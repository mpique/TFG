$(document).ready(function() {
    $('#sendButton').click(function() {
        var host = $('#hostInput').val();
        var port = $('#portInput').val();
        var method = $('#methodSelect').val();

        $.ajax({
            url: '/' + method.toLowerCase() + '_interface_info',
            type: method,
            data: JSON.stringify({host: host, port: port}),
            contentType: 'application/json',
            success: function(data) {
                $('#interfaceInfo').html(JSON.stringify(data, null, 2));
            }
        });
    });
});
