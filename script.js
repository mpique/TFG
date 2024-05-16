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
        var host = $('#hostInput').val();
        var port = $('#portInput').val();
        var interface = $('#interfaceInput').val();
        var method = $('#methodSelect').val();
        var body = $('#bodyInput').val();

        var url = `https://${host}:${port}/restconf/data/ietf-interfaces:interfaces/interface=${interface}`;

        $.ajax({
            url: url,
            type: method,
            data: JSON.stringify({host: host, port: port, interface: interface, body: body}),
            contentType: 'application/json',
            success: function(data) {
                $('#interfaceInfo').html(JSON.stringify(data, null, 2));
            }
        });
    });

    // Button to copy the response to the Body input
    $('#copyResponseButton').click(function() {
        var responseData = $('#interfaceInfo').text();
        $('#bodyInput').val(responseData);
    });
});
