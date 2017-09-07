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

		var next = "";
		var map = new Map();
		var sTrackIds = "";
		while(next != null) {
			$.ajax({
				url: '/getPlaylistTracks',
				data: {
					'access_token': acc_token,
					'user_id': user_id,
					'playlist_id': playlist_id,
					'url' : next,
					'fields':	'next,' +
								'total,' +
								'items(track(id,name))'
				},
				async: false
			}).done(function(data) {
				next = data.next;

				for(var it in data.items) {
					var curr = data.items[it].track;
					map.set(curr.id, curr.name);
					sTrackIds = sTrackIds + curr.id + ","
				}

				if(data.total >= map.size) {
					alert("Reached Total: " + map.size )
				}
			});
		}

	}

	my_playlist(acc_token, limit, offset) {
		$.ajax({
			url: '/getCurrentUserPlaylist',
			data: {
				'access_token': acc_token,
				'limit': limit,
				'offset': offset
			}
		}).done(function(data) {

			self.total = data.total
			if(offset + limit >= data.total) {
				document.getElementById("next").parentNode.className = "disabled";
			} else {
				document.getElementById("next").parentNode.className = "";
			}
			$("#lstPlaylist tr").remove();

			var template = '<tr> <td class="v-a-m">#It </td> <td class="v-a-m"><a href = "#URL"><span class="text-white">#Name</span></a> <br> <span>Followers: #Followers</span> </td> <td class="v-a-m"> <div class="media media-auto"> <div class="media-left"> <div class="avatar"> <img class="media-object img-circle" src="#OwnerImg" alt="Avatar"> </div> </div> <div class="media-body"> <span class="media-heading text-white">#OwnerName</span> <br> <span class="media-heading"><span>Spotify id: #OwnerId</span></span> </div> </div> </td> <td class="v-a-m"><span>#Tipe</span> <br> <span class="#CollaborativeStyle">#sCollaborative</span> </td> <td class="text-right v-a-m"> <a  id ="#GETID" data-user = "#DataUser" data-playlist = "#DataPlaylist" type="button" class="btn btn-default">Analyze</a> </td> </tr>';
			var items = data.items
			//var tableRef = document.getElementById('playlist').getElementsByTagName('tbody')[0];
			var myTable = document.getElementById('lstPlaylist');
			var idx = 1;
			for(var it in items) {
			//for(var it = 0; it < 1; ++it) {
				var item = items[it];

				$.ajax({
					url: '/getPlaylistFull',
					data: {
						'access_token': acc_token,
						'user_id': item.owner.id,
						'playlist_id': item.id,
						'fields': 	'name,' +
									'id,' +
									'external_urls.spotify,' +
									'owner,' +
									'owner.display_name,' +
									'owner.id,' +
									'collaborative,' +
									'public,' +
									'followers.total,' +
									'images.items(url),'
					}
				}).done(function(data2) {

					var current = template.replace("#It", idx);
					current = current.replace("#Name", data2.name);
					current = current.replace("#URL", data2.external_urls.spotify);
					current = current.replace("#OwnerName", data2.owner.display_name || data2.owner.id);
					if(data2.owner != null) {
						var userImg = document.getElementById('user_image');
						//userImg.src = data.user_image;
					}
					current = current.replace("#OwnerId", data2.owner.id);
					if (data2.collaborative == true) {
						current = current.replace("#CollaborativeStyle", "text-success");
						current = current.replace("#sCollaborative", "Collaborative");
					}
					else {
						current = current.replace("#CollaborativeStyle", "text-danger");
						current = current.replace("#sCollaborative", "Not Collaborative");
					}
					current = current.replace("#Tipe", (data2.public == true)? "Public": "Private");
					current = current.replace("#GETID", data2.id);
					current = current.replace("#DataUser", data2.owner.id);
					current = current.replace("#DataPlaylist", data2.id);
					//current = current.replace("#OwnerImg", data2.images[1].url);


					current = current.replace("#Followers", data2.followers.total);

					$.ajax({
						url: '/getUserInfo',
						data: {
							'access_token': acc_token,
							'user_id': data2.owner.id
						},
						async: false
					}).done(function(UserInfo) {
						if(UserInfo.images.length > 0) {
							current = current.replace("#OwnerImg", UserInfo.images[0].url);
						} else {
							current = current.replace("#OwnerImg", "../public/img/spotify_logo.png");
						}
					});

					myTable.insertAdjacentHTML( 'beforeend', current );
					var current_get = document.getElementById(data2.id);
					current_get.onclick = function(){
						var c = new Controller();
						c.track_multi_analysis(acc_token, this.getAttribute("data-user"), this.getAttribute("data-playlist"));
					};

					var c = $("#lstPlaylist tr").length;
					if(c == self.total % self.limit){
						//alert("FIN")
						$("#playlist_loader").hide();
						$("#playlist_table").show();
					}
				});

				idx++;
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
			self.current_user_id = data.user_id

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
/*
	var oauthSource = document.getElementById('oauth-template').innerHTML,
		oauthTemplate = Handlebars.compile(oauthSource),
		oauthPlaceholder = document.getElementById('oauth');*/

	var params = getHashParams();

	var access_token = params.access_token,
		refresh_token = params.refresh_token,
		error = null;

	if (error) {
		alert('There was an error during the authentication');
	} else {
		if (access_token) {
			// render oauth info
		/*	oauthPlaceholder.innerHTML = oauthTemplate({
				access_token: access_token,
				refresh_token: refresh_token
			});*/

		} else {
				// render initial screen
				alert("NO PERMISSION");
		}
	}

	var controller = new Controller();
	self.limit = 20;
	self.offset = 0;
	self.total = 0;
	var btnPrev = document.getElementById("prev");
	btnPrev.onclick = function(){
		var c = new Controller();
		if(self.offset > 0) {
			self.offset -= self.limit;
			$("#playlist_loader").show();
			$("#playlist_table").hide();
			c.my_playlist(access_token, self.limit, self.offset);
			if(self.offset == 0) {
				this.parentNode.className  = "disabled";
			}
		}
	};

	var btnNext = document.getElementById("next");
	btnNext.onclick = function(){
		var c = new Controller();
		document.getElementById("prev").parentNode.className  = "";
		self.offset += self.limit;
		$("#playlist_loader").show();
		$("#playlist_table").hide();
		c.my_playlist(access_token, self.limit, self.offset);
	};


	controller.my_info(access_token);
	controller.my_playlist(access_token, self.limit, self.offset);

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
		controller.my_playlist(access_token, 5, 0);
	});
});
