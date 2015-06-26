define('class/animations/unit_action', [

], function(

) {
	var OFFSET_X = 103;
	var OFFSET_Y = 132;
	var SINGLE_MOVEMENT_TIME = 1000;//time for unit to move from one cell to another

	function UnitAnimation(unit, animation_type, line) {
		this.unit = unit;
		this.animation_type = animation_type;
		this.line = line;//can be undefined if type is not types.MOVING - stored here temporary for tests
		this.frame_number = 0;
		this.sprite_data = unit.getSpriteData();
		this.percent = 0;

		this.starting_time = null;

		this.initialize();
	}

	UnitAnimation.prototype.initialize = function() {
		//img, sx, sy, s_width, s_height, dx, dy, d_width, d_height

		//var now = ;
	};

	UnitAnimation.prototype.getFrame = function(canvas_helper) {
		if (this.animation_type === 'moving') {
			return this.getFrameMovement(canvas_helper);
		}
		else {
			return this.getFrameNormal(canvas_helper);
		}
	};

	UnitAnimation.prototype.getFrameNormal = function(canvas_helper) {
		var cube = this.unit.getCube();
		var position = canvas_helper.grid.hexToCenter(cube);
		var img_width = this.sprite_data.width,
			img_height = this.sprite_data.height;
		var steps = this.sprite_data.states[this.animation_type].steps;
		var sx = img_width * (steps[this.frame_number] - 1);

		var pos = {
			x : OFFSET_X + position.x - this.sprite_data.legs_x,
			y : OFFSET_Y + position.y - this.sprite_data.legs_y
		};

		this.frame_number++;

		if (this.frame_number === steps.length) {
			this.frame_number = 0;
		}

		return [sx, 0, img_width, img_height, pos.x, pos.y, img_width, img_height];
	};

	UnitAnimation.prototype.getFrameMovement = function(canvas_helper) {
		//Save time when animation was called for a first time
		if (this.starting_time === null) {
			this.starting_time = (new Date()).getTime();
		}

		var passed_time = Math.min((new Date()).getTime() - this.starting_time, SINGLE_MOVEMENT_TIME);
		var img_width = this.sprite_data.width,
			img_height = this.sprite_data.height;
		var steps = this.sprite_data.states[this.animation_type].steps;
		var sx = img_width * (steps[this.frame_number] - 1);
		var percent = (100 * passed_time) / SINGLE_MOVEMENT_TIME;
		var pos = getPointOnLine(this.line[0].x, this.line[0].y, this.line[1].x, this.line[1].y, percent);


		this.frame_number++;

		if (this.frame_number === steps.length) {
			this.frame_number = 0;
		}

		return [sx, 0, img_width, img_height, pos.x + OFFSET_X - this.sprite_data.legs_x, pos.y + OFFSET_Y - this.sprite_data.legs_y, img_width, img_height];
	};

	UnitAnimation.prototype.isFinished = function() {

	};

	return UnitAnimation;
});