
from plaza import app
from flask import request, abort

from plaza.helpers.json import to_json
from plaza.models.core.model import Model
from plaza.models.core.has_routes import HasRoutes

from plaza.helpers.validation_rules import validation_rules

from bson.objectid import ObjectId

import stripe

import string
import random
import hashlib



with app.app_context():
	class User(HasRoutes, Model):

		collection_name = 'users'
		collection_sort = [('updated_at', -1), ('created_at', -1)]

		schema = {
			'email': validation_rules['email'],
			'password': validation_rules['password'],
			'first_name': validation_rules['text'],
			'last_name': validation_rules['text'],
			# 'referral_id': validation_rules['text'],
			'notes': validation_rules['text'],
			'is_vendor': validation_rules['bool'],
			'is_admin': validation_rules['bool'],
			'metadata': validation_rules['metadata']
		}


		endpoint = '/users'
		routes = [
			{
				'route': '',
				'view_function': 'list_view',
				'methods': ['GET'],
				'requires_admin': True
			},
			{
				'route': '',
				'view_function': 'create_view',
				'methods': ['POST']
			},
			{
				'route': '/<ObjectId:_id>',
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


			# document['order_count'] = 0
			# document['subscription_order_count'] = 0

			# document['referral_id'] = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(7))
			# document['referral_count'] = 0

			# document['referral_order_count'] = 0
			# document['referral_subscription_count'] = 0
			# document['referral_subscription_order_count'] = 0
			

			document['_id'] = ObjectId()
			document['user_id'] = document['_id']


			stripe.api_key = app.config['STRIPE_API_KEY']
			document['provider_data'] = stripe.Customer.create(
				email=document['email'],
				metadata={'_id': document['_id']}
			)



			return super().create(document)



		@classmethod
		def update(cls, _id, document, other_operators={}, projection={}):



			return super().update(_id, document, other_operators, projection)




		@classmethod
		def preprocess(cls, document):

			if not request.current_session_is_admin:
				try:
					del document['is_admin']
				except KeyError:
					pass
				try:
					del document['is_vendor']
				except KeyError:
					pass
			
			try:
				document['password'] = hashlib.sha256(document['password'].encode('utf-8')).hexdigest()

			except KeyError:
				pass

			return super().preprocess(document)



		@classmethod
		def postprocess(cls, document):
			


			try:
				del document['password']

			except KeyError:
				pass


			return document



		
	



