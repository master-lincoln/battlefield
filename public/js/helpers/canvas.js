define('helper/canvas', [
	'enum/hex_states',
	'gridlib/screen_coordinate'
], function(
	hexStatesEnum,
	ScreenCoordinate
) {

	var OFFSET_X = 103,
		OFFSET_Y = 132,
		WIDTH = 800,
		HEIGHT = 556;


	var setHexStyles = function(ctx, state) {
		ctx.lineWidth = 1;

		switch(state) {
			case hexStatesEnum.IDLE:
				ctx.strokeStyle = '#678a00';
				ctx.fillStyle = 'rgba(0,0,0,0)';
				ctx.fill();
				break;
			case hexStatesEnum.HOVER:
				ctx.strokeStyle = '#fff200';
				ctx.fillStyle = 'rgba(0,0,0,0)';
				ctx.fill();
				break;
			case hexStatesEnum.BLOCKED:
				ctx.strokeStyle = '#678a00';
				ctx.fillStyle = 'rgba(0,0,0,0.3)';
				ctx.fill();
				break;
			case hexStatesEnum.OBSTACLE:
				ctx.strokeStyle = 'red';
				ctx.fillStyle = 'rgba(0,0,0,0)';
				ctx.fill();
				break;
		}
	};



	function CanvasHelper(canvas, grid) {
		this.canvas = canvas;
		this.grid = grid;

		this.initialize();
	}

	CanvasHelper.prototype.initialize = function() {
		this.canvas.attr({
			width : WIDTH,
			height : HEIGHT
		});

		this.hexagon_points = this.grid.getHexagonShape();
		this.ctx = this.canvas[0].getContext('2d');
	};

	CanvasHelper.prototype.cleanUp = function() {
		this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
	};

	CanvasHelper.prototype.drawIdlePolygon = function(cube) {
		return this.drawPolygon(cube, {
			state : hexStatesEnum.IDLE
		});
	};

	CanvasHelper.prototype.drawHoverPolygon = function(cube) {
		return this.drawPolygon(cube, {
			state : hexStatesEnum.HOVER
		});
	};

	CanvasHelper.prototype.drawBlockedPolygon = function(cube) {
		return this.drawPolygon(cube, {
			state : hexStatesEnum.BLOCKED
		});
	};

	CanvasHelper.prototype.drawObstaclePolygon = function(cube) {
		return this.drawPolygon(cube, {
			state : hexStatesEnum.OBSTACLE
		});
	};

	CanvasHelper.prototype.drawPolygon = function(cube, settings) {
		return this._drawPolygon(cube, settings);
	};

	CanvasHelper.prototype._drawPolygon = function(cube, settings) {
		var ctx = this.ctx;
		var hexagon_points = this.hexagon_points;
		var position = this.grid.hexToCenter(cube);
		var x = position.x + OFFSET_X;
		var y = position.y + OFFSET_Y;
		var polygon = [];

		ctx.beginPath();
		ctx.moveTo(x, y);//Move to center point of hexagon

		for (var j = 0; j < hexagon_points.length; j++) {
			var point = hexagon_points[j];

			if (j === 0) {
				ctx.moveTo(x + point.x, y + point.y);//Its necessary to remove line between center point of hexagon and first verticle
			}

			ctx.lineTo(x + point.x, y + point.y);
			polygon.push(new ScreenCoordinate(x + point.x, y + point.y));
		}

		ctx.lineTo(x + hexagon_points[0].x, y + hexagon_points[0].y);

		setHexStyles(ctx, settings.state);

		ctx.closePath();
		ctx.stroke();

		return polygon;
	};

	CanvasHelper.prototype.drawPath = function(path) {
		var ctx = this.ctx;
		var x = OFFSET_X;
		var y = OFFSET_Y;

		//
		if (path.length === 0) {
			return;
		}

		this.cleanUp();

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 7;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		for(var i = 0; i < path.length; i++) {
			var position = this.grid.hexToCenter(path[i]);

			if (i === 0) {
				ctx.moveTo(x + position.x, y + position.y);
			}
			else {
				ctx.lineTo(x + position.x, y + position.y);
			}
		}

		ctx.stroke();
	};

	CanvasHelper.prototype.addCubeCoordinates = function(hexes) {
		var ctx = this.ctx;

		ctx.fillStyle = "rgb(255,255,255)";

		for(var i = 0, l = hexes.length; i < l; i++) {
			var hex = hexes[i];
			var cube = hex.getCube();
			var position = this.grid.hexToCenter(cube);

			ctx.font = "9px serif";
			ctx.fillText(cube.x + ',' + cube.y + ',' + cube.z, OFFSET_X + position.x - 10, OFFSET_Y + position.y + 4);
		}
	};

	CanvasHelper.prototype.animateUnit = function(unit) {
		//this code is only for tests purposes
		var ctx = this.ctx;

		var animation_type = 'mouseover_active';
		var sprite_data = unit.getSpriteData(),
			cube = unit.getCube(),
			position = this.grid.hexToCenter(cube);

		var start_point = {
			x : OFFSET_X + position.x - sprite_data.legs_x,
			y : OFFSET_Y + position.y - sprite_data.legs_y
		};

		var destination_point = {
			x : 500,
			y : 500
		};

		var getCurrentPosition = function() {
			return start_point;//Calculate here current position
		};

		var steps = sprite_data.states[animation_type],
			step_count = steps.length;


		var img = document.createElement('img');
		img.src = sprite_data.url;

		var counter = 0;
		var startTime = (new Date()).getTime();

		var animate = function() {
			var img_width = sprite_data.width,
				img_height = sprite_data.height;

			var pos = getCurrentPosition();

			img.width = img_width * step_count;
			img.height = img_height;

			ctx.clearRect(0, 0, 800, 556);

			ctx.drawImage(
				img,
				img_width * (steps[counter] - 1),
				0,
				img_width,
				img_height,
				pos.x,
				pos.y,
				img_width,
				img_height
			);

			counter++;

			if(counter === step_count) {
				counter = 0;
			}

			setTimeout(function() {
				window.requestAnimationFrame(function() {
					animate();
				});
			}, 100);
		};

		img.onload = function() {
			animate();
		}.bind(this);
	};

	return CanvasHelper;
});