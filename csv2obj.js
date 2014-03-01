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