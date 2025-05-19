import sys, os, warnings, requests, datetime
from ncclient import manager
from lxml import etree
from flask import Flask, render_template, request, jsonify, Response
from concurrent.futures import ThreadPoolExecutor, as_completed

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_restconf_info', methods=['GET', 'POST', 'PUT', 'DELETE'])
def fetch_restconf_info():
    host = request.args.get('host')
    port = request.args.get('port', 443)
    interface = request.args.get('interface')
    username = request.args.get('username')
    password = request.args.get('password')
    req_body = request.get_json(silent=True)
    url = f"https://{host}:{port}/restconf/data/interfaces/interface={interface}"

    headers = {
        "Content-Type": "application/yang-data+json"
    }

    try:
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            json=req_body,
            auth=auth
        )

        try:
            device_response = response.json()
        except ValueError:
            device_response = response.text

        return jsonify({
            "status": response.status_code,
            "device_response": device_response
        }), response.status_code

@app.route("/fetch_restconf_telemetry", methods=["GET", "POST"])
def fetch_restconf_telemetry():
    host = request.args.get('host')
    port = request.args.get('port', 443)
    interface = request.args.get('interface')
    username = request.args.get('username')
    password = request.args.get('password')
    req_body = request.get_json(silent=True)

    url = f"https://{host}:{port}/restconf/data/interfaces/interface={interface}"

    headers = {
        "Accept": "application/yang-data+json"
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            auth=HTTPBasicAuth(username, password),
            verify=False
        )
        response.raise_for_status() # Error if not code 2xx
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/fetch_netconf_info', methods=['GET', 'POST'])
def fetch_netconf_info():
    host = request.args.get('host')
    port = request.args.get('port', 830)
    interface = request.args.get('interface')
    username = request.args.get('username')
    password = request.args.get('password')
    netconfOperation = request.args.get('netconfOperation')
    xml_body = request.data.decode('utf-8') if request.data else None

    try:
        with manager.connect(
            host=host,
            port=int(port),
            username=username,
            password=password,
            hostkey_verify=False
        ) as m:
            if netconfOperation == 'get-config':
                response = m.get_config(source='running')
                result = response.xml
            elif netconfOperation == 'edit-config':
                if not xml_body:
                    return Response("<error>edit-config requires a body</error>", mimetype='application/xml', status=400)
                response = m.edit_config(target='running', config=xml_body, default_operation="merge")
                result = response.xml
            elif netconfOperation == 'copy-config':
                response = m.copy_config(target='running', source='startup')
                result = response.xml
            elif netconfOperation == 'delete-config':
                response = m.delete_config(target='candidate')
                result = response.xml

            else:
                return Response("<error>Not a supported operation</error>", mimetype='application/xml', status=400)

        return Response(result, mimetype='application/xml', status=200)
    except Exception as e:
        error_xml = f"<error>{str(e)}</error>"
        return Response(error_xml, mimetype='application/xml', status=500)


@app.route("/fetch_netconf_telemetry/", methods=["GET", "POST"])
def fetch_netconf_telemetry():
    host = request.args.get('host')
    port = int(request.args.get('port', 830))
    interface = request.args.get('interface')
    username = request.args.get('username')
    password = request.args.get('password')
    netconfOperation = request.args.get('netconfOperation', 'get')

    # Filtro NETCONF para estadísticas de interfaz
    NETCONF_FILTER = f"""
    <filter>
      <interfaces-state xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
        <interface>
          <name>{interface}</name>
          <statistics/>
        </interface>
      </interfaces-state>
    </filter>
    """

    try:
        with manager.connect(
            host=host,
            port=port,
            username=username,
            password=password,
            hostkey_verify=False
        ) as m:
            netconf_response = m.get(NETCONF_FILTER)
            response_xml = netconf_response.xml
            return Response(response_xml, mimetype='application/xml', status=200)

    except Exception as e:
        error_xml = f"<error>{str(e)}</error>"
        return Response(error_xml, mimetype='application/xml', status=500)

if __name__ == '__main__':
    app.run(debug=True)
