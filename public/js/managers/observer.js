define('manager/observer', [
	'jquery',
	'provider/events'
], function(
	$,
	events_definition
) {
	'use strict';

	var $document = $(document);

	function eventHasProperName(event_name) {
		var parts = event_name.split(':'), i, l = parts.length,
			test = events_definition;

		for (i = 0; i < l; i++) {
			if (test[parts[i]]) {
				test = test[parts[i]];
			}
			else {
				return false;
			}
		}

		return true;
	}

	function prepareEventName(eventName, className, methodName) {
		if (eventName === 'all' && !Game.dev) {
			throw 'Listening to all events is only allowed for debugging!';
		}

		if (!eventName && methodName !== 'unsubscribe') {
			throw 'The "eventName" has to be specified for $.Observer(eventName).' + methodName + '()';
		}

		if (typeof eventName !== 'undefined' && !eventHasProperName(eventName)) {
			throw 'The "eventName" you want to use in $.Observer(eventName).' + methodName + '() is not correctly defined! Current event name: (' + eventName + ')';
		}

		if (!eventName && !className) {
			throw 'One of "eventName" or "className" has to be specified for $.Observer(eventName)...' + eventName + ', ' + className + ' , ' + methodName;
		}

		if (methodName !== 'publish' && !className && Game.dev) {
			console.warn('You did not specified className in $.Observer. Are you sure it\'s correct?', methodName);
		}

		//If className is specified, then event name can be empty
		eventName = eventName || '';

		//If className is cm_context, then change it to string
		if (className && className.main) {
			className = 'window_' + className.main;
		}

		var joined_classname = $.isArray(className) ? className.join('.') : className;
		return !className ? eventName : eventName + '.' + joined_classname;
	}

	return function(eventName) {
		return {
			/**
			 * Transmits information to all listeners about action which did happen.
			 *
			 * @param {String|Object} [className]   optionally a class name or array of class names.
			 * @param {Object} data                 data which should be provided to all listeners
			 *
			 * -----------------------------------------------------------------
			 *  Example 1:
			 *
			 *      All subscribers which listens on 'GameEvents.some.event' will
			 *      be notified.
			 *
			 *
			 *      $.Observer(GameEvents.some.event).publish({
			 *          some_data : 123
			 *      });
			 *
			 * -----------------------------------------------------------------
			 *  Example 2:
			 *
			 *      Only subscribers which listens on 'GameEvents.some.event' and
			 *      specified 'some_class' as a class name will be notified.
			 *
			 *
			 *      $.Observer(GameEvents.some.event).publish(['some_class'], {some_data : 123});
			 */
			publish : function(className, data) {
				if (!data) {
					data = className;
					className = '';
				}

				$document.trigger(prepareEventName(eventName, className, 'publish'), data);
			},

			/**
			 * Saves information that some part of the code wants to listen on the specific event
			 *
			 * @param {String|Object} [className]   optional parameter, but highly recommended
			 *     That helps with unregistering events, because you can have 2 listeners with following classes:
			 *     (1) 'class1' (2) 'class1', 'class2' and when you will call $.Observer().unsubscribe('class2');
			 *     only the second listener will be removed. @see also examples from $.Observer().publish() method
			 * @param {Function} callback    a function which will be executed when an event happened
			 *
			 * -----------------------------------------------------------------
			 *  Example 1:
			 *
			 *      Not recommended case. Please use it only if you really understand how it works.
			 *      Listeners registered like this are very hardly recognizable and probably
			 *      never unregistered.
			 *
			 *
			 *      $.Observer(GameEvents.some.event).subscribe(function(e) {});
			 *
			 * -----------------------------------------------------------------
			 *  Example 2:
			 *
			 *      Just properly registered listener
			 *
			 *
			 *      $.Observer(GameEvents.some.event).subscribe('class_1', function(e) {});
			 *
			 * -----------------------------------------------------------------
			 *  Example 3:
			 *
			 *      Listener registered with 2 classes. Sometimes its necessary to unregister/reregister
			 *      some listeners during the window is opened. In that cases its good
			 *      to specify 2 class names, one global (for example 'window_oktoberfest') and one internal
			 *      (for example 'listen_for_beer').
			 *
			 *
			 *      $.Observer(GameEvents.some.event).subscribe(['class_1', 'class_2'], function(e) {});
			 */
			subscribe : function(className, callback) {
				//If className is not defined
				if (!callback) {
					callback = className;
					className = '';
				}

				if (typeof callback !== 'function') {
					throw 'Callback must be a function';
				}

				$document.on(prepareEventName(eventName, className, 'subscribe'), callback);
			},

			/**
			 * Removes listener
			 * -----------------------------------------------------------------
			 *  Example 1:
			 *
			 *      Removes listener using Component Manager context (usually
			 *      listener is also registered with the same context - usually
			 *      becuase there is a possibility to crate class names by hand).
			 *      This way of registering listeners is used with Backbone Windows,
			 *      and makes this process much easier.
			 *
			 *
			 *      $.Observer().unsubscribe(cm_context);
			 *
			 * -----------------------------------------------------------------
			 *  Example 2:
			 *
			 *      Removes all listeners which has class name 'some_class'
			 *
			 *
			 *      $.Observer().unsubscribe('some_class');
			 * -----------------------------------------------------------------
			 *  Example 3:
			 *
			 *      Removes all listeners which has all specified classes
			 *
			 *
			 *      $.Observer().unsubscribe(['class_name', 'class_name_x']);
			 *
			 * -----------------------------------------------------------------
			 * Example 4:
			 *
			 *      Removes only listeners which listen on specific event type
			 *      and contains spcific class name.
			 *
			 *
			 *      $.Observer(GameEvents.document.key.shift.down).unsubscribe('class_name');
			 *
			 * -----------------------------------------------------------------
			 *  Example 5:
			 *
			 *      Removes only listeners which listen on specific event type
			 *      and contains spcific class names.
			 *
			 *
			 *      $.Observer(GameEvents.document.key.shift.down).unsubscribe(['class_name', 'class_name_x']);
			 */
			unsubscribe : function(className) {
				$document.off(prepareEventName(eventName, className, 'unsubscribe'));
			}
		};
	};
});
