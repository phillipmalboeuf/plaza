
class Plaza.Views.Post extends Plaza.Views.Editable


	events: {
		# "click [data-thumbnail]": "trigger_upload"
		"click [data-content-image-key]": "trigger_upload"
		"change [data-image-input]": "upload_image"
		"click [data-remove-option]": "remove_option"
		"click [data-add-option]": "add_option"
	}


	initialize: ->

		@list_route = this.el.getAttribute("data-list-route")

		super()



	render: ->

		super()

		if @data.is_authenticated
			this.$el.find("[data-title]").attr "contenteditable", "true"
			# this.$el.find("[data-thumbnail]").each (index, image)=>
			# 	$(image).addClass "img--clickable"

			this.$el.find("[data-content-key]").attr "contenteditable", "true"
			this.$el.find("[data-content-image-key]").each (index, image)=>
				$(image).addClass "img--clickable"

			this.$el.find("[data-option]").attr "contenteditable", "true"


			this.delegateEvents()

		this



	save_edit: (e)->
		if Plaza.settings.lang?
			this.$el.find("[data-content-key]").each (index, content)=>
				@model.attributes.content[content.getAttribute("data-content-key")].translations = {} unless @model.attributes.content[content.getAttribute("data-content-key")].translations?
				@model.attributes.content[content.getAttribute("data-content-key")].translations[Plaza.settings.lang] = content.innerHTML

			this.$el.find("[data-content-image-key]").each (index, image)=>
				@model.attributes.content[image.getAttribute("data-content-image-key")].translations = {} unless @model.attributes.content[image.getAttribute("data-content-image-key")].translations?
				@model.attributes.content[image.getAttribute("data-content-image-key")].translations[Plaza.settings.lang] = image.getAttribute("src")
		
		else
			this.$el.find("[data-content-key]").each (index, content)=>
				@model.attributes.content[content.getAttribute("data-content-key")] = { value: content.innerHTML }

			this.$el.find("[data-content-image-key]").each (index, image)=>
				@model.attributes.content[image.getAttribute("data-content-image-key")] = { value: image.getAttribute("src") }

		# @model.attributes.thumbnail = this.$el.find("[data-thumbnail]").attr("src")

		

		options = this.$el.find("[data-option]")
		if options.length > 0
			@model.attributes.content.product_options = {value: []}
			options.each (index, option)=>
				@model.attributes.content.product_options.value.push option.innerHTML

		super()


	remove_option: (e)->
		$(e.currentTarget).parent().parent().remove()

	add_option: (e)->
		$(e.currentTarget).before "<div><input type='radio' name='options' id='"+@model.id+"_new' value='new'> <label for='"+@model.id+"_new'><span data-option contenteditable>Nouvelle option</span> <button class='button--transparent small' data-remove-option>(Supprimer)</button></label></div>"



	trigger_upload: (e)->
		@image = $(e.currentTarget)
		this.$el.find("[data-image-input]").click()


	upload_image: (e)->
		file = e.currentTarget.files[0]
		if file.type.match('image.*')
			Plaza.helpers.upload file,
				success: (response)=>
					
					@image.attr "src", Plaza.settings.cdn+response.url
 


