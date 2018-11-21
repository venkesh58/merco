
$(function(){

	function sendEmail(message)
	{

		var message1 = $("#videolink").val();
        var message2 = $("#chatlink").val();
        message = message1.concat(message2);

	    //window.location = "mailto:xyz@abc.com";
	    var email="";
        var subject = 'Meeting';
        var emailBody = 'Hi:';
        emailBody = emailBody.concat(encodeURIComponent("\n"));
        emailBody = emailBody.concat("Link to Video:");
        emailBody = emailBody.concat(encodeURIComponent(message1));
        emailBody = emailBody.concat(encodeURIComponent("\n"));
        emailBody = emailBody.concat("Link to Chat only:");
        emailBody = emailBody.concat(encodeURIComponent(message2));


        window.location = "mailto:"+email+"?subject="+subject+"&body="+emailBody;
	}

	new Clipboard('#copylink');	
	var track = 3;

	$( "#plus" ).click(function() {
		var row = $(this).parent().parent();
		var parent = $(this).parent();
		
		var icon = null;
		track++;

		if ( parent.hasClass( "col-do-nothing" )) {
			var firstcol = $('<div />', {
	        "class": 'col-md-6 agendar-content',
	        "id": (track+1)} )
	        .appendTo(row);

	        $(this).detach().appendTo(firstcol);


	        var inputfiled = $('<input />', {
	        "class": 'input-field span2',
	    	"type": 'text'} )
	        .appendTo(parent);

	        parent.attr("id", track );

	        inputfiled.after(" ");

	        icon = $('<i />', {
	        "class": 'fa fa-times',
	    	"name":  track} )
	        .appendTo(parent);
		}
		else{
			var secondcol = $('<div />', {
	        "class": 'col-md-6 agendar-content col-do-nothing',
	    	"id": (track+1) } )
	        .appendTo(row);

	        $(this).detach().appendTo(secondcol);

	        var inputfiled = $('<input />', {
	        "class": 'input-field span2',
	    	"type": 'text'} )
	        .appendTo(parent);
	        
	       	inputfiled.after(" ");

	        icon = $('<i />', {
	        "class": 'fa fa-times',
	    	"name":  track } )
	        .appendTo(parent);

	        parent.attr('id', track);

	        //parent.addClass('col-md-offset-2 ');
		}
		
		$('.fa-times').unbind().click(function(){

			var nameStr = $(this).attr("name");
			var name = parseInt(nameStr);	
			
			$('#agendar-c').children('div').each(function () {
				var idStr = $(this).attr('id');
				var id = parseInt(idStr);
				if (id > name){
					$(this).attr("id", (id-1));
					$(this).find('i').attr("name", (id-1));
					
					var new_id = $(this).attr('id');
					if (new_id%2==0 && !$(this).hasClass("col-do-nothing")){
						$(this).addClass("col-do-nothing");
					}	
					else if (new_id%2==1 && $(this).hasClass("col-do-nothing")){
						$(this).removeClass("col-do-nothing");
					}

				}				

			});	

			$(this).parent().remove();	
 
    	});

	});

	$('.fa-times').unbind().click(function(){


			var nameStr = $(this).attr("name");
			var name = parseInt(nameStr);
			
			$('#agendar-c').children('div').each(function () {
				var idStr = $(this).attr('id');
				var id = parseInt(idStr);

				if (id > name){
					$(this).attr("id", (id-1));
					$(this).find('i').attr("name", (id-1));
					
					var new_id = $(this).attr('id');
					if (new_id%2==0 && !$(this).hasClass("col-do-nothing")){
						$(this).addClass("col-do-nothing");
					}	
					else if (new_id%2==1 && $(this).hasClass("col-do-nothing")){
						$(this).removeClass("col-do-nothing");
					}
	
				}				

			});	
			$(this).parent().remove();	

    });

    $('input[type="time"][value="now"]').each(function(){    
	    var d = new Date(),        
	        h = d.getHours(),
	        m = d.getMinutes();
	    	if(h < 10) h = '0' + h; 
	    	if(m < 10) m = '0' + m; 
	    	$(this).attr({
	      	'value': h + ':' + m
	    	});
  		});


	$('#copylink').on('click',function(){
    	$(this).tooltip({placement: 'bottom',trigger: 'manual'}).tooltip('show');
    	setTimeout(function() {
    				$('#copylink').tooltip('destroy'); 
 	  	}, 500);
    			
    });

    $('#time-container-expand').on('click',function(){
    	$('#time-input-container').toggleClass("hide-container");

    	if ($(this).hasClass('fa-chevron-circle-down')){  	
    		$("#submit-time").css("visibility", "visible");	
    		$('#time-container-expand').attr("class", "fa fa-chevron-circle-up fa-lg");	
    	}	
    	else{  
    		$("#submit-time").css("visibility", "hidden"); 		
    		$('#time-container-expand').attr("class", "fa fa-chevron-circle-down fa-lg");	
    	}
    });

	$('#agenda-container-expand').on('click',function(){
    	$('#agenda-con').toggleClass("hide-container");
    	if ($(this).hasClass('fa-chevron-circle-down')){
    		$("#submit-agenda").css("visibility", "visible");
    		$('#agenda-container-expand').attr("class", "fa fa-chevron-circle-up fa-lg");	
    	}	
    	else{
    		$("#submit-agenda").css("visibility", "hidden");
    		$('#agenda-container-expand').attr("class", "fa fa-chevron-circle-down fa-lg");	
    	}
    });

	$("#mail").on('click',function(){
		sendEmail();
	});

    var guid = XSockets.Utils.guid();
    var videolink = "http://127.0.0.1:8080/main.cshtml?context=" + guid + "&video=1";
    var chatlink = "http://127.0.0.1:8080/main.cshtml?context=" + guid + "&video=0";

    $("#videolink").attr("value", videolink);
    $("#chatlink").attr("value", chatlink);
    	
    var view = new AgendaView(null, guid);

    //----------------- Time Code from Tinashe ----------------//

    var context = guid;
           
	var starttimekey = context + "starttimekey";
	var endtimekey = context + "endtimekey";
		   

	var ws = new XSockets.WebSocket("ws://localhost:4502", ["Chat"],{
    	ctx: context
    });

	var timestorage = ws.controller("Chat");
			
	var submitTime = $('#submit-time');
			

			
	submitTime.click(function (){
				
		var txt;
		
		var meetingdate = $('#meeting_date').val().toString();
		var starttime = $('#start_time').val().toString();
		var endtime = $('#end_time').val().toString();
		var timezone = $('#time_zone').val().toString();
		

		
		if( meetingdate === '' || starttime === '' || endtime === '' || timezone === '' ){
			txt = 'Some fields are empty! Refresh the page and enter again';
			//document.getElementById("feedback").innerHTML = txt;
			alert(txt);
			
		} 
		else {
		
			var Starttime_string = meetingdate +" "+ starttime +" "+ timezone;
			var Endtime_string = meetingdate +" "+ endtime +" "+ timezone;
			
			var t1 = Date.parse(Starttime_string) - Date.parse(new Date());
			var t2 = Date.parse(Endtime_string) - Date.parse(Starttime_string);
						
			if(t1 < 0){
				txt = "The meeting time has already passed! Refresh the page and enter again";
				//document.getElementById("feedback").innerHTML = txt;
				alert(txt);					
			}
			else if (t2 < 0) {
				txt = "Meeting end time can not be earlier than start time! Refresh the page and enter again";
				//document.getElementById("feedback").innerHTML = txt;
				alert(txt);
			}
			else
			{
							
				console.log(Starttime_string);
				console.log(Endtime_string);
				
				timestorage.storageSet(starttimekey, Starttime_string);
				timestorage.storageSet(endtimekey, Endtime_string);

				var Starttime;
				var Endtime;

				timestorage.storageGet( starttimekey, function(data)
				{		
					Starttime = data.V;
					console.log("I am here dude");
					
					if(Starttime !== '' || Starttime !== undefined || Starttime !== null)
					{
						
						timestorage.storageGet(endtimekey, function(data){	
							Endtime = data.V;
							console.log("I am here dude");
						
							if (Endtime !== ''|| Endtime !== undefined || Endtime !== null) {
								txt = "Request suceeded:"
								//document.getElementById("feedback").innerHTML = txt + 'Start time is: ' + Starttime +'End time is: ' + Endtime;
								alert(txt);
							}
							else {
								txt = "Request not succeeded! The web service might be down";
								//document.getElementById("feedback").innerHTML = txt;
								alert(txt);
							}
						});
					}						
				});
			}
		}
	});

   // End Time Code/ -----------------------------  //

});