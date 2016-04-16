class Plaza.Routers.Router extends Backbone.Router



	routes: {
		"lists/:list_route(/tags)(/authors)(/posts)(/:route)(/)": "list"
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


		$(".js-piece").each (index, element)=>
			model = new Plaza.Models.Piece({"_id": element.getAttribute("data-id")})
			@views.push new Plaza.Views.Piece({
				el: element
				model: model
			})


		$(".js-parallax").each (index, element)=>
			@views.push new Plaza.Views.Parallax({
				el: element
			})



	path: ->
		




	list: (list_route, route)->
		$(".js-post").each (index, element)=>
			model = new Plaza.Models.ListPost()
			model.urlRoot = Plaza.settings.api + "lists/"+window.list_id+"/posts"
			@views.push new Plaza.Views.Post({
				el: element, 
				model: model
			})










