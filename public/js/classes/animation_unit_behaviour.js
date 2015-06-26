define('class/animation_unit_behaviour', [
	'enum/battlefield_unit_animation_types',
	'class/animations/unit_standing',
	'class/animations/unit_action',
	'class/animations/unit_movement'
], function(
	battlefieldUnitAnimationTypesEnum,
	UnitStandingAnimation,
	UnitActionAnimation,
	UnitMovementAnimation
) {

	function UnitBehaviourAnimation(unit) {
		this.unit = unit;
		this.animations = [];

		this.default_animation = new UnitStandingAnimation(unit, battlefieldUnitAnimationTypesEnum.STANDING);
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
		var l = this.animations.length;
		var ready_to_play_animation = null;

		while(l--) {
			var animation = this.animations[l];

			if (animation.isFinished()) {
				this.animations.splice(l, 1);

				if (this.animations.length === 0) {
					animation.destroy();
				}
			}
			else {
				ready_to_play_animation = animation;
			}
		}

		//If there is no animation to play, then animate unit standing
		//@todo later check wheter unit is active or not
		if (this.animations.length === 0) {
			return this.default_animation;
		}

		return ready_to_play_animation;
	};

	UnitBehaviourAnimation.prototype.drawInFrame = function(canvas_helper) {
		var current_animation = this._getCurrentAnimation();
		var frame = current_animation.getFrame(canvas_helper);

		canvas_helper.renderImage.apply(canvas_helper, [this.img].concat(frame));
	};

	UnitBehaviourAnimation.prototype.isUnit = function(unit) {
		return this.unit.cid === unit.cid;
	};

	UnitBehaviourAnimation.prototype.moveUnitOnPolyline = function(polyline_points, callback) {
		for (var i = 1; i < polyline_points.length; i++) {
			var line = [polyline_points[i - 1], polyline_points[i]];

			this.animations.push(new UnitMovementAnimation(this.unit, battlefieldUnitAnimationTypesEnum.MOVING, line, callback));
		}
	};

	return UnitBehaviourAnimation;
});