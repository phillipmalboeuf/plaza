


window.Plaza =
	Collections:{}
	Models:{}
	Views:{}
	Routers:{}


	settings:
		cdn: "https://d3hy1swj29dtr7.cloudfront.net/"
		api: "http://127.0.0.1:5000/"



	init: ->

		@session = new Plaza.Models.Session()
		@user = new Plaza.Models.User()
		
		@admin_view = new Plaza.Views.Admin()

		@views = []

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



		@checkout = StripeCheckout.configure
			key: "pk_test_2HjgvpC2f4FSLj90x9E6bOG9"
			locale: "auto",
			token: (token)=>

				$.ajax
					type: "POST"
					url: Plaza.settings.api + "_charge"
					data: JSON.stringify({
						token_id: token.id
						amount: @amount
						name: @name
						customer: token.email
					})
					contentType: "application/json; charset=utf-8"
					dataType: "json"
					success: (response)=>
						console.log response

						$("[data-post]").removeClass "overlay--show"
						$("[data-success]").addClass "overlay--show"
				

		$("[data-add-to-cart]").on "click", (e)=>
			parent = $(e.currentTarget).parent().parent()

			@amount = parseFloat(parent.find("[data-price]").text())*100
			@name = parent.find("[data-title]").text()
			@checkout.open
				name: @name,
				description: parent.find("[data-description]").text(),
				image: parent.find("[data-photo]").attr("src"),
				currency: "cad",
				amount: @amount




		@router = new Plaza.Routers.Router()
		Backbone.history.start()
	


		
		

Plaza = window.Plaza
_ = window._
Backbone = window.Backbone
jQuery = window.jQuery


_.extend Plaza.settings, window.plaza_settings if window.plaza_settings?


$ ->
	Plaza.init()














