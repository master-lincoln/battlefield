define('class/animation_unit_behaviour', [
	'class/animation_unit',
	'enum/battlefield_unit_animation_types'
], function(
	UnitAnimation,
	battlefieldUnitAnimationTypesEnum
) {

	function UnitBehaviourAnimation(unit) {
		this.unit = unit;
		this.animations = [];

		this.default_animation = new UnitAnimation(unit, battlefieldUnitAnimationTypesEnum.MOVING);
	}

	UnitBehaviourAnimation.prototype.initialize = function(animations_manager) {
		var sprite_data = this.unit.getSpriteData();
		var img = document.createElement('img');
			img.src = sprite_data.url;
			img.height = sprite_data.height;

			img.onload = function(animations_manager) {
				animations_manager.add(this);
			}.bind(this, animations_manager);

		this.img = img;
	};

	UnitBehaviourAnimation.prototype._getCurrentAnimation = function() {
		return this.animations.length === 0 ? this.default_animation : this.animations[0];
	};

	UnitBehaviourAnimation.prototype.drawInFrame = function(canvas_helper) {
		var current_animation = this._getCurrentAnimation();
		var frame = current_animation.getFrame(canvas_helper);

		canvas_helper.renderImage.apply(canvas_helper, [this.img].concat(frame));
	};

	UnitBehaviourAnimation.prototype.isUnit = function(unit) {
		return this.unit.cid === unit.cid;
	};

	UnitBehaviourAnimation.prototype.moveUnitOnPath = function(cube) {

	};

	return UnitBehaviourAnimation;
});