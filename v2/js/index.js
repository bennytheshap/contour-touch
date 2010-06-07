var renderedImageWidth = null;
var renderedImageHeight = null;

var current_arc = Array();
var current_point = null;
var arcs = Array();
var canvas = null;

var inMoveMode = true;

/**
 iPad automatically downscales images. We need to find the drawn resolution so that we know where touched points are landing.
 **/
function CaptureRenderedDimensions()
{
	renderedImageHeight = document.getElementById('theimage').height;
	renderedImageWidth = document.getElementById('theimage').width;
}

/**
 Create a canvas on top of the loaded image to show touched points on.
 **/
function CreateCanvasOverImage()
{
	canvas = document.getElementById('thecanvas');
	canvas.id = "thecanvas";
	canvas.width = renderedImageWidth;
	canvas.height = renderedImageHeight;
	canvas.parent = document.getElementById('theimage').parent;
	}
 
function ResetHeightWidth() {
	var headerH = document.getElementById('header').offsetHeight;
	var footerH = document.getElementById('footer').offsetHeight;
	var wrapperH = window.innerHeight - headerH - footerH;
	var wrapperW = window.width;
	document.getElementById('wrapper').style.height = wrapperH + 'px';
	document.getElementById('wrapper').style.width = wrapperW + 'px';	
}

function AddPointToCurrentArc(x,y)
{
	var last_point = current_point;
	//keep track of it
	current_point = [x,y];
	current_arc.push(current_point);

	var context = canvas.getContext("2d");
	
	if (last_point != null)
	{
		//connect it to the last point
		context.strokeStyle = "rgba(0,0,0,.5)";
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(last_point[0], last_point[1]);
		context.lineTo(current_point[0], current_point[1]);
		context.stroke();
		context.closePath();
	}
	//draw it
	context.fillStyle = "rgba(255,0,0,.66)"
	context.beginPath();
	context.arc(x,y,4,0,2*Math.PI,true);
	context.closePath();
	context.fill();
}

function PointTouched(e)
{
	e.preventDefault();
	if (e.targetTouches.length > 0)
	{
		var touch = e.targetTouches[0];
	
		var x = touch.pageX - $('#thecanvas').offset().left;
		var y = touch.pageY - $('#thecanvas').offset().top;
		AddPointToCurrentArc(x,y);
	}
	e.stopPropagation();
}
function CanvasTouchStarted(e)
{
	PointTouched(e)
}
function CanvasTouchMoved(e)
{
	PointTouched(e)
}
function CanvasTouchEnded(e)
{
	PointTouched(e)
	arcs.push(current_arc);
	current_arc = Array();
	current_point = null;
}


function MoveButtonClicked()
{
	if (inMoveMode)
	{
		return;
	}
	inMoveMode = true;

	canvas.removeEventListener("touchstart", CanvasTouchStarted);
	canvas.removeEventListener("touchmove", CanvasTouchMoved);
	canvas.removeEventListener("touchend", CanvasTouchEnded);
	
	$('#wrapper').jScrollTouch();
}

function DelineateButtonClicked()
{
	if (inMoveMode)
	{
		inMoveMode = false;
		//disable scrolling/zooming behavior
		$('#wrapper').trigger('jscrolltouch.unhook');
		
		//the above jscrolltouch.unhook should do these for us
		// $('#wrapper').unbind('touchstart');
		// $('#wrapper').unbind('touchmove');
		// $('#wrapper').unbind('touchend');
		// $('#wrapper').unbind('mousedown');
		// $('#wrapper').unbind('mouseup');
		// $('#wrapper').unbind('mousemove');
		
		//then track points touched.
		canvas.addEventListener("touchstart", CanvasTouchStarted);
		canvas.addEventListener("touchmove", CanvasTouchMoved);
		canvas.addEventListener("touchend", CanvasTouchEnded);
		
		//and send updates back to the server.
	}	
}
 
function loaded() {
	ResetHeightWidth();
	document.addEventListener('touchmove', function(e){ e.preventDefault(); }, false);
	$('#wrapper').jScrollTouch();
	
	$('#theimage').load( function(){
		//I was trying to disable scaling, but it appears to scale the in-ram representation of the image. 
		//In order to support zooming, I may have to tile images. Barf.
		CaptureRenderedDimensions();
		CreateCanvasOverImage();
	});
	
	$('#move_mode_button').click(function(e){
		$('#move_mode_button').addClass("chosen");
		$('#delineate_mode_button').removeClass("chosen");
		//e.target.style.class = "chosen";
		MoveButtonClicked();
	});
	
	$('#delineate_mode_button').click(function(){
		$('#move_mode_button').removeClass("chosen");
		$('#delineate_mode_button').addClass("chosen");
		DelineateButtonClicked();
	});
	
}

jQuery(document).ready(function(){
	loaded();
});

window.addEventListener('orientationchange', ResetHeightWidth);

