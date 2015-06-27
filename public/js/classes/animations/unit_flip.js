define('class/animations/unit_flip', [
	'map/default',
	'class/animations/unit_base',
	'enum/battlefield_unit_animation_types'
], function(
	BattlefieldData,
	UnitBaseAnimation,
	battlefieldUnitAnimationTypesEnum
) {

	function UnitFlipAnimation(unit, animation_type, callback, direction) {
		UnitBaseAnimation.prototype.constructor.apply(this, arguments);

		this.direction = direction;

		this.initialize();
	}

	UnitFlipAnimation.prototype = Object.create(UnitBaseAnimation.prototype);
	UnitFlipAnimation.prototype.constructor = UnitFlipAnimation;

	UnitFlipAnimation.prototype.initialize = function() {

	};

	UnitFlipAnimation.prototype.drawFrame = function(canvas_helper, img) {
		if (this.direction === battlefieldUnitAnimationTypesEnum.TURN_LEFT) {
			canvas_helper.flipLeft();
		} else if(this.direction === battlefieldUnitAnimationTypesEnum.TURN_RIGHT) {
			canvas_helper.flipRight();
		}
		else {
			throw 'Unexpected case';
		}

		this.frame_number = -1;
	};

	UnitFlipAnimation.prototype.isFinished = function() {
		return this.frame_number === -1;
	};

	UnitFlipAnimation.prototype.destroy = function() {
		UnitBaseAnimation.prototype.destroy.apply(this, arguments);
	};

	return UnitFlipAnimation;
});