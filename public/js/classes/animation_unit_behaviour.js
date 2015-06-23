define('class/animation_unit_behaviour', [

], function(

) {
	var img_width = 100,
		img_height = 100;

	function UnitBehaviourAnimation(unit) {
		//UnitAnimation.prototype.constructor.apply(this, arguments);

		this.frame_number = 0;
		this.unit = unit;
	}

	//UnitBehaviourAnimation.inherits(UnitAnimation);

	UnitBehaviourAnimation.prototype.initialize = function(animations_manager) {
		var animation_type = 'mouseover_active';
		var sprite_data = this.unit.getSpriteData(),
			steps = sprite_data.states[animation_type],
			step_count = steps.length;

		var img_width = sprite_data.width,
			img_height = sprite_data.height;

		var img = document.createElement('img');
		img.src = sprite_data.url;
		img.width = img_width * step_count;
		img.height = img_height;

		img.onload = function(animations_manager) {
			animations_manager.add(this);
		}.bind(this, animations_manager);

		this.img = img;
	};

	UnitBehaviourAnimation.prototype.drawInFrame = function(canvas_helper) {
		var ctx = canvas_helper.ctx;
		var animation_type = 'mouseover_active';

		var sprite_data = this.unit.getSpriteData(),
			steps = sprite_data.states[animation_type],
			step_count = steps.length;

		var img_width = sprite_data.width,
			img_height = sprite_data.height;

		var cube = this.unit.getCube();

		var position = canvas_helper.grid.hexToCenter(cube);

		var pos = {
			x : canvas_helper.OFFSET_X + position.x - sprite_data.legs_x,
			y : canvas_helper.OFFSET_Y + position.y - sprite_data.legs_y
		};

		ctx.drawImage(
			this.img,
			img_width * (steps[this.frame_number] - 1),
			0,
			img_width,
			img_height,
			pos.x,
			pos.y,
			img_width,
			img_height
		);

		this.frame_number++;

		if (this.frame_number === step_count) {
			this.frame_number = 0;
		}
	};

	return UnitBehaviourAnimation;
});