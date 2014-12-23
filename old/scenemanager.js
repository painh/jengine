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
		// TODO list에서 검사할것.
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
}