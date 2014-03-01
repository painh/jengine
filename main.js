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
	return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
}

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
	
	include_js( config["srcPath"] + "resource.js");
	$(document).bind("touchstart mousedown", mouseDown);
	$(document).bind("touchmove mousemove", mouseMove);
	$(document).bind("touchend mouseup", mouseUp);

	function mouseDown(e)
	{ 
		e.preventDefault();

		if(!MouseManager)
			return false;

		var pageX, pageY;
		if(e.type.indexOf("touch") == 0)
		{
			pageX = e.originalEvent.touches[0].pageX;
			pageY = e.originalEvent.touches[0].pageY;
		}
		else
		{
			pageX = e.pageX;
			pageY = e.pageY;
		}

		var offsetX = $("#game").offset().left;
		var offsetY = $("#game").offset().top;
		MouseManager.x = Math.floor((pageX - offsetX) / config["screenScale"]);
		MouseManager.y = Math.floor((pageY - offsetY) / config["screenScale"]);

		MouseManager.LDown = true;
		return false;
	}

	function mouseMove(e)
	{
		e.preventDefault();

		if(!MouseManager)
			return false;

		var pageX, pageY;
		if(e.type.indexOf("touch") == 0)
		{
			pageX = e.originalEvent.touches[0].pageX;
			pageY = e.originalEvent.touches[0].pageY;
		}
		else
		{
			pageX = e.pageX;
			pageY = e.pageY;
		}

		var offsetX = $("#game").offset().left;
		var offsetY = $("#game").offset().top;
		MouseManager.x = Math.floor((pageX - offsetX) / config["screenScale"]);
		MouseManager.y = Math.floor((pageY - offsetY) / config["screenScale"]);
		return false;

	}

	function mouseUp(e)
	{
		e.preventDefault();

		if(!MouseManager)
			return false;
	
		MouseManager.LDown = false;
		return false;
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
		Console = new Console(config["width"], config["height"]);
		KeyManager = new KeyManager();
		Renderer = new Renderer(config["width"], config["height"], config['screenScale']);
		MouseManager = new MouseManager();
		ImageManager = new ImageManager();
		SoundManager = new SoundManager();
		SceneManager = new SceneManager();
		RequestManager = new RequestManager();
		ResLoader = new ResLoader();

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
													
													Renderer.Begin();
														SceneManager.Render();
													Renderer.End();
	
													MouseManager.prevLDown = MouseManager.LDown;
													MouseManager.Upped = false;
													MouseManager.Clicked = false;
													
													KeyManager.EndFrame();

													++totalFPS;
												}, interval);			
												
											}, config["resLoadWaitTerm"]);
	} );

}

function jengineStart()
{
	getArgument();
	include_js("config.js");
	AllowZoom(false)
	
	waitIncludeComplete(  function() {
		
		if( config["gameDivAlign"] == "center"  )
		{
			$("#game").css(  { position : "absolute",
										top : "50%",
										left : "50%",
										margin: "-" + (config["height"] * config["screenScale"])/ 2 + "px 0 0 -"  + (config["width"] * config["screenScale"]) / 2+ "px"}	 );
		}
		
		LoadLib();
	} );
}
