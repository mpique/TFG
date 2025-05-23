$(document).ready(function() {
    function toggleMode() {
        var button = document.getElementById("toggleButton");
        var displayText = document.getElementById("displayText");
        var restconfTemplate = document.getElementById("restconfTemplate").innerHTML;
        var netconfTemplate = document.getElementById("netconfTemplate").innerHTML;
      
        if (button.textContent === "Switch to NETCONF") {
          button.textContent = "Switch to RESTCONF";
          displayText.innerHTML = netconfTemplate;
        } else {
          button.textContent = "Switch to NETCONF";
          displayText.innerHTML = restconfTemplate;
        }
    }

    document.getElementById("toggleButton").addEventListener("click", toggleMode);

    document.getElementById("displayText").innerHTML = document.getElementById("restconfTemplate").innerHTML;

    function showSaveButton() {
        const input = document.getElementById('host');
        const saveButton = document.getElementById('saveButton');
        const table = document.getElementById('groupTable');
        const tbody = table.querySelector('tbody');

        let groupCounter = 1;

        input.addEventListener('input', function () {
            saveButton.style.display = input.value.trim() !== '' ? 'inline-block' : 'none';
        });

        saveButton.addEventListener('click', function () {
            const value = input.value.trim();
            if (value === '') return;

            table.style.display = 'table';

            const row = document.createElement('tr');

            const groupCell = createEditableCell(`Group ${groupCounter}`);
            const hostCell = createEditableCell(value);
            const actionCell = createActionCell(row, hostCell, input, saveButton);

            row.appendChild(groupCell);
            row.appendChild(hostCell);
            row.appendChild(actionCell);
            tbody.appendChild(row);

            groupCounter++;
            input.value = '';
            saveButton.style.display = 'none';
        });

        function createEditableCell(text) {
            const cell = document.createElement('td');
            cell.textContent = text;

            cell.addEventListener('click', function () {
                if (cell.querySelector('input')) return;

                const currentText = cell.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                input.classList.add('editable-input');

                cell.textContent = '';
                cell.appendChild(input);
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);

                function save() {
                    cell.textContent = input.value.trim() || currentText;
                }

                input.addEventListener('blur', save);
                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        save();
                    }
                });
            });


            return cell;
        }

        function createActionCell(row, hostCell, input, saveButton) {
            const cell = document.createElement('td');

            // Select Button
            const selectBtn = document.createElement('button');
            selectBtn.textContent = 'Select';
            selectBtn.classList.add('action-btn');
            selectBtn.addEventListener('click', function () {
                input.value = hostCell.textContent.trim();
                saveButton.style.display = input.value ? 'inline-block' : 'none';
                input.focus();
            });

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('action-btn');
            deleteBtn.addEventListener('click', function () {
                row.remove();
                if (tbody.rows.length === 0) {
                    table.style.display = 'none';
                }
            });

            cell.appendChild(selectBtn);
            cell.appendChild(deleteBtn);
            return cell;
        }
    }

    showSaveButton();

    // Send a RESTCONF request
    $('#sendRequest').click(function() {
        var hosts = $('#host').val().split(' ');
        var port = $('#port').val();
        var interface = $('#interface').val();
        var username = $('#username').val();
        var password = $('#password').val();
        var method = $('#methodSelect').val();
        var requestBody = $('#body').val();

        // Clear
        $('#restconfResponse').empty();

        hosts.forEach(function(host) {
            const url = `/fetch_restconf_info?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&interface=${encodeURIComponent(interface)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

            let options = {
                method: httpMethod,
                headers: {
                    "Content-Type": "application/json"
                }
            };

            if (requestBody && httpMethod.toUpperCase() !== "GET") {
                options.body = JSON.stringify(requestBody);
            }

            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error en la red: " + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    $('#restconfResponse').append('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
                })
                .catch(error => {
                    $('#restconfResponse').append('<pre>' + JSON.stringify(error.responseJSON, null, 2) + '</pre>');
                });
        });
    });

    // Button to copy the response to the REST body input
    $('#copyResponseButton').click(function() {
        var responseData = $('#restconfResponse').text();
        $('#body').val(responseData);
    });

    // Button to copy the response to the NETCONF body input
    $('#copyRpcResponseButton').click(function() {
        var responseData = $('#rpcResponse').text();
        $('#rpcBody').val(responseData);
    });

    // Send a NETCONF operation
    $('#sendOperation').click(function() {
        var host = $('#host').val();
        var port = $('#port').val();
        var interface = $('#interface').val();
        var username = $('#username').val();
        var password = $('#password').val();
        var netconfOperation = $('#operationSelect').val();
        var xmlBody = $('#body').val();

        // Clear
        $('#rpcResponse').empty();

        const url = `/fetch_netconf_info?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&interface=${encodeURIComponent(interface)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&netconf_operation=${encodeURIComponent(netconfOperation)}`;

        const options = {
            method: netconfOperation.toLowerCase() === 'get-config' ? 'GET' : 'POST',
            headers: {
                'Content-Type': 'application/xml'
            }
        };

        if (xmlBody && netconf_operation.toLowerCase() !== 'get-config') {
            options.body = xmlBody;
        }

        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network error: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                $('#rpcResponse').append('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
            })
            .catch(error => {
                $('#rpcResponse').append('<pre>'  + error.message + '</pre>');
            });
    });

    $('#fetchNetconfTelemetry').click(function() {
        var host = $('#host').val();
        var port = $('#port').val();
        var interface = $('#interface').val();
        var username = $('#username').val();
        var password = $('#password').val();

        // Clear
        $('#netconfTelemetryResponse').empty();

        const url = `/fetch_netconf_info?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&interface=${encodeURIComponent(interface)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        const options = {
            method: netconfOperation.toLowerCase() === 'get-config' ? 'GET' : 'POST',
            headers: {
                'Content-Type': 'application/xml'
            }
        };

        if (xmlBody && netconf_operation.toLowerCase() !== 'get-config') {
            options.body = xmlBody;
        }

        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                $('#netconfTelemetryResponse').append('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
            })
            .catch(error => {
                $('#netconfTelemetryResponse').append('<pre>'  + error.message + '</pre>');
            });
    });

    $('#fetchRestconfTelemetry').click(function() {
        var host = $('#host').val();
        var port = $('#port').val();
        var interface = $('#interface').val();
        var username = $('#username').val();
        var password = $('#password').val();

        // Clear
        $('#restconfTelemetryResponse').empty();

        const url = `/fetch_restconf_telemetry?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&interface=${encodeURIComponent(interfaceName)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                  throw new Error("Error: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const tableHtml = renderTelemetryTable(data, "json");
                $('#restconfTelemetryResponse').innerHTML = tableHtml;
            })
            .catch(error => {
                $('#restconfTelemetryResponse').append('<pre>'  + error.message + '</pre>');
            });
    });

function renderTelemetryTable(data, format = "json") {
    let table = "<table border='1'><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>";

    if (format === "json") {
        const interfaceData = data?.["ietf-interfaces:interface"] || data?.interface;
        if (!interfaceData) return "<p>No telemetry data found</p>";

        for (const [key, value] of Object.entries(interfaceData)) {
            if (typeof value === "object") {
                for (const [subKey, subValue] of Object.entries(value)) {
                    table += `<tr><td>${key}.${subKey}</td><td>${subValue}</td></tr>`;
                }
            } else {
                table += `<tr><td>${key}</td><td>${value}</td></tr>`;
            }
        }
    } else if (format === "xml") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const rows = xmlDoc.querySelectorAll("interface *");

        rows.forEach(el => {
            const name = el.tagName;
            const value = el.textContent.trim();
            if (value) {
                table += `<tr><td>${name}</td><td>${value}</td></tr>`;
            }
        });
    }

    table += "</tbody></table>";
    return table;
}

});