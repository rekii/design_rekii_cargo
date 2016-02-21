/**
 * Europa
 */

var Design = {
	data: {
		indexScroll: 0
	},

	// First load
	init: function() {
		Design.viewport();
		Design.paginate();
		Design.solo.init();

		$window = $(window);
		$body = $("body");

		$window.on("scroll", function(e) {
			// If we're on the index
			if ($body.attr("data-view") == "index") {
				Design.data.indexScroll = $window.scrollTop();
			}
		});

		// Fix the loading animations
		Cargo.Core.ReplaceLoadingAnims.init();

		// Do not scroll to top on index show
		Cargo.Model.DisplayOptions.attributes.disable_project_scroll = true;
	},

	keybindings: function() {
		// Remove previous bindings
		Cargo.Core.KeyboardShortcut.Remove("Left");
		Cargo.Core.KeyboardShortcut.Remove("Right");

		Cargo.Core.KeyboardShortcut.Add("Left", 37, function() {
			Action.Project.Prev();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("Right", 39, function() {
			Action.Project.Next();
			return false;
		});
	},

	resizeSlideshow: function(el, obj, state) {
		if (state == "resize") {
			el.find("> *").css({
				"-webkit-transition": "width 0s ease, height 0s ease",
				"-moz-transition": "width 0s ease, height 0s ease",
				"transition": "width 0s ease, height 0s ease"
			});
		} else {
			el.find("> *").css({
				"-webkit-transition": "width " + obj.options.transition_duration + "s ease, height " + obj.options.transition_duration + "s ease",
				"-moz-transition": "width " + obj.options.transition_duration + "s ease, height " + obj.options.transition_duration + "s ease",
				"transition": "width " + obj.options.transition_duration + "s ease, height " + obj.options.transition_duration + "s ease"
			});
		}

		// Resize and position the containing element
		obj.resizeContainer();
		if (Cargo.Plugins) {
			if (Cargo.Plugins.hasOwnProperty("elementResizer")) {
				Cargo.Plugins.elementResizer.refresh();
			}
		}
	},

	paginate: function() {
		$(".thumbnail[data-formatted!='true']").each(function() {
			Design.formatThumbnail($(this));
		});
	},

	formatThumbnail: function($thumb) {
		// Default thumb
		if ($thumb.find(".thumb_image img").attr("src") == "/_gfx/thumb_custom.gif") {
			$thumb.find(".thumb_image").addClass("default_thumb");
		}

		$thumb.attr("data-formatted", "true");
	},

	viewport: function() {
		if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
			$("[name='viewport']").attr("content", "width=device-width, initial-scale=0.3, user-scalable=no");
		} else if (navigator.userAgent.match(/iPad/i)) {
			$("[name='viewport']").attr("content", "width=device-width, initial-scale=1, user-scalable=no");
		}
	},

	mobileIcons: function() {
		if (navigator.userAgent.match(/i(Phone|Pod|Pad)/i)) {
			$(".project_nav").addClass("mobile_format");
		}
	},

	project: {
		init: function() {
			// Top
			$(window).scrollTop(0);

			// Mark as project
			$("body").attr("data-view", "project");

			// Move the fullscreen button
			$("#fullscreen").appendTo(".entry");

			setTimeout(function() {
			    $(window).trigger("resize");
			}, 1);

			Design.keybindings();
		}
	},

	page: {
		init: function() {
			$("body").attr("data-view", "page");
			$("html, body").scrollTop(0);
		}
	},

	index: {
		init: function() {
			// Mark as index
			$("body").attr("data-view", "index");

			// Turn off navigation
			Design.keybindings();

			// scroll to prev position
			$(window).scrollTop(Design.data.indexScroll);
		},
	},

	solo: {
		init: function() {
			$(document).ready(function() {
				if (Cargo.Helper.IsSololink()) {
					$(".project_nav").hide();
				}
			});
		}
	}

};

/**
 * Events
 */

$(function() {
	Design.init();
});

Cargo.Event.on("pagination_complete project_collection_reset", function(new_page) {
	Design.paginate();
});

Cargo.Event.on("show_index_complete", function(new_page) {
	Design.index.init();
});

Cargo.Event.on("project_load_complete", function(pid) {
	(Cargo.Helper.GetCurrentPageType() == "project" ? Design.project.init() : Design.page.init())
	Design.mobileIcons();
});

Cargo.Event.on("project_close_complete", function(pid) {
	Design.index.init();
});

Cargo.Event.on("pagination_start", function() {
	setTimeout(function() {
		$("body > .retinaSpinner").hide();
	}, 1);
});

Cargo.Event.on("pagination_complete", function() {
	$("body > .retinaSpinner").css("display", "");
});

Cargo.Event.on("fullscreen_destroy_hotkeys", function() {
    Design.keybindings();
});

/* Some non-api events merged into an object for less clutter */
$.each({
	slideshow_resize: function(el, obj) {
		Design.resizeSlideshow(el, obj, "resize");
	},
	slideshow_transition_start: function(el, obj) {
		Design.resizeSlideshow(el, obj);
	},
	element_resizer_init: function(plugin) {
		plugin.setOptions({
			adjustElementsToWindowHeight: Cargo.Model.DisplayOptions.attributes.image_scale_vertical
		});
	},
	fullscreen_destroy_hotkeys: function() {
		Design.keybindings();
	}
}, function(event, callback) {
	Cargo.Event.on(event, callback);
});
