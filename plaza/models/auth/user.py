
from plaza import app
from flask import request, abort

from plaza.helpers.json import to_json
from plaza.models.core.model import Model
from plaza.models.core.has_routes import HasRoutes
from plaza.models.core.with_templates import WithTemplates

from plaza.helpers.validation_rules import validation_rules

from bson.objectid import ObjectId

import string
import random
import hashlib
import uuid
import urllib



with app.app_context():
	class User(WithTemplates, HasRoutes, Model):

		collection_name = 'users_2'
		collection_sort = [('updated_at', -1), ('created_at', -1)]

		schema = {
			'email': validation_rules['email'],
			'password': validation_rules['password'],
			'is_admin': validation_rules['bool'],
			'metadata': validation_rules['metadata']
		}


		endpoint = '/users'
		routes = [
			{
				'route': '',
				'view_function': 'list_view',
				'methods': ['GET'],
				'requires_user': True
			},
			{
				'route': '',
				'view_function': 'create_view',
				'methods': ['POST'],
				'requires_admin': True
			},
			{
				'route': '/<string:_id>',
				'view_function': 'get_view',
				'methods': ['GET'],
				'requires_user': True
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
				'requires_admin': True
			}
		]


		@classmethod
		def create(cls, document):

			document['is_online'] = False


			# document['order_count'] = 0
			# document['subscription_order_count'] = 0

			# document['referral_id'] = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(7))
			# document['referral_count'] = 0

			# document['referral_order_count'] = 0
			# document['referral_subscription_count'] = 0
			# document['referral_subscription_order_count'] = 0


			document['store_credit'] = 0
			document['_id'] = ObjectId()
			document['user_id'] = document['_id']


			if 'password' not in document:
				document['password'] = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(9))
				document['password'] = '-'.join([document['password'][:3], document['password'][3:6], document['password'][6:]])
				has_generated_password = True

			else:
				has_generated_password = False


			return super().create(document)



		@classmethod
		def update(cls, _id, document, other_operators={}, projection={}):


			document = super().update(_id, document, other_operators, projection)


			return document




		@classmethod
		def preprocess(cls, document):

			if not request.current_session_is_admin:
				try:
					del document['is_admin']
				except KeyError:
					pass
			
			try:
				document['password_salt'] = uuid.uuid4().hex
				document['password'] = hashlib.sha256(document['password'].encode('utf-8') + document['password_salt'].encode('utf-8')).hexdigest()
			except KeyError:
				del document['password_salt']
				
				pass

			try:
				document['route'] = urllib.parse.quote_plus(document['route'].lower())
			except KeyError:
				pass

			return super().preprocess(document)





		@classmethod
		def postprocess(cls, document):

			try:
				del document['password']
				del document['password_salt']
			except KeyError:
				pass

			return document



