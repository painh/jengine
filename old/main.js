var Console;
var KeyManager;
var Renderer;
var MouseManager;
var ImageManager;
var SoundManager;
var RequestManager;
var SceneManager;
var ResLoader;
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var g_argumentList;
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var checkInclude = new Object;
var waitIncludeID = 0;
var lastIncluded = undefined;
var g_cachedTime = new Date();
var totalFPS = 0;

var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;

var g_now;

var touchDevice = false;

function swipedetect(el, callback){
//http://www.javascriptkit.com/javatutors/touchevents2.shtml 
	var touchsurface = el, swipedir, startX, startY, distX, distY, threshold = 75, //required min distance traveled to be considered swipe
						restraint = 50, // maximum distance allowed at the same time in perpendicular direction
						allowedTime = 300, // maximum time allowed to travel that distance
						elapsedTime,
						startTime,
						handleswipe = callback || function(swipedir){}

	touchsurface.addEventListener('touchstart', function(e){
		var touchobj = e.changedTouches[0]
		swipedir = 'none'
		dist = 0
		startX = touchobj.pageX
		startY = touchobj.pageY
		startTime = new Date().getTime() // record time when finger first makes contact with surface
		e.preventDefault() 
	}, false)

	touchsurface.addEventListener('touchmove', function(e){
		e.preventDefault() // prevent scrolling when inside DIV
	}, false)

	touchsurface.addEventListener('touchend', function(e){
		var touchobj = e.changedTouches[0]
		distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
		distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
		elapsedTime = new Date().getTime() - startTime // get time elapsed
		if (elapsedTime <= allowedTime){ // first condition for awipe met
		if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
		swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
		}
		else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
		swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
		}
		}
		handleswipe(swipedir)
		e.preventDefault()
	}, false)
} 


function CheckTouchable()
{
	return 'ontouchstart' in window || navigator.msMaxTouchPoints; 
}

function AddTouchSwipe(func)
{ 
	var el = document.getElementById('game');
	swipedetect(el, func)
}


function addGrowl()
{
	$("head").append("<style>"+
						" #growl { position: absolute; bottom: 10px; right: 20px; overflow: hidden; z-index:    2000; } "+
						"#growl .msg { z-index:    3000; border: 1px solid #171717; color: #E4E4E4; text-shadow: 0 -1px 1px #0A131A; font-weight: bold; min-width: 200px; min-height: 30px; padding: 10px; font-size: 15px; margin-bottom: 10px; background-color: #0000ff; background: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 255, 0.3)), color-stop(0.8, rgba(255, 255, 255, 0))), rgba(0, 0, 64, 0.8); box-shadow: inset 0 1px 1px #8E8E8E; -webkit-box-shadow: inset 0 1px 1px #8E8E8E; -moz-box-shadow: inset 0 1px 1px #8E8E8E; border-radius: 7px; -webkit-border-radius: 7px; -moz-border-radius: 7px; }"+
						" #growl .alert { background-color: #ff0000; background: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 0, 0, 0.3)), color-stop(0.8, rgba(255, 255, 255, 0))), rgba(64, 0, 0, 0.8); }"+
						"</style>"); 

    var container = $("<div />");
    container.attr({id: "growl"});
        $(function(){
        $("body").append(container);
    });

    $.growl = function(body, warning)
    {
        // Create the Growl div
        var msg = $("<div />").addClass("msg");

        console.log(body)
        if(warning)
                msg.addClass("$.growl")
        msg.html(body);

        // Append it to the list
        container.append(msg);

        // Add a drop effect, and then remove
        msg.show("drop", { direction: "down",
                            distance: 50 }, 300).
                            delay(1000).
                            fadeOut(300, function()
                            {
                            $(this).remove();
                            });

        return msg;
    };
} 

function ajaxReq(url, arg, successFunc, type)
{
    if(typeof(arg) == "function" && successFunc == undefined)
    {
        successFunc = arg;
        arg = {}
    }

    if(!type)
        type = 'GET';

    return $.ajax({url: url,
            type: type,
            data: arg,
            dataType: 'json',
            timeout: 1000 * 60,
            error: function (xhr, ajaxOptions, thrownError)
            {
                alert("url : " + url + "\n" + xhr.responseText);
                alert(thrownError);
            },
            success: function(json)
                        {
                            console.log("ajax req success");
                            console.log("url : " + url);
                            console.log("arg : ");
                            console.log(arg);
//                          console.log("successFunc : " + successFunc);

                            if(json)
                            {
                                console.log("json : ");
                                console.log(json);

                                if(json.error || json.failed || (json.result && json.result != 0) )
                                {
                                    var message = "";

                                    for(var i in json)
                                        message += i + " : " + json[i] + "<br>";

                                    $.growl(message);
                                }
                            }

                            if(successFunc)
                                successFunc(json)
                        }
        })
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
//http://stackoverflow.com/questions/2750028/enable-disable-zoom-on-iphone-safari-with-javascript
function AllowZoom(flag) {
  if (flag == true) {
    $('head meta[name=viewport]').remove();
    $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10.0, minimum-scale=1, user-scalable=1" />');
  } else {
    $('head meta[name=viewport]').remove();
    $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0" />');              
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function randomRange(n1, n2)
{
	return Math.floor( (Math.random() * (parseInt(n2) - parseInt(n1) + 1)) + parseInt(n1) );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////


function removeFromList(list, obj)
{
	var idx = list.indexOf(obj);
	list.splice(idx, 1); 
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Console = function( width, height)
{
	this.consoleDiv = $("<div id='consoleDiv'></div>").appendTo("#game");
	this.line = 0;
	this.prefix = "";

	this.Trace = function( msg )
	{
		this.line++;
	
		if(config['showLogOnDebugger'])
		{
			$("<p id = 'consoleP' class='consoleP' >"+ this.prefix + msg+"</p>").appendTo("#consoleDiv");
			if( this.line > this.maxLineOnScreen )
				$("#consoleP:first").remove();
		}
		
		if(config['showLogOnDebugger'])
			console.log(this.prefix+msg);
	}
	
	$("<p id = 'consoletest' class='consoleP' >M</p>").appendTo("#consoleDiv");
	this.fontWidth = this.consoleDiv.width();
	this.fontHeight = this.consoleDiv.height();
	$('#consoletest').remove();
	
	this.consoleDiv.width(width);
	this.consoleDiv.height(height);

	this.maxLineOnScreen = height / this.fontHeight;
	
	this.consoleDiv.hide();
}

function trace( msg )
{
	Console.Trace(msg);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

var KeyManager = function()
{
	this.keyMap = new Array(255);
	this.KeyMapPrevFrame = new Array(255);

	this.arrowLeft = 37;	
	this.arrowUp = 38;
	this.arrowRight = 39;
	this.arrowDown = 40;
	
	this._1 = 49
	this._2 = 50
	this._3 = 51
	this._4 = 52

	this.a = 65;
	this.s = 83;
	this.d = 68;
	this.f = 70;
	this.z = 90
	this.x = 88
	
	this.space = 32;
	
	for( var i = 0; i < 255; ++i)
	{
		this.KeyMapPrevFrame[i] = false;
		this.keyMap[i] = false;
	}
	
	this.KeyDown = function(keyCode)
	{
		if(keyCode >= 255)
			return;
			
		this.keyMap[keyCode] = true;
	}
	
	this.KeyUp = function(keyCode)
	{
		if(keyCode >= 255)
			return;

		this.keyMap[keyCode] = false;
	}
	
	this.IsKeyPress = function(keyCode)
	{
		if(keyCode >= 255)
			return;
			
		if(( this.KeyMapPrevFrame[keyCode]  == false ) && (this.keyMap[keyCode] == true) )
			return true;
			
		return false;
	}	
	
	this.IsKeyDown = function(keyCode)
	{
		if(keyCode >= 255)
			return false;
	
		return this.keyMap[keyCode];
	}
	
	this.EndFrame = function()
	{
		for( var i = 0; i < 255; ++i)
			this.KeyMapPrevFrame[i] = this.keyMap[i];
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

var MouseManager = function()
{
	this.prex = 0;
	this.prey = 0;
	this.x = 0;
	this.y = 0;
	this.LDown = false;
	this.prevLDown = false;
	this.Clicked = false;
	this.Upped = false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function IsAllIncludeComplete( includeID )
{
	for(var i in checkInclude)
	{
//		if(checkInclude[i].waitIncludeID != includeID )
//			continue;
			
//		console.log("IsAllIncludeComplete : " + i + checkInclude[i].isLoaded);
			
		if(checkInclude[i].isLoaded == undefined)
			return false;		
			
		if(checkInclude[i].isLoaded == false)
			return false;
	}
	return true;
}

function include_js( name )
{
	checkInclude[name] = new Object;
	checkInclude[name].isLoaded = false;
	checkInclude[name].waitIncludeID = waitIncludeID;
	
//	console.log("include_js : " + name);
//	for(var idx in checkInclude[name])
//		console.log("\t " + idx + " : " + checkInclude[name][idx]);
	checkInclude[name].script = $("<script type='text/javascript' src = '"+ name+"' ></script>").appendTo('head');	
	console.log("include_js : " + name );
	checkInclude[name].script.attr( 'onLoad', function() { checkInclude[name].isLoaded = true;  console.log("include_js : " + name + " included!"); } );
	lastIncluded = checkInclude[name];
}

function include_css( name )
{
	checkInclude[name] = new Object;
	checkInclude[name].isLoaded = false;
	checkInclude[name].waitIncludeID = waitIncludeID;
	checkInclude[name].script = $("<link rel='stylesheet' type='text/css' href ='" +  name + "'/>").appendTo('head');
	checkInclude[name].script.attr( 'onLoad', function() { checkInclude[name].isLoaded = true; console.log("include_css : " + name + " included!");} );
}

function waitIncludeComplete( completeFunc )
{
	var defaultTerm = 100;
	var curID = waitIncludeID;
	++waitIncludeID;
	
	if(config["resLoadWaitTerm"]  != undefined )
		defaultTerm = config["resLoadWaitTerm"];
		
	var timer = setInterval( function() 
	{
//		console.log("interval!");
		if(!IsAllIncludeComplete(curID))
			return;
			
		clearInterval(timer);
		console.log("all include end!");
//		console.log("---------------------------");
//		for(var i in checkInclude)
//			console.log(checkInclude[i] + " , "+ checkInclude[i].isLoaded +" , "+i);

		completeFunc();
	}, defaultTerm );

}

function getArgument()
{
	var fullArg = String(window.location).split('?');
	
	if(fullArg.length != 2)
		return;
		
	var args = String(fullArg[1]).split('&');

	for(var idx in args)
	{
		var arg = args[idx].split('='); //Ű�� ���и�
		
		if(arg.length != 2)
			continue;

		g_argumentList[ arg[0] ] = arg[1];
		
	}

//	for(var idx in g_argumentList)
//		console.log(idx);
}

function LoadLib()
{
//	for(var idx in config)
//		console.log( idx + " : " + config[idx] );
		
	include_js( config["jenginePath"] + "renderer.js");
	include_js( config["jenginePath"] + "imagemanager.js");
	include_js( config["jenginePath"] + "soundmanager.js");
	include_js( config["jenginePath"] + "scenemanager.js" );
	include_js( config["jenginePath"] + "requestmanager.js" );
	include_js( config["jenginePath"] + "resloader.js" );
	include_js( config["jenginePath"] + "csv2obj.js" );

	
	include_css( config["jenginePath"] + "css/console.css");
	include_css( config["jenginePath"] + "css/renderer.css");
	
	//include_js( config["srcPath"] + "resource.js");
	$("#game").bind("touchstart mousedown", mouseDown);
	$("#game").bind("touchmove mousemove", mouseMove);
	$(document).bind("touchend mouseup", mouseUp);

	function mouseDown(e)
	{ 
		e.preventDefault();

		if(!MouseManager)
			return;

		var pageX, pageY;
		if(e.type.indexOf("touch") == 0)
		{
			pageX = e.originalEvent.touches[0].pageX;
			pageY = e.originalEvent.touches[0].pageY;
			touchDevice = true;
		}
		else
		{
			pageX = e.pageX;
			pageY = e.pageY;
		}

		var offsetX = $("#game").offset().left;
		var offsetY = $("#game").offset().top;
		MouseManager.prex = MouseManager.x;
		MouseManager.prey = MouseManager.y;
		MouseManager.x = Math.floor((pageX - offsetX) / g_screenScale);
		MouseManager.y = Math.floor((pageY - offsetY) / g_screenScale);
		if(e.type.indexOf("touch") == 0)
		{
			MouseManager.prex = MouseManager.x;
			MouseManager.prey = MouseManager.y;
		}

		MouseManager.LDown = true;
	}

	function mouseMove(e)
	{
		e.preventDefault();

		if(!MouseManager)
			return;

		var pageX, pageY;
		if(e.type.indexOf("touch") == 0)
		{
			pageX = e.originalEvent.touches[0].pageX;
			pageY = e.originalEvent.touches[0].pageY;
			touchDevice = true;
			MouseManager.LDown = true;
		}
		else
		{
			pageX = e.pageX;
			pageY = e.pageY;
		}

		var offsetX = $("#game").offset().left;
		var offsetY = $("#game").offset().top;
		MouseManager.x = Math.floor((pageX - offsetX) / g_screenScale);
		MouseManager.y = Math.floor((pageY - offsetY) / g_screenScale); 
	}

	function mouseUp(e)
	{
		e.preventDefault();

		if(!MouseManager)
			return;
		MouseManager.LDown = false;

//		var pageX, pageY;
//		if(e.type.indexOf("touch") == 0)
//		{
//			pageX = e.originalEvent.touches[0].pageX;
//			pageY = e.originalEvent.touches[0].pageY;
//		}
//		else
//		{
//			pageX = e.pageX;
//			pageY = e.pageY;
//		}
//
//	
//		MouseManager.LDown = false;
//
//		var offsetX = $("#game").offset().left;
//		var offsetY = $("#game").offset().top;
//		MouseManager.x = Math.floor((pageX - offsetX) / config["screenScale"]);
//		MouseManager.y = Math.floor((pageY - offsetY) / config["screenScale"]);
	}												
	
	$(window).keydown(function(e) {
		if(e.keyCode == 220)
			$("#consoleDiv").slideToggle();
		
		if(KeyManager)
			KeyManager.KeyDown(e.keyCode);
	});
	
	$(window).keyup(function(e) {
		if(KeyManager)
			KeyManager.KeyUp(e.keyCode);
	});


	waitIncludeComplete( function() 
	{
		KeyManager = new KeyManager();
		Renderer = new Renderer(config["width"], config["height"], config['screenScale']);
		Console = new Console(g_scaledWidth, g_scaledHeight);
		MouseManager = new MouseManager();
		ImageManager = new ImageManager();
		SoundManager = new SoundManager();
		SceneManager = new SceneManager();
		RequestManager = new RequestManager();
		ResLoader = new ResLoader();
		AddTouchSwipe();

//		for(var idx in imgRes)
//			ImageManager.Register( imgRes[idx], idx);
			
//		for(var idx in sndRes)
//			SoundManager.Register( sndRes[idx], idx);
		
		var waitResourceTimer = setInterval( function() 
											{
												if(ImageManager.IsAllLoadComplete() == false)
													return;

												if(SoundManager.IsAllLoadComplete() == false)
													return;
									
												clearInterval(waitResourceTimer);

												startGame(); 
		
												var interval = 1000 / config["fps"];
												
												var timer = setInterval( function()
												{
													Console.prefix = totalFPS + " : ";
													delete g_cachedTime;
													g_cachedTime = new Date();
													
													if(MouseManager.prevLDown == false && MouseManager.LDown )
														MouseManager.Clicked = true;

													if(MouseManager.prevLDown == true && MouseManager.LDown == false )
														MouseManager.Upped = true;
													
													SceneManager.Update();
													
													g_now = new Date();
													Renderer.Begin();
														SceneManager.Render();
													Renderer.End();
	
													MouseManager.prex = MouseManager.x;
													MouseManager.prey = MouseManager.y;
													MouseManager.prevLDown = MouseManager.LDown;
													MouseManager.Upped = false;
													MouseManager.Clicked = false;
//													if(touchDevice)
//														MouseManager.LDown = false;
													
													KeyManager.EndFrame();

													++totalFPS;
												}, interval);			
												
											}, config["resLoadWaitTerm"]);
	} );

}

function jengineStart()
{
	getArgument();
	//include_js("config.js");
	AllowZoom(false)
	
	waitIncludeComplete(  function() { 
		addGrowl();
		LoadLib();
	} );
}
