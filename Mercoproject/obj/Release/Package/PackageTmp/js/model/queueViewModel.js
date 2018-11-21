//////////////////////
// QUEUE VM
//////////////////////
var QueueViewModel = (function () {
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
        this.Queues = ko.observableArray([]);


        this.UpdateQueue = function (queue) {
            //create observable
            queue = knockify(queue);
            var match = ko.utils.arrayFirst(self.Queues(), function (item) {
                return queue.Id() === item.Id();
            });
            if (!match) {
                //Add, did not exist
                self.Queues.push(queue);
            } else {
                //Existed, update 
                //copy observable to another observable - object, target
                knockify(queue,match);
            }
        }
        this.RemoveQueue = function (queue) {
            this.Queues.remove(function (item) { return item.Id() == queue.Id; });
        }
    }    
    return vm;
})();