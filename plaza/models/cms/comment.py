from plaza import app
from flask import request, abort

from plaza.models.core.child_model import ChildModel
from plaza.models.core.has_child_routes import HasChildRoutes

from plaza.models.cms.list_post import ListPost
from plaza.models.cms.survey import Survey

from plaza.helpers.validation_rules import validation_rules



with app.app_context():
	class Comment(HasChildRoutes, ChildModel):
		list_name = 'comments'

		schema = {
			'user_id': validation_rules['object_id'],
			'subject': validation_rules['text'],
			'body': validation_rules['text'],
			'rating': validation_rules['number'],
			'metadata': validation_rules['metadata']
		}


		endpoint = '/comments'
		routes = [
			{
				'route': '',
				'view_function': 'list_view',
				'methods': ['GET']
			},
			{
				'route': '',
				'view_function': 'create_view',
				'methods': ['POST'],
				'requires_user': True
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'get_view',
				'methods': ['GET']
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'update_view',
				'methods': ['PATCH', 'PUT'],
				'requires_user': True
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'delete_view',
				'methods': ['DELETE'],
				'requires_user': True
			}
		]


	class ListPostComment(Comment):

		parent = ListPost


	class SurveyComment(Comment):

		parent = Survey



