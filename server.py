
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

from plaza import app
from plaza.helpers.json import to_json


from flask import request, abort
import os


from plaza.models.core.upload import Upload
Upload.define_routes()

from plaza.models.core.charge import Charge
Charge.define_routes()


from plaza.models.auth.token import Token
from plaza.models.auth.session import Session
from plaza.models.auth.user import User

Token.define_routes()
Session.define_routes()
User.define_routes()


from plaza.models.cms.piece import Piece
from plaza.models.cms.author import Author
from plaza.models.cms.list import List
from plaza.models.cms.list_post import ListPost
from plaza.models.cms.comment import ListPostComment
from plaza.models.cms.survey import Survey
from plaza.models.cms.survey_answer import SurveyAnswer
from plaza.models.cms.comment import SurveyComment

Piece.define_routes()
Author.define_routes()
List.define_routes()
ListPost.define_routes()
ListPostComment.define_routes()
Survey.define_routes()
SurveyAnswer.define_routes()
SurveyComment.define_routes()



if __name__ == '__main__':
	if app.config['DEBUG']:
		app.run(threaded=True)

	else:
		http_server = HTTPServer(WSGIContainer(app))
		http_server.listen(5000)
		IOLoop.instance().start()

