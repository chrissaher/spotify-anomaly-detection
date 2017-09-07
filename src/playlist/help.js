$.ajax({
	url: '/getPlaylist',
	data: {
		'access_token': acc_token,
		'user_id': user_id,
		'playlist_id': playlist_id,
		'fields':	''
	}
}).done(function(data) {
	var trackIds = [];
	var trackNames = []
	var items = data.tracks.items
	var sTrackIds = "";
	var arrTracks = [];

	var resultNamePlaceholder = document.getElementById('resultName');
	resultNamePlaceholder.innerHTML = JSON.stringify(data.tracks.next);


	for(var it in items) {
		trackIds.push(items[it].track.id);
		trackNames.push(items[it].track.name);
		sTrackIds = sTrackIds + items[it].track.id + ","
	}

	var next = data.tracks.next;
	while(next != null) {
		var url = next;
		next = null;
		$.ajax({
			url: '/getNextTracks',
			data: {
				'access_token': acc_token,
				'url': url
			},
			async: false
		}).done(function(data) {
			var resultIdPlaceholder = document.getElementById('resultId');
			resultIdPlaceholder.innerHTML = JSON.stringify(data.next);
			var items = data.items
			for(var it in items) {
				trackIds.push(items[it].track.id);
				trackNames.push(items[it].track.name);
				sTrackIds = sTrackIds + items[it].track.id + ","
			}
			next = data.next;
		});
	}

	$("#info_body tr").remove();

	for(var b = 0; b < trackIds.length; ){
		sTrackIds = "";
		for(var it = 0; it < 100; ++it) {
			if(b + it >= trackIds.length) {
				break;
			}
			sTrackIds = sTrackIds + trackIds[b + it] + ",";
		}
		b += 100;

		$.ajax({
			url: '/getMultiAnalysis',
			data: {
				'access_token': acc_token,
				'trackIds': sTrackIds//JSON.stringify(trackIds)
			},
			async: false
		}).done(function(data) {
			var tableRef = document.getElementById('info').getElementsByTagName('tbody')[0];
			var features = data.audio_features;
			for(var it in features) {
				var info = [];
				var itx = (b - 100) + parseInt(it);
				info.push(itx);
				info.push(trackIds[itx]);
				info.push(trackNames[itx]);
				info.push(features[it].danceability);
				info.push(features[it].energy);
				info.push(features[it].key);
				info.push(features[it].loudness);
				info.push(features[it].mode);
				info.push(features[it].speechiness);
				info.push(features[it].acousticness);
				info.push(features[it].instrumentalness);
				info.push(features[it].liveness);
				info.push(features[it].valence);
				info.push(features[it].tempo);
				info.push(features[it].duration_ms);
				info.push(features[it].time_signature);

				var newRow   = tableRef.insertRow(tableRef.rows.length);
				for(var i = 0; i < 16; ++i) {
					var cell = newRow.insertCell(i);
					cell.appendChild(document.createTextNode(info[i]));
				}
			}
		});
	}
});
