
class Plaza.Views.Piece extends Plaza.View


	piece_admin_template: templates["admin/piece_admin"]
	piece_link_template: templates["admin/piece_link"]
	piece_file_link_template: templates["admin/piece_file_link"]


	events: {
		"click .js-save_piece": "save_piece"
		"input [data-key]": "key_input"
		"click [data-key]": "prevent_click"
		"click [data-image-key]": "trigger_image_upload"
		"click [data-file-key]": "trigger_file_upload"
		"change .js-image_input": "upload_image"
		"change .js-file_input": "upload_file"
	}


	initialize: ->

		this.listenTo @model, "sync", this.render
		@model.fetch()


		super()


	render: ->

		super()


		if @data.is_authenticated
			this.$el.find("[data-key]").attr "contenteditable", "true"

			this.$el.find("[data-link-key]").each (index, link)=>
				$(link).before this.piece_link_template({
					key: link.getAttribute("data-link-key")
					link: link.getAttribute("href")
				})

				link.removeAttribute("data-link-key")

			this.$el.find("[data-file-link-key]").each (index, link)=>
				$(link).before this.piece_file_link_template({
					key: link.getAttribute("data-file-link-key")
					url: link.getAttribute("href")
				})

				link.removeAttribute("data-file-link-key")

			this.$el.find("[data-image-key]").each (index, image)=>
				$(image).addClass "img--clickable"
				


			this.$el.find("[data-piece-admin]").html this.piece_admin_template(@data)
			@button = this.$el.find(".js-save_piece")[0]

		this



	save_piece: (e)->
		e.preventDefault()

		if Plaza.settings.lang?
			this.$el.find("[data-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-key")].translations = {} unless @model.attributes.content[key.getAttribute("data-key")].translations?
				@model.attributes.content[key.getAttribute("data-key")].translations[Plaza.settings.lang] = key.innerHTML

			this.$el.find("[data-image-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-image-key")].translations = {} unless @model.attributes.content[key.getAttribute("data-image-key")].translations?
				@model.attributes.content[key.getAttribute("data-image-key")].translations[Plaza.settings.lang] = key.getAttribute("src")

			this.$el.find("[data-file-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-file-key")].translations = {} unless @model.attributes.content[key.getAttribute("data-file-key")].translations?
				@model.attributes.content[key.getAttribute("data-file-key")].translations[Plaza.settings.lang] = key.innerText


		else
			this.$el.find("[data-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-key")].value = key.innerHTML

			this.$el.find("[data-image-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-image-key")].value = key.getAttribute("src")

			this.$el.find("[data-file-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-file-key")].value = key.innerText


		@model.save()


	key_input: (e)->
		if @button.hasAttribute "disabled"
			@button.removeAttribute "disabled"


	trigger_image_upload: (e)->
		input = this.$el.find(".js-image_input")
		@image_key = e.currentTarget.getAttribute("data-image-key")
		input.click()


	upload_image: (e)->

		file = e.currentTarget.files[0]
		if file.type.match('image.*')
			Plaza.helpers.upload file,
				success: (response)=>
					
					this.$el.find("[data-image-key='"+@image_key+"']").attr "src", Plaza.settings.cdn+response.url
					this.key_input()


	trigger_file_upload: (e)->
		input = this.$el.find(".js-file_input")
		@file_key = e.currentTarget.getAttribute("data-file-key")
		input.click()


	upload_file: (e)->

		file = e.currentTarget.files[0]
		Plaza.helpers.upload file,
			success: (response)=>
				
				file_key = this.$el.find("[data-file-key='"+@file_key+"']")
				file_key.text Plaza.settings.cdn+response.url
				this.key_input()



	prevent_click: (e)->
		if @data.is_authenticated
			e.preventDefault()


