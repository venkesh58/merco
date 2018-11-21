//////////////////////
// ANIMAL VIEW
//////////////////////
var AgendaView = (function () {
    var model = new AgendaViewModel();

    //View
    var view = function (ctrl, guid) {                

        //Callbacks from controller when the service send new data
        var onInit = function (agendas) {
            agendas.forEach(model.UpdateAgenda);
        };
        var onAddOrUpdate = function (agenda) {
            model.UpdateAgenda(agenda);
        };
        var onDelete = function (agenda) {
            model.RemoveAgenda(agenda);
        };

        var controller = ctrl || new AgendaController(onAddOrUpdate, onDelete, onInit, guid);
        
        this.addOrUpdate = function (agenda) {
            controller.addOrUpdate(agenda);
        };
        this.remove = function (agenda) {
            controller.remove(agenda);
        };

        $(document).on("click", ".mark-circle", function(){
            $(this).addClass('right-control-yellow-color');
            $(this).closest('#test-sub').find('.mark-circle').not($(this)).removeClass('right-control-yellow-color');

            var object = [];
            $(this).closest('#test-sub').find('.input-box').each(function(e){    
                if ($(this).val() != "") {
                    object.push($(this).val());
                }
            });

            var highlightId = $(this).attr('id');

            controller.addOrUpdate({
                Id: guid,
                Topics: object,
                Highlight: highlightId
            });


        });

        var timerid;
        $(document).on("keypress", ".input-box", function(e){
            var key = e.which;
            if(key == 13){
                    var object = [];
                    $(this).closest('#test-sub').find('.input-box').each(function(e){    
                        if ($(this).val() != "") {
                            object.push($(this).val());
                        }
                    });

                    var hightlightOne = $(this).closest('#test-sub').find('.right-control-yellow-color');

                    var highlightId = hightlightOne.attr('id');

                    controller.addOrUpdate({
                        Id: guid,
                        Topics: object,
                        Highlight: highlightId
                    });
            }

        });


        $('#submit-agenda').on('click',function(){
            var object = [];
            $("#agendar-c :input").each(function(e){    
                if ($(this).val() != "") {
                    object.push($(this).val());
                    //console.log(object);
                    $(this).val('');
                }
            });

            controller.addOrUpdate({
                Id: guid,
                Topics: object,
                Highlight: "0"
            });

                    
        }); 
   
    };

     //Apply KO
    ko.applyBindings(model, document.getElementById('alterAgenda'));


    return view;
})();