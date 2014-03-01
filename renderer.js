var Renderer = function(width, height, scale)
{
	if(scale == undefined)
		scale = 1.0;
		
	this.canvas = $("<canvas id='mainCanvas'/>").appendTo("#game");
	var t = $("<canvas id='backCanvas'/>");
//	var privateCanvas = $(t).appendTo('<div/>');
	this.backCanvasElement = $(document.createElement('canvas'));
	this.backCanvas = this.backCanvasElement.get(0);

	this.frontCanvas = this.canvas.get(0).getContext("2d");
	this.backCanvas.width = width * scale;
	this.backCanvas.height = height * scale;
	this.context = this.backCanvas.getContext('2d');

	this.width = width;
	this.height = height;
	
	var domCanvas = this.canvas.get(0);
	domCanvas.width = width * scale;
	domCanvas.height = height * scale;

	this.context.font         = '13pt Arial';
	this.context.textBaseline = 'top';

	this.fontSize = parseInt(this.canvas.css('font-size'));
	
	this.lastTime = new Date().getTime();
	this.fps = 0;
	this.lastFPS = 0;
	this.currentTime = this.lastTime;
	this.clearColor = "#000000";
	this.defaultColor = "#ffffff";
	
	this.SetAlpha = function( a )
	{
		this.context.globalAlpha = a;
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

		var px = Math.round(n % (img.width / patternX));
		var py

		if(n < (img.width / patternX))
			py = 0;
		else
			py = Math.round(n / (img.width / patternX))

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

		var px = Math.round(n % (img.width / patternX))
		var py

		if(n < (img.width / patternX))
			py = 0;
		else
			py = Math.round(n / (img.width / patternX))

		//this.context.drawImage( img, px * patternX, py * patternY, patternX, patternY, -this.width + x , y, patternX, patternY);

		this.context.drawImage( img, px * patternX, py * patternY, patternX, patternY, -x - patternX , y, patternX, patternY)

		this.context.restore()
 	}	
	
	this.Rect = function(x, y, w, h)
	{
		this.context.fillRect(x,y,w,h);
	}
	
	this.RectStroke = function(x, y, w, h)
	{
		this.context.lineWidth = 1;
		this.context.strokeRect(x,y,w,h);
	}
	
	this.Line = function( x1, y1, x2, y2 )
	{
		this.context.beginPath();	
		this.context.strokeStyle = this.context.fillStyle;
		this.context.moveTo( x1, y1 );
		this.context.lineTo( x2, y2 );		
		this.context.stroke();		
	}

	this.SetColor = function( color )
	{
		this.context.fillStyle = color;
	}
	
	this.Begin = function()
	{
		this.context.fillStyle = this.clearColor;
		this.Rect(0, 0, this.width, this.height);
		this.context.fillStyle = this.defaultColor;
	}
	
	this.End = function()
	{
		this.fps++;
		
		this.frontCanvas.drawImage(this.backCanvas, 0, 0,
							this.width, this.height, 0, 0, this.backCanvas.width, this.backCanvas.height);
		
		
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