define('helper/canvas', [
	'data/battlefields/grass',
	'enum/hex_states',
	'gridlib/screen_coordinate'
], function(
	BattlefieldData,
	hexStatesEnum,
	ScreenCoordinate
) {

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
				ctx.fillStyle = 'rgba(255,0,0,0.3)';
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
			width : BattlefieldData.CANVAS_WIDTH,
			height : BattlefieldData.CANVAS_HEIGHT
		});

		this.hexagon_points = this.grid.getHexagonShape();
		this.ctx = this.canvas[0].getContext('2d');
	};

	CanvasHelper.prototype.cleanUp = function() {
		this.ctx.clearRect(0, 0, BattlefieldData.CANVAS_WIDTH, BattlefieldData.CANVAS_HEIGHT);
	};

	CanvasHelper.prototype.flipLeft = function() {
		this.ctx.translate(BattlefieldData.CANVAS_WIDTH, 0);
		this.ctx.scale(-1, 1);


		//this.ctx.clearRect(0, 0, BattlefieldData.CANVAS_WIDTH, BattlefieldData.CANVAS_HEIGHT);
	};

	CanvasHelper.prototype.flipRight = function() {
		//this.ctx.clearRect(0, 0, BattlefieldData.CANVAS_WIDTH, BattlefieldData.CANVAS_HEIGHT);
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
		var x = position.x + BattlefieldData.GRID_OFFSET_X;
		var y = position.y + BattlefieldData.GRID_OFFSET_Y;
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
		var x = BattlefieldData.GRID_OFFSET_X;
		var y = BattlefieldData.GRID_OFFSET_Y;

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
			ctx.fillText(cube.x + ',' + cube.y + ',' + cube.z, BattlefieldData.GRID_OFFSET_X + position.x - 10, BattlefieldData.GRID_OFFSET_Y + position.y + 4);
		}
	};

	CanvasHelper.prototype.renderImage = function(img, sx, sy, s_width, s_height, dx, dy, d_width, d_height, orientation) {
		var $virtual_canvas = $('#canvas_unit_movement');
		$virtual_canvas.attr('width', s_width);
		$virtual_canvas.attr('height', s_height);
		var virtual_canvas = $virtual_canvas[0];
		var virtual_ctx = virtual_canvas.getContext('2d');

		var flip_offset = 0;


		if (orientation) {
			virtual_ctx.save();
			virtual_ctx.translate(s_width, 0);
			virtual_ctx.scale(-1, 1);
			flip_offset = -45;
		}

		virtual_ctx.drawImage(img, sx, sy, s_width, s_height, 0, 0, d_width, d_height);

		if (orientation) {
			virtual_ctx.restore();
		}

		/*if (orientation) {
			this.ctx.save();

			this.flipLeft();

		}*/

		this.ctx.drawImage(virtual_canvas, 0, 0, s_width, s_height, dx + flip_offset, dy, d_width, d_height);
		//this.ctx.drawImage(img, sx, sy, s_width, s_height, dx, dy, d_width, d_height);

		/*if (orientation) {
			this.flipLeft();
			this.ctx.translate(-400, 0);

			this.ctx.restore();
		}*/
	};

	return CanvasHelper;
});