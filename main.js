function CSVToObj( csvString )
{
	var lines = csvString.split('\n');
	var list = undefined;
	var col = undefined;

	for( var i = 0; i < lines.length; i++)
	{
		if(lines[i][0] == "#")
			continue;

		var tokens = lines[i].split(',');

		if(tokens.length == 0)
			continue;

		if(list == undefined)
		{
			list = new Array();
			col = tokens;
			continue;
		}

		if(tokens.length != col.length)
		{
			trace("tokens != col " + lines[i]);
			continue;
		}

		var entry = new Object();
		for(var j = 0; j < col.length; ++j)
			entry[col[j]] = tokens[j];
	
		list.push(entry);
	}
/*
	for( var i = 0; i < list.length; i++)
	{
		for( var j in list[i] )
			trace( "[" + i + "]" + j + " : "  + list[i][j] );
	}
*/
	return list;	
}

var ImageManager = function()
{
	this.m_imageArray = new Array();

	this.ImageOnLoad = function( image )
	{
		var img = this.Get(image.imageName);
		if(img == null)
			return;

		img.isLoaded = true;
		//trace(image.src + " load complete");
	}

	this.Register = function( URL, imageName, forceLoad )
	{
//		trace(URL);
//		trace(imageName);
		for( var idx in this.m_imageArray )
		{
			if(this.m_imageArray[idx].imageName == imageName &&
				this.m_imageArray[idx].src == URL)
			{
				trace("already registered image" + imageName );
				return this.m_imageArray[idx];
			}
		}
		
		var newImage = new Image();
		this.m_imageArray.push( newImage );

		newImage.onload = function() { ImageManager.ImageOnLoad(this) } ;
		newImage.onerror = function() { trace("error : load " + URL + " failed") } ;
		newImage.imageName = imageName;
		newImage.isLoaded = false;
		if(forceLoad)
			newImage.src = URL + "?t="+(new Date()).getTime();
		else
			newImage.src = URL;

	//	trace(newImage.imageName);
		return newImage;
	}

	this.Get = function( imageName )
	{
		for( var i = 0; i < this.m_imageArray.length; ++i)
		{
			if( this.m_imageArray[i].imageName == imageName )
			{
				return this.m_imageArray[i];
			}
		}

		trace("not registered imageName " + imageName);
		return null;
	}

	this.IsAllLoadComplete = function()
	{
		for( var idx in this.m_imageArray )
		{
			if(!this.m_imageArray[idx].isLoaded)
				return false;
		}
	
		return true;
	}
};

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
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////// 
function removeFromList(list, obj)
{
	var idx = list.indexOf(obj);
	list.splice(idx, 1); 
};


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
};

function trace( msg )
{
	Console.Trace(msg);
};
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
};
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
};

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
};

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
};

function include_css( name )
{
	checkInclude[name] = new Object;
	checkInclude[name].isLoaded = false;
	checkInclude[name].waitIncludeID = waitIncludeID;
	checkInclude[name].script = $("<link rel='stylesheet' type='text/css' href ='" +  name + "'/>").appendTo('head');
	checkInclude[name].script.attr( 'onLoad', function() { checkInclude[name].isLoaded = true; console.log("include_css : " + name + " included!");} );
};

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

};

function getArgument()
{
	var fullArg = String(window.location).split('?');
	
	if(fullArg.length != 2)
		return;
		
	var args = String(fullArg[1]).split('&');

	for(var idx in args)
	{
		var arg = args[idx].split('='); //Å°ï¿½ï¿½ ï¿½ï¿½ï¿½Ð¸ï¿½
		
		if(arg.length != 2)
			continue;

		g_argumentList[ arg[0] ] = arg[1];
		
	}

//	for(var idx in g_argumentList)
//		console.log(idx);
};

function LoadLib()
{
//	for(var idx in config)
//		console.log( idx + " : " + config[idx] );
		
//	include_js( config["jenginePath"] + "renderer.js");
//	include_js( config["jenginePath"] + "imagemanager.js");
//	include_js( config["jenginePath"] + "soundmanager.js");
//	include_js( config["jenginePath"] + "scenemanager.js" );
//	include_js( config["jenginePath"] + "requestmanager.js" );
//	include_js( config["jenginePath"] + "resloader.js" );
//	include_js( config["jenginePath"] + "csv2obj.js" );
//
	
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
};

function jengineStart()
{
	getArgument();
	//include_js("config.js");
	AllowZoom(false)
	
	waitIncludeComplete(  function() { 
		addGrowl();
		LoadLib();
	} );
};

var g_screenScale = 1;
var g_scaledWidth = 1;
var g_scaledHeight = 1;
var g_backCanvas;
var g_frontCanvas;
var g_domCanvas;
var g_scale = 1;
function screenResize()
{
	if(config['autoScale'])
	{
		var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

		console.log('view', w, h);
		console.log('view 2', config['width'], config['height']);
		scaleX = w / config['width'];
		scaleY = h / config['height'];

		g_scale = Math.min(scaleX, scaleY); 
	}

	g_screenScale = g_scale;

	$("#game").width(g_scaledWidth);
	$("#game").height(g_scaledHeight);
	g_scaledWidth = config['width'] * g_scale;
	g_scaledHeight = config['height'] * g_scale;

	console.log("----------");
	console.log(g_backCanvas.width, g_backCanvas.height);
	console.log(g_domCanvas.width, g_domCanvas.height);
	console.log("================");


	g_backCanvas.width = config['width'];
	g_backCanvas.height = config['height'];
	g_domCanvas.width = g_scaledWidth;
	g_domCanvas.height = g_scaledHeight;

	if( config["gameDivAlign"] == "center"  )
	{
		$("#game").css(  { position : "absolute",
									top : "50%",
									left : "50%",
									margin: "-" + (g_scaledHeight)/ 2 + "px 0 0 -"  + (g_scaledWidth) / 2+ "px"}	 );
	}

	console.log(g_backCanvas);
	console.log(g_backCanvas.width , g_backCanvas.height ); 

	g_frontCanvas.mozImageSmoothingEnabled = false;
	g_frontCanvas.webkitImageSmoothingEnabled = false;
	g_frontCanvas.imageSmoothingEnabled = false;

	g_backCanvas.getContext('2d').mozImageSmoothingEnabled = false;
	g_backCanvas.getContext('2d').webkitImageSmoothingEnabled = false;
	g_backCanvas.getContext('2d').imageSmoothingEnabled = false;
};

