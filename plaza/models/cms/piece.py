from plaza import app
from flask import request, abort

from plaza.models.core.model import Model
from plaza.models.core.has_routes import HasRoutes

from plaza.helpers.validation_rules import validation_rules
from plaza.helpers.json import to_json

import markdown


with app.app_context():
	class Piece(HasRoutes, Model):

		collection_name = 'pieces'

		schema = {
			'title': validation_rules['text'],
			'is_online': validation_rules['bool'],
			'content': validation_rules['content'],
			'metadata': validation_rules['metadata']
		}

		schema['content']['valueschema']['schema']['translations'] = { 'type': 'dict', 'schema': {} }
		for lang in app.config['LANGS']:
			schema['content']['valueschema']['schema']['translations']['schema'][lang] = { 'nullable': True }


		endpoint = '/pieces'
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
				'requires_admin': True
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
				'requires_admin': True
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'delete_view',
				'methods': ['DELETE'],
				'requires_admin': True
			}
		]


		@classmethod
		def preprocess(cls, document):
			for cache in app.caches:
				app.caches[cache].clear()

			return super().preprocess(document)


		@classmethod
		def update(cls, _id, document, other_operators={}, projection={}):

			try:
				for key in document['content'].copy().keys():
					document['content.'+key] = document['content'].pop(key)

				del document['content']

			except KeyError:
				pass

			return super().update(_id, document, other_operators, projection)



		@classmethod
		def _values(cls, lang=None):
			values = {}
			for document in cls.list():
				title = document['title'].lower().replace(' ', '').replace('&', '_').replace('#', '_')
				values[title] = document

				try:
					for (key, value) in document['content'].items():
						if lang is not None:
							try:
								value['value'] = value['translations'][lang]
							except KeyError:
								pass


						if 'is_markdown' in value and value['is_markdown']:
							values[title][key] = markdown.markdown(value['value'])
						else:
							values[title][key] = value['value']

					del values[title]['content']
				except KeyError:
					pass

				del values[title]['is_online']

			return values








