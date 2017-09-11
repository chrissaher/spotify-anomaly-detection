import cherrypy
import cherrypy_cors
import json
from anomalydetector import AnomalyDetector

cherrypy.config.update({
	'server.socket_host': '0.0.0.0',
	'server.socket_port': 8080,
})

@cherrypy.expose
class AnomalyDetectorWS(object):

	def GET(self):
		return "GET METHOD"

	def POST(self, data):

		ad = AnomalyDetector();
		outliers = ad.fit(data);
		return outliers;

if __name__ == '__main__':
	cherrypy_cors.install()
	conf = {
		'/': {
			'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
			'tools.sessions.on': True,
			'tools.response_headers.on': True,
			'cors.expose.on': True,
			'tools.response_headers.headers': [('Content-Type', 'text/plain')],
		}
	}
	cherrypy.quickstart(AnomalyDetectorWS(), '/', conf)

#https://hub.docker.com/_/python/
#https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
#https://medium.com/@nagarwal/best-practices-for-working-with-dockerfiles-fb2d22b78186
#https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
#https://stackoverflow.com/questions/12701259/how-to-make-a-node-js-application-run-permanently
#https://github.com/jbfink/docker-wordpress/tree/master/scripts
#https://github.com/Lawouach/cherrypy-docker-hello-world/blob/master/Dockerfile
#http://docs.cherrypy.org/en/latest/basics.html
#https://docs.docker.com/get-started/part2/#build-the-app
#http://docs.cherrypy.org/en/latest/config.html