var Renderer = function(width, height, scale)
{
	if(scale == undefined)
		g_scale = 1.0;
	else
		g_scale = scale;

	window.onresize=screenResize;
	console.log(g_scaledWidth, g_scaledHeight);
	console.log("----------");

	this.canvas = $("<canvas id='mainCanvas'/>").appendTo("#game");
	var t = $("<canvas id='backCanvas'/>");
//	var privateCanvas = $(t).appendTo('<div/>');
	this.backCanvasElement = $(document.createElement('canvas'));
	this.backCanvas = this.backCanvasElement.get(0);
	g_backCanvas = this.backCanvas;

	this.context = this.backCanvas.getContext('2d');

	this.width = width;
	this.height = height;
	
	g_domCanvas = this.canvas.get(0);
//	this.frontCanvas = this.canvas.get(0).getContext("2d");
	this.frontCanvas = g_domCanvas.getContext("2d");
	g_frontCanvas = this.frontCanvas;

	screenResize();

	this.context.font         = '13pt Arial';
	this.context.textBaseline = 'top';

	this.fontSize = parseInt(this.canvas.css('font-size'));
	
	this.lastTime = new Date().getTime();
	this.fps = 0;
	this.lastFPS = 0;
	this.currentTime = this.lastTime;
	this.clearColor = "#000000";
	this.defaultColor = "#ffffff";
	
	this.context.globalCompositeOperation = 'source-over';
	this.SetAlpha = function( a )
	{
		this.context.globalAlpha = a;
	} 

	this.SetCompositeOperation = function(op)
	{
//var compositeTypes = [
//	  'source-over','source-in','source-out','source-atop',
//	    'destination-over','destination-in','destination-out','destination-atop',
//		  'lighter','darker','copy','xor'
//];
		this.context.globalCompositeOperation = op;
	}
	
	this.SetFont = function(font)
	{
		this.context.font			= font;
		this.context.textBaseline	= 'top';
	}
	
	this.Text = function( x, y, msg )
	{
		this.context.fillText(msg, x, y);
	}

	this.GetTextWidth = function(text)
	{
		var metrics = this.context.measureText(text);
		return metrics.width;
	}
	
	this.GetFontSize = function()
	{
		return parseInt(this.canvas.css('font-size'));
	}

	this.WrapText = function (x, y, maxWidth, lineHeight, text)
	{
		var words = text.split(" ");
		var line = "";
	 
		for (var n = 0; n < words.length; n++) 
		{
			var testLine = line + words[n] + " ";
			var metrics = this.context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth) {
				this.context.fillText(line, x, y);
				line = words[n] + " ";
				y += lineHeight;
			}
			else {
				line = testLine;
			}
		}
		this.context.fillText(line, x, y);
	}

	this.ImgBlt = function( x, y, img, srcX, srcY, srcWidth, srcHeight, renderWidth, renderHeight )
	{
		if(!img.isLoaded)
			return

		if(renderWidth == undefined)
			renderWidth = srcWidth

		if(renderHeight == undefined)
			renderHeight = srcHeight

		this.context.drawImage( img, srcX, srcY, srcWidth, srcHeight, x, y, renderWidth, renderHeight);
	}

 	
	this.Img = function( x, y, img, patternX, patternY, n )
	{
		if(!img.isLoaded)
			return;

		if(patternX == undefined)
			patternX = img.width;

		if(patternY == undefined)
			patternY = img.height;

		if(n == undefined)
			n = 0;

		var px = Math.floor(n % (img.width / patternX));
		var py

		if(n < (img.width / patternX))
			py = 0;
		else
			py = Math.floor(n / (img.width / patternX))

		this.context.drawImage( img, px * patternX, py * patternY, patternX, patternY, x, y, patternX, patternY);
	}

 	this.ImgFlipH = function( x, y, img, patternX, patternY, n )
 	{
		if(!img.isLoaded)
			return;

		this.context.save();
		this.context.scale(-1, 1)

		if(patternX == undefined)
			patternX = img.width;

		if(patternY == undefined)
			patternY = img.height;

		if(n == undefined)
			n = 0;

		var px = Math.floor(n % (img.width / patternX))
		var py

		if(n < (img.width / patternX))
			py = 0;
		else
			py = Math.floor(n / (img.width / patternX))

		//this.context.drawImage( img, px * patternX, py * patternY, patternX, patternY, -this.width + x , y, patternX, patternY);

		this.context.drawImage( img, px * patternX, py * patternY, patternX, patternY, -x - patternX , y, patternX, patternY)

		this.context.restore()
 	}	
	

	this.RoundRect = function(x, y, width, height, radius, fill, stroke) 
	{
//http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
		if (typeof stroke == "undefined" ) stroke = false; 
		if (typeof radius === "undefined") radius = 5;
		if (typeof fill === "undefined") fill = 5;

		this.context.beginPath();
		this.context.moveTo(x + radius, y);
		this.context.lineTo(x + width - radius, y);
		this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
		this.context.lineTo(x + width, y + height - radius);
		this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		this.context.lineTo(x + radius, y + height);
		this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
		this.context.lineTo(x, y + radius);
		this.context.quadraticCurveTo(x, y, x + radius, y);
		this.context.closePath();

		if (stroke)  this.context.stroke();
		if (fill) this.context.fill();
	}

	this.Rect = function(x, y, w, h)
	{
		this.context.fillRect(x,y,w,h);
	}
	
	this.RectStroke = function(x, y, w, h)
	{ 
		this.context.lineWidth = 1;
		this.context.strokeRect(parseInt(x),parseInt(y),parseInt(w),parseInt(h)); 
	}
	
	this.Line = function( x1, y1, x2, y2 )
	{
		this.context.beginPath();	
		this.context.strokeStyle = this.context.fillStyle;
		this.context.moveTo( x1, y1 );
		this.context.lineTo( x2, y2 );		
		this.context.stroke();		
	}

	this.Circle = function(cx, cy, r)
	{
		this.context.beginPath();
		this.context.arc(cx, cy, r, 0, Math.PI*2, true); 
		this.context.closePath();
		this.context.fill();
	}
	this.SetColor = function( color )
	{
		this.context.fillStyle = color;
		this.context.strokeStyle = color;
	}
	
	this.Begin = function()
	{
		this.context.fillStyle = this.clearColor;
		this.Rect(0, 0, this.width, this.height);
		this.context.fillStyle = this.defaultColor;
		this.SetCompositeOperation('source-over');
	}

	this.drawPixelated = function()
	{
		var idata = this.context.getImageData(0, 0, this.width, this.height).data;
		var zoom = config['screenScale']; 

		for (var x2=0;x2<this.width;++x2)
		{
			for (var y2=0;y2<this.height;++y2)
			{
				var i=(y2*this.width+x2)*4;
				var r=idata[i  ];
				var g=idata[i+1];
				var b=idata[i+2];
				var a=idata[i+3];

				this.frontCanvas.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")"; 
				this.frontCanvas.fillRect(x2*zoom, y2*zoom, zoom, zoom);
			}
		}

		console.log('frame done!');
	}

	this.End = function()
	{
		this.fps++;

//		this.drawPixelated();
		
		this.frontCanvas.drawImage(this.backCanvas, 0, 0,
							this.width, this.height, 0, 0, g_scaledWidth, g_scaledHeight);
		
		
		this.Text(0, 0, "FPS : " + this.lastFPS );
		
		var curDate = new Date();
		this.currentTime = curDate.getTime();

		if( this.currentTime - this.lastTime > 1000)
		{
			this.lastFPS = this.fps;
			this.fps = 0;
			this.lastTime = this.currentTime;
		}
		
		time = null;
	}
};

var RequestManager = function()
{
	//this.m_soundArray = new Array();
	
	this.Get = function ( _url, _data, _success, _error  )
	{
		$.ajax(
					{
						url: _url,
						type: 'GET',
						dataType: 'json',
						data : _data,
						timeout: 3000,
						error: _error,
						success: function(json) 
						{
							trace( JSON.stringify(json) );
							_success(json); 
						}
					}
				);
	}
	
	this.Post = function ( _url, _data, _success, _error  )
	{
		$.ajax(
					{
						url: _url,
						type: 'POST',
						dataType: 'json',
						data : _data,
						timeout: 3000,
						error: _error,
						success: function(json) 
						{
							trace( JSON.stringify(json) );

//							trace(json['msg']);
							_success(json); 
						}
					}
				);
	}	
};

var ResLoader = function()
{
	this.list = new Array();

	this.Init = function(onLoadComplete)
	{
//		this.onLoad = onLoad;
		this.onLoadComplete = onLoadComplete;
	}

	this.getEntry = function( path )
	{
		for(var i = 0; i < this.list.length; ++i)
			if(this.list[i].path == path)
				return this.list[i];

		return null;
	}

	this.GetLoadedCount = function()
	{
		var cnt = 0;
		for(var i = 0; i < this.list.length; ++i)
			if(this.list[i].isLoaded)
				++cnt;

		return cnt;
	}

	this.AddRes = function( path, onLoad )
	{
		if(this.getEntry(path) != null)
		{
			trace("warn - already registered path " + path);
			return this.list[i];
		}
		var entry = new Object;
		entry.path = path;
		entry.isLoaded = false;

		this.list.push(entry);
		var resLoader = this;

		$.get( path, function(data) {
				onLoad(data);
//				trace(outValue);

				entry.isLoaded = true;
				trace("load complete " + entry.path + "( " + resLoader.GetLoadedCount() + " / " +  resLoader.list.length + " )");

				if(resLoader.GetLoadedCount() == resLoader.list.length)
					resLoader.onLoadComplete();
//				eval("var map1 = " + data);
				});
	}
};

var SceneManager = function()
{
	this.m_sceneList = new Array;
	this.m_curScene = null;
	this.m_nextScene = null;
	this.m_prevScene = null;
	
	this.Add = function ( scene )
	{
		if( this.m_sceneList.length == 0)
		{
			this.m_curScene = scene;
			this.m_curScene.Start();
		}
			
		this.m_sceneList.push(scene);
	}
	
	this.SetNext = function( scene )
	{
		// TODO list¿¡¼­ °Ë»çÇÒ°Í.
		this.m_nextScene = scene;
	}
	
	this.GetPrev = function()
	{
		return this.m_prevScene;
	}
	
	this.Update = function( )
	{
		if(this.m_curScene == undefined)
			return;
			
		this.m_curScene.Update();
		
		if( this.m_nextScene != null )
		{
			trace("scene changed");
			this.m_curScene.End();
			
			this.m_prevScene = this.m_curScene;
			this.m_curScene = this.m_nextScene;
			this.m_nextScene = null;
			
			this.m_curScene.Start();
		}
	}
	
	this.Render = function()
	{
		if(this.m_curScene == undefined)
			return;
	
		this.m_curScene.Render();
	}
};

var SoundManager = function()
{
	this.m_soundArray = new Array();

	this.Play = function( soundName )
	{
		var snd = this.Get(soundName);

		if(snd == null)
			return;
		snd.currentTime = 0;
		snd.play();
	}

	this.SoundOnLoad = function( sound )
	{
		sound.removeEventListener('load', SoundManager.SoundOnLoad, false);
		sound.removeEventListener('canplaythrough', SoundManager.SoundOnLoad, false);	

		var snd = this.Get(sound.soundName);

		if(snd == null)
			return;

		snd.isLoaded = true;
		trace(snd.src + " load complete");
	}

	this.Register = function( URL, soundName )
	{
		for( var idx in this.m_soundArray )
		{
			if(this.m_soundArray[idx].src == soundName)
			{
				trace("already registered sound " + soundName );
				return;
			}
		}

		var newSound = new Audio(URL);

		newSound.onerror = function() { trace("error : load " + URL + " failed") } ;
		this.m_soundArray.push( newSound );
		newSound.soundName = soundName;
		newSound.isLoaded = false;
		newSound.src = URL;

		newSound.play();
		if(newSound.readyState !== 4)
		{
		    newSound.addEventListener('canplaythrough', function() { SoundManager.SoundOnLoad(this) }, false);
		    newSound.addEventListener('load', function() { SoundManager.SoundOnLoad(this) }, false);
			setTimeout(function(){ newSound.pause(); }, 1); 
		}
		else
		{
			//video is ready
		}
		//newSound.load();
	}

	this.Get = function( soundName )
	{
		for( var i = 0; i < this.m_soundArray.length; ++i)
		{
			if( this.m_soundArray[i].soundName == soundName )
			{
				return this.m_soundArray[i];
			}
		}

		trace("not registered soundName " + soundName);
		return null;
	}

	this.IsAllLoadComplete = function()
	{
		for( var idx in this.m_soundArray )
		{
	//		trace(this.m_soundArray[idx].isLoaded);

			if(!this.m_soundArray[idx].isLoaded)
				return false;
		}
	
		return true;
	}
};
