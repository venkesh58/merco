/////////////////////////////////////////////////////
// AGENDA SERVCIE
//
// We expect 'agenda' to a controller on the server.
/////////////////////////////////////////////////////
var AgendaService = (function () {
    var service = function (url, controllers, guid) {
        var socket = new XSockets.WebSocket(url || 'ws://127.0.0.1:4502', controllers || ['agenda'], {
        	ctx: guid
        });

        this.AgendaController = socket.controller('agenda');
    }
    return service;
})();
