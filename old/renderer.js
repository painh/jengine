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
}
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
}
