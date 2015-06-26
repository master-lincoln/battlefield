define('class/animations/unit_standing', [
	'map/default',
	'class/animations/unit_base'
], function(
	BattlefieldData,
	UnitBaseAnimation
) {

	function UnitStandingAnimation() {
		UnitBaseAnimation.prototype.constructor.apply(this, arguments);

		this.initialize();
	}

	UnitStandingAnimation.prototype = Object.create(UnitBaseAnimation.prototype);
	UnitStandingAnimation.prototype.constructor = UnitStandingAnimation;

	UnitStandingAnimation.prototype.initialize = function() {
		this.percent = 0;
	};

	UnitStandingAnimation.prototype.getFrame = function(canvas_helper) {
		var cube = this.unit.getCube();
		var position = canvas_helper.grid.hexToCenter(cube);
		var img_width = this.getImageWidth(),
			img_height = this.getImageHeight();
		var steps = this.getAnimationSteps();
		var sx = img_width * (steps[this.frame_number] - 1);

		var pos = {
			x : BattlefieldData.GRID_OFFSET_X + position.x - this.sprite_data.legs_x,
			y : BattlefieldData.GRID_OFFSET_Y + position.y - this.sprite_data.legs_y
		};

		this.frame_number++;

		if (this.frame_number === steps.length) {
			this.frame_number = 0;
		}

		return [sx, 0, img_width, img_height, pos.x, pos.y, img_width, img_height];
	};

	UnitStandingAnimation.prototype.isFinished = function() {

	};

	return UnitStandingAnimation;
});