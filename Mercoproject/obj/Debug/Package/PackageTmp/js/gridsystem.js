;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

var hark = require('../hark.js');

var bows = require('bows');

var tagVolumes = [];

var streamVolumes = [];
var referenceVolumes = [];
for (var i = 0; i < 100; i++) {
  tagVolumes.push(-100);
  streamVolumes.push(-100);
  referenceVolumes.push(-50);
}


$(function(){

    var urlParam = function(name, w){
            w = w || window;
            var rx = new RegExp('[\&|\?]'+name+'=([^\&\#]+)'),
                val = w.location.search.match(rx);
            return !val ? '':val[1];
    }

    function progress(timeleft, timetotal, $element) {
        var progressBarWidth = timeleft * $element.width() / timetotal;
        $element
            .find('div')
            .animate({ width: progressBarWidth }, 500)
            .html(timeleft + " seconds");
        if(timeleft > 0) {
            setTimeout(function() {
                progress(timeleft - 1, timetotal, $element);
            }, 1000);
        }
    };

    function createGroupNameDivAndVideoDiv(video, id, height, customClass, parentDiv){
        var div = $('<div />', {
            "class": customClass,
            "height": height
        } );

        var div1 = $('<div />', {
            "class": "custom-message",
            "id": id,
            'width': 150
        } );             

        div.append(video);
        div.append(div1);
        $(document.getElementById(parentDiv)).append(div);

        var vid = div.find("video").first();
        if (parentDiv == "videospeaking"){
            div1.css({
                top: vid.height()-40,
                left:vid.offset().left + div1.width()
            });
        }
        else{
            div1.css({
                top: vid.height() -25,
                left:vid.offset().left + div1.width()/2 + 20
            });
        }
        
    }

    function adjustGroupNameDiv(video){
        var div = $('#'+video.attr('name'));
        div.css({
                top: video.height() - 25,
                left:video.offset().left + div.width()/2 + 20
        });
    }

    function createRemoteVideo(peerId,mediaStream){
        var remoteVideo = document.createElement("video");
        remoteVideo.setAttribute("autoplay", "autoplay");
        remoteVideo.setAttribute("height", "100%");
        remoteVideo.setAttribute("rel",peerId);
        remoteVideo.setAttribute("name",mediaStream.id);
        attachMediaStream(remoteVideo, mediaStream);

        return remoteVideo;
    }
    
    var context = urlParam('context');
    var groupPeerId = urlParam('peer');

    // ------------- Tinashe Codes for Timing ---------- //


            var starttimekey = context + "starttimekey";
            var endtimekey = context + "endtimekey";         
            var ws = new XSockets.WebSocket("ws://localhost:4502", ["Chat"],{
                ctx: context
            });

            var onError = function(err) {
                     console.log("error:", err);
           };
           
           var timestorage = ws.controller("Chat");
           
           
           function getTimeRemaining(endtime) {
               var t = Date.parse(endtime) - Date.parse(new Date());
               var seconds = Math.floor((t / 1000) % 60);
               var minutes = Math.floor((t / 1000 / 60) % 60);
               var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
               var days = Math.floor(t / (1000 * 60 * 60 * 24));
               return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
               };
            }

            function initializeClock(id, endtime) {
              var clock = document.getElementById(id);
              var daysSpan = clock.querySelector('.days');
              var hoursSpan = clock.querySelector('.hours');
              var minutesSpan = clock.querySelector('.minutes');
              var secondsSpan = clock.querySelector('.seconds');

              function updateClock() {
                var t = getTimeRemaining(endtime);

                //daysSpan.innerHTML = t.days;
                hoursSpan.innerHTML = ('0' + t.hours).slice(-2)+":";
                minutesSpan.innerHTML = ('0' + t.minutes).slice(-2)+":";
                secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

                if (t.total <= 0) {
                  clearInterval(timeinterval);
                }
              }

              updateClock();
              var timeinterval = setInterval(updateClock, 1000);
            }

            var Starttime;
            var Endtime;
            
            timestorage.storageGet( endtimekey, function(data){   
                Endtime = data.V;

                timestorage.storageGet( starttimekey, function(data){   
                    Starttime = data.V;


                    var totalMeetingTimeInSeconds = (Date.parse(Endtime) - Date.parse(Starttime))/1000;
                    var remainMeetingTimeInSeconds = (Date.parse(Endtime) - Date.parse(new Date()))/1000;
                    var t2 = Date.parse(Starttime) - Date.parse(new Date());

                    if (t2 <= 0){
                        progress(remainMeetingTimeInSeconds, totalMeetingTimeInSeconds, $('.progressBar'));
                    }
                    else{
                        progress(0, 180, $('.progressBar'));
                    }

                    
                });
                initializeClock('clockdiv', Endtime);
            });

           


    // ------------- End codes for Timing ------------//


    var view = new AgendaView(null, context);

   /* var object = [ "topic 1: Introduction", "topic 2: webrtc", "topic 3: design process", "topic 4: advanced features", "topic 5: ending"];*/

			var brokerController, ws, webRTC, localid;
	  		// we pass a 'static' guid as a parameters , see ctx below
            var speaking_plus_below = $("#videoscreen video").length + $("#videospeaking video").length;
            
            //ws = new XSockets.WebSocket("wss://rtcplaygrouund.azurewebsites.net:443", ["connectionbroker"], {
            ws = new XSockets.WebSocket("ws://localhost:4502", ["connectionbroker"], {
                ctx: context,
                grouppeer: groupPeerId
            }); 

            var screenheight = $( document ).height() * 0.9; 


            var onError = function(err) {
              console.log("error:", err);
            };

                var addRemoteVideo = function(peerId,mediaStream) {

                	var count_botton_videos = $("#videoscreen video").length;
                	var count_speaking_videos = $("#videospeaking video").length;
                	if (count_speaking_videos == 0){
	                
	                    var remoteVideo = createRemoteVideo(peerId,mediaStream);

                        createGroupNameDivAndVideoDiv(remoteVideo, mediaStream.id, screenheight * 0.6, "col-md-12", 'videospeaking');                      
	                	
                	}
                	else if (count_botton_videos == 1){

                		var remoteVideo = createRemoteVideo(peerId,mediaStream);
                        createGroupNameDivAndVideoDiv(remoteVideo, mediaStream.id, screenheight * 0.3, "col-md-6", 'videoscreen');

                        $( "#videoscreen > div" ).each(function() {    
                            $(this).attr('class',"col-md-6");
                            var video = $(this).find("video").first();
                            if (video.attr('name') != mediaStream.id){
                             adjustGroupNameDiv(video);
                            }

                        });
                        

                	}
                	else if (count_botton_videos == 2){						

	                    var remoteVideo = createRemoteVideo(peerId,mediaStream);
                        createGroupNameDivAndVideoDiv(remoteVideo, mediaStream.id, screenheight * 0.3, "col-md-4", 'videoscreen');

                        $( "#videoscreen > div" ).each(function() {    
                            $(this).attr('class',"col-md-4");
                            var video = $(this).find("video").first();
                            if (video.attr('name') != mediaStream.id){
                                adjustGroupNameDiv(video);
                            }

                        });

                	}

                	else if (count_botton_videos == 3){
                       
	                    var remoteVideo = createRemoteVideo(peerId,mediaStream);
                        createGroupNameDivAndVideoDiv(remoteVideo, mediaStream.id, screenheight * 0.3, "col-md-3", 'videoscreen');

                        $( "#videoscreen > div" ).each(function() {    
                            $(this).attr('class',"col-md-3");
                            var video = $(this).find("video").first();
                            if (video.attr('name') != mediaStream.id){
                                adjustGroupNameDiv(video);
                            }

                        });

                        
	                	
                	}

                	if (count_botton_videos == 4){

						$('.rightlayout').css("display","");

                        $('#videospeaking').css( "width", "70%" );
                        $('.belowlayout').css( "width", "70%" );

						$("video1").detach().appendTo('#videospeaking');
						
                        var trackvideo = 0;

                        $( "#videoscreen video" ).each(function() {                		 	
                		 	if (trackvideo < 2){

                		 		$(this).attr('class',"col-md-6");
                		 	
                            }else{
                                var video = $(this);
                                var remoteVideo = $('<video />', {
                                "autoplay": 'true',
                                "src": video.attr('src'),
                                "rel": video.attr('rel'),
                                "class": 'col-md-12',
                                "height": (screenheight * 0.3),
                                "id": video.attr('id')
                                } ).appendTo($("#videoscreenright"));

                                remoteVideo.css('margin-bottom', '5px');

                                $(this).remove();
                		 	}

                		 	trackvideo++;
                		});



	                    var remoteVideo = document.createElement("video");
	                    remoteVideo.setAttribute("autoplay", "true");
	                    remoteVideo.setAttribute("rel",peerId);
	                    attachMediaStream(remoteVideo, mediaStream);

	                   
	                    remoteVideo.setAttribute("class", "col-md-12");

	                    remoteVideo.setAttribute("height", screenheight * 0.3);
	                    remoteVideo.setAttribute("id", mediaStream.id);
	                    
	                    $("#videoscreenright").append(remoteVideo);
	                	
                	}

                    brokerController.invoke("userInfo");
                };


                var onConnectionLost = function (remotePeer) {
                    console.log("onconnectionlost");

                    var peerId = remotePeer.PeerId;
                    var videoToRemove = $("video[rel='" + peerId + "']");
                    //var alignDiv = $('#'+videoToRemove.attr('name'));
                    videoToRemove.parent().remove();
                    videoToRemove.remove();
                    //videoToRemove.remove();

                    var count = $("#videoscreen video").length + $("#videoscreenright video").length + $("#videospeaking video").length;     
                    
                    $('#videospeaking').css( "width", "100%" );
                    $('.belowlayout').css( "width", "100%" );

                    var speakingvideo_number = $("#videospeaking video").length;

                    if (speakingvideo_number == 0){
                        var secondDiv = $( "#videoscreen > :first-child" ).next();
                        var video = secondDiv.children('video').first();

                        var newVideo = document.createElement("video");
                        newVideo.setAttribute("autoplay", "true");
                        newVideo.setAttribute("src", video.attr('src'));
                        newVideo.setAttribute("height", '100%');
                        newVideo.setAttribute("rel", video.attr('rel'));
                        newVideo.setAttribute("name", video.attr('name'));

                        var alignDiv = $('#'+video.attr('name')).remove();

                        createGroupNameDivAndVideoDiv(newVideo, video.attr('name'), screenheight * 0.6, "col-md-12", 'videospeaking');

                       
                        video.parent().remove();
                    }
                  
                    $( "#videoscreen > div" ).each(function() {
                        
                        if (count == 5){
                            $(this).attr('class',"col-md-3");  
                        }
                        else if (count == 4) {
                            $(this).attr('class',"col-md-4");
                        }
                        else if (count == 3) {
                            $(this).attr('class',"col-md-6");
                        } 
                        else if (count == 2) {
                            $(this).attr('class',"col-md-12");                       
                        }

                        var video = $(this).find("video").first();
                        adjustGroupNameDiv(video);      
                    });

                    $( "#videoscreenright video" ).each(function() {
                        var video = $(this);
                            //$(this).detach().appendTo('#videoscreen');
                        var newVideo = document.createElement("video");
                        newVideo.setAttribute("autoplay", "true");
                        newVideo.setAttribute("rel", video.attr('rel'));
                        newVideo.setAttribute("src", video.attr('src'));
                        newVideo.setAttribute("height", screenheight * 0.3);
                        newVideo.setAttribute("id", video.attr('id'));

                        if (count == 5){
                            newVideo.setAttribute("class","col-md-3");
                        }
                        else if (count == 4) {
                            newVideo.setAttribute('class',"col-md-4");
                        }
                        else if (count == 3) {
                            newVideo.setAttribute('class',"col-md-6");
                        } 
                        else if (count == 2) {
                            newVideo.setAttribute('class',"col-md-12");
                        }  
                        $('#videoscreen').append(newVideo);

                        $(this).remove();
                    });
                    

                    $('.rightlayout').css("display","none");
                    brokerController.invoke("userInfo");
                    
                };


                var oncConnectionCreated = function() {
                    console.log("oncconnectioncreated", arguments);
                }

                var onGetUerMedia = function(stream) {
                    console.log("Successfully got some userMedia , hopefully a goat will appear..");
                    webRTC.connectToContext(); // connect to the current context?
                };

                var onRemoteStream = function (remotePeer) {      
                    addRemoteVideo(remotePeer.PeerId, remotePeer.stream);
                    console.log("Opps, we got a remote stream. lets see if its a goat..");
                    console.log("peerid from remote: ", remotePeer.PeerId );
                    console.log("steam id from remote: ", remotePeer.stream.id );
                };


                var onLocalStream = function(mediaStream) {
                    console.log("Got a localStream", mediaStream.id);
                    localid = mediaStream.id;
                    console.log("check this id:  meadiastram id ", mediaStream.id);
                   
                    var video = document.createElement("video");
                    video.setAttribute("height", "100%");
                    video.setAttribute("autoplay", "true");
                    video.setAttribute("name", mediaStream.id);
                    video.setAttribute("id", 'localvideo');
                    
                    attachMediaStream(video, mediaStream);
            

                    createGroupNameDivAndVideoDiv(video, mediaStream.id, screenheight * 0.3, "col-md-12", 'videoscreen');
                    

                    
                    brokerController.invoke("userInfo");

                   /* var speechEvents = hark(mediaStream);

                    speechEvents.on('speaking', function() {
                      brokerController.publish("StreamInfo", { peerId: mediaStream.id,streamInfo: 1 });
                    });

                    speechEvents.on('volume_change', function(volume, threshold) {
                      streamVolumes.push(volume);
                      streamVolumes.shift();
                    });

                    speechEvents.on('stopped_speaking', function() {
                      brokerController.publish("StreamInfo", { peerId: mediaStream.id,streamInfo: 0 });
                    });*/
                    
                    brokerController.on('sharescreen', function(message) {
                        getScreenId(function (error, sourceId, screen_constraints) {

                            if(sourceId && sourceId != 'firefox') {
                                screen_constraints = {
                                    video: {
                                        mandatory: {
                                            chromeMediaSource: 'screen',
                                            maxWidth: 1920,
                                            maxHeight: 1080,
                                            minAspectRatio: 1.77
                                        }
                                    }
                                };

                                if (error === 'permission-denied') return alert('Permission is denied.');
                                if (error === 'not-chrome') return alert('Please use chrome.');

                                if (!error && sourceId) {
                                    screen_constraints.video.mandatory.chromeMediaSource = 'desktop';
                                    screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
                                }
                            }

                            navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                                navigator.getUserMedia(screen_constraints, function (stream) {

                                    webRTC.removeStream(webRTC.getLocalStreams()[0]);
                                    var id = $('#localvideo').attr('name');
                                    //$('#localvideo').remove();
                                    $('#localvideo').parent().remove();
                                    brokerController.invoke('updateremotevideo', id);

                                    
                                    webRTC.addLocalStream(stream);

                                    webRTC.getRemotePeers().forEach(function (p) {
                                        webRTC.refreshStreams(p);
                                    });
                                    
                                    stream.onended = function() {

                                        webRTC.removeStream(webRTC.getLocalStreams()[0]);
                                        var id = $('#localvideo').attr('name');
                                        $('#localvideo').parent().remove();
                                        brokerController.invoke('updateremotevideo', id);
                                        webRTC.getUserMedia(webRTC.userMediaConstraints.hd(true), onGetUerMedia, onError);
                                        
                                        webRTC.getRemotePeers().forEach(function (p) {
                                            webRTC.refreshStreams(p);
                                        });
                                        brokerController.invoke('releasesharescreen', '1');
                                    };


                                }, function (error) {
                                    console.error(error);
                                });

                         });

                    });

                    brokerController.on('triggrrecord', function(message) {
                        if (message == "record"){
                            alert("record start");
                            if ("MediaRecorder" in window === false) {
                              console.log("Recorder not started MediaRecorder not available in this browser. ");
                              return;
                            }               
                            stream = webRTC.getLocalStreams()[0];
                            recorder = new XSockets.MediaRecorder(stream);
                            recorder.start();
                        }
                        else if (message == "stoprecord"){
                            recorder.stop();
                            alert("record stop");
                        }

                        recorder.oncompleted = function(blob,blobUrl) {
                                
                            console.log("Recorder completed.. ");
                           /* var li = document.createElement("li");
                            var download = document.createElement("a");
                            download.textContent = new Date();
                            download.setAttribute("download", XSockets.Utils.randomString(8) + ".wav");
                            download.setAttribute("href", blobUrl);
                            li.appendChild(download);

                            $("#videoscreen").append(li);*/

                            var arrayBuffer;

                            var fileReader = new FileReader();
                            fileReader.onload = function (fn) {
                                
                                arrayBuffer = this.result;

                                brokerController.invokeBinary("fileShare", arrayBuffer, {
                                mimeType: blob.type,
                                size: blob.size
                                });
                            };
                            fileReader.readAsArrayBuffer(blob);


                            
                        }
                    });


                };

                var onContextCreated = function(ctx) {
                    console.log("RTC object created, and a context is created - ", ctx);
                    webRTC.getUserMedia(webRTC.userMediaConstraints.hd(true), onGetUerMedia, onError);
                };

                var onOpen = function() {
                                 

                    console.log("Connected to the brokerController - 'connectionBroker'");

                    webRTC = new XSockets.WebRTC(this);
                    webRTC.onlocalstream = onLocalStream;
                    webRTC.oncontextcreated = onContextCreated;
                    webRTC.onconnectioncreated = oncConnectionCreated;
                    webRTC.onconnectionlost = onConnectionLost;
                   
                    webRTC.onremotestream = onRemoteStream;

                    // mutecommand function need to be changed to only get back to linked video stream. This need to be 
                    // think throughout. Very important.
                    brokerController.on('MuteCommand', function (data) {
                            if (data.mute == 1){
                                console.log("mute command receive");
                                webRTC.muteAudio(true);
                            }
                            else if(data.mute == 0){
                                console.log("unmute command receive");
                                webRTC.muteAudio(false);
                            }
                    });

                    brokerController.on('userupdate', function (data) {
                        console.log(data);
                        for (var i=0; i < data.length; i++){
                            var d = data[i];
                            var videoName = data[i].streamId;
                            //var divVideo = $("#"+videoName);
                            var divVideo = $(document.getElementById(videoName));
                            if ( divVideo != null ){
                                divVideo.css('background-color', '#D0CDCB');
                                divVideo.text(data[i].UserName);
                            }
                            
                        }
                        
                    });

                    brokerController.on('updateremotevideo', function(streamid){
                       $(document.getElementById(streamid)).parent().remove();
                    });

                    var recorder;

                    brokerController.subscribe('StreamInfo', function (data) {
                
                        console.log(data);
                        //var notification = document.querySelector('#remoteuserspeaking');
                        if (data.streamInfo == 1 && speaking_plus_below > 1){
                            //&& data.peerId != localid
                            console.log("subscribe remote id is: ", data.peerId);
                            var speakingvideo_now = $("video[id='" + data.peerId + "']");
                            var speaking_previousparent = $("video[id='" + data.peerId + "']").parent();
                            var speakingvideo_before = $( "#videospeaking video:first-child" );
                            if (data.peerId != speakingvideo_before.attr('id')){

                                var video1 = document.createElement("video");
                                video1.setAttribute("autoplay", "true");
                                video1.setAttribute("src", speakingvideo_now.attr('src'));
                                video1.setAttribute("height", speakingvideo_before.attr('height'));
                                video1.setAttribute("class",speakingvideo_before.attr('class'));
                                video1.setAttribute("id", speakingvideo_now.attr('id'));


                                var video2 = document.createElement("video");
                                video2.setAttribute("autoplay", "true");
                                video2.setAttribute("src", speakingvideo_before.attr('src'));
                                video2.setAttribute("height", speakingvideo_now.attr('height'));
                                video2.setAttribute("class",speakingvideo_now.attr('class'));
                                video2.setAttribute("id", speakingvideo_before.attr('id'));

                                speakingvideo_before.remove();
                                $('#videospeaking').append(video1);
                                speakingvideo_now.remove();
                                speaking_previousparent.append(video2);
                                
                            }
                        }

                    });
                };

                var onConnected = function() {
                    console.log("connection to the 'broker' server is established");
                    console.log("Try get the broker controller form server..");
                    brokerController = ws.controller("connectionbroker");
                    brokerController.onopen = onOpen;
                };
                
                ws.onconnected = onConnected;

}); 


},{"../hark.js":2,"attachmediastream":5,"bows":3,"getusermedia":4}],4:[function(require,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

},{}],5:[function(require,module,exports){
module.exports = function (stream, el, options) {
    var URL = window.URL;
    var opts = {
        autoplay: true,
        mirror: false,
        muted: false
    };
    var element = el || document.createElement('video');
    var item;

    if (options) {
        for (item in options) {
            opts[item] = options[item];
        }
    }

    if (opts.autoplay) element.autoplay = 'autoplay';
    if (opts.muted) element.muted = true;
    if (opts.mirror) {
        ['', 'moz', 'webkit', 'o', 'ms'].forEach(function (prefix) {
            var styleName = prefix ? prefix + 'Transform' : 'transform';
            element.style[styleName] = 'scaleX(-1)';
        });
    }

    // this first one should work most everywhere now
    // but we have a few fallbacks just in case.
    if (URL && URL.createObjectURL) {
        element.src = URL.createObjectURL(stream);
    } else if (element.srcObject) {
        element.srcObject = stream;
    } else if (element.mozSrcObject) {
        element.mozSrcObject = stream;
    } else {
        return false;
    }

    return element;
};

},{}],2:[function(require,module,exports){
var WildEmitter = require('wildemitter');

function getMaxVolume (analyser, fftBins) {
  var maxVolume = -Infinity;
  analyser.getFloatFrequencyData(fftBins);

  for(var i=4, ii=fftBins.length; i < ii; i++) {
    if (fftBins[i] > maxVolume && fftBins[i] < 0) {
      maxVolume = fftBins[i];
    }
  };

  return maxVolume;
}


var audioContextType = window.AudioContext || window.webkitAudioContext;
// use a single audio context due to hardware limits
var audioContext = null;
module.exports = function(stream, options) {
  var harker = new WildEmitter();


  // make it not break in non-supported browsers
  if (!audioContextType) return harker;

  //Config
  var options = options || {},
      smoothing = (options.smoothing || 0.1),
      interval = (options.interval || 50),
      threshold = options.threshold,
      play = options.play,
      history = options.history || 10,
      running = true;

  //Setup Audio Context
  if (!audioContext) {
    audioContext = new audioContextType();
  }
  var sourceNode, fftBins, analyser;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = smoothing;
  fftBins = new Float32Array(analyser.fftSize);

  if (stream.jquery) stream = stream[0];
  if (stream instanceof HTMLAudioElement || stream instanceof HTMLVideoElement) {
    //Audio Tag
    sourceNode = audioContext.createMediaElementSource(stream);
    if (typeof play === 'undefined') play = true;
    threshold = threshold || -50;
  } else {
    //WebRTC Stream
    sourceNode = audioContext.createMediaStreamSource(stream);
    threshold = threshold || -50;
  }

  sourceNode.connect(analyser);
  if (play) analyser.connect(audioContext.destination);

  harker.speaking = false;

  harker.setThreshold = function(t) {
    threshold = t;
  };

  harker.setInterval = function(i) {
    interval = i;
  };

  harker.stop = function() {
    running = false;
    harker.emit('volume_change', -100, threshold);
    if (harker.speaking) {
      harker.speaking = false;
      harker.emit('stopped_speaking');
    }
    analyser.disconnect();
    sourceNode.disconnect();
  };
  harker.speakingHistory = [];
  for (var i = 0; i < history; i++) {
      harker.speakingHistory.push(0);
  }

  // Poll the analyser node to determine if speaking
  // and emit events if changed
  var looper = function() {
    setTimeout(function() {

      //check if stop has been called
      if(!running) {
        return;
      }

      var currentVolume = getMaxVolume(analyser, fftBins);

      harker.emit('volume_change', currentVolume, threshold);

      var history = 0;
      if (currentVolume > threshold && !harker.speaking) {
        // trigger quickly, short history
        for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
          history += harker.speakingHistory[i];
        }
        if (history >= 2) {
          harker.speaking = true;
          harker.emit('speaking');
        }
      } else if (currentVolume < threshold && harker.speaking) {
        for (var i = 0; i < harker.speakingHistory.length; i++) {
          history += harker.speakingHistory[i];
        }
        if (history == 0) {
          harker.speaking = false;
          harker.emit('stopped_speaking');
        }
      }
      harker.speakingHistory.shift();
      harker.speakingHistory.push(0 + (currentVolume > threshold));

      looper();
    }, interval);
  };
  looper();


  return harker;
}

},{"wildemitter":6}],6:[function(require,module,exports){
/*
WildEmitter.js is a slim little event emitter by @henrikjoreteg largely based
on @visionmedia's Emitter from UI Kit.

Why? I wanted it standalone.

I also wanted support for wildcard emitters like this:

emitter.on('*', function (eventName, other, event, payloads) {

});

emitter.on('somenamespace*', function (eventName, payloads) {

});

Please note that callbacks triggered by wildcard registered events also get
the event name as the first argument.
*/

module.exports = WildEmitter;

function WildEmitter() { }

WildEmitter.mixin = function (constructor) {
    var prototype = constructor.prototype || constructor;

    prototype.isWildEmitter= true;

    // Listen on the given `event` with `fn`. Store a group name if present.
    prototype.on = function (event, groupName, fn) {
        this.callbacks = this.callbacks || {};
        var hasGroup = (arguments.length === 3),
            group = hasGroup ? arguments[1] : undefined,
            func = hasGroup ? arguments[2] : arguments[1];
        func._groupName = group;
        (this.callbacks[event] = this.callbacks[event] || []).push(func);
        return this;
    };

    // Adds an `event` listener that will be invoked a single
    // time then automatically removed.
    prototype.once = function (event, groupName, fn) {
        var self = this,
            hasGroup = (arguments.length === 3),
            group = hasGroup ? arguments[1] : undefined,
            func = hasGroup ? arguments[2] : arguments[1];
        function on() {
            self.off(event, on);
            func.apply(this, arguments);
        }
        this.on(event, group, on);
        return this;
    };

    // Unbinds an entire group
    prototype.releaseGroup = function (groupName) {
        this.callbacks = this.callbacks || {};
        var item, i, len, handlers;
        for (item in this.callbacks) {
            handlers = this.callbacks[item];
            for (i = 0, len = handlers.length; i < len; i++) {
                if (handlers[i]._groupName === groupName) {
                    //console.log('removing');
                    // remove it and shorten the array we're looping through
                    handlers.splice(i, 1);
                    i--;
                    len--;
                }
            }
        }
        return this;
    };

    // Remove the given callback for `event` or all
    // registered callbacks.
    prototype.off = function (event, fn) {
        this.callbacks = this.callbacks || {};
        var callbacks = this.callbacks[event],
            i;

        if (!callbacks) return this;

        // remove all handlers
        if (arguments.length === 1) {
            delete this.callbacks[event];
            return this;
        }

        // remove specific handler
        i = callbacks.indexOf(fn);
        callbacks.splice(i, 1);
        if (callbacks.length === 0) {
            delete this.callbacks[event];
        }
        return this;
    };

    /// Emit `event` with the given args.
    // also calls any `*` handlers
    prototype.emit = function (event) {
        this.callbacks = this.callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this.callbacks[event],
            specialCallbacks = this.getWildcardCallbacks(event),
            i,
            len,
            item,
            listeners;

        if (callbacks) {
            listeners = callbacks.slice();
            for (i = 0, len = listeners.length; i < len; ++i) {
                if (!listeners[i]) {
                    break;
                }
                listeners[i].apply(this, args);
            }
        }

        if (specialCallbacks) {
            len = specialCallbacks.length;
            listeners = specialCallbacks.slice();
            for (i = 0, len = listeners.length; i < len; ++i) {
                if (!listeners[i]) {
                    break;
                }
                listeners[i].apply(this, [event].concat(args));
            }
        }

        return this;
    };

    // Helper for for finding special wildcard event handlers that match the event
    prototype.getWildcardCallbacks = function (eventName) {
        this.callbacks = this.callbacks || {};
        var item,
            split,
            result = [];

        for (item in this.callbacks) {
            split = item.split('*');
            if (item === '*' || (split.length === 2 && eventName.slice(0, split[0].length) === split[0])) {
                result = result.concat(this.callbacks[item]);
            }
        }
        return result;
    };

};

WildEmitter.mixin(WildEmitter);

},{}],3:[function(require,module,exports){
(function(window) {
  var logger = require('andlog'),
      goldenRatio = 0.618033988749895,
      hue = 0,
      padLength = 15,
      yieldColor,
      bows;

  yieldColor = function() {
    hue += goldenRatio;
    hue = hue % 1;
    return hue * 360;
  };

  bows = function(str) {
    var msg;
    msg = "%c" + (str.slice(0, padLength));
    msg += Array(padLength + 3 - msg.length).join(' ') + '|';

    return logger.log.bind(logger, msg, "color: hsl(" + (yieldColor()) + ",99%,40%); font-weight: bold");
  };

  bows.config = function(config) {
    if (config.padLength) {
      return padLength = config.padLength;
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = bows;
  } else {
    window.bows = bows;
  }
}).call(this);

},{"andlog":7}],7:[function(require,module,exports){
// follow @HenrikJoreteg and @andyet if you like this ;)
(function () {
    var inNode = typeof window === 'undefined',
        ls = !inNode && window.localStorage,
        out = {};

    if (inNode) {
        module.exports = console;
        return;
    }

    var andlogKey = ls.andlogKey || 'debug'
    if (ls && ls[andlogKey] && window.console) {
        out = window.console;
    } else {
        var methods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),
            l = methods.length,
            fn = function () {};

        while (l--) {
            out[methods[l]] = fn;
        }
    }
    if (typeof exports !== 'undefined') {
        module.exports = out;
    } else {
        window.console = out;
    }
})();

},{}]},{},[1])