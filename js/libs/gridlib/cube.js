define('gridlib/cube', [], function() {
	'use strict';

	var Cube = function(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
	};

	Cube.add = function(a,b) {
		return new Cube(a.x + b.x,a.y + b.y,a.z + b.z);
	};

	Cube.scale = function(a,k) {
		return new Cube(a.x * k,a.y * k,a.z * k);
	};

	Cube.direction = function(direction) {
		return Cube.directions[direction];
	};

	Cube.neighbor = function(hex,direction) {
		return Cube.add(hex,Cube.direction(direction));
	};

	Cube.diagonalNeighbor = function(hex,direction) {
		return Cube.add(hex,Cube.diagonals[direction]);
	};

	Cube.distance = function(a,b) {
		return ((Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2) | 0;
	};

	Cube.$length = function(h) {
		return ((Math.abs(h.x) + Math.abs(h.y) + Math.abs(h.z)) / 2) | 0;
	};

	Cube.prototype = {
		toString : function() {
			return this.v().join(",");
		},
		v : function() {
			return [this.x,this.y,this.z];
		},
		rotateLeft : function() {
			return new Cube(-this.y,-this.z,-this.x);
		},
		rotateRight : function() {
			return new Cube(-this.z,-this.x,-this.y);
		},
		equals : function(other) {
			return this.x == other.x && this.y == other.y && this.z == other.z;
		}
	};

	Cube.directions = [new Cube(1,-1,0), new Cube(1,0,-1), new Cube(0,1,-1), new Cube(-1,1,0), new Cube(-1,0,1), new Cube(0,-1,1)];
	Cube.diagonals = [new Cube(2,-1,-1), new Cube(1,1,-2), new Cube(-1,2,-1), new Cube(-2,1,1), new Cube(-1,-1,2), new Cube(1,-2,1)];

	return Cube;
});