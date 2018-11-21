//////////////////////
// AGENDA VM
//////////////////////
var AgendaViewModel = (function () {
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
        this.Agendas = ko.observableArray([]);

        this.childItems = ko.observableArray([]);

        this.UpdateAgenda = function (agenda) {
            //create observable
            agenda = knockify(agenda);
            var match = ko.utils.arrayFirst(self.Agendas(), function (item) {
                return agenda.Id() === item.Id();
            });
            if (!match) {
                //Add, did not exist
                childItems = ko.observableArray(agenda.Topics());
                agenda.Topics = childItems;

                self.Agendas.push(agenda);
            } else {
                //Existed, update 
                //copy observable to another observable - object, target
                knockify(agenda,match);
            }
        }
        this.RemoveAgenda = function (agenda) {
            this.Agendas.remove(function (item) { return item.Id() == agenda.Id; });
        }
    }    
    return vm;
})();