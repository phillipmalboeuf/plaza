
class Plaza.Views.Editable extends Plaza.View


	edit_admin_template: templates["admin/edit_admin"]

	
	initialize: ->
		this.events["click .js-save_edit"] = "save_edit"
		this.events["click .js-destroy"] = "destroy"

		this.listenTo @model, "sync", this.render

		@model.fetch()

		super()



	render: ->

		_.extend @data,
			model: @model.toJSON()

		super()

		if @data.is_authenticated
			this.$el.find("[data-admin]").html this.edit_admin_template(@data)
			this.$el.find(".admin_only").removeClass "admin_only"

			this.delegateEvents()

		this


	save_edit: (e)->

		@model.save()



	destroy: ->
		if confirm("Are you sure?")
			@model.destroy
				success: (model, response)=>

					Turbolinks.visit "/"
					$(document).on "turbolinks:load", =>
						$(document).off "turbolinks:load"

						Plaza.render_views()
						Plaza.router.navigate @list_route,
							trigger: true



