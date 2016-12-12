
class Plaza.Views.List extends Plaza.View

	list_admin_template: templates["admin/list_admin"]


	events: {
		"click [data-new]": "new"
	}


	initialize: ->

		super()



	render: ->

		super()

		if @data.is_authenticated
			this.$el.find("[data-list-admin]").html this.list_admin_template(@data)

			this.delegateEvents()

		this


	new: (e)->

		type = e.currentTarget.getAttribute "data-new"
		model = new Plaza.Models.ListPost()
		model.urlRoot = Plaza.settings.api + "lists/"+this.el.getAttribute("data-list-id")+"/posts"
		model.attributes.content = {}
		model.attributes.content["is_"+type] = {value: true}

		if type == "product"
			model.attributes.content["title"] = {value: "Nom du produit"}
			model.attributes.content["product_description"] = {value: "Description du produit"}
			model.attributes.content["product_price"] = {value: 10.0}
			model.attributes.content["product_photo"] = {value: ""}

		else if type == "photo"
			model.attributes.content["title"] = {value: "Nom de la photo"}
			model.attributes.content["photo"] = {value: ""}

		else if type == "video"
			model.attributes.content["title"] = {value: "Nom du vidéo"}
			model.attributes.content["video_embed_id"] = {value: "MNqYeNahqK8"}

		list_route = this.el.getAttribute("data-list")
		
		model.save {
			title: "Nom de l'objet"
			is_online: true
		},
			success: (model, response)->
				console.log response

				Turbolinks.visit "/"
				$(document).on "turbolinks:load", ->
					$(document).off "turbolinks:load"

					Plaza.render_views()
					Plaza.router.navigate list_route+"/"+response._id,
						trigger: true



	


