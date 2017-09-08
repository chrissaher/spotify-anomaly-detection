import cherrypy
import cherrypy_cors
import json
from anomalydetector import AnomalyDetector

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
