define('controller/base', [
	'backbone',
	'app'
], function(
	Backbone,
	app
) {
	return Backbone.View.extend({
		models : null,
		collections : null,

		initialize : function(options) {
			this.models = options.models || {};
			this.collections = options.collections || {};
		},

		getCollection : function(name) {
			return this.collections[name];
		},

		/**
		 * Returns component manager context.
		 *
		 * @param {String} sub_context
		 * @return {Object}
		 */
		getContext : function(sub_context) {
			if (sub_context) {
				return {
					main : this.getMainContext(),
					sub : sub_context
				};
			}
			else {
				return this.cm_context;
			}
		},

		/**
		 * Returns name of the main context
		 *
		 * @return {String}
		 */
		getMainContext : function() {
			return this.cm_context.main;
		},

		/**
		 * Returns name of the sub context
		 *
		 * @return {String}
		 */
		getSubContext : function() {
			return this.cm_context.sub;
		},

		/**
		 * Registers event listener 'binded' directly with controller, so can be removed when its destroyed.
		 *
		 * @param {String} event_name   @see definitions/events
		 * @param {Function} callback
		 */
		observeEvent : function(event_name, callback) {
			app.observer(event_name).subscribe([this.getMainContext(), this.getSubContext()], callback);
		},

		/**
		 * Unregisters event listener 'binded' directly to controller
		 *
		 * @param {String} event_name   @see GameEvents
		 */
		stopObservingEvent : function(event_name) {
			app.observer(event_name).unsubscribe([this.getMainContext(), this.getSubContext()]);
		},

		/**
		 * Unregisters event listeners
		 */
		stopObservingEvents : function() {
			app.observer().unsubscribe([this.getMainContext(), this.getSubContext()]);
		},

		/**
		 * Triggers event defined in events.js
		 *
		 * @param {String} event_name   @see GameEvents
		 * @param {Object} data
		 */
		publishEvent : function(event_name, data) {
			data = typeof data !== 'undefined' ? data : {};

			app.observer(event_name).publish(data);
		},

		_destroy : function() {
			this.stopListening();

			//Unsubscribe all observed events
			this.stopObservingEvents();

			this.destroy();
		}
	});
});