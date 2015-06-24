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
		var animation_type = 'mouseover_active';

		var sprite_data = this.unit.getSpriteData(),
			step_count = sprite_data.states[animation_type].length;

		canvas_helper.renderUnit(
			this.img,
			animation_type,
			sprite_data,
			this.unit.getCube(),
			this.frame_number
		);

		this.frame_number++;

		if (this.frame_number === step_count) {
			this.frame_number = 0;
		}
	};

	UnitBehaviourAnimation.prototype.moveTo = function(cube) {
		console.log(this.unit.getCube(), cube);
	};

	return UnitBehaviourAnimation;
});