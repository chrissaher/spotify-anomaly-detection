class Controller {
	doAlert(){
		alert("HOLA")
	}

	refresh_token(acc_token, ref_token){
		$.ajax({
			url: '/refresh_token',
			data: {
				'refresh_token': ref_token
			}
		}).done(function(data) {
			var access_token = data.access_token;
			var oauthSource = document.getElementById('oauth-template').innerHTML;
			var oauthPlaceholder = document.getElementById('oauth');
			var oauthTemplate = Handlebars.compile(oauthSource);
			oauthPlaceholder.innerHTML = oauthTemplate({
				access_token: access_token,
				refresh_token: ref_token
			});
		});
	}

	info_playlist(acc_token) {
		$.ajax({
			url: '/getPlaylist',
			data: {
				'access_token': acc_token
			}
		}).done(function(data) {
			var resultIdPlaceholder = document.getElementById('resultId');
			resultIdPlaceholder.innerHTML = data.tracks.items[0].track.id;

			var resultNamePlaceholder = document.getElementById('resultName');
			resultNamePlaceholder.innerHTML = JSON.stringify(data.tracks.items[0].track.name);
		});
	}

	track_analysis(acc_token) {
		var trackId = $("#resultId").text();
		$.ajax({
			url: '/getAnalysis',
			data: {
				'access_token': acc_token,
				'trackId': trackId
			}
		}).done(function(data) {
			var info = [
				"trackid",
				"Name",
				data.danceability,
				data.energy,
				data.key,
				data.loudness,
				data.mode,
				data.speechiness,
				data.acousticness,
				data.instrumentalness,
				data.liveness,
				data.valence,
				data.tempo,
				data.duration_ms,
				data.time_signature
			];


			var tableRef = document.getElementById('info').getElementsByTagName('tbody')[0];
			var newRow   = tableRef.insertRow(tableRef.rows.length);

			for(var i = 0; i < 15; ++i) {
				var cell = newRow.insertCell(i);
				cell.appendChild(document.createTextNode(info[i]));
			}
			//var resultAnalysis = document.getElementById('resultAnalysis');
			//resultAnalysis.innerHTML = JSON.stringify(data);
		});
	}

	track_multi_analysis(acc_token) {

		$.ajax({
			url: '/getPlaylist',
			data: {
				'access_token': acc_token
			}
		}).done(function(data) {
			var trackIds = [];
			var trackNames = []
			var items = data.tracks.items
			var sTrackIds = "";

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
					}
				}).done(function(data) {
					var resultIdPlaceholder = document.getElementById('resultId');
					resultIdPlaceholder.innerHTML = JSON.stringify(data.next);
					var items = data.items
					for(var it in items) {
						trackIds.push(items[it].track.id);
						trackNames.push(items[it].track.name);
						sTrackIds = sTrackIds + items[it].track.id + ","
					}
					next = data.tracks.next;
				});
			}

			$.ajax({
				url: '/getMultiAnalysis',
				data: {
					'access_token': acc_token,
					'trackIds': sTrackIds//JSON.stringify(trackIds)
				}
			}).done(function(data) {
				var tableRef = document.getElementById('info').getElementsByTagName('tbody')[0];

				var features = data.audio_features;
				for(var it in features) {
					var info = [];
					info.push(features[it].id);
					info.push(trackNames[it]);
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
					for(var i = 0; i < 15; ++i) {
						var cell = newRow.insertCell(i);
						cell.appendChild(document.createTextNode(info[i]));
					}
				}

			});
		});
	}
}

$(() => {

	function getHashParams() {
		var hashParams = {};
		var e, r = /([^&;=]+)=?([^&;]*)/g,
				q = window.location.hash.substring(1);
		while ( e = r.exec(q)) {
			 hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
	}

	var oauthSource = document.getElementById('oauth-template').innerHTML,
		oauthTemplate = Handlebars.compile(oauthSource),
		oauthPlaceholder = document.getElementById('oauth');

	var params = getHashParams();

	var access_token = params.access_token,
		refresh_token = params.refresh_token,
		error = params.error;

	if (error) {
		alert('There was an error during the authentication');
	} else {
		if (access_token) {
			// render oauth info
			oauthPlaceholder.innerHTML = oauthTemplate({
				access_token: access_token,
				refresh_token: refresh_token
			});

		} else {
				// render initial screen
				alert("NO PERMISSION");
		}
	}


	var controller = new Controller();
	$('#obtain-new-token').click(() => {
		//controller.refresh_token(access_token, refresh_token);
		controller.info_playlist(access_token);
	});

	$('#analysis').click(() => {
		controller.track_multi_analysis(access_token);
	});
});
