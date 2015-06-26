define('unit/stronghold/hobgoblin', [
	'enum/battlefield_unit_animation_types'
], function(
	battlefieldUnitAnimationTypesEnum
) {
	function getStates() {
		var obj = {};

		obj[battlefieldUnitAnimationTypesEnum.MOVING] = {
			steps : [10, 11, 12, 13, 14, 15, 16, 17, 18],
			duration : 1170,
			repeat : Infinity,
			movement : true
		};

		obj[battlefieldUnitAnimationTypesEnum.MOUSEOVER] = {
			steps : [1, 5, 6, 7, 8, 8, 7, 6, 5],
			duration : 1170,
			repeat : Infinity,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.STANDING] = {
			steps : [1, 2, 3, 4, 3, 2, 1],
			duration : 910,
			repeat : Infinity,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.MOUSEOVER_ACTIVE] = {
			steps : [60, 64, 65, 66, 67, 67, 66, 65, 64],
			duration : 1170,
			repeat : Infinity,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.STANDING_ACTIVE] = {
			steps : [60, 61, 62, 63, 62, 61, 60],
			duration : 910,
			repeat : Infinity,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.HIT] = {
			steps : [1, 46, 47, 48, 49, 51],
			duration : 780,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.DEFEND] = {
			steps : [1, 22, 23, 24, 25, 26, 27, 28],
			duration : 1040,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.DEATH] = {
			steps : [1, 52, 53, 54, 55, 56, 57, 58, 59],
			duration : 1170,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.TURN_LEFT] = {
			steps : [1, 20, 21],
			duration : 390,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.TURN_RIGHT] = {
			steps : [21, 20, 1],
			duration : 390,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.ATTACK_UP] = {
			steps : [1, 34, 35, 29, 30, 31, 32, 33],
			duration : 1040,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.ATTACK_STRAIGHT] = {
			steps : [1, 34, 35, 36, 37, 38, 39, 40],
			duration : 1040,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.ATTACK_DOWN] = {
			steps : [1, 34, 35, 41, 42, 43, 44, 45],
			duration : 1040,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.START_MOVING] = {
			steps : [9],
			duration : 130,
			repeat : 1,
			movement : false
		};

		obj[battlefieldUnitAnimationTypesEnum.STOP_MOVING] = {
			steps : [19],
			duration : 130,
			repeat : 1,
			movement : false
		};

		return obj;
	}

	/**
	 * How to get unit images
	 * - Export images in Def preview, and 'Export all for def tool' to get all states + active state
	 *
	 * Run following commands in folder with .bmp files to create sprite (no need to adjust)
	 * - for file in *.bmp; do convert $file -transparent '#ff00ff' -transparent '#ff96ff' -transparent '#00ffff' "`basename $file .bmp`.png"; done
	 * - convert *.png +append output.png
	 *
	 *
	 * - Duration for each step has been calculated in way steps.length * 130ms
	 *
	 */
	var sprites = {
		url : 'images/units/stronghold/battlefield/hobgoblin.png',
		viewport_width : 100,
		viewport_height : 100,
		width : 450,
		height: 400,
		legs_x : 200,
		legs_y : 255,

		//Take a look into 'Def Preview' list to get these states
		states : getStates()
	};

	return {
		sprites : sprites
	};
});