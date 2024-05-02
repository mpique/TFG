from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

def get_interface_info(host, port):
    url = f"https://{host}:{port}/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet1"
    headers = {
        "Accept": "application/yang-data+json",
        "Content-Type": "application/yang-data+json",
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        interface_info = response.json()
        return interface_info
    else:
        return None

def post_interface_info(host, port):
    # TODO
    pass

def put_interface_info(host, port):
    # TODO
    pass

def delete_interface_info(host, port):
    # TODO
    pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_interface_info', methods=['GET'])
def fetch_interface_info_get():
    host = request.args.get('host')
    port = request.args.get('port')
    interface_info = get_interface_info(host, port)
    return jsonify(interface_info)

@app.route('/post_interface_info', methods=['POST'])
def fetch_interface_info_post():
    host = request.json.get('host')
    port = request.json.get('port')
    interface_info = post_interface_info(host, port)
    return jsonify(interface_info)

@app.route('/put_interface_info', methods=['PUT'])
def fetch_interface_info_put():
    host = request.json.get('host')
    port = request.json.get('port')
    interface_info = put_interface_info(host, port)
    return jsonify(interface_info)

@app.route('/delete_interface_info', methods=['DELETE'])
def fetch_interface_info_delete():
    host = request.json.get('host')
    port = request.json.get('port')
    interface_info = delete_interface_info(host, port)
    return jsonify(interface_info)

if __name__ == '__main__':
    app.run(debug=True)
