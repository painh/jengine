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
}