define('class/animations/unit_standing', [
	'map/default'
], function(
	BattlefieldData
) {

	function UnitStandingAnimation(unit, animation_type) {
		this.unit = unit;
		this.animation_type = animation_type;

		this.initialize();
	}

	UnitStandingAnimation.prototype.initialize = function() {
		this.frame_number = 0;
		this.sprite_data = this.unit.getSpriteData();
		this.percent = 0;
	};

	UnitStandingAnimation.prototype.getFrame = function(canvas_helper) {
		var cube = this.unit.getCube();
		var position = canvas_helper.grid.hexToCenter(cube);
		var img_width = this.sprite_data.width,
			img_height = this.sprite_data.height;
		var steps = this.sprite_data.states[this.animation_type].steps;
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