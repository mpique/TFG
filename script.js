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
            const url = `/fetch_interface_info?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&interface=${encodeURIComponent(interface)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

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

    // Send an edit-config
    $('#sendOperation').click(function() {
        var host = $('#hostInput').val();
        var port = $('#portInput').val();
        var interface = $('#interfaceInput').val();
        var username = $('#usernameInput').val();
        var password = $('#passwordInput').val();
        var netconf_operation = $('#operationSelect').val();
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
                $('#rpcResponse').append('<pre>' + JSON.stringify(error.responseJSON, null, 2) + '</pre>');
            });
    });

});