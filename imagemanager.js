var ImageManager = function()
{
	this.m_imageArray = new Array();

	this.ImageOnLoad = function( image )
	{
		var img = this.Get(image.imageName);
		if(img == null)
			return;

		img.isLoaded = true;
		trace(image.src + " load complete");
	}

	this.Register = function( URL, imageName )
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