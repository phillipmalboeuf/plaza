from flask import request, abort
from plaza import app
from plaza.helpers.json import to_json, json_formater


def raise_error(category, key, code=500, fields=None, no_abort=False):
	errors = {}
	document = {
		'category': category,
		'key': key,
		'code': code
	}

	if fields is not None:
		document['fields'] = fields

	try:
		document['message'] = errors[category][key]
	except KeyError:
		pass
	

	if no_abort:
		return to_json(document, code)

	else:
		abort(to_json(document, code))