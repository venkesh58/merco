//////////////////////
// ANIMAL VIEW
//////////////////////
var UserView = (function () {
    var model = new UserViewModel();

    //View
    var view = function (ctrl, guid, ctx) {                

        //Callbacks from controller when the service send new data
        var onInit = function (users) {
            users.forEach(model.UpdateUser);
        };
        var onAddOrUpdate = function (user) {
            model.UpdateUser(user);
        };
        var onDelete = function (user) {
            model.RemoveUser(user);
        };

        var controller = ctrl || new UserController(onAddOrUpdate, onDelete, onInit, guid);
        
        this.addOrUpdate = function (user) {
            controller.addOrUpdate(user);
        };
        this.remove = function (user) {
            controller.remove(user);
        };
        
        //UI Events
        //new 
        /*var submitHostInfo = $('#submitHostInfo');
        submitHostInfo.click(function (){
            //Do not save if the name is missing
            if ($('#hostPersonalName').val().trim().length == 0) {
                alert("You have to provide a name for the user");
                return;
            }
            controller.addOrUpdate({
                Id: guid,
                Context: ctx,
                Name: $('#hostPersonalName').val(),
                GroupName: $('#hostGroupName').val()
            });
        });*/
    };
    //Apply KO
    ko.applyBindings(model, document.getElementById('userViewContainer'));
    return view;
})();