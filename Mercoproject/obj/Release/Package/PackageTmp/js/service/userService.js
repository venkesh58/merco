/////////////////////////////////////////////////////
// USER SERVCIE
//
// We expect 'user' to a controller on the server.
/////////////////////////////////////////////////////
var UserService = (function () {
    var service = function (url, controllers, guid) {
        var socket = new XSockets.WebSocket(url || 'ws://127.0.0.1:4502', controllers || ['user'], {
        	ctx: guid
        });

        this.UserController = socket.controller('user');
    }
    return service;
})();