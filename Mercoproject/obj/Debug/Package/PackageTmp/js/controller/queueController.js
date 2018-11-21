//////////////////////
// Queue CTRL
//////////////////////
var QueueController = (function () {

    var controller = function (onAddOrUpdate, onDelete, onInit) {

        //RealTime Service
        var service = new QueueService();

        //RealTime events from our service
        service.QueueController.on('init:queuemodel', function (queues) {
            onInit(queues);
        });
        service.QueueController.subscribe('update:queuemodel', function (queue) {
            onAddOrUpdate(queue);
        });
        service.QueueController.subscribe('add:queuemodel', function (queue) {
            onAddOrUpdate(queue);
        });
        service.QueueController.subscribe('delete:queuemodel', function (queue) {
            onDelete(queue);
        });

        //Exposed methods
        this.addOrUpdate = function (queue) {
            console.log('add', queue);
            service.QueueController.invoke('update', queue);
        };
        this.remove = function (queue) {
            //console.log('remove', queue.Id());
           // service.QueueController.invoke('delete', { Id: queue.Id() });

            console.log('remove', queue);
            service.QueueController.invoke('delete', { Id: queue });           
        };
    };
    return controller;
})();