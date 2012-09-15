(function(window, undefined) {
	"use strict";
	var $ = window.jQuery;
	var Backbone = window.Backbone;
	
	$(function() {
		
		var Bookmark = Backbone.Model.extend({
			defaults: function() {
				return {
					name: "Projekt",
					order: Bookmarks.nextOrder(),
					link: '/'
				};
			},
			initialize: function() {
				if(!this.get('title')) {
					this.set({'title': this.defaults.title});
				}
			},
			
			clear: function() {
				this.destroy();
			}
		});
		
		var BookmarkList = Backbone.Collection.extend({
			model: Bookmark,
			
			localStorage: new Store('bookmark-backbone'),
			
			nextOrder: function() {
				if(!this.length) { return 1; }
				return this.last().get('order')+1;
			},
			
			comparator: function(bookmark) {
				return bookmark.get('order');
			}
		});
		
		var Bookmarks = new BookmarkList;
		
		
		
		
		
		var BookmarkView = Backbone.View.extend({
			tagName: 'li',
			template: _.template('<a href="<%= link %>"><i class="icon-remove"></i> <i class="icon-pencil"></i> <%= name %></a>'),
			events: {
				'click .icon-remove': 'removeBM',
				'click .icon-pencil': 'editName'
			},
			initialize: function() {
				this.model.bind('change', this.render, this);
				this.model.bind('destroy', this.remove, this);
			},
			render: function() {
				this.$el.html(
					this.template(
						this.model.toJSON()
					)
				);
				return this;
			},
			editName: function() {
				var name = window.prompt('Enter new Name');
				if(name !== null) {
					this.model.save('name', name);
				}
				return false;
			},
			removeBM: function() {
				this.model.destroy();
				return false;
			},
			clear: function() {
				this.model.clear();
			}
		});
		
		
		
		
		
		
		
		
		var AppView = Backbone.View.extend({
			el: $('#bookmarks'),
			
			events: {
				'click .add-bm': 'addBookmark'
			},
			
			initialize: function() {
				this.divider = this.$('.divider');
				
				Bookmarks.bind('add', this.addOne, this);
				Bookmarks.bind('reset', this.addAll, this);
				
				Bookmarks.fetch();
				
			},
			
			addBookmark: function() {
				var name = $('h2').text();
				if(name !== 'root') {
					name = name.split('/');
					name = name[name.length-2];
				}
				
				var around = Bookmarks.reduce(function(memo, bookmark) {
					return memo || bookmark.get('link') === location.href
				}, false);
				
				if(around) {
					alert('Bookmark schon da');
					return false;
				}
				
				Bookmarks.create({
					link: location.href,
					name: name
				});
				return false;
			},
			addOne: function(bookmark) {
				var view = new BookmarkView({model: bookmark});
				var html = view.render().el;
				this.divider.before(html);
			},
			addAll: function() {
				var html = $([]);
				Bookmarks.each(function(bookmark) {
					var view = new BookmarkView({model: bookmark});
					html = html.add(view.render().el);
				});
				
				this.divider.prev().show();
				this.divider.show();
				this.divider.before(html);
			}
		});
		
		new AppView();
	});
}(window));