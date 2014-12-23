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