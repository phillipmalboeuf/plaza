class Plaza.Views.Parallax extends Backbone.View


	events: {}


	initialize: ->



		this.render()



	render: ->

		layers = this.$el.find(".js-layer")

		translate = ->
			for layer in layers
				layer.style.transform = "translate3d(0, "+(window.pageYOffset * -layer.getAttribute("data-depth"))+"px, 0)"


		$(window).scroll ->
			window.requestAnimationFrame(translate)
			
			
		this


	



