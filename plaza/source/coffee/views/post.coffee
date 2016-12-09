
class Plaza.Views.Post extends Plaza.Views.Editable


	events: {
		"click [data-thumbnail]": "trigger_upload"
		"click [data-content-image-key]": "trigger_upload"
		"change [data-image-input]": "upload_image"
	}


	initialize: ->

		@list_route = this.el.getAttribute("data-list-route")

		super()



	render: ->

		super()

		if @data.is_authenticated
			this.$el.find("[data-title]").attr "contenteditable", "true"
			this.$el.find("[data-thumbnail]").each (index, image)=>
				$(image).addClass "img--clickable"

			this.$el.find("[data-content-key]").attr "contenteditable", "true"
			this.$el.find("[data-content-image-key]").each (index, image)=>
				$(image).addClass "img--clickable"



			this.delegateEvents()

		this



	save_edit: (e)->
		@model.set
			title: this.$el.find("[data-title]").html()
			thumbnail: this.$el.find("[data-thumbnail]").attr("src")

		this.$el.find("[data-content-key]").each (index, content)=>
			@model.attributes.content[content.getAttribute("data-content-key")].value = content.innerHTML

		this.$el.find("[data-content-image-key]").each (index, image)=>
			@model.attributes.content[image.getAttribute("data-content-image-key")].value = image.getAttribute("src")

		super()



	trigger_upload: (e)->
		@image = $(e.currentTarget)
		this.$el.find("[data-image-input]").click()


	upload_image: (e)->
		file = e.currentTarget.files[0]
		if file.type.match('image.*')
			Plaza.helpers.upload file,
				success: (response)=>
					
					@image.attr "src", Plaza.settings.cdn+response.url
 


