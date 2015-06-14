define('unit/stronghold/hobgoblin', [

], function(

) {
	/**
	 * How to get unit images
	 * - Export images in Def preview, and 'Export all for def tool' to get all states + active state
	 *
	 * Run following commands in folder with .bmp files to create sprite (no need to adjust)
	 * - for file in *.bmp; do convert $file -transparent '#ff00ff' -transparent '#ff96ff' -transparent '#00ffff' "`basename $file .bmp`.png"; done
	 * - convert *.png +append output.png
	 *
	 */
	var sprites = {
		url : 'images/units/stronghold/battlefield/hobgoblin.png',
		width : 450,
		height: 400,
		legs_x : 200,
		legs_y : 255,

		//Take a look into 'Def Preview' list to get these states
		states : {
			moving : [10, 11, 12, 13, 14, 15, 16, 17, 18],
			mouseover : [1, 5, 6, 7, 8, 8, 7, 6, 5],
			standing : [1, 2, 3, 4, 3, 2, 1],
			mouseover_active : [60, 64, 65, 66, 67, 67, 66, 65, 64],
			standing_active : [60, 61, 62, 63, 62, 61, 60],
			hit : [1, 46, 47, 48, 49, 51],
			defend : [1, 22, 23, 24, 25, 26, 27, 28],
			death : [1, 52, 53, 54, 55, 56, 57, 58, 59],
			turn_left : [1, 20, 21],
			turn_right : [21, 20, 1],
			attack_up : [1, 34, 35, 29, 30, 31, 32, 33],
			attack_straight : [1, 34, 35, 36, 37, 38, 39, 40],
			attack_down : [1, 34, 35, 41, 42, 43, 44, 45],
			start_moving : [9],
			stop_moving : [19]
		}


		/*walking : {
			url : 'images/units/stronghold/battlefield/hobgoblin/walking_sprite.png',
			steps : 10,
			width : 110,
			height: 110,
			legs_x : 55,
			legs_y : 72
		}*/
	};

	return {
		sprites : sprites
	};
});