class Plaza.Models.User extends Plaza.Model

	urlRoot: Plaza.settings.api + "users"


	initialize: (options={})->
		user_id = Plaza.cookies.get("User-Id")

		if user_id?
			this.set 
				_id: user_id

			this.fetch()