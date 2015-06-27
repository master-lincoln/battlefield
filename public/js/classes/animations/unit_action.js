define('class/animations/unit_action', [
	'map/default',
	'class/animations/unit_base'
], function(
	BattlefieldData,
	UnitBaseAnimation
) {

	function UnitActionAnimation() {
		UnitBaseAnimation.prototype.constructor.apply(this, arguments);

		this.initialize();
	}

	UnitActionAnimation.prototype = Object.create(UnitBaseAnimation.prototype);
	UnitActionAnimation.prototype.constructor = UnitActionAnimation;

	UnitActionAnimation.prototype.initialize = function() {

	};

	UnitActionAnimation.prototype.drawFrame = function(canvas_helper, img) {
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
			this.frame_number = -1;
		}

		canvas_helper.renderImage(img, sx, 0, img_width, img_height, pos.x, pos.y, img_width, img_height);
	};

	UnitActionAnimation.prototype.isFinished = function() {
		return this.frame_number === -1;
	};

	UnitActionAnimation.prototype.destroy = function() {
		UnitBaseAnimation.prototype.destroy.apply(this, arguments);
	};

	return UnitActionAnimation;
});