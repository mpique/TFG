import sys, os, warnings, requests, datetime
from ncclient import manager
from lxml import etree
from flask import Flask, render_template, request, jsonify
from lxml import etree

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
    host = data.get('host')
    port = data.get('port')
    interfaces = data.get('interfaces').split(',')
    body = data.get('body')

    results = {}
    for interface in interfaces:
        response_data = send_restconf_request(request.method, host, port, interface.strip(), body)
        results[interface.strip()] = response_data
    return jsonify(results)

@app.route('/send_rpc')
def send_rpc():

    data = request.json
    interfaces = data.get('interfaces').split(',')
    for interface in interfaces:

        current_time = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d %H:%M:%S')
        config_e = etree.Element("config")
        configuration = etree.SubElement(config_e, "interface-configurations", data.get('rpc'))
        interface_cfg = etree.SubElement(configuration, "interface-configuration")
        active = etree.SubElement(interface_cfg, "active").text = 'act'
        interface_name = etree.SubElement(interface_cfg, "interface-name").text = interface
        description = etree.SubElement(interface_cfg, "description").text  = 'NETCONF configured - ' + current_time

        with manager.connect(host=data.get('host'), port=data.get('port'), username=data.get('username'), password=data.get('rpc'),
                        hostkey_verify=False, device_params={'name':'default'},
                        look_for_keys=False, allow_agent=False) as m:
            with m.locked(target="candidate"):
                m.edit_config(config=config_e, default_operation="merge", target="candidate")
                m.commit()

    results =  {"message": "RPC sent successfuly to interfaces " + data.get('interfaces')}

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)
