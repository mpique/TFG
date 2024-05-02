$(document).ready(function() {
    $('#sendButton').click(function() {
        var host = $('#hostInput').val();
        var port = $('#portInput').val();
        var method = $('#methodSelect').val();
        var body = $('#bodyInput').val();

        $.ajax({
            url: '/' + method.toLowerCase() + '_interface_info',
            type: method,
            data: JSON.stringify({host: host, port: port, body: body}), 
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
