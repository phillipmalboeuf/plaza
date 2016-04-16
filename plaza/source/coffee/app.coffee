


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

		@router = new Plaza.Routers.Router()
		Backbone.history.start()
	


		
		

Plaza = window.Plaza
_ = window._
Backbone = window.Backbone
jQuery = window.jQuery


_.extend Plaza.settings, window.plaza_settings if window.plaza_settings?


$ ->
	Plaza.init()














