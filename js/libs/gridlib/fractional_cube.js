define('gridlib/fractional_cube', ['gridlib/cube'], function(Cube) {
	'use strict';

	var FractionalCube = function(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
	};

	FractionalCube.cubeRound = function(h) {
		var rx = Math.round(h.x);
		var ry = Math.round(h.y);
		var rz = Math.round(h.z);
		var x_diff = Math.abs(rx - h.x);
		var y_diff = Math.abs(ry - h.y);
		var z_diff = Math.abs(rz - h.z);

		if (x_diff > y_diff && x_diff > z_diff) {
			rx = -ry - rz;
		} else if(y_diff > z_diff) {
			ry = -rx - rz;
		} else {
			rz = -rx - ry;
		}

		return new Cube(rx,ry,rz);
	};

	FractionalCube.cubeLerp = function(a,b,t) {
		return new FractionalCube(a.x + (b.x - a.x) * t,a.y + (b.y - a.y) * t,a.z + (b.z - a.z) * t);
	};

	FractionalCube.cubeLinedraw = function(a,b) {
		var N = Cube.distance(a,b);
		var results = [];
		var _g1 = 0;
		var _g = N + 1;

		while(_g1 < _g) {
			var i = _g1++;

			results.push(FractionalCube.cubeRound(FractionalCube.cubeLerp(a, b, 1.0 / Math.max(1, N) * i)));
		}

		return results;
	};

	FractionalCube.prototype.v = function() {
		return [this.x,this.y,this.z];
	};

	FractionalCube.prototype.toString = function() {
		return "#{" + this.v().join(",") + "}";
	};

	return FractionalCube;
});