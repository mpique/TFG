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

      $('#fetchButton').click(function() {
        var hosts = $('#hostInput').val().split(' ');
        var port = $('#portInput').val();
        var interface = $('#interfaceInput').val();
        var method = $('#methodSelect').val();
        var body = $('#bodyInput').val();

        // Clear
        $('#interfaceInfo').empty(); 

        hosts.forEach(function(host) {
            var url = `https://${host}:${port}/restconf/data/ietf-interfaces:interfaces/interface=${interface}`;

            $.ajax({
                url: url,
                type: method,
                data: method === 'GET' ? null : body,
                contentType: 'application/json',
                success: function(data) {
                    $('#interfaceInfo').append('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
                },
                error: function(error) {
                    $('#interfaceInfo').append('<pre>' + JSON.stringify(error.responseJSON, null, 2) + '</pre>');
                }
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

    $('#sendRpcButton').click(function() {
        var host = $('#hostInput').val();
        var port = $('#portInput').val();
        var rpc = $('#rpcBodyInput').val();
        var username = $('#usernameInput').val();
        var password = $('#passwordInput').val();
        var url = '/send_rpc';

        var requestData = {
            host: host,
            port: port,
            rpc: rpc,
            username: username,
            password: password,
        };
        // Clear
        $('#rpcResponse').empty();  

        $.ajax({
            url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        success: function(data) {
            $('#rpcResponse').append('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
        },
        error: function(error) {
            $('#rpcResponse').append('<pre>' + JSON.stringify(error.responseJSON, null, 2) + '</pre>');
            }
        });
    });
});