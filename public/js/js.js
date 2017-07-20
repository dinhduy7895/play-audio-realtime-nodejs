$(function(){
	var socket = io();

	container = $('.container');
	cover = $('.cover');
	song = new Audio('test.ogg','test.mp3');
	duration = song.duration;

	if (song.canPlayType('audio/mpeg;')) {
	  	song.type= 'audio/mpeg';
	  	song.src= 'test.mp3';
	} else {
	  	song.type= 'audio/ogg';
	  	song.src= 'test.ogg';
	}

	// Handle events
	$('.player').on('click','#play', function(e){
		socket.emit('play');
		play();
		e.preventDefault();
	});

	$('.player').on('click','#pause', function(e){
		socket.emit('pause');
		pause();
		e.preventDefault();
	});

	$('.player').on('click','#mute', function(e) {
		socket.emit('mute');
		mute();
		e.preventDefault();

	});

	$('.player').on('click','#muted', function(e) {
		socket.emit('muted');
		muted();
		e.preventDefault();
	});

	$('.player').on('click','#close', function(e) {
		socket.emit('close');
		closed();
		e.preventDefault();
	});
	
	$("#seek").bind("change", function() {
		changed();
		socket.emit('change', $("#seek").val());
	});

	var timeDrag = false;  
	$('.progressBar').mousedown(function(e) {
	    timeDrag = true;
	    socket.emit('volume', e.pageX);
	    updatebar(e.pageX);
	});

	$(document).mouseup(function(e) {
	    if(timeDrag) {
	        timeDrag = false;
	        socket.emit('volume', e.pageX);
	        updatebar(e.pageX);
	    }
	});

	$(document).mousemove(function(e) {
	    if(timeDrag) {
	    	socket.emit('volume', e.pageX);
	        updatebar(e.pageX);
	    }
	});
 
	song.addEventListener("ended", function(){
	    song.currentTime = 0;
		$('#pause').replaceWith('<a class="button gradient" id="play" href="" title=""><span class="glyphicon glyphicon-play" aria-hidden="true"></a>');
	});

	song.addEventListener('timeupdate',function (){
		curtime = parseInt(song.currentTime, 10);
		$("#seek").attr("value", curtime);
		$("#seek").val(curtime);
	});

// function
	function play(){
		song.play();
		$('#play').replaceWith('<a class="button gradient" id="pause" href="" title=""><span class="glyphicon glyphicon-pause" aria-hidden="true"></a>');
		$('#seek').attr('max',song.duration);
		return false;
	};

	function pause(){
		song.pause();
		$('#pause').replaceWith('<a class="button gradient" id="play" href="" title=""><span class="glyphicon glyphicon-play" aria-hidden="true"></a>');
		return false;
	}

	function mute(){
		song.volume = 0;
		$('.timeBar').css('width', '0%');
		$('#mute').replaceWith('<a class="button gradient" id="muted" href="" title=""><span class="glyphicon glyphicon-volume-off" aria-hidden="true"></a>');
		return false;
	}

	function muted(){
		song.volume = 1;
		$('.timeBar').css('width', '100%');
		$('#muted').replaceWith('<a class="button gradient" id="mute" href="" title=""><span class="glyphicon glyphicon-volume-up" aria-hidden="true"></a>');
		return false;
	}

	function changed(){
		song.currentTime = $("#seek").val();
		$("#seek").attr("max", song.duration);
	}

	var updatebar = function(x) {
	    var progress = $('.progressBar');
	    var position = x - progress.offset().left; //Click pos
	    var percentage = 100 * position / progress.width();
		if(percentage > 100) {
	        percentage = 100;
	    }
	    if(percentage < 0) {
	        percentage = 0;
	    }
	    $('.timeBar').css('width', percentage+'%');
	    song.volume = 1 * percentage / 100;
	};
	
// Socket
	socket.on('getCurrentTime', function(){
		var currentTime = parseInt(song.currentTime, 10);
		var maxTime = song.duration;
		var status  =  'play';
		if(song.paused) status = 'pause';
		var data = {
			'currentTime' : currentTime,
			'maxTime' : maxTime,
			'status' : status,
		};
		socket.emit('getCurrentTime', data);
	});

	socket.on('setCurrentTime', function(data){
		song.currentTime = data.currentTime;
		play();
		$('#seek').attr('max',data.maxTime);
		if(data.status == 'pause')
			pause();
	})

	socket.on('play', function(){
		play();
	});

	socket.on('pause', function(){
		pause();
	});

	socket.on('mute', function(){
		mute();
	});

	socket.on('muted', function(){
		muted();
	});

	socket.on('change', function(data){
		song.currentTime =  data;
		$("#seek").val(data);
	});

	socket.on('volume', function(data){
		updatebar(data);
	});

	
})