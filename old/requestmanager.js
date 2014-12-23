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