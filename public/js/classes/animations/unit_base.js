define('class/animations/unit_base', [

], function(

) {
	function UnitAnimationBase(unit, animation_type) {
		this.unit = unit;
		this.animation_type = animation_type;

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
		return this.sprite_data.states[this.getAnimationType()].steps;
	};

	UnitAnimationBase.prototype.getImageWidth = function() {
		return this.sprite_data.width;
	};

	UnitAnimationBase.prototype.getImageHeight = function() {
		return this.sprite_data.height;
	};

	return UnitAnimationBase;
});