'use strict';
var express = require('express');
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');


var client_id = 'a7f084730c164961a78208b6f4dfa2fa';
var client_secret = '370de42f69324fbabe5c90aeade386fc';
var redirect_uri = 'https://anomaly-detection-web.herokuapp.com/demo';

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

app.get('/refresh_token', function(req, res) {

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

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				request.get(options, function(error, response, body) {
					//console.log(body);
				});

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

	var authOptions = {
		url: url,
		headers: { 'Authorization': 'Bearer ' + access_token },
		form: {
		},
		json: true
	};

	request.get(authOptions, function(error, response, body) {
		console.log(body)
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

	var authOptions = {
		url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '?fields=' + fields,
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

app.set('port', (process.env.PORT || 8889));
//console.log('Listening on ' + app.get('port'));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
//app.listen(8080);
