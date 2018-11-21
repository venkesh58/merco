/////////////////////////////////////////////////////
// ANIMAL SERVCIE
//
// We expect 'animal' to a controller on the server.
/////////////////////////////////////////////////////
var QueueService = (function () {
    var service = function (url, controllers) {
        var socket = new XSockets.WebSocket(url || 'ws://127.0.0.1:4502', controllers || ['queue']);

        this.QueueController = socket.controller('queue');
    }
    return service;
})();