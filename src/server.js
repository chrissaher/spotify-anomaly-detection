/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var localStorage = require('localStorage')

var client_id = 'a7f084730c164961a78208b6f4dfa2fa'; // Your client id
var client_secret = '370de42f69324fbabe5c90aeade386fc'; // Your secret
var redirect_uri = 'http://localhost:8889/demo'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param	{number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

console.log(__dirname);
app.use(express.static(__dirname, {'index': ['index.html', 'login.html']}))
   .use(cookieParser());

app.use(express.static(__dirname + '/public'));

app.get('/login', function(req, res) {

	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});

app.get('/callback', function(req, res) {

	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					//console.log(body);
				});

				// we can also pass the token to the browser to make requests from there
				res.redirect('/#' +
					querystring.stringify({
						access_token: access_token,
						refresh_token: refresh_token
					}));
			} else {
				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
			}
		});
	}
});

app.get('/refresh_token', function(req, res) {

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			res.send({
				'access_token': access_token
			});
		}
	});
});

app.get('/demo', function(req, res) {

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;
	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};
		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token,
					refresh_token = body.refresh_token;
				localStorage.setItem('sp-accessToken', access_token);
				localStorage.setItem('sp-refreshToken', refresh_token);
				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					//console.log(body);
				});

				// we can also pass the token to the browser to make requests from there
				res.redirect('/playlist/playlist.html#' +
					querystring.stringify({
						access_token: access_token,
						refresh_token: refresh_token
					}));
			} else {
				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
			}
		});
	}
});

app.get('/dashboard',function(req, res){
	//console.log("DASH")
	var access_token = req.query.access_token;
	var refresh_token = req.query.refresh_token;
	var error = req.query.error;
	//console.log(access_token)
/*
	request.get(null, function(error, response, body) {
		console.log(body);

	});*/

	var url = '/playlist/playlist.html#' +
		querystring.stringify({
			access_token: access_token,
			refresh_token: refresh_token
		});

	//console.log(url)
	res.redirect(url);

});

app.get('/getPlaylistTracks',function(req, res){
	var access_token = req.query.access_token;
	var user_id = req.query.user_id;
	var playlist_id = req.query.playlist_id;
	var fields = req.query.fields;

	var url = req.query.url;

	if(url == null || url == "") {
		url = 'https://api.spotify.com/v1/users/'+ user_id +'/playlists/' + playlist_id + '/tracks/?'+
			querystring.stringify({
				'fields' : fields
			});
	}

	console.log("PARAMETERS")
	console.log(user_id);
	console.log(playlist_id);
	console.log(url)
	console.log("END")
	var authOptions = {
		url: url,
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	});
});

app.get('/getPlaylist',function(req, res){
	var access_token = req.query.access_token;
	var user_id = req.query.user_id;
	var playlist_id = req.query.playlist_id;
	var fields = req.query.fields;

	//console.log(user_id);
	//console.log(playlist_id);
	var authOptions = {
		url: 'https://api.spotify.com/v1/users/'+ user_id +'/playlists/' + playlist_id + +
			querystring.stringify({
				fields : fields
			}),
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var id = body.id;
			/*res.send({
				'access_token': id
			});*/
			res.send(body);
		}
	});
});

app.get('/getAnalysis',function(req, res){
	var access_token = req.query.access_token;
	var trackId = req.query.trackId;
	var authOptions = {
		url: 'https://api.spotify.com/v1/audio-features/' + trackId,
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	});
});

app.get('/getMultiAnalysis',function(req, res){
	var access_token = req.query.access_token;
	var trackIds = req.query.trackIds;
	var authOptions = {
		url: 'https://api.spotify.com/v1/audio-features/?' +
			querystring.stringify({
				ids : trackIds
			}),
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	});
});

app.get('/getNextTracks',function(req, res){
	var access_token = req.query.access_token;
	var url = req.query.url;
	var authOptions = {
		url: url,
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	});
});

app.get('/getCurrentUserPlaylist',function(req, res){
	var access_token = req.query.access_token;
	var limit = req.query.limit;
	var offset = req.query.offset;
	var authOptions = {
		url: 'https://api.spotify.com/v1/me/playlists?limit=' + limit + '&offset=' + offset,
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};
	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	});
});

app.get('/getPlaylistFull',function(req, res){
	var access_token = req.query.access_token;
	var user_id = req.query.user_id;
	var playlist_id = req.query.playlist_id;
	var fields = req.query.fields;
	//console.log(user_id);
	//console.log(playlist_id);
	var authOptions = {
		url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '?fields=' + fields,
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};
	//console.log("HARO")
	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			//console.log(body)
			/*res.send({
				'followers': body.followers.total
			});*/
			res.send(body);
		}
	});
	//console.log("BYE BYE")
});

app.get('/getUserInfo',function(req, res){
	var access_token = req.query.access_token;
	var user_id = req.query.user_id;

	var authOptions = {
		url: 'https://api.spotify.com/v1/users/' + user_id ,
		headers: { 'Authorization': 'Bearer ' + access_token },
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send({
				'images' : body.images
			});
		}
	});
});


app.get('/getCurrentUserInfo',function(req, res){
	var access_token = req.query.access_token;
	var authOptions = {
		url: 'https://api.spotify.com/v1/me',
		headers: { 'Authorization': 'Bearer ' + access_token },
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send({
				'user_id': body.id,
				'user_name': body.display_name || body.id,
				'user_country': body.country,
				'user_image': ((body.images.length > 0)? body.images[0].url : null),
				'user_mail' : body.email,
				'user_url' : body.external_urls["spotify"],
				'user_followers' : body.followers.total
			});
		}
	});

});

console.log('Listening on 8889');
app.listen(8889);
