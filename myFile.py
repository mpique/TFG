import sys, os, warnings, requests, datetime
from ncclient import manager
from lxml import etree
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def send_request(method, host, port, interface, body=None):
    url = f"https://{host}:{port}/restconf/data/ietf-interfaces:interfaces/interface={interface}"
    headers = {
        "Accept": "application/yang-data+json",
        "Content-Type": "application/yang-data+json",
    }
    response = requests.request(method, url, headers=headers, json=body, verify=False)

    if response.status_code in [200, 201, 204]:
        return response.json() if response.content else {"message": "Request successful"}
    else:
        return {"error": response.json()}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_interface_info', methods=['GET', 'POST', 'PUT', 'DELETE'])
def fetch_interface_info():
    data = request.json
    hosts = data.get('host').split(' ')
    port = data.get('port')
    interface = data.get('interface')
    body = data.get('body')

    results = {}
    for host in hosts:
        response_data = send_restconf_request(request.method, host.strip(), port, interface, body)
        results[host.strip()] = response_data
    return jsonify(results)

@app.route('/edit_config_rpc')
def send_rpc():

    data = request.json
    hosts = data.get('hosts').split(' ')
    for host in hosts:

        current_time = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d %H:%M:%S')
        config_e = etree.Element("config")
        configuration = etree.SubElement(config_e, "interface-configurations", nsmap = {None: 'http://cisco.com/ns/yang/Cisco-IOS-XR-ifmgr-cfg'})
        interface_cfg = etree.SubElement(configuration, "interface-configuration")
        active = etree.SubElement(interface_cfg, "active").text = 'act'
        interface_name = etree.SubElement(interface_cfg, "interface-name").text = data.get('name')
        description = etree.SubElement(interface_cfg, "description").text  = data.get('description')

        with manager.connect(host=data.get('host'), port=data.get('port'), username=data.get('username'), password=data.get('password'),
                        hostkey_verify=False, device_params={'name':'default'},
                        look_for_keys=False, allow_agent=False) as m:
            with m.locked(target="candidate"):
                m.edit_config(config=config_e, default_operation="merge", target="candidate")
                m.commit()

    results =  {"message": "RPC sent successfuly to hosts " + data.get('hosts')}

    return jsonify(results)

@app.route('/delete_config_rpc')
def send_rpc():

    data = request.json
    hosts = data.get('hosts').split(' ')
    for host in hosts:
        config_e = etree.Element("config")
        with manager.connect(host=data.get('host'), port=data.get('port'), username=data.get('username'), password=data.get('password'),
                        hostkey_verify=False, device_params={'name':'default'},
                        look_for_keys=False, allow_agent=False) as m:
            with m.locked(target="running"):
                m.edit_config(config=config_e, default_operation="delete", target="running")
                m.commit()

    results =  {"message": "RPC sent successfuly to hosts " + data.get('hosts')}

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)
