	$(function(){
	var socket = io();
	songs = new Array();
	container = $('.container');
	var listSong = $('.player');
	for( var i = 0 ; i < listSong.length; i++){
		var name = $(listSong[i]).attr('id') ;
		song = new Audio(name+'.ogg',name+'.mp3');
		if (song.canPlayType('audio/mpeg;')) {
	  	song.type= 'audio/mpeg';
	  	song.src= name+'.mp3';
		} else {
		  	song.type= 'audio/ogg';
		  	song.src= name+'.ogg';
		}
		songs[name] = song;
	}
	// Handle events
	$('.player').on('click','#play', function(e){
		var audioName = getAudioName(e);
		socket.emit('play', audioName);
		play(audioName);
		e.preventDefault();
	});

	$('.player').on('click','#pause', function(e){
		var audioName = getAudioName(e);
		socket.emit('pause', audioName);
		paused(audioName);
		e.preventDefault();
	});

	$('.player').on('click','#mute', function(e) {
		var audioName = getAudioName(e);
		socket.emit('mute',audioName);
		mute(audioName);
		e.preventDefault();

	});

	$('.player').on('click','#muted', function(e) {
		var audioName = getAudioName(e);
		socket.emit('muted',audioName);
		muted(audioName);
		e.preventDefault();
	});
	
	$('.player').on('click','#seek', function(e) {
		var audioName = getAudioName(e);
		console.log($('#'+audioName+" #seek").val());
		changed(audioName);
		socket.emit('change', $('#'+audioName+" #seek").val(), audioName);
	});

	var timeDrag = false;  
	$('.progressBar').mousedown(function(e) {
	    timeDrag = true;
	    updatebar(e.pageX, getAudioName(e));
	});

	$(document).mouseup(function(e) {
	    if(timeDrag) {
	        timeDrag = false;
	        updatebar(e.pageX, getAudioName(e));
	    }
	});

	$(document).mousemove(function(e) {
	    if(timeDrag) {
	        updatebar(e.pageX, getAudioName(e));
	    }
	});
 	for( var i = 0 ; i < listSong.length; i++){			
		audioName = $(listSong[i]).attr('id');

		(function(audioName){		
			songs[audioName].addEventListener("ended", function(){
		   		songs[audioName].currentTime = 0;
				$('#'+audioName+' #pause').replaceWith('<a class="button gradient" id="play" href="" title=""><span class="glyphicon glyphicon-play" aria-hidden="true"></a>');
			});
		})(audioName);


		(function(audioName){
			songs[audioName].addEventListener('timeupdate',function (){
				curtime = parseInt(songs[audioName].currentTime, 10);
				$('#'+audioName+' #seek').attr("value", curtime);
				$('#'+audioName+' #seek').val(curtime);
			});
		})(audioName);
	}
	

// function
	function play(audioName){
		for( var i = 0 ; i < listSong.length; i++){			
			if ($(listSong[i]).attr('id') == audioName){
				songs[audioName].play();
			}
			else {
				songs[$(listSong[i]).attr('id')].pause();
				$('#'+$(listSong[i]).attr('id')+' #pause').replaceWith('<a class="button gradient" id="play" href="" title=""><span class="glyphicon glyphicon-play" aria-hidden="true"></a>');

			}
		}
		$('#'+audioName+' #play').replaceWith('<a class="button gradient" id="pause" href="" title=""><span class="glyphicon glyphicon-pause" aria-hidden="true"></a>');
		$('#'+audioName+' #seek').attr('max',songs[audioName].duration);

		return false;
	};

	function paused(audioName){
		if(audioName != undefined)
		songs[audioName].pause();	
		$('#'+audioName+' #pause').replaceWith('<a class="button gradient" id="play" href="" title=""><span class="glyphicon glyphicon-play" aria-hidden="true"></a>');
		return false;
	}

	function mute(audioName){
		songs[audioName].volume = 0;
		$('#'+audioName+' .timeBar').css('width', '0%');
		$('#'+audioName+' #mute').replaceWith('<a class="button gradient" id="muted" href="" title=""><span class="glyphicon glyphicon-volume-off" aria-hidden="true"></a>');
		return false;
	}

	function muted(audioName){
		songs[audioName].volume = 1;
		$('#'+audioName+' .timeBar').css('width', '100%');
		$('#'+audioName+' #muted').replaceWith('<a class="button gradient" id="mute" href="" title=""><span class="glyphicon glyphicon-volume-up" aria-hidden="true"></a>');
		return false;
	}

	function changed(audioName){
		songs[audioName].currentTime = $('#'+audioName+" #seek").val();
		$('#'+audioName+" #seek").attr("max", song.duration);
	}

	var updatebar = function(x, audioId) {
	    var progress = $('#'+audioId+' .progressBar');
	    console.log(progress);
	    var position = x - progress.offset().left; //Click pos
	    var percentage = 100 * position / progress.width();
		if(percentage > 100) {
	        percentage = 100;
	    }
	    if(percentage < 0) {
	        percentage = 0;
	    }
	    $('#'+audioId+' .timeBar').css('width', percentage+'%');
	    songs[audioId].volume = 1 * percentage / 100;
	};
	
	function getAudioName(e){
		var audio = e.target.parentNode;
		if( $(audio).hasClass('player') ) return $(audio).attr('id');
		var audioName = $(audio).parent().attr('id');
		return audioName;
	}

	function getAudioState(audioName){
		if(!songs[audioName].paused) return 'play';
		else return 'pause';
	}
// Socket
	socket.on('getCurrentTime', function(){
		var data = {};
		for( var i = 0 ; i < listSong.length; i++){	
			var audioName = $(listSong[i]).attr('id');
			var currentTime = parseInt(songs[audioName].currentTime, 10);
			var maxTime = songs[audioName].duration;
			var status  =  getAudioState(audioName);		
			data[audioName] = {
				'currentTime' : currentTime,
				'maxTime' : maxTime,
				'status' : status,
			};
		}		
		socket.emit('getCurrentTime',JSON.stringify(data));
	});

	socket.on('setCurrentTime', function(data){
		var data = JSON.parse(data);
		for( var i = 0 ; i < listSong.length; i++){	
			var audioName = $(listSong[i]).attr('id');
			console.log(data[audioName].maxTime);
			$('#'+audioName+ ' #seek').attr('max',data[audioName].maxTime);
			songs[audioName].currentTime = parseInt(data[audioName].currentTime, 10);
			var status  =  data[audioName].status;
			if( status == 'play') {
				songs[audioName].play();
				$('#'+audioName+' #play').replaceWith('<a class="button gradient" id="pause" href="" title=""><span class="glyphicon glyphicon-pause" aria-hidden="true"></a>');
			}
			else					songs[audioName].pause();
		}
	})

	socket.on('play', function(audioName){
		play(audioName);
	});

	socket.on('pause', function(audioName){
		paused(audioName);
	});

	socket.on('mute', function(audioName){
		mute();
	});

	socket.on('muted', function(audioName){
		muted();
	});

	socket.on('change', function(data, audioName){
		songs[audioName].currentTime =  data;
		$('#'+audioName+ ' #seek').val(data);
	});

	socket.on('volume', function(data){
		updatebar(data);
	});

	
})