define('gridlib/screen_coordinate', [], function() {
	'use strict';

	var ScreenCoordinate = function(x, y) {
		this.x = x;
		this.y = y;
	};

	ScreenCoordinate.prototype = {
		equals : function(p) {
			return this.x == p.x && this.y == p.y;
		},
		toString : function() {
			return this.x + "," + this.y;
		},
		length_squared : function() {
			return this.x * this.x + this.y * this.y;
		},
		length : function() {
			return Math.sqrt(this.length_squared());
		},
		normalize : function() {
			var d = this.length();

			return new ScreenCoordinate(this.x / d, this.y / d);
		},
		scale : function(d) {
			return new ScreenCoordinate(this.x * d, this.y * d);
		},
		rotateLeft : function() {
			return new ScreenCoordinate(this.y, -this.x);
		},
		rotateRight : function() {
			return new ScreenCoordinate(-this.y, this.x);
		},
		add : function(p) {
			return new ScreenCoordinate(this.x + p.x, this.y + p.y);
		},
		subtract : function(p) {
			return new ScreenCoordinate(this.x - p.x, this.y - p.y);
		},
		dot : function(p) {
			return this.x * p.x + this.y * p.y;
		},
		cross : function(p) {
			return this.x * p.y - this.y * p.x;
		},
		distance : function(p) {
			return this.subtract(p).length();
		}
	};

	return ScreenCoordinate;
});