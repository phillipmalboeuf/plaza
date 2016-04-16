class Plaza.Collection extends Backbone.Collection

	model: Plaza.Model
		



	fetch: (options={})->
		super Plaza.Model.prototype.set_secret_header(options)



