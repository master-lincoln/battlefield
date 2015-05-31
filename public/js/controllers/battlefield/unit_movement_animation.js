define('controller/battlefield/unit_movement_animation', [
	'controller/base',
	'view/battlefield/unit_movement_animation'
], function(
	BaseController,
	UnitMovementAnimationView
) {
	return BaseController.extend({
		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			this.$d3 = options.$d3;
			this.$root = options.$root;
		},

		initializeView : function() {
			this.view = new UnitMovementAnimationView({
				el : this.$el,
				controller : this
			});
		},

		animate : function(unit, callback) {
			var from = unit.getPreviousPosition(),
				to = unit.getPosition();
			var hex = this.parent_controller.getHex(from.x, from.y, from.z);

			var tile = hex.getTile();
			//console.log(tile);

			//var clone = d3.select(tile[0][0].cloneNode(true));


			var getPath = function(path) {
				var d = [];

				for (var i = 0; i < path.length; i++) {
					d.push(i == 0 ? 'M' : 'L');
					d.push(this.grid.hexToCenter(path[i]));
				}

				return d.join(" ");
			};

			var path = this.parent_controller.getPath(from, to);

			this.$root.append(function() {
				var clone = tile[0][0].cloneNode(true);


				d3.select(clone).classed('animation').append('animateMotion').attr('path', getPath(path)).attr('dur', '3s').attr('repeatCount', 'indefinite');

				return clone;
			});







			//clone

			//console.log(this.parent_controller.getPath(from, to));

			//label.append('tspan').attr('class', "q").text(labels[0] + ', ');

			//<animateMotion path="M 0 0 H 300 Z" dur="3s" repeatCount="indefinite" />


			if (typeof callback === 'function') {
				callback();
			}
		},

		destroy : function() {

		}
	});
});