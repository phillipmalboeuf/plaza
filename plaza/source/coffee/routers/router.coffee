class Plaza.Routers.Router extends Backbone.Router



	routes: {
		# "lists/:list_route(/tags)(/authors)(/posts)(/:route)(/)": "list"
		"dev": "dev"
		"index": "index"
		"(:lang)(/)(:path)(/)": "path"
	}

	views: []
	

	initialize: ->



	execute: (callback, args)->

		for view in @views
			view.destroy()

		delete @views
		@views = []

		callback.apply(this, args) if callback?




	index: ->
		$("#dev").removeClass "dev--show"


	dev: ->
		$("#dev").addClass "dev--show"



	path: ->
		




	list: (list_route, route)->
		$(".js-post").each (index, element)=>
			model = new Plaza.Models.ListPost()
			model.urlRoot = Plaza.settings.api + "lists/"+window.list_id+"/posts"
			@views.push new Plaza.Views.Post({
				el: element, 
				model: model
			})










