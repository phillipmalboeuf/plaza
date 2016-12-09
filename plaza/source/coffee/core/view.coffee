class Plaza.View extends Backbone.View

	template: null
	templates: null

	data: {}
	events: {}


	initialize: ->
		this.listenTo Plaza.session, "sync", this.render if Plaza.session?
		this.listenTo Plaza.user, "sync", this.render if Plaza.user?

		_.extend @data, 
			pieces: window.pieces


		this.render()




	render: ->
		_.extend @data, 
			session: Plaza.session.toJSON() if Plaza.session?
			user: Plaza.user.toJSON() if Plaza.user?
			is_authenticated: Plaza.session.has("user_id") if Plaza.session?
			is_admin: Plaza.user.get("is_admin") if Plaza.user?

		if @templates?
			html = ""
			_.each @templates, (template)=>
				html += template(@data)

			this.$el.html(html)
			
		else
			this.$el.html @template(@data) if @template?


		super()

		$(document.links).filter(()->
			this.hostname != window.location.hostname
		).attr('target', '_blank')

		this.delegateEvents()

		this


