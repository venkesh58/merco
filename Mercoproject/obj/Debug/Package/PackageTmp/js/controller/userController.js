//////////////////////
// USER CTRL
//////////////////////
var UserController = (function () {

    var controller = function (onAddOrUpdate, onDelete, onInit, guid) {

        //RealTime Service
        var service = new UserService(null, null, guid);

        //RealTime events from our service
        service.UserController.on('init:usermodel', function (users) {
            onInit(users);
        });
        service.UserController.subscribe('update:usermodel', function (user) {
            onAddOrUpdate(user);
        });
        service.UserController.subscribe('add:usermodel', function (user) {
            onAddOrUpdate(user);
        });
        service.UserController.subscribe('delete:usermodel', function (user) {
            onDelete(user);
        });

        //Exposed methods
        this.addOrUpdate = function (user) {
            console.log('add', user);
            service.UserController.invoke('update', user);
        };
        this.remove = function (user) {
            console.log('remove', user.Id());
            service.UserController.invoke('delete', { Id: user.Id() });
        };
    };
    return controller;
})();