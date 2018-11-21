//////////////////////
// Queue CTRL
//////////////////////
var AgendaController = (function () {

    var controller = function (onAddOrUpdate, onDelete, onInit, guid) {

        //RealTime Service
        var service = new AgendaService(null, null, guid);

        //RealTime events from our service
        service.AgendaController.on('init:agendamodel', function (agendas) {
            onInit(agendas);
        });
        service.AgendaController.subscribe('update:agendamodel', function (agenda) {
            onAddOrUpdate(agenda);
        });
        service.AgendaController.subscribe('add:agendamodel', function (agenda) {
            onAddOrUpdate(agenda);
        });
        service.AgendaController.subscribe('delete:agendamodel', function (agenda) {
            onDelete(agenda);
        });

        //Exposed methods
        this.addOrUpdate = function (agenda) {
            console.log('add', agenda);
            service.AgendaController.invoke('update', agenda);
        };
        this.remove = function (agenda) {
            //console.log('remove', queue.Id());
           // service.QueueController.invoke('delete', { Id: queue.Id() });

            console.log('remove', agenda);
            service.AgendaController.invoke('delete', { Id: agenda });           
        };
    };
    return controller;
})();