(function() {
  var Backbone, Plaza, _, jQuery;

  window.Plaza = {
    Collections: {},
    Models: {},
    Views: {},
    Routers: {},
    settings: {
      cdn: "https://d3hy1swj29dtr7.cloudfront.net/",
      api: "http://127.0.0.1:5000/"
    },
    init: function() {
      this.session = new Plaza.Models.Session();
      this.user = new Plaza.Models.User();
      this.checkout = StripeCheckout.configure({
        key: "pk_live_c7xy5E2ZpoiBEqvWhX6JIRoz",
        locale: "auto",
        shippingAddress: true,
        token: (function(_this) {
          return function(token) {
            return $.ajax({
              type: "POST",
              url: Plaza.settings.api + "_charge",
              data: JSON.stringify({
                token_id: token.id,
                amount: _this.amount,
                name: _this.name,
                customer: token.email
              }),
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: function(response) {
                console.log(response);
                $("[data-post]").removeClass("overlay--show");
                return $("[data-success]").addClass("overlay--show");
              }
            });
          };
        })(this)
      });
      this.render_views();
      this.router = new Plaza.Routers.Router();
      return Backbone.history.start();
    },
    render_views: function() {
      this.admin_view = new Plaza.Views.Admin();
      this.views = [];
      $(".js-piece").each((function(_this) {
        return function(index, element) {
          var model;
          model = new Plaza.Models.Piece({
            "_id": element.getAttribute("data-id")
          });
          return _this.views.push(new Plaza.Views.Piece({
            el: element,
            model: model
          }));
        };
      })(this));
      $("[data-list]").each((function(_this) {
        return function(index, element) {
          return _this.views.push(new Plaza.Views.List({
            el: element
          }));
        };
      })(this));
      $("[data-post]").each((function(_this) {
        return function(index, element) {
          var model;
          model = new Plaza.Models.ListPost({
            "_id": element.getAttribute("data-post")
          });
          model.urlRoot = Plaza.settings.api + "lists/" + element.getAttribute("data-list-id") + "/posts";
          return _this.views.push(new Plaza.Views.Post({
            el: element,
            model: model
          }));
        };
      })(this));
      $(".js-parallax").each((function(_this) {
        return function(index, element) {
          return _this.views.push(new Plaza.Views.Parallax({
            el: element
          }));
        };
      })(this));
      return $("[data-add-to-cart]").on("click", (function(_this) {
        return function(e) {
          var option, parent;
          parent = $(e.currentTarget).parent().parent();
          _this.amount = parseFloat(parent.find("[data-price]").text()) * 100;
          _this.name = parent.find("[data-content-key='title']").text();
          option = parent.find("[name='options']:checked");
          if (option.length > 0) {
            _this.name = _this.name + " (" + option.val() + ")";
          }
          return _this.checkout.open({
            name: _this.name,
            description: parent.find("[data-description]").text(),
            image: parent.find("[data-photo]").attr("src"),
            currency: "cad",
            amount: _this.amount
          });
        };
      })(this));
    }
  };

  Plaza = window.Plaza;

  _ = window._;

  Backbone = window.Backbone;

  jQuery = window.jQuery;

  if (window.plaza_settings != null) {
    _.extend(Plaza.settings, window.plaza_settings);
  }

  $(function() {
    return Plaza.init();
  });

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.model = Plaza.Model;

    Collection.prototype.fetch = function(options) {
      if (options == null) {
        options = {};
      }
      return Collection.__super__.fetch.call(this, Plaza.Model.prototype.set_secret_header(options));
    };

    return Collection;

  })(Backbone.Collection);

}).call(this);

(function() {
  window.Plaza.cookies = {
    set: function(name, value, expiry_days) {
      var d, expires;
      d = new Date();
      d.setTime(d.getTime() + (expiry_days * 24 * 60 * 60 * 1000));
      expires = "expires=" + d.toGMTString();
      return document.cookie = "X-" + name + "=" + value + "; " + expires + "; path=/";
    },
    set_for_a_session: function(name, value) {
      return document.cookie = "X-" + name + "=" + value + "; path=/";
    },
    get: function(name) {
      var cookie, cookies, fn, i, len, value;
      name = "X-" + name + "=";
      value = false;
      cookies = document.cookie.split(';');
      fn = function(cookie) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
          return value = cookie.substring(name.length, cookie.length);
        }
      };
      for (i = 0, len = cookies.length; i < len; i++) {
        cookie = cookies[i];
        fn(cookie);
      }
      if (!value) {
        value = null;
      }
      return value;
    },
    "delete": function(name) {
      return document.cookie = 'X-' + name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
  };

}).call(this);

(function() {
  Plaza.helpers = {
    upload: function(file, options) {
      var data;
      if (options == null) {
        options = {};
      }
      data = new FormData();
      data.append("file", file);
      return $.ajax({
        type: "POST",
        url: Plaza.settings.api + "_upload",
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        headers: {
          "X-Session-Secret": Plaza.cookies.get("Session-Secret")
        },
        success: function(response) {
          if (options.success != null) {
            return options.success(response);
          }
        }
      });
    },
    get_query_string: function() {
      var m, query_string, regex, result;
      result = {};
      query_string = location.search.slice(1);
      regex = /([^&=]+)=([^&]*)/g;
      m = null;
      while ((m = regex.exec(query_string))) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }
      return result;
    }
  };

  String.prototype.capitalize = function() {
    var array, string;
    array = this.split(" ");
    string = "";
    _.each(array, function(piece) {
      return string += piece.charAt(0).toUpperCase() + piece.slice(1) + " ";
    });
    return string.trim();
  };

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.urlRoot = Plaza.settings.api + "models";

    Model.prototype.idAttribute = "_id";

    Model.prototype.save = function(data, options, local_only) {
      var e;
      if (options == null) {
        options = {};
      }
      if (local_only == null) {
        local_only = false;
      }
      if (this.local_storage != null) {
        this.set(data);
        try {
          localStorage.setItem(this.local_storage, JSON.stringify(this.toJSON()));
        } catch (_error) {
          e = _error;
          console.log("Warning: localStorage is disabled");
        }
      }
      if (local_only) {
        if (options.success != null) {
          return options.success(this, this.toJSON());
        }
      } else {
        return Model.__super__.save.call(this, data, this.set_secret_header(options));
      }
    };

    Model.prototype.fetch = function(options) {
      if (options == null) {
        options = {};
      }
      if ((this.local_storage != null) && (localStorage.getItem(this.local_storage) != null)) {
        this.set(this.parse(JSON.parse(localStorage.getItem(this.local_storage))));
      }
      if (this.id != null) {
        return Model.__super__.fetch.call(this, this.set_secret_header(options));
      }
    };

    Model.prototype.destroy = function(options) {
      if (options == null) {
        options = {};
      }
      if (this.local_storage != null) {
        localStorage.removeItem(this.local_storage);
      }
      return Model.__super__.destroy.call(this, this.set_secret_header(options));
    };

    Model.prototype.clear = function() {
      if (this.local_storage != null) {
        localStorage.removeItem(this.local_storage);
      }
      return Model.__super__.clear.call(this);
    };

    Model.prototype.set_secret_header = function(options) {
      if (options.headers == null) {
        options.headers = {};
      }
      options.headers['Accept'] = 'application/json';
      options.headers["X-Session-Id"] = Plaza.cookies.get("Session-Id");
      options.headers['X-Session-Secret'] = Plaza.cookies.get("Session-Secret");
      return options;
    };

    return Model;

  })(Backbone.Model);

}).call(this);

