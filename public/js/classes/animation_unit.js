define('class/animation_unit', [

], function(

) {
	function UnitAnimation(unit, animation_type) {
		this.unit = unit;
		this.animation_type = animation_type;
		this.frame_number = 0;
		this.sprite_data = unit.getSpriteData();

		this.starting_time = null;

		this.initialize();
	}

	UnitAnimation.prototype.initialize = function() {
		//img, sx, sy, s_width, s_height, dx, dy, d_width, d_height

		//var now = ;
	};

	UnitAnimation.prototype.getFrame = function(canvas_helper) {
		//Save time when animation was called for a first time
		if (this.starting_time === null) {
			this.starting_time = (new Date()).getTime();
		}

		var cube = this.unit.getCube();
		var position = canvas_helper.grid.hexToCenter(cube);
		var img_width = this.sprite_data.width,
			img_height = this.sprite_data.height;
		var steps = this.sprite_data.states[this.animation_type].steps;
		var sx = img_width * (steps[this.frame_number] - 1);

		var pos = {
			x : 103 + position.x - this.sprite_data.legs_x,
			y : 132 + position.y - this.sprite_data.legs_y
		};

		this.frame_number++;

		if (this.frame_number === steps.length) {
			this.frame_number = 0;
		}

		return [sx, 0, img_width, img_height, pos.x, pos.y, img_width, img_height];
	};

	return UnitAnimation;
});