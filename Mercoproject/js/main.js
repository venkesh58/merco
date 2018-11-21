
$(function(){

	var urlParam = function(name, w){
            w = w || window;
            var rx = new RegExp('[\&|\?]'+name+'=([^\&\#]+)'),
                val = w.location.search.match(rx);
            return !val ? '':val[1];
    }

    function getRandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}

	function downloadCanvas(link, canvasId, filename) {
	    link.href = document.getElementById(canvasId).toDataURL();
	    link.download = filename;
	}


	function createPollBtn(id, id1){
		var inputvalue = $('#'+id).val();
		 var a_btn = $('<button/>',
	    {
	        title: inputvalue,
	        class: 'poll-button btn btn-xs'	        
	    });

	    a_btn.css("background-color", getRandomColor());
	    a_btn.html(inputvalue);

	    a_btn.appendTo($('#'+id1));

	    
	    var icon = $('<i />', {
	        "class": 'fa fa-times fa-lg close'} )
	        .appendTo(a_btn);

	    $('.poll-button .close').on('click', function() {
			    alert('remove button: ' + $(this).parent().attr("title"));
			    var id = $(this).parent().remove();
		});
	}

	function createMessageDiv(message){
		var div = $('<div />', {
        	"text": message.Message
    	} );
    	div.css("display","inline-block");
    	div.css("padding-left","10px");

    	var divTitle = $('<div />', {
        	"text": message.Username+": ",
    	} );
    	divTitle.css("display","inline-block");
    	divTitle.css("font-weight","Bold");

    	var divC = $('<div />', {
    	} );
    	divC.append(divTitle);
    	divC.append(div);
    	divC.css("float","left");
    	divC.css("clear","both");

        divC.appendTo($('#publicMessageContainer'));

	}

	function get_time_difference(earlierDate,laterDate)
	{
	       var nTotalDiff = laterDate.getTime() - earlierDate.getTime();
	       var oDiff = new Object();
	 
	       oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);
	       nTotalDiff -= oDiff.days*1000*60*60*24;
	 
	       oDiff.hours = Math.floor(nTotalDiff/1000/60/60);
	       nTotalDiff -= oDiff.hours*1000*60*60;
	 
	       oDiff.minutes = Math.floor(nTotalDiff/1000/60);
	       nTotalDiff -= oDiff.minutes*1000*60;
	 
	       oDiff.seconds = Math.floor(nTotalDiff/1000);
	 
	       return oDiff;
	 
	}

	function output_time_difference_inFormat(object){
		var hours = object.hours;
		var minutes = object.minutes;
		var seconds = object.seconds;
		var duration = "";
		if (hours != 0){
			duration = hours+"h:";
		}
		else if(minutes != 0){
			duration = duration+minutes+"m:"
		}

		duration = duration + seconds+"s"
		
		return duration;
	}

	var createChart = function(id){
		var data = {
			labels: [
		        "Yes",
		        "No",
		        "Neutral"
		    ],
		    datasets: [
		        {
		            data: [4, 2, 2],
		            backgroundColor: [
		                "#31BCA4",
		                "#D1483D",
		                "#1D89DC"
		            ], 
		            borderWidth: 5         
		        }]

		};
        
        var ctx = $("#"+id);
        ctx.width = 45;
		ctx.height = 45;

		var pieChart = new Chart(ctx, {
		    type: 'pie',
		    data: data
		});
    } 

    function unique(list) {
	  var result = [];
	  $.each(list, function(i, e) {
	    if ($.inArray(e, result) == -1) result.push(e);
	  });
	  return result;
	}

       

	var	menuRight = document.getElementById( 'cbp-spmenu-s2' ),
	chat_showRightPush = $( '.chat-right-control' ),
	settings_showRightPush = $( '#settings-right-menu' ),
	poll_showRightPush = $( '#poll-right-menu' ),
	shared_showRightPush = $( '#shared-right-menu' ),
	chat = $('#chat'),
	folder= $('#folder'),
	vote= $('#vote'),
	settings= $('#settings'),
	body = document.body;

	//"6c743b9b-f19f-4b74-a472-4081drtc14f43"; //
    var context = urlParam('context');
    var if_video = urlParam('video');
    var localUser = "Default User";
    var localGroup = "Gloabl";
    var localUserId;
    var tagTime;
    //var localId = XSockets.Utils.guid();

    //var view = new UserView(null, localId, context);

    var view = new AgendaView(null, context);

	var ws = new XSockets.WebSocket("ws://localhost:4502", ["Chat"],{
    	ctx: context
    });
    var ws1;
    var track_if_link_trigger = 0;
	
	ws.onconnected = function () {
		chat = ws.controller("chat");
		chat.on("oncontext", function (message) {
			console.log("oncontext", message);

		});

		chat.on("chatMessages", function (messages) {
			console.log("chatMessages", messages);
			for (var i=0; i < messages.length; i++){
				var message = messages[i];
				createMessageDiv(message);
			}
		});

		chat.on("chatMessage", function (message) {
			console.log("chatMessage", message);
			createMessageDiv(message);
		});

		chat.on("peerModels", function (messages){
			console.log("usermodels: ", messages);
			//var objects = [];
			//var objects1 = [];

			var dict = {};			
			for (var i=0; i < messages.length; i++)	{
				var peermodel = messages[i];
				dict[peermodel.GroupName] = peermodel.Id;
				//objects.push(peermodel.GroupName);
				//objects1.push();
			}

			//objects = unique(objects);
			//objects1 = unique(objects1);

			$('#participantsGroupName').empty();

			for (var item in dict) {
			  //console.log('key:' + item + ' value:' + dict[item]);
			  	var option = $('<option/>');
				option.attr({ 'value': item, 'id': dict[item] }).text(item);
				$('#participantsGroupName').append(option);
			  // Output
			  // key:anotherKey value:anotherValue
			}
		});

		// Get chatMessages (from DB )
		chat.invoke("chatMessages");	
		chat.invoke("peerModels");

		chat.on("userInfo", function (message) {
			localUser = message.UserName;
			localGroup = message.GroupName;

			window.localUser = localUser;
			window.localGroup = localGroup

			console.log("local user is ", window.localUser);
			console.log("local group is ", window.localGroup);
			console.log("this peer id is: ", message);

			//if (if_video == 1 && track_if_link_trigger == 0){
			if (if_video == 1){

				ws1 = new XSockets.WebSocket("ws://localhost:4502", ["connectionbroker"], {
        			ctx: context,
        			grouppeer: message.Id
    			}); 

				ws1.onconnected = function () {

					window.open('http://127.0.0.1:8080/gridsystem.cshtml?context='+context+"&peer="+message.Id, "self");
					track_if_link_trigger = 1;
		
					console.log("connection to the  secure 'broker' server is established");
				    var brokerController = ws1.controller("connectionbroker");

				    $('#muteBtn').click(function(){
				    	if ($(this).attr("rel") == "0"){
							$(this).attr("src", "images/mute_orange.png");
							$(this).attr("rel", "1");
							brokerController.invoke("MuteCommand", { mute: 1 });
						}
						else{
							$(this).attr("src", "images/mute_white.png");
							$(this).attr("rel", "0");
							brokerController.invoke("MuteCommand", { mute: 0 });
						}
					});

					var submitHostInfo = $('#submitHostInfo');
					submitHostInfo.click(function (){		
							brokerController.invoke("SetUsername",$('#hostGroupName').val()); 

					});

					var activateRecording = $('#activateRecording');
					activateRecording.click(function (){
						if ($(this).text() == "Activate") {
							$(this).text('Inactivate');
							$(this).removeClass('btn-color-record-activate');

							brokerController.invoke("ActivateRecord","1"); 
							localStorage.a = new Date();

							$('#enableTag').addClass('hidden');
							$('#bannerTagbody').removeClass('hidden');
							$('#bannerFooter').removeClass('hidden');

						}else{
							$(this).text('Activate');
							$(this).addClass('btn-color-record-activate');

							brokerController.invoke("ActivateRecord","0");

							$('#enableTag').removeClass('hidden');
							$('#bannerTagbody').addClass('hidden');
							$('#bannerFooter').addClass('hidden');
						}     	

					});

					$('#enableRecording').click(function (){
							$('#activateRecording').text('Inactivate');
							$('#activateRecording').removeClass('btn-color-record-activate');

							brokerController.invoke("ActivateRecord","1"); 
							localStorage.a = new Date();

							$('#enableTag').addClass('hidden');
							$('#bannerTagbody').removeClass('hidden');
							$('#bannerFooter').removeClass('hidden');
							

					});

					$('#stopRecordingButton').click(function (){
							$('#activateRecording').text('Activate');
							$('#activateRecording').addClass('btn-color-record-activate');

							brokerController.invoke("ActivateRecord","0");

							$('#enableTag').removeClass('hidden');
							$('#bannerTagbody').addClass('hidden');
							$('#bannerFooter').addClass('hidden');						 	

					});



					var shareScreen = $("#shareScreen");
					shareScreen.click(function (){
						$(this).removeClass('mainmenu');
						$(this).addClass('mainmenu_aftershare')
						brokerController.invoke("ShareScreen", '1');		

					});

					brokerController.on('releasesharescreen', function(number) {
						$("#shareScreen").addClass('mainmenu');
					});

					brokerController.on('recordingreceived', function(binaryMessage) {
                        var fileInfo = binaryMessage.D;
                        var blob = new Blob([binaryMessage.B], { type: "audio/webm" });
                        var blobUrl = window.URL.createObjectURL(blob);
                        // check if the file is an image, if show it, otherwise, create a download link
                        var name = XSockets.Utils.randomString(8) + ".wav";
                        var downloadLink = $('<a>',{
						    text: name,
						    download: name,
						    title: "size:" + blob.size,
						    href: blobUrl
						}).appendTo('body');
                       
                        //$("#list-files").append(downloadLink);
                        var customeLi = $('<li>');
                       	$('#recordingFiles').append(customeLi.append($('<div>').addClass('col').append(downloadLink)));
                       	var radioBtn = $('<input type="radio" name="1" value="one"/>');
                       	customeLi.append($('<div>').addClass('small').append(radioBtn));            
                    });

					$('#saveTag').on('click', function(){
						$('#tagContent').addClass('hidden');
						$('#tagCenterImage').removeClass('hidden');
						$('#bannerFooter').removeClass('hidden');
						$('#earilerTags').removeClass('hidden');
						$('#saveAllTags').css("background-color", "#26C689");
						$('#bannerFooter').css("cursor", "pointer");

						brokerController.invoke("AddTagMessage", { 
							GroupId: message.Id,
							Message: $('#tagContentArea').val(),
							Created: tagTime
						});

						$('#tagContentArea').val("");

						brokerController.invoke("TagMessagesNumber");

					});

					brokerController.on('tagMessagesNumber', function(number) {
						$('#earilerTagsNumber').text(number);
						$('#numberOfT').text(number);
					});

					brokerController.on('tagMessages', function(messages) {
						console.log(messages);
						var fileContent = "";
						for (var i=0; i<messages.length; i++){
							var message = messages[i];
							console.log(message);
							fileContent = fileContent + message.Created + ": "+message.Message;
							fileContent = fileContent + "\n";
						}

						var data = new Blob([fileContent], {type: 'text/plain'});
						var blobUrl = window.URL.createObjectURL(data);
                        // check if the file is an image, if show it, otherwise, create a download link
                        var name = $('#tagRecordName').val() + ".txt";
                        var downloadLink = $('<a>',{
						    text: name,
						    download: name,
						    title: "size:" + data.size,
						    href: blobUrl
						});
                       
                        //$("#list-files").append(downloadLink);
                        var customeLi = $('<li>');
                       	$('#otherSharedFiles').append(customeLi.append($('<div>').addClass('col').append(downloadLink)));
                       	var radioBtn = $('<input type="radio" name="1" value="one"/>');
                       	customeLi.append($('<div>').addClass('small').append(radioBtn)); 

					});

					$('#saveAllTags').on('click', function(){
						$('#tagContent').addClass('hidden');
						$('#tagCenterImage').addClass('hidden');
						$('#bannerFooter').addClass('hidden');
						$('#earilerTags').addClass('hidden');
						$('#saveTagContent').removeClass('hidden');

					});
					$('#cancelTagsButton').on('click', function(){
						$('#tagContent').addClass('hidden');
						$('#tagCenterImage').removeClass('hidden');
						$('#bannerFooter').removeClass('hidden');
						$('#earilerTags').removeClass('hidden');
						$('#saveTagContent').addClass('hidden');

					});

					$('#saveTagsButton').on('click', function(){
						$('#tagContent').addClass('hidden');
						$('#tagCenterImage').removeClass('hidden');
						$('#bannerFooter').removeClass('hidden');
						$('#earilerTags').removeClass('hidden');
						$('#saveTagContent').addClass('hidden');

						brokerController.invoke("TagMessages");

					});

					if($('#activateRecording').text() == "Activate"){
						$('#enableTag').removeClass('hidden');
						$('#bannerTagbody').addClass('hidden');
						$('#bannerFooter').addClass('hidden');
					}
				};
			}

			if (if_video == undefined || if_video == 0){
				ws1 = new XSockets.WebSocket("ws://localhost:4502", ["connectionbroker"], {
        			ctx: context,
        			grouppeer: message.Id
    			}); 
				var counting = 0;
    			ws1.onconnected = function () {
    				var brokerController = ws1.controller("connectionbroker");

    				brokerController.on('recordingreceived', function(binaryMessage) {
    					counting++;
                        var fileInfo = binaryMessage.D;
                        var blob = new Blob([binaryMessage.B], { type: "audio/webm" });
                        var blobUrl = window.URL.createObjectURL(blob);
                        // check if the file is an image, if show it, otherwise, create a download link
                        var name = counting + ".wav";
                        var downloadLink = $('<a>',{
						    text: name,
						    download: name,
						    title: "size:" + blob.size,
						    href: blobUrl
						}).appendTo('body');
                       
                        //$("#list-files").append(downloadLink);
                        var customeLi = $('<li>');
                       	$('#recordingFiles').append(customeLi.append($('<div>').addClass('col').append(downloadLink)));
                       	var radioBtn = $('<input type="radio" name="1" value="one"/>');
                       	customeLi.append($('<div>').addClass('small').append(radioBtn));            
                    });

					
					brokerController.on('tagMessages', function(messages) {
						console.log(messages);
						var fileContent = "";
						for (var i=0; i<messages.length; i++){
							var message = messages[i];
							console.log(message);
							fileContent = fileContent + message.Created + ": "+message.Message;
							fileContent = fileContent + "\n";
						}

						var data = new Blob([fileContent], {type: 'text/plain'});
						var blobUrl = window.URL.createObjectURL(data);
                        // check if the file is an image, if show it, otherwise, create a download link
                        var name = $('#tagRecordName').val() + ".txt";
                        if (name == ".txt"){
                        	name = "tag file 1.txt";
                        }
                        var downloadLink = $('<a>',{
						    text: name,
						    download: name,
						    title: "size:" + data.size,
						    href: blobUrl
						});
                       
                        //$("#list-files").append(downloadLink);
                        var customeLi = $('<li>');
                       	$('#otherSharedFiles').append(customeLi.append($('<div>').addClass('col').append(downloadLink)));
                       	var radioBtn = $('<input type="radio" name="1" value="one"/>');
                       	customeLi.append($('<div>').addClass('small').append(radioBtn)); 

					});

    			};
			}
		});

		chat.on("usernamegroupnameChange", function (message) {
			console.log("usernameChange", message);
			chat.invoke("getUserName");
			chat.invoke("peerModels");
		});

		var submitHostInfo = $('#submitHostInfo');
		submitHostInfo.click(function (){
			if ($('#hostPersonalName').val().trim().length == 0) {
				alert("Please provide a name for the user before submitting");
				return;
			}else{
				chat.invoke("SetUserNameAndGroupName", { 
					UserName: $('#hostPersonalName').val(), 
					GroupName: $('#hostGroupName').val()
				});
				$('.modalDialog').css('opacity', '0');
				$('.modalDialog').css('pointer-events', 'none');
			}     	

		});

		var submitParticipantInfo = $('#submitParticipantInfo');
		submitParticipantInfo.click(function (){
			if ($('#participantPersonalName').val().trim().length == 0) {
				alert("Please provide a name for the user before submitting");
				return;
			}else{
				chat.invoke("SetUserNameAndGroupName", { 
					UserName: $('#participantPersonalName').val(),
					GroupName: $('#participantsGroupName').val(),
					Id: $('#participantsGroupName').children(":selected").attr("id")
				});

				$('.modalDialog').css('opacity', '0');
				$('.modalDialog').css('pointer-events', 'none');
			}     	

		});

		var saveChangingUserName = $('#changeUserName');
		saveChangingUserName.click(function (){
			if ($('#username_newvalue').val().trim().length == 0) {
				alert("Please provide a name for the user before submitting");
				return;
			}else{
				chat.invoke("SetUserName", { username: $('#username_newvalue').val() });
				$('#username_newvalue').val(""); 
			}     	

		});
			

		chat.invoke("GetUserName");

		$("#publicSend").on("click", function () {
			chat.invoke("chatMessage", {
				Location: "Sweden",
				Username: localUser,
				Message : $('#chatcontent').val()
			});
			$('#chatcontent').val("");
		});

	};
  
    if (if_video == 1){
		//$(".morderator").removeClass("hidden");
		$("#participants").addClass('hidden');
		$(".participants").addClass('hidden');
		$('#footer').removeClass('hidden');
	}
	else{
		$("#poll-right-menu").addClass('hidden');	
		$("#morderator").addClass("hidden");
		$('#footer').addClass('hidden');
		$("#chat-right-menu").css("top", "20%");
		$("#shared-right-menu").css("top", "40%");
		$("#settings-right-menu").css("top", "60%");
		$(".host").addClass('hidden');

		//$(".participants").removeClass('hidden');
	}

	/*if(window.localUser != undefined || window.localUser != ""){
		$('.modalDialog').css('opacity', '0');
		$('.modalDialog').css('pointer-events', 'none');
	}*/

	$("#username_input").trigger('click');


	$('#recording').click(function(){
		$('#recording').addClass('hidden');
		$('#expand-recording').removeClass('hidden');
	});

	$('#check').click(function(){
		$('#recording').removeClass('hidden');
		$('#expand-recording').addClass('hidden');
	});

	$('#close-raise-banner').click(function(){
		$('#rasie-question').removeClass('hidden');
		$('#expand-rasie-question').addClass('hidden');
	});


	$('#rasie-question').click(function(){
		$('#rasie-question').addClass('hidden');
		$('#expand-rasie-question').removeClass('hidden');
	});

	$('#close-tag-banner').click(function(){
		$('#recording').removeClass('hidden');
		$('#expand-recording').addClass('hidden');
	});

	$('#polling').click(function(){
		$('#polling').addClass('hidden');
		$('#expand-polling').removeClass('hidden');
	});

	$('.close').click(function(){
		$('.modalDialog').css('opacity', '0');
		$('.modalDialog').css('pointer-events', 'none');
		
	});

	$('#close-polling-banner').click(function(){
		$('#polling').removeClass('hidden');
		$('#expand-polling').addClass('hidden');
	});

	chat_showRightPush.click( function() {
		if (settings_showRightPush.hasClass('right-control-yellow-color')){
			settings_showRightPush.removeClass('right-control-yellow-color');
			settings_showRightPush.addClass('right-control-gray-color');

		}
		else if (poll_showRightPush.hasClass('right-control-yellow-color')){
			poll_showRightPush.removeClass('right-control-yellow-color');
			poll_showRightPush.addClass('right-control-gray-color');
		}
		else if (shared_showRightPush.hasClass('right-control-yellow-color')){
			shared_showRightPush.removeClass('right-control-yellow-color');
			shared_showRightPush.addClass('right-control-gray-color');
		}
		else{
			classie.toggle( this, 'active' );
			classie.toggle( body, 'cbp-spmenu-push-toleft' );
			classie.toggle( menuRight, 'cbp-spmenu-open' );
		}

		if ($(this).hasClass('right-control-yellow-color')){
			$(this).removeClass('right-control-yellow-color');
			$(this).addClass('right-control-gray-color');
		}
		else {
			$(this).removeClass('right-control-gray-color');
			$(this).addClass('right-control-yellow-color');
		}
		$(this).removeClass('hidden');
		$("#chat-container").removeClass('hidden');
		$("#settings-container").addClass('hidden');
		$("#poll-container").addClass('hidden');
		$("#shared-container").addClass('hidden');

	});

	settings_showRightPush.click( function() {
		if (chat_showRightPush.hasClass('right-control-yellow-color')){
			chat_showRightPush.removeClass('right-control-yellow-color');
			chat_showRightPush.addClass('right-control-gray-color');
		}
		else if (poll_showRightPush.hasClass('right-control-yellow-color')){
			poll_showRightPush.removeClass('right-control-yellow-color');
			poll_showRightPush.addClass('right-control-gray-color');
		}
		else if (shared_showRightPush.hasClass('right-control-yellow-color')){
			shared_showRightPush.removeClass('right-control-yellow-color');
			shared_showRightPush.addClass('right-control-gray-color');
		}
		else{
			classie.toggle( this, 'active' );
			classie.toggle( body, 'cbp-spmenu-push-toleft' );
			classie.toggle( menuRight, 'cbp-spmenu-open' );
		}

		if ($(this).hasClass('right-control-yellow-color')){
			$(this).removeClass('right-control-yellow-color');
			$(this).addClass('right-control-gray-color');
		}
		else {
			$(this).removeClass('right-control-gray-color');
			$(this).addClass('right-control-yellow-color');
		}

		$(this).removeClass('hidden');
		$("#settings-container").removeClass('hidden');
		$("#chat-container").addClass('hidden');
		$("#poll-container").addClass('hidden');
		$("#shared-container").addClass('hidden');
		
	});

	poll_showRightPush.click( function() {
		if (chat_showRightPush.hasClass('right-control-yellow-color')){
			chat_showRightPush.removeClass('right-control-yellow-color');
			chat_showRightPush.addClass('right-control-gray-color');
		}
		else if (settings_showRightPush.hasClass('right-control-yellow-color')){
			settings_showRightPush.removeClass('right-control-yellow-color');
			settings_showRightPush.addClass('right-control-gray-color');
		}
		else if (shared_showRightPush.hasClass('right-control-yellow-color')){
			shared_showRightPush.removeClass('right-control-yellow-color');
			shared_showRightPush.addClass('right-control-gray-color');
		}
		else{
			classie.toggle( this, 'active' );
			classie.toggle( body, 'cbp-spmenu-push-toleft' );
			classie.toggle( menuRight, 'cbp-spmenu-open' );
		}

		if ($(this).hasClass('right-control-yellow-color')){
			$(this).removeClass('right-control-yellow-color');
			$(this).addClass('right-control-gray-color');
		}
		else {
			$(this).removeClass('right-control-gray-color');
			$(this).addClass('right-control-yellow-color');
		}

		$(this).removeClass('hidden');
		$("#settings-container").addClass('hidden');
		$("#chat-container").addClass('hidden');
		$("#shared-container").addClass('hidden');
		$("#poll-container").removeClass('hidden');
		
	});

	shared_showRightPush.click( function() {
		if (chat_showRightPush.hasClass('right-control-yellow-color')){
			chat_showRightPush.removeClass('right-control-yellow-color');
			chat_showRightPush.addClass('right-control-gray-color');
		}
		else if (settings_showRightPush.hasClass('right-control-yellow-color')){
			settings_showRightPush.removeClass('right-control-yellow-color');
			settings_showRightPush.addClass('right-control-gray-color');
		}
		else if (poll_showRightPush.hasClass('right-control-yellow-color')){
			poll_showRightPush.removeClass('right-control-yellow-color');
			poll_showRightPush.addClass('right-control-gray-color');
		}
		else{
			classie.toggle( this, 'active' );
			classie.toggle( body, 'cbp-spmenu-push-toleft' );
			classie.toggle( menuRight, 'cbp-spmenu-open' );
		}

		if ($(this).hasClass('right-control-yellow-color')){
			$(this).removeClass('right-control-yellow-color');
			$(this).addClass('right-control-gray-color');
		}
		else {
			$(this).removeClass('right-control-gray-color');
			$(this).addClass('right-control-yellow-color');
		}

		$(this).removeClass('hidden');
		$("#settings-container").addClass('hidden');
		$("#chat-container").addClass('hidden');
		$("#poll-container").addClass('hidden');
		$("#shared-container").removeClass('hidden');
		
	});

	chat.click(function(){
		chat.addClass('active');
		folder.removeClass('active');
		vote.removeClass('active');
		settings.removeClass('active');
		$('#chat-panel').show();
		$('#folder-panel').hide();
		$('#vote-panel').hide();
		$('#settings-panel').hide();
	});
	folder.click(function(){
		chat.removeClass('active');
		folder.addClass('active');
		vote.removeClass('active');
		settings.removeClass('active');
		$('#chat-panel').hide();
		$('#folder-panel').show();
		$('#vote-panel').hide();
		$('#settings-panel').hide();
	});

	vote.click(function(){
		chat.removeClass('active');
		folder.removeClass('active');
		vote.addClass('active');
		settings.removeClass('active');
		$('#chat-panel').hide();
		$('#folder-panel').hide();
		$('#vote-panel').show();
		$('#settings-panel').hide();
	});
	settings.click(function(){
		chat.removeClass('active');
		folder.removeClass('active');
		vote.removeClass('active');
		settings.addClass('active');
		$('#chat-panel').hide();
		$('#folder-panel').hide();
		$('#vote-panel').hide();
		$('#settings-panel').show();
	});

	$('#change-username-container-expand').on('click',function(){
    	$('#change-username-container').toggleClass("hide-container");

    	if ($(this).hasClass('fa-chevron-circle-down')){  	
    		$('#change-username-container-expand').attr("class", "fa fa-angle-up fa-lg");	
    	}	
    	else{  
    		$('#change-username-container-expand').attr("class", "fa fa-angle-down fa-lg");	
    	}
    });
    $('#change-groupname-container-expand').on('click',function(){
    	$('#change-groupname-container').toggleClass("hide-container");

    	if ($(this).hasClass('fa-chevron-circle-down')){  	
    		$('#change-groupname-container-expand').attr("class", "fa fa-angle-up fa-lg");	
    	}	
    	else{  
    		$('#change-groupname-container-expand').attr("class", "fa fa-angle-down fa-lg");	
    	}
    });

    $('#change-language-container-expand').on('click',function(){
    	$('#change-transribe-language-container').toggleClass("hide-container");

    	if ($(this).hasClass('fa-chevron-circle-down')){  	
    		$('#change-language-container-expand').attr("class", "fa fa-angle-up fa-lg");	
    	}	
    	else{  
    		$('#change-language-container-expand').attr("class", "fa fa-angle-down fa-lg");	
    	}
    });

    $('.poll-button .close').on('click', function() {
	    alert('remove button: ' + $(this).parent().attr("title"));
	    var id = $(this).parent().remove();
	});

	$('#create_poll_answer').on('click', function() {
		createPollBtn("addition_poll_answer", "poll_btn_answers");
	});

	$('#participant_create_poll_answer').on('click', function() {
	    createPollBtn("participant_addition_poll_answer", "participant_poll_btn_answers");
	});


	$('#pollCreateButton').on('click', function(){
		$('#answerPollPanel').removeClass('hidden');
		$('#createpollExpand').text("Create a new poll");
		$('#createPollQuestionContainer').addClass('hidden');
		$('#resultPollPanel').addClass('hidden');
		
		var icon = $('<img />', {
	        "src": 'images/add_topic_agenda.png'
	    	} )
	        .appendTo($('#createpollExpand'));
	    icon.css("margin-left", "10px");

	        icon.on('click', function() {
			    
			    $('#createPollQuestionContainer').removeClass('hidden');
			    $('#createpollExpand').text("Create a poll");
			});

	});

	$('#participantsPollCreateButton').on('click', function(){
		$('#participantAnswerPoll').removeClass('hidden');
		$('#participantCreatePoll').addClass('hidden');

	});

	$('#sendPollResult').on('click', function(){
		$('#answerPollPanel').addClass('hidden');
		$('#resultPollPanel').removeClass('hidden');
		createChart("resultsChart");	
	});

	$('#participantSendPollResult').on('click', function(){
		$('#participantAnswerPoll').addClass('hidden');
		$('#participantCreatePoll').addClass('hidden');
		$('#participantResultPoll').removeClass('hidden');
		createChart("resultsChart1");	
	});

	$('#btn-download').on('click', function(){
		downloadCanvas(this, 'resultsChart', 'result.png');
	});

	$('#expandAlterAgendaContainer').on('click', function(){
		$(this).addClass('hidden');
		$('#alterAgendaContainer').removeClass('hidden');
		$('.footer').css('bottom', '0');
	});

	$('#closeAlterAgendaContainer').on('click', function(){
		$('#alterAgendaContainer').addClass('hidden');
		$('#expandAlterAgendaContainer').removeClass('hidden');
		$('.footer').css('bottom', '-10px');
	});

	$('#tagButton').on('click', function(){
		$('#tagCenterImage').addClass('hidden');
		$('#tagContent').removeClass('hidden');
		$('#bannerFooter').addClass('hidden');
		var myDate = new Date(localStorage.a); //Date.parse();

		//$('#tagContentArea').text(myDate);
		var diff = get_time_difference(myDate, new Date());

		tagTime = output_time_difference_inFormat(diff);
		$('#tagContentArea').attr('placeholder', tagTime + " - Add tag description");
	});


}); 