(function() {
  Handlebars.registerHelper('first', function(models, options) {
    if ((models != null) && (models[0] != null)) {
      return options.fn(models[0]);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('last', function(models, options) {
    if ((models != null) && (models[models.length - 1] != null)) {
      return options.fn(models[models.length - 1]);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('get', function(model, key) {
    if ((model != null) && (model[key] != null)) {
      return model[key];
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_get', function(model, key, options) {
    if ((model[key] != null) && model[key]) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('unless_get', function(model, key, options) {
    if ((model[key] != null) && model[key]) {
      return null;
    } else {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('if_equal', function(left, right, options) {
    if (left === right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_lower', function(left, right, options) {
    if (left < right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_higher', function(left, right, options) {
    if (left > right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_get_equal', function(model, key, right, options) {
    if ((model[key] != null) && model[key] === right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('unless_equal', function(left, right, options) {
    if (left !== right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_in_array', function(array, right, options) {
    if ((array != null) && _.contains(array, right)) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('date', function(date) {
    date = new Date(date);
    return date.toLocaleDateString();
  });

  Handlebars.registerHelper('if_dates_equal', function(left, right, options) {
    left = new Date(left);
    right = new Date(right);
    if (left.toLocaleDateString() === right.toLocaleDateString()) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('json', function(json) {
    return JSON.stringify(JSON.parse(json), void 0, 2);
  });

  Handlebars.registerHelper('address', function(address) {
    var address_text;
    address_text = "";
    if (address != null) {
      if (address.name != null) {
        address.first_name = address.name;
        address.last_name = "";
      }
      address_text += address.first_name + " " + address.last_name + "<br>" + address.street;
      if ((address.street_continued != null) && address.street_continued !== "") {
        address_text += address.street_continued;
      }
      address_text += " " + address.city + ", " + address.region + ", " + address.country + " " + address.zip;
    }
    return address_text;
  });

  Handlebars.registerHelper('percentage', function(value) {
    return (value * 100) + "%";
  });

  Handlebars.registerHelper('ms', function(value) {
    return (parseFloat(value)).toFixed(3) + "ms";
  });

  Handlebars.registerHelper('plus', function(left, right) {
    return left + right;
  });

  Handlebars.registerHelper('minus', function(left, right) {
    return left - right;
  });

  Handlebars.registerHelper('times', function(value, times) {
    return value * times;
  });

  Handlebars.registerHelper('divide', function(left, right) {
    return left / right;
  });

  Handlebars.registerHelper('encode_uri', function(url) {
    return encodeURIComponent(url);
  });

  Handlebars.registerHelper('first_letter', function(string) {
    if (string != null) {
      return string[0].toUpperCase();
    }
  });

  Handlebars.registerHelper('first_word', function(string) {
    if (string != null) {
      return string.split(" ")[0];
    }
  });

  Handlebars.registerHelper('name_from_email', function(email) {
    if (email != null) {
      return email.split("@")[0];
    }
  });

  Handlebars.registerHelper('first_name_from_name', function(name) {
    if (name != null) {
      return name.split(" ")[0];
    }
  });

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.View = (function(superClass) {
    extend(View, superClass);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.template = null;

    View.prototype.templates = null;

    View.prototype.data = {};

    View.prototype.events = {};

    View.prototype.initialize = function() {
      if (Plaza.session != null) {
        this.listenTo(Plaza.session, "sync", this.render);
      }
      if (Plaza.user != null) {
        this.listenTo(Plaza.user, "sync", this.render);
      }
      _.extend(this.data, {
        pieces: window.pieces
      });
      return this.render();
    };

    View.prototype.render = function() {
      var html;
      _.extend(this.data, Plaza.session != null ? {
        session: Plaza.session.toJSON()
      } : void 0, Plaza.user != null ? {
        user: Plaza.user.toJSON()
      } : void 0, Plaza.session != null ? {
        is_authenticated: Plaza.session.has("user_id")
      } : void 0, Plaza.user != null ? {
        is_admin: Plaza.user.get("is_admin")
      } : void 0);
      if (this.templates != null) {
        html = "";
        _.each(this.templates, (function(_this) {
          return function(template) {
            return html += template(_this.data);
          };
        })(this));
        this.$el.html(html);
      } else {
        if (this.template != null) {
          this.$el.html(this.template(this.data));
        }
      }
      View.__super__.render.call(this);
      $(document.links).filter(function() {
        return this.hostname !== window.location.hostname;
      }).attr('target', '_blank');
      this.delegateEvents();
      return this;
    };

    return View;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.urlRoot = Plaza.settings.api + "lists";

    return List;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.ListPost = (function(superClass) {
    extend(ListPost, superClass);

    function ListPost() {
      return ListPost.__super__.constructor.apply(this, arguments);
    }

    return ListPost;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.Piece = (function(superClass) {
    extend(Piece, superClass);

    function Piece() {
      return Piece.__super__.constructor.apply(this, arguments);
    }

    Piece.prototype.urlRoot = Plaza.settings.api + "pieces";

    return Piece;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.Survey = (function(superClass) {
    extend(Survey, superClass);

    function Survey() {
      return Survey.__super__.constructor.apply(this, arguments);
    }

    Survey.prototype.urlRoot = Plaza.settings.api + "surveys";

    return Survey;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.SurveyAnswer = (function(superClass) {
    extend(SurveyAnswer, superClass);

    function SurveyAnswer() {
      return SurveyAnswer.__super__.constructor.apply(this, arguments);
    }

    return SurveyAnswer;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.Session = (function(superClass) {
    extend(Session, superClass);

    function Session() {
      return Session.__super__.constructor.apply(this, arguments);
    }

    Session.prototype.urlRoot = Plaza.settings.api + "sessions";

    Session.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      return this.set({
        _id: Plaza.cookies.get("Session-Id"),
        secret: Plaza.cookies.get("Session-Secret"),
        user_id: Plaza.cookies.get("User-Id")
      });
    };

    Session.prototype.login = function(data, options) {
      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      return Plaza.session.save(data, {
        success: function(model, response) {
          Plaza.cookies.set("Session-Id", response._id);
          Plaza.cookies.set("Session-Secret", response.secret);
          Plaza.cookies.set("User-Id", response.user_id);
          return Plaza.user.initialize();
        }
      });
    };

    Session.prototype.logout = function() {
      this.clear();
      Plaza.user.clear();
      Plaza.cookies["delete"]("Session-Id");
      Plaza.cookies["delete"]("Session-Secret");
      Plaza.cookies["delete"]("User-Id");
      return window.location = window.location.pathname;
    };

    Session.prototype.is_authenticated = function() {
      return Plaza.cookies.get("User-Id") != null;
    };

    return Session;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Models.User = (function(superClass) {
    extend(User, superClass);

    function User() {
      return User.__super__.constructor.apply(this, arguments);
    }

    User.prototype.urlRoot = Plaza.settings.api + "users";

    User.prototype.initialize = function(options) {
      var user_id;
      if (options == null) {
        options = {};
      }
      user_id = Plaza.cookies.get("User-Id");
      if (user_id != null) {
        this.set({
          _id: user_id
        });
        return this.fetch();
      }
    };

    return User;

  })(Plaza.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.Editable = (function(superClass) {
    extend(Editable, superClass);

    function Editable() {
      return Editable.__super__.constructor.apply(this, arguments);
    }

    Editable.prototype.edit_admin_template = templates["admin/edit_admin"];

    Editable.prototype.initialize = function() {
      this.events["click .js-save_edit"] = "save_edit";
      this.events["click .js-destroy"] = "destroy";
      this.listenTo(this.model, "sync", this.render);
      this.model.fetch();
      return Editable.__super__.initialize.call(this);
    };

    Editable.prototype.render = function() {
      _.extend(this.data, {
        model: this.model.toJSON()
      });
      Editable.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-admin]").html(this.edit_admin_template(this.data));
        this.$el.find(".admin_only").removeClass("admin_only");
        this.delegateEvents();
      }
      return this;
    };

    Editable.prototype.save_edit = function(e) {
      return this.model.save();
    };

    Editable.prototype.destroy = function() {
      if (confirm("Are you sure?")) {
        return this.model.destroy({
          success: (function(_this) {
            return function(model, response) {
              Turbolinks.visit("/");
              return $(document).on("turbolinks:load", function() {
                $(document).off("turbolinks:load");
                Plaza.render_views();
                return Plaza.router.navigate(_this.list_route, {
                  trigger: true
                });
              });
            };
          })(this)
        });
      }
    };

    return Editable;

  })(Plaza.View);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.Admin = (function(superClass) {
    extend(Admin, superClass);

    function Admin() {
      this.check_escape = bind(this.check_escape, this);
      return Admin.__super__.constructor.apply(this, arguments);
    }

    Admin.prototype.el = $("#admin");

    Admin.prototype.template = templates["admin/admin"];

    Admin.prototype.events = {
      "submit .js-submit_login": "submit_login",
      "click .js-show_new_post": "show_new_post",
      "submit .js-new_post_form": "submit_new_post_form",
      "click .js-logout": "logout"
    };

    Admin.prototype.initialize = function() {
      $(document).on("keyup", this.check_escape);
      return Admin.__super__.initialize.call(this);
    };

    Admin.prototype.render = function() {
      return Admin.__super__.render.call(this);
    };

    Admin.prototype.submit_login = function(e) {
      e.preventDefault();
      return Plaza.session.login({
        email: e.currentTarget["email"].value,
        password: e.currentTarget["password"].value
      });
    };

    Admin.prototype.logout = function(e) {
      e.preventDefault();
      return Plaza.session.logout();
    };

    Admin.prototype.show_new_post = function(e) {
      this.$el.find(".js-show_new_post").addClass("hide");
      return this.$el.find(".js-new_post_form").removeClass("hide");
    };

    Admin.prototype.submit_new_post_form = function(e) {
      var model;
      e.preventDefault();
      model = new Plaza.Models.ListPost();
      model.urlRoot = Plaza.settings.api + "lists/" + window.list_id + "/posts";
      return model.save({
        title: e.currentTarget["title"].value.trim(),
        route: e.currentTarget["route"].value.trim().toLowerCase()
      }, {
        success: function(model, response) {
          return window.location = "/lists/blog/posts/" + model.attributes.route;
        }
      });
    };

    Admin.prototype.check_escape = function(e) {
      var login_box;
      if (e.keyCode === 27) {
        login_box = this.$el.find(".js-login_box");
        if (login_box.hasClass("hide")) {
          login_box.removeClass("hide");
          return login_box.find("[name='email']").focus();
        } else {
          login_box.addClass("hide");
          if (Plaza.session.is_authenticated()) {
            return Plaza.session.logout();
          }
        }
      }
    };

    return Admin;

  })(Plaza.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.list_admin_template = templates["admin/list_admin"];

    List.prototype.events = {
      "click [data-new]": "new"
    };

    List.prototype.initialize = function() {
      return List.__super__.initialize.call(this);
    };

    List.prototype.render = function() {
      List.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-list-admin]").html(this.list_admin_template(this.data));
        this.delegateEvents();
      }
      return this;
    };

    List.prototype["new"] = function(e) {
      var list_route, model, type;
      type = e.currentTarget.getAttribute("data-new");
      model = new Plaza.Models.ListPost();
      model.urlRoot = Plaza.settings.api + "lists/" + this.el.getAttribute("data-list-id") + "/posts";
      model.attributes.content = {};
      model.attributes.content["is_" + type] = {
        value: true
      };
      if (type === "product") {
        model.attributes.content["title"] = {
          value: "Nom du produit"
        };
        model.attributes.content["product_description"] = {
          value: "Description du produit"
        };
        model.attributes.content["product_price"] = {
          value: 10.0
        };
        model.attributes.content["product_photo"] = {
          value: ""
        };
      } else if (type === "photo") {
        model.attributes.content["title"] = {
          value: "Nom de la photo"
        };
        model.attributes.content["photo"] = {
          value: ""
        };
      } else if (type === "video") {
        model.attributes.content["title"] = {
          value: "Nom du vidéo"
        };
        model.attributes.content["video_embed_id"] = {
          value: "MNqYeNahqK8"
        };
      }
      list_route = this.el.getAttribute("data-list");
      return model.save({
        title: "Nom de l'objet",
        is_online: true
      }, {
        success: function(model, response) {
          console.log(response);
          Turbolinks.visit("/");
          return $(document).on("turbolinks:load", function() {
            $(document).off("turbolinks:load");
            Plaza.render_views();
            return Plaza.router.navigate(list_route + "/" + response._id, {
              trigger: true
            });
          });
        }
      });
    };

    return List;

  })(Plaza.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.Parallax = (function(superClass) {
    extend(Parallax, superClass);

    function Parallax() {
      return Parallax.__super__.constructor.apply(this, arguments);
    }

    Parallax.prototype.events = {};

    Parallax.prototype.initialize = function() {
      return this.render();
    };

    Parallax.prototype.render = function() {
      var layers, translate;
      layers = this.$el.find(".js-layer");
      translate = function() {
        var i, layer, len, results;
        results = [];
        for (i = 0, len = layers.length; i < len; i++) {
          layer = layers[i];
          results.push(layer.style.transform = "translate3d(0, " + (window.pageYOffset * -layer.getAttribute("data-depth")) + "px, 0)");
        }
        return results;
      };
      $(window).scroll(function() {
        return window.requestAnimationFrame(translate);
      });
      return this;
    };

    return Parallax;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.Piece = (function(superClass) {
    extend(Piece, superClass);

    function Piece() {
      return Piece.__super__.constructor.apply(this, arguments);
    }

    Piece.prototype.piece_admin_template = templates["admin/piece_admin"];

    Piece.prototype.piece_link_template = templates["admin/piece_link"];

    Piece.prototype.piece_file_link_template = templates["admin/piece_file_link"];

    Piece.prototype.events = {
      "click .js-save_piece": "save_piece",
      "input [data-key]": "key_input",
      "click [data-key]": "prevent_click",
      "click [data-image-key]": "trigger_image_upload",
      "click [data-file-key]": "trigger_file_upload",
      "change .js-image_input": "upload_image",
      "change .js-file_input": "upload_file"
    };

    Piece.prototype.initialize = function() {
      this.listenTo(this.model, "sync", this.render);
      this.model.fetch();
      return Piece.__super__.initialize.call(this);
    };

    Piece.prototype.render = function() {
      Piece.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-key]").attr("contenteditable", "true");
        this.$el.find("[data-link-key]").each((function(_this) {
          return function(index, link) {
            $(link).before(_this.piece_link_template({
              key: link.getAttribute("data-link-key"),
              link: link.getAttribute("href")
            }));
            return link.removeAttribute("data-link-key");
          };
        })(this));
        this.$el.find("[data-file-link-key]").each((function(_this) {
          return function(index, link) {
            $(link).before(_this.piece_file_link_template({
              key: link.getAttribute("data-file-link-key"),
              url: link.getAttribute("href")
            }));
            return link.removeAttribute("data-file-link-key");
          };
        })(this));
        this.$el.find("[data-image-key]").each((function(_this) {
          return function(index, image) {
            return $(image).addClass("img--clickable");
          };
        })(this));
        this.$el.find("[data-piece-admin]").html(this.piece_admin_template(this.data));
        this.button = this.$el.find(".js-save_piece")[0];
      }
      return this;
    };

    Piece.prototype.save_piece = function(e) {
      e.preventDefault();
      if (Plaza.settings.lang != null) {
        this.$el.find("[data-key]").each((function(_this) {
          return function(index, key) {
            if (_this.model.attributes.content[key.getAttribute("data-key")].translations == null) {
              _this.model.attributes.content[key.getAttribute("data-key")].translations = {};
            }
            return _this.model.attributes.content[key.getAttribute("data-key")].translations[Plaza.settings.lang] = key.innerHTML;
          };
        })(this));
        this.$el.find("[data-image-key]").each((function(_this) {
          return function(index, key) {
            if (_this.model.attributes.content[key.getAttribute("data-image-key")].translations == null) {
              _this.model.attributes.content[key.getAttribute("data-image-key")].translations = {};
            }
            return _this.model.attributes.content[key.getAttribute("data-image-key")].translations[Plaza.settings.lang] = key.getAttribute("src");
          };
        })(this));
        this.$el.find("[data-file-key]").each((function(_this) {
          return function(index, key) {
            if (_this.model.attributes.content[key.getAttribute("data-file-key")].translations == null) {
              _this.model.attributes.content[key.getAttribute("data-file-key")].translations = {};
            }
            return _this.model.attributes.content[key.getAttribute("data-file-key")].translations[Plaza.settings.lang] = key.innerText;
          };
        })(this));
      } else {
        this.$el.find("[data-key]").each((function(_this) {
          return function(index, key) {
            return _this.model.attributes.content[key.getAttribute("data-key")].value = key.innerHTML;
          };
        })(this));
        this.$el.find("[data-image-key]").each((function(_this) {
          return function(index, key) {
            return _this.model.attributes.content[key.getAttribute("data-image-key")].value = key.getAttribute("src");
          };
        })(this));
        this.$el.find("[data-file-key]").each((function(_this) {
          return function(index, key) {
            return _this.model.attributes.content[key.getAttribute("data-file-key")].value = key.innerText;
          };
        })(this));
      }
      return this.model.save();
    };

    Piece.prototype.key_input = function(e) {
      if (this.button.hasAttribute("disabled")) {
        return this.button.removeAttribute("disabled");
      }
    };

    Piece.prototype.trigger_image_upload = function(e) {
      var input;
      input = this.$el.find(".js-image_input");
      this.image_key = e.currentTarget.getAttribute("data-image-key");
      return input.click();
    };

    Piece.prototype.upload_image = function(e) {
      var file;
      file = e.currentTarget.files[0];
      if (file.type.match('image.*')) {
        return Plaza.helpers.upload(file, {
          success: (function(_this) {
            return function(response) {
              _this.$el.find("[data-image-key='" + _this.image_key + "']").attr("src", Plaza.settings.cdn + response.url);
              return _this.key_input();
            };
          })(this)
        });
      }
    };

    Piece.prototype.trigger_file_upload = function(e) {
      var input;
      input = this.$el.find(".js-file_input");
      this.file_key = e.currentTarget.getAttribute("data-file-key");
      return input.click();
    };

    Piece.prototype.upload_file = function(e) {
      var file;
      file = e.currentTarget.files[0];
      return Plaza.helpers.upload(file, {
        success: (function(_this) {
          return function(response) {
            var file_key;
            file_key = _this.$el.find("[data-file-key='" + _this.file_key + "']");
            file_key.text(Plaza.settings.cdn + response.url);
            return _this.key_input();
          };
        })(this)
      });
    };

    Piece.prototype.prevent_click = function(e) {
      if (this.data.is_authenticated) {
        return e.preventDefault();
      }
    };

    return Piece;

  })(Plaza.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.Post = (function(superClass) {
    extend(Post, superClass);

    function Post() {
      return Post.__super__.constructor.apply(this, arguments);
    }

    Post.prototype.events = {
      "click [data-content-image-key]": "trigger_upload",
      "change [data-image-input]": "upload_image",
      "click [data-remove-option]": "remove_option",
      "click [data-add-option]": "add_option"
    };

    Post.prototype.initialize = function() {
      this.list_route = this.el.getAttribute("data-list-route");
      return Post.__super__.initialize.call(this);
    };

    Post.prototype.render = function() {
      Post.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-title]").attr("contenteditable", "true");
        this.$el.find("[data-content-key]").attr("contenteditable", "true");
        this.$el.find("[data-content-image-key]").each((function(_this) {
          return function(index, image) {
            return $(image).addClass("img--clickable");
          };
        })(this));
        this.$el.find("[data-option]").attr("contenteditable", "true");
        this.delegateEvents();
      }
      return this;
    };

    Post.prototype.save_edit = function(e) {
      var options;
      if (Plaza.settings.lang != null) {
        this.$el.find("[data-content-key]").each((function(_this) {
          return function(index, content) {
            if (_this.model.attributes.content[content.getAttribute("data-content-key")].translations == null) {
              _this.model.attributes.content[content.getAttribute("data-content-key")].translations = {};
            }
            return _this.model.attributes.content[content.getAttribute("data-content-key")].translations[Plaza.settings.lang] = content.innerHTML;
          };
        })(this));
        this.$el.find("[data-content-image-key]").each((function(_this) {
          return function(index, image) {
            if (_this.model.attributes.content[content.getAttribute("data-content-image-key")].translations == null) {
              _this.model.attributes.content[image.getAttribute("data-content-image-key")].translations = {};
            }
            return _this.model.attributes.content[image.getAttribute("data-content-image-key")].translations[Plaza.settings.lang] = image.getAttribute("src");
          };
        })(this));
      } else {
        this.$el.find("[data-content-key]").each((function(_this) {
          return function(index, content) {
            return _this.model.attributes.content[content.getAttribute("data-content-key")] = {
              value: content.innerHTML
            };
          };
        })(this));
        this.$el.find("[data-content-image-key]").each((function(_this) {
          return function(index, image) {
            return _this.model.attributes.content[image.getAttribute("data-content-image-key")] = {
              value: image.getAttribute("src")
            };
          };
        })(this));
      }
      options = this.$el.find("[data-option]");
      if (options.length > 0) {
        this.model.attributes.content.product_options = {
          value: []
        };
        options.each((function(_this) {
          return function(index, option) {
            return _this.model.attributes.content.product_options.value.push(option.innerHTML);
          };
        })(this));
      }
      return Post.__super__.save_edit.call(this);
    };

    Post.prototype.remove_option = function(e) {
      return $(e.currentTarget).parent().parent().remove();
    };

    Post.prototype.add_option = function(e) {
      return $(e.currentTarget).before("<div><input type='radio' name='options' id='" + this.model.id + "_new' value='new'> <label for='" + this.model.id + "_new'><span data-option contenteditable>Nouvelle option</span> <button class='button--transparent small' data-remove-option>(Supprimer)</button></label></div>");
    };

    Post.prototype.trigger_upload = function(e) {
      this.image = $(e.currentTarget);
      return this.$el.find("[data-image-input]").click();
    };

    Post.prototype.upload_image = function(e) {
      var file;
      file = e.currentTarget.files[0];
      if (file.type.match('image.*')) {
        return Plaza.helpers.upload(file, {
          success: (function(_this) {
            return function(response) {
              return _this.image.attr("src", Plaza.settings.cdn + response.url);
            };
          })(this)
        });
      }
    };

    return Post;

  })(Plaza.Views.Editable);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Views.Survey = (function(superClass) {
    extend(Survey, superClass);

    function Survey() {
      return Survey.__super__.constructor.apply(this, arguments);
    }

    Survey.prototype.el = $(".js-survey");

    Survey.prototype.events = {
      "focus .js-input": "focus_input",
      "submit .js-form": "submit_form",
      "click .js-reset": "reset"
    };

    Survey.prototype.initialize = function() {
      this.answers = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: pieces.survey.answers
      });
      this.survey = new Plaza.Models.Survey({
        "_id": "56b60e72f5f9e96ffb235c64"
      });
      this.survey.fetch();
      return this.listenTo(this.survey, "sync", this.render);
    };

    Survey.prototype.render = function() {
      var answers, count, highest_count, key, second_answers;
      if (localStorage.getItem("survey_answer") != null) {
        answers = this.survey.get("questions")[0]["answers"];
        second_answers = this.survey.get("questions")[1]["answers"];
        highest_count = 0;
        for (key in answers) {
          count = answers[key];
          if (second_answers[key] != null) {
            answers[key] = answers[key] + second_answers[key];
            delete second_answers[key];
          }
        }
        for (key in second_answers) {
          count = second_answers[key];
          answers[key] = second_answers[key];
        }
        for (key in answers) {
          count = answers[key];
          if (answers[key] > highest_count) {
            highest_count = answers[key];
          }
        }
        this.$el.find(".js-answers").html(templates["answers"]({
          answers: answers,
          highest_count: highest_count
        }));
        this.$el.find(".js-results").removeClass("hide");
        setTimeout((function(_this) {
          return function() {
            return _this.$el.find(".js-results").removeClass("fade_out");
          };
        })(this), 1);
      } else {
        $("body").removeClass("white_back");
        this.$el.find(".js-questions").removeClass("hide");
        this.$el.find(".js-typeahead").typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        }, {
          source: this.answers,
          name: "answers",
          templates: {
            suggestion: templates["answer"]
          }
        });
        setTimeout((function(_this) {
          return function() {
            _this.$el.find(".js-questions").removeClass("fade_out");
            return _this.$el.find(".js-question")[1].focus();
          };
        })(this), 1);
      }
      return this;
    };

    Survey.prototype.focus_input = function(e) {
      this.$el.find(".js-input").addClass("input_box--faded");
      $(e.currentTarget).removeClass("input_box--faded");
      return $(e.currentTarget).removeClass("input_box--hidden");
    };

    Survey.prototype.submit_form = function(e) {
      var answers, form, i, len, question, ref;
      e.preventDefault();
      form = e.currentTarget;
      answers = [];
      ref = this.survey.get("questions");
      for (i = 0, len = ref.length; i < len; i++) {
        question = ref[i];
        if (form[question["key"]] != null) {
          if (form[question["key"]].value === "") {
            $(form[question["key"]]).focus();
            return false;
          }
          answers.push({
            question_key: question["key"],
            value: form[question["key"]].value.capitalize()
          });
        }
      }
      this.survey_answer = new Plaza.Models.SurveyAnswer();
      this.survey_answer.local_storage = "survey_answer";
      this.survey_answer.urlRoot = Plaza.settings.api + "surveys/" + this.survey.id + "/answers";
      return this.survey_answer.save({
        answers: answers
      }, {
        success: (function(_this) {
          return function(model, response) {
            _this.$el.find(".js-questions").addClass("fade_out");
            return setTimeout(function() {
              _this.$el.find(".js-questions").addClass("hide");
              return _this.survey.fetch();
            }, 666);
          };
        })(this)
      });
    };

    Survey.prototype.reset = function(e) {
      e.preventDefault();
      this.$el.find(".js-results").addClass("fade_out");
      this.$el.find(".js-form")[0].reset();
      this.$el.find(".js-typeahead").typeahead("destroy");
      localStorage.removeItem("survey_answer");
      return setTimeout((function(_this) {
        return function() {
          return _this.render();
        };
      })(this), 666);
    };

    return Survey;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Plaza.Routers.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      "dev": "dev",
      "index": "index",
      "(:path)(/)(:post)(/)": "path"
    };

    Router.prototype.views = [];

    Router.prototype.initialize = function() {};

    Router.prototype.execute = function(callback, args) {
      var i, len, ref, view;
      ref = this.views;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.destroy();
      }
      delete this.views;
      this.views = [];
      if (callback != null) {
        return callback.apply(this, args);
      }
    };

    Router.prototype.index = function() {
      $("[data-list]").removeClass("overlay--show");
      $("[data-post]").removeClass("overlay--show");
      $("[data-success]").removeClass("overlay--show");
      return setTimeout(function() {
        return $("[data-video-id]").removeAttr("src");
      }, 666);
    };

    Router.prototype.path = function(path, post) {
      var video;
      $("[data-list='" + path + "']").addClass("overlay--show");
      $("[data-success]").removeClass("overlay--show");
      if (post != null) {
        $("[data-post='" + post + "']").addClass("overlay--show");
        video = $("[data-post='" + post + "'] [data-video-id]");
        return setTimeout(function() {
          if (video.length > 0) {
            return video.attr("src", "https://www.youtube.com/embed/" + video.attr("data-video-id"));
          }
        }, 666);
      } else {
        $("[data-post]").removeClass("overlay--show");
        return setTimeout(function() {
          return $("[data-video-id]").removeAttr("src");
        }, 666);
      }
    };

    return Router;

  })(Backbone.Router);

}).call(this);
