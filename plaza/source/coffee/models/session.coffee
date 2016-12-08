class Plaza.Models.Session extends Plaza.Model

	urlRoot: Plaza.settings.api + "sessions"


	initialize: (options={})->
		this.set 
			_id: Plaza.cookies.get("Session-Id")
			secret: Plaza.cookies.get("Session-Secret")
			user_id: Plaza.cookies.get("User-Id")



	login: (data={}, options={})->
		Plaza.session.save data,
			success: (model, response)->
				Plaza.cookies.set "Session-Id", response._id
				Plaza.cookies.set "Session-Secret", response.secret
				Plaza.cookies.set "User-Id", response.user_id

				Plaza.user.initialize()



	logout: ->
		this.clear()

		Plaza.user.clear()

		Plaza.cookies.delete "Session-Id"
		Plaza.cookies.delete "Session-Secret"
		Plaza.cookies.delete "User-Id"
		
		window.location = window.location.pathname


	is_authenticated: ->
		Plaza.cookies.get("User-Id")?
		
