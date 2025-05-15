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
        const input = document.getElementById('hostInput');
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
        var hosts = $('#hostInput').val().split(' ');
        var port = $('#portInput').val();
        var interface = $('#interfaceInput').val();
        var username = $('#usernameInput').val();
        var password = $('#passwordInput').val();
        var method = $('#methodSelect').val();
        var requestBody = $('#bodyInput').val();

        // Clear
        $('#interfaceInfo').empty(); 

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
                    $('#interfaceInfo').append('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
                })
                .catch(error => {
                    $('#interfaceInfo').append('<pre>' + JSON.stringify(error.responseJSON, null, 2) + '</pre>');
                });
        });
    });

    // Button to copy the response to the REST body input
    $('#copyResponseButton').click(function() {
        var responseData = $('#interfaceInfo').text();
        $('#bodyInput').val(responseData);
    });

    // Button to copy the response to the NETCONF body input
    $('#copyRpcResponseButton').click(function() {
        var responseData = $('#rpcResponse').text();
        $('#rpcBodyInput').val(responseData);
    });

    // Send a NETCONF operation
    $('#sendOperation').click(function() {
        var host = $('#hostInput').val();
        var port = $('#portInput').val();
        var interface = $('#interfaceInput').val();
        var username = $('#usernameInput').val();
        var password = $('#passwordInput').val();
        var netconfOperation = $('#operationSelect').val();
        var xmlBody = $('#bodyInput').val();

        const url = `/fetch_netconf_info?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&interface=${encodeURIComponent(interface)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&netconf_operation=${encodeURIComponent(netconfOperation)}`;

        let options = {
            method: netconfOperation.toUpperCase() === 'GET' ? 'GET' : 'POST',
            headers: {
                "Content-Type": "application/xml"
            }
        };

        if (xmlBody && netconfOperation.toLowerCase() !== 'get-config') {
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

});