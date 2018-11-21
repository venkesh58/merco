//////////////////////
// USER VM
//////////////////////
var UserViewModel = (function () {
    var vm = function () {
        var self = this;
        var knockify = function (o, t) {
            if (!t) {               
                for (var p1 in o) {
                    if (o.hasOwnProperty(p1)) {
                        o[p1] = ko.observable(o[p1]);
                    }
                }
                return o;
            }
            else {
                var js = ko.toJS(o);
                for (var p2 in js) {
                    if (js.hasOwnProperty(p2)) {
                        t[p2](js[p2]);
                    }
                }
                return t;
            }            
        }
        this.Users = ko.observableArray([]);
        this.UpdateUser = function (user) {
            //create observable
            user = knockify(user);
            var match = ko.utils.arrayFirst(self.Users(), function (item) {
                return user.Id() === item.Id();
            });
            if (!match) {
                //Add, did not exist
                self.Users.unshift(user);
            } else {
                //Existed, update 
                //copy observable to another observable - object, target
                knockify(user,match);
            }
        }
        this.RemoveUser = function (user) {
            this.Users.remove(function (item) { return item.Id() == user.Id; });
        }
    }    
    return vm;
})();