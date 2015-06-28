define('class/animations/unit_base', [
	'map/default'
], function(
	BattlefieldData
) {
	function UnitAnimationBase(unit, animation_type, callback) {
		this.unit = unit;
		this.animation_type = animation_type;
		this.callback = callback;

		this.frame_number = 0;
		this.sprite_data = this.unit.getSpriteData();
	}

	UnitAnimationBase.prototype.initialize = function() {
		throw 'The "initialize" method has to be implemented in class which inherits from UnitAnimationBase';
	};

	UnitAnimationBase.prototype.getAnimationType = function() {
		return this.animation_type;
	};

	UnitAnimationBase.prototype.getAnimationSteps = function() {
		return this.getAnimation().steps;
	};

	UnitAnimationBase.prototype.getAnimationDuration = function() {
		return this.getAnimationSteps().length * BattlefieldData.FRAME_LIFE_TIME;
	};

	UnitAnimationBase.prototype.getAnimation = function() {
		return this.sprite_data.states[this.getAnimationType()];
	};

	UnitAnimationBase.prototype.getImageWidth = function() {
		return this.sprite_data.width;
	};

	UnitAnimationBase.prototype.getImageHeight = function() {
		return this.sprite_data.height;
	};

	UnitAnimationBase.prototype.destroy = function() {
		if (typeof this.callback === 'function') {
			this.callback();
		}
	};

	return UnitAnimationBase;
});