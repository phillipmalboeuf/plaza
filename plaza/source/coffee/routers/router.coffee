class Plaza.Routers.Router extends Backbone.Router



	routes: {
		"dev": "dev"
		"index": "index"
		"(:path)(/)(:post)(/)": "path"
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
		$("[data-list]").removeClass "overlay--show"
		$("[data-post]").removeClass "overlay--show"
		$("[data-success]").removeClass "overlay--show"

		setTimeout ->
			$("[data-video-id]").removeAttr "src"
		, 666



	path: (path, post)->
		$("[data-list='"+path+"']").addClass "overlay--show"
		$("[data-success]").removeClass "overlay--show"

		if post?
			$("[data-post='"+post+"']").addClass "overlay--show"
			
			video = $("[data-post='"+post+"'] [data-video-id]")
			setTimeout ->
				if video.length > 0
					video.attr "src", "https://www.youtube.com/embed/"+video.attr("data-video-id")
			, 666

		else
			$("[data-post]").removeClass "overlay--show"

			setTimeout ->
				$("[data-video-id]").removeAttr "src"
			, 666










