class Controller {

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
		var trackId = $("#trackid")[0].value;
		$.ajax({
			url: '/getAnalysis',
			data: {
				'access_token': acc_token,
				'trackId': trackId
			}
		}).done(function(data) {
			var info = [
				0,
				data.id,
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

			$("#info_body tr").remove();
			var tableRef = document.getElementById('info').getElementsByTagName('tbody')[0];
			var newRow   = tableRef.insertRow(tableRef.rows.length);

			for(var i = 0; i < 16; ++i) {
				var cell = newRow.insertCell(i);
				cell.appendChild(document.createTextNode(info[i]));
			}
			//var resultAnalysis = document.getElementById('resultAnalysis');
			//resultAnalysis.innerHTML = JSON.stringify(data);
		});
	}

	track_multi_analysis(acc_token, user_id, playlist_id) {

		$.ajax({
			url: '/getPlaylist',
			data: {
				'access_token': acc_token,
				'user_id': user_id,
				'playlist_id': playlist_id
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
	}

	my_playlist(acc_token) {
		$.ajax({
			url: '/getCurrentUserPlaylist',
			data: {
				'access_token': acc_token
			}
		}).done(function(data) {

			$("#playlist_body tr").remove();
			$("#lstPlaylist tr").remove();

			var template = '<tr> <td class="v-a-m">#It </td> <td class="v-a-m"><span class="text-white">#Name</span> <br> <span>Followers: #Followers</span> </td> <td class="v-a-m"> <div class="media media-auto"> <div class="media-left"> <div class="avatar"> <img class="media-object img-circle" src="#OwnerImg" alt="Avatar"> </div> </div> <div class="media-body"> <span class="media-heading text-white">#OwnerName</span> <br> <span class="media-heading"><span>Spotify id: #OwnerId</span></span> </div> </div> </td> <td class="v-a-m"><span>#Tipe</span> <br> <span class="#CollaborativeStyle">#Collaborative</span> </td> <td class="text-right v-a-m"> <a href = "#AnalyzeURL" data-user = "#DataUser" data-playlist = "#DataPlaylist" type="button" class="btn btn-default">Analyze</a> </td> </tr> ';
			var items = data.items
			var tableRef = document.getElementById('playlist').getElementsByTagName('tbody')[0];
			var myTable = document.getElementById('lstPlaylist');

			for(var it in items) {
				var item = items[it];
				var playlist = [];
				playlist.push(it);
				playlist.push(item.id);
				playlist.push(item.name);
				playlist.push(item.owner.id);
				playlist.push(item.href);

				var newRow   = tableRef.insertRow(tableRef.rows.length);
				for(var i = 0; i < 5; ++i) {
					var cell = newRow.insertCell(i);
					cell.appendChild(document.createTextNode(playlist[i]));
				}
				var cell = newRow.insertCell(5);
				var optSpan = document.createElement('span');
				optSpan.innerHTML = "Analyze";
				optSpan.className = "btn btn-default";

				var optA = document.createElement('a');

				optA.setAttribute("playlist_id", item.id);
				optA.setAttribute("user_id", item.owner.id);
				optA.appendChild(optSpan);
				optA.onclick = function(){
					var c = new Controller();
					c.track_multi_analysis(acc_token, this.getAttribute("user_id"), this.getAttribute("playlist_id"));
				};

				cell.appendChild(optA);
				var current = template.replace("#It", it );
				current = current.replace("#Name", item.name);
				current = current.replace("#OwnerName", item.owner.display_name || item.owner.id);
				current = current.replace("#OwnerId", item.owner.id);
				current = current.replace("#Collaborative", (item.collaborative)? "Collaborative":"Not Collaborative" );
				current = current.replace("#DataUser", item.owner.id);
				current = current.replace("#DataPlaylist", item.id);
				myTable.insertAdjacentHTML( 'beforeend', current );
			}

		});
	}

	my_info(acc_token) {
		$.ajax({
			url: '/getCurrentUserInfo',
			data: {
				'access_token': acc_token
			}
		}).done(function(data) {

			$("#playlist_body tr").remove();

			var userId = document.getElementById('user_id');
			userId.innerHTML = data.user_id;

			var userName = document.getElementById('user_name');
			userName.innerHTML = data.user_name;

			var spotifyIcon = document.getElementById('spotify_link');
			spotifyIcon.href = data.user_url;

			var userFlag = document.getElementById('user_flag');
			userFlag.className = "avatar-status avatar-status-bottom flag-icon flag-icon-" + data.user_country.toLowerCase() + " flag-icon-squared";

			if(data.user_image != null) {
				var userImg = document.getElementById('user_image');
				userImg.src = data.user_image;
			}

			var user_followers = document.getElementById('user_followers');
			user_followers.innerHTML = data.user_followers;
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

	if (window.opener) {
	    alert('inside a pop-up window or target=_blank window');
		var params = getHashParams();
		var access_token = params.access_token,
			refresh_token = params.refresh_token,
			error = params.error;
		localStorage.setItem('sp-accessToken', access_token);
		localStorage.setItem('sp-refreshToken', refresh_token);
		localStorage.setItem('sp-error', error);
		//window.close()
	} else if (window.top !== window.self) {
	    //alert('inside an iframe');
	} else {
	    //alert('this is a top level window');
	}

	var oauthSource = document.getElementById('oauth-template').innerHTML,
		oauthTemplate = Handlebars.compile(oauthSource),
		oauthPlaceholder = document.getElementById('oauth');

	var params = getHashParams();

	var access_token = params.access_token,
		refresh_token = params.refresh_token,
		error = null;

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
	controller.my_info(access_token);

	$('#obtain-new-token').click(() => {
		controller.refresh_token(access_token, refresh_token);
		//controller.info_playlist(access_token);
	});

	$('#analysis').click(() => {
		controller.track_multi_analysis(access_token);
	});

	$('#analysis_track').click(() => {
		controller.track_analysis(access_token);
	});

	$('#my_playlist').click(() => {
		controller.my_playlist(access_token);
	});
});
