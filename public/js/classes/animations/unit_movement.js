define('class/animations/unit_movement', [
	'map/default',
	'helper/plane_2d',
	'class/animations/unit_base'
], function(
	BattlefieldData,
	Plane2DHelper,
	UnitBaseAnimation
) {
	function UnitMovementAnimation(unit, animation_type, line) {
		UnitBaseAnimation.prototype.constructor.apply(this, arguments);

		this.line = line;

		this.initialize();
	}

	UnitMovementAnimation.prototype = Object.create(UnitBaseAnimation.prototype);
	UnitMovementAnimation.prototype.constructor = UnitMovementAnimation;

	UnitMovementAnimation.prototype.initialize = function() {
		this.frame_number = 0;
		this.sprite_data = this.unit.getSpriteData();
		this.percent = 0;
		this.starting_time = null;
	};

	UnitMovementAnimation.prototype.getFrame = function(canvas_helper) {
		//Save time when animation was called for a first time
		if (this.starting_time === null) {
			this.starting_time = (new Date()).getTime();
		}

		var passed_time = Math.min((new Date()).getTime() - this.starting_time, BattlefieldData.SINGLE_MOVEMENT_TIME);
		var img_width = this.getImageWidth(),
			img_height = this.getImageHeight();
		var steps = this.getAnimationSteps();
		var sx = img_width * (steps[this.frame_number] - 1);
		var percent = (100 * passed_time) / BattlefieldData.SINGLE_MOVEMENT_TIME;
		var pos = Plane2DHelper.getPointOnLine(this.line[0].x, this.line[0].y, this.line[1].x, this.line[1].y, percent);

		this.percent = percent;
		this.frame_number++;

		if (this.frame_number === steps.length) {
			this.frame_number = 0;
		}

		return [sx, 0, img_width, img_height, pos.x + BattlefieldData.GRID_OFFSET_X - this.sprite_data.legs_x, pos.y + BattlefieldData.GRID_OFFSET_Y - this.sprite_data.legs_y, img_width, img_height];
	};

	UnitMovementAnimation.prototype.isFinished = function() {
		return this.percent === 100;
	};

	return UnitMovementAnimation;
});