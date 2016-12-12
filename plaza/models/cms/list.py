from plaza import app
from flask import request, abort

from plaza.models.core.model import Model
from plaza.models.core.with_templates import WithTemplates
from plaza.models.core.has_routes import HasRoutes

from plaza.helpers.validation_rules import validation_rules
from plaza.helpers.json import to_json

from plaza.models.cms.author import Author

from bson.objectid import ObjectId
import markdown


with app.app_context():
	class List(WithTemplates, HasRoutes, Model):

		collection_name = 'lists'

		schema = {
			'title': validation_rules['text'],
			'route': validation_rules['text'],
			'thumbnail': validation_rules['image'],
			'image': validation_rules['image'],
			'template': {
				'type': 'dict',
				'schema': {
					'thumbnail': validation_rules['image'],
					'image': validation_rules['image'],
					'content': validation_rules['content'],
					'tags': validation_rules['text_list'],
					'metadata': validation_rules['metadata']
				}
			},
			'is_online': validation_rules['bool'],
			'metadata': validation_rules['metadata']
		}

		endpoint = '/lists'
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
				'route': '/<string:_id>',
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
				for key in document['template']['content'].copy().keys():
					document['template.content.'+key] = document['template']['content'].pop(key)

				del document['template']['content']
			except KeyError:
				pass

			try:
				for key in document['template'].copy().keys():
					document['template.'+key] = document['template'].pop(key)

				del document['template']

			except KeyError:
				pass

			return super().update(_id, document, other_operators, projection)



		@classmethod
		def postprocess(cls, document):
			tag_counts = {}
			document['tags'] = []
			document['highest_tag_count'] = 0


			try:
				posts = []
				for post in document['posts']:
					if post['is_online']:
						posts.append(post)
				document['posts'] = posts


				for post in document['posts']:
					try:
						for tag in post['tags']:
							if tag in tag_counts:
								tag_counts[tag] += 1
							else:
								tag_counts[tag] = 1

					except KeyError:
						pass
						

				for (key, value) in tag_counts.items():
					document['tags'].append({'name':key, 'count':value})
					if value > document['highest_tag_count']:
						document['highest_tag_count'] = value

			except KeyError:
				pass



			return document




		# HELPERS
		@classmethod
		def _values(cls, lang):

			lists = cls.list()
			for _list in lists:
				try:
					posts = []

					for post in _list['posts']:
						post_values = post.copy()

						try:
							for (key, value) in post_values['content'].items():
								if lang is not None:
									try:
										value['value'] = value['translations'][lang]
									except KeyError:
										pass
								
								if 'is_markdown' in value and value['is_markdown']:
									post_values[key] = markdown.markdown(value['value'])
								else:
									post_values[key] = value['value']
							del post_values['content']

						except KeyError:
							pass

						posts.append(post_values)


					def get_published_date(post):
						return post['published_date']

					_list['posts'] = sorted(posts, key=get_published_date)
					_list['posts'].reverse()
					


				except KeyError:
					pass
				

			return lists






