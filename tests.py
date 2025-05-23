import unittest
import requests
from ncclient import manager
import xml.etree.ElementTree as ET

BASE_URL = "http://127.0.0.1:5000"
HEADERS = {"Content-Type": "application/yang-data+json"}
HOST = "192.168.1.1"
PORT_RESTCONF = 443
PORT_NETCONF = 830
AUTH_OK = ("admin", "admin")
AUTH_FAIL = ("wrong", "wrong")
INTERFACE = "GigabitEthernet0/0"

class TestNetworkAutomationFull(unittest.TestCase):

    def test_netconf_connection_success(self):
        try:
            with manager.connect(host=HOST, port=PORT_NETCONF, username=AUTH_OK[0], password=AUTH_OK[1], hostkey_verify=False, timeout=5) as m:
                self.assertTrue(m.connected)
        except Exception as e:
            self.fail(f"NETCONF connection failed: {e}")

    def test_netconf_connection_failure(self):
        with self.assertRaises(Exception):
            manager.connect(host=HOST, port=PORT_NETCONF, username=AUTH_FAIL[0], password=AUTH_FAIL[1], hostkey_verify=False, timeout=5)

    def test_restconf_auth_failure(self):
        res = requests.get(f"{BASE_URL}/fetch_restconf_info", params={
            "host": HOST, "port": PORT_RESTCONF, "interface": INTERFACE, "username": AUTH_FAIL[0], "password": AUTH_FAIL[1]
        })
        self.assertIn(res.status_code, [401, 403, 500])

    def test_get_config_netconf(self):
        try:
            with manager.connect(host=HOST, port=PORT_NETCONF, username=AUTH_OK[0], password=AUTH_OK[1], hostkey_verify=False) as m:
                res = m.get_config(source='running')
                self.assertIn("interface", res.xml)
        except Exception as e:
            self.fail(f"NETCONF get-config failed: {e}")

    def test_edit_config_netconf(self):
        edit_payload = """<config xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
    <interface>
      <name>Loopback77</name>
      <description>Edited via test</description>
      <type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:softwareLoopback</type>
      <enabled>true</enabled>
    </interface>
  </interfaces>
</config>"""
        try:
            with manager.connect(host=HOST, port=PORT_NETCONF, username=AUTH_OK[0], password=AUTH_OK[1], hostkey_verify=False) as m:
                res = m.edit_config(target='running', config=edit_payload)
                self.assertIn("<ok/>", res.xml)
        except Exception as e:
            self.fail(f"NETCONF edit-config failed: {e}")

    def test_delete_interface_netconf(self):
        delete_payload = """<config xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
    <interface operation="delete">
      <name>Loopback77</name>
    </interface>
  </interfaces>
</config>"""
        try:
            with manager.connect(host=HOST, port=PORT_NETCONF, username=AUTH_OK[0], password=AUTH_OK[1], hostkey_verify=False) as m:
                res = m.edit_config(target='running', config=delete_payload)
                self.assertIn("<ok/>", res.xml)
        except Exception as e:
            self.fail(f"NETCONF delete-config failed: {e}")

    def test_restconf_invalid_interface(self):
        res = requests.get(f"{BASE_URL}/fetch_restconf_info", params={
            "host": HOST, "port": PORT_RESTCONF, "interface": "FakeInterface", "username": AUTH_OK[0], "password": AUTH_OK[1]
        })
        self.assertIn(res.status_code, [404, 500])

    def test_compare_netconf_restconf(self):
        try:
            # RESTCONF
            rest = requests.get(f"{BASE_URL}/fetch_restconf_telemetry", params={
                "host": HOST, "port": PORT_RESTCONF, "interface": INTERFACE, "username": AUTH_OK[0], "password": AUTH_OK[1]
            }).json()

            # NETCONF
            netconf = requests.get(f"{BASE_URL}/fetch_netconf_telemetry", params={
                "host": HOST, "port": PORT_NETCONF, "interface": INTERFACE, "username": AUTH_OK[0], "password": AUTH_OK[1]
            }).text

            root = ET.fromstring(netconf)
            disc_time_netconf = root.find(".//{*}discontinuity-time").text
            disc_time_restconf = rest["ietf-interfaces:interface"]["statistics"]["discontinuity-time"]
            self.assertEqual(disc_time_netconf, disc_time_restconf)
        except Exception as e:
            self.fail(f"Comparison between NETCONF and RESTCONF failed: {e}")

if __name__ == "__main__":
    unittest.main()
