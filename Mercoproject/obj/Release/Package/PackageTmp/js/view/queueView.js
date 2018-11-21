//////////////////////
// Queue VIEW
//////////////////////
function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

var QueueView = (function () {
    var model = new QueueViewModel();

    //View
    var view = function (ctrl) {                

        //Callbacks from controller when the service send new data
        var onInit = function (queues) {
            queues.forEach(model.UpdateQueue);
        };
        var onAddOrUpdate = function (queue) {
            model.UpdateQueue(queue);
        };
        var onDelete = function (queue) {
            model.RemoveQueue(queue);
        };

        var controller = ctrl || new QueueController(onAddOrUpdate, onDelete, onInit);
        
        this.addOrUpdate = function (queue) {
            controller.addOrUpdate(queue);
        };
        this.remove = function (queue) {
            controller.remove(queue);
        };

           
        //UI Events
        //new 
        var submitQuestion = $('#submitQuestion');
        submitQuestion.click(function (){
        if ($(this).attr('rel') == "add"){

            var guid = XSockets.Utils.guid();
            //track_user++;
            //$('#questionQueue').removeClass('hidden');
            $(this).attr("src", "images/delete-raise-question.png");
            $(this).attr("rel", "remove");
            $(this).attr("name", guid);

            $('#questionQueue').css('border', '1px solid #ffffff');
            var text = $('#question-content').val();

            $('#question-content').val("");

            controller.addOrUpdate({
                Id: guid,
                Name: window.localUser,
                Question: text,
                BackgroundColor: getRandomColor()
            });

            console.log("add queue question");


        }
        else if ($(this).attr('rel') == "remove"){
            var track = $(this).attr('name');
            //$('#' + track).remove();

            myApp.view.remove(track);

            $(this).attr("src", "images/check-1.png");
            $(this).attr("rel", "add");      

            if ($('#questionQueue div').length == 0){
                $('#questionQueue').css('border', '0px solid #ffffff');
            }                                                                       
        }

    }); 
   
};
    //Apply KO
    ko.applyBindings(model, document.getElementById('queuewrap'));

    return view;
})();