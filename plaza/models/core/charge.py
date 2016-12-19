
from plaza import app
from plaza.models.core.has_routes import HasRoutes

from flask import request

from bson.objectid import ObjectId

import stripe



with app.app_context():
	class Charge(HasRoutes):

		endpoint = '/_charge'
		routes = [
			{
				'route': '',
				'view_function': 'upload_view',
				'methods': ['POST']
			}
		]


		@classmethod
		def upload_view(cls):
			stripe.api_key = app.config['STRIPE_API_KEY']

			data = cls._get_json_from_request()

			charge = stripe.Charge.create(
				amount=int(data['amount']),
				currency='cad',
				source=data['token_id'],
				receipt_email=data['customer'],
				description=data['name'] + ' pour : ' + data['customer']
			)

			return cls._format_response({
				'charge': charge
			})






