define('manager/animation', [
	'data/battlefields/grass'
], function(
	BattlefieldData
) {
	var drawing_frame;

	var animations = [];

	function AnimationsManager(canvas_helper) {
		this.canvas_helper = canvas_helper;

		this.initialize();
	}

	AnimationsManager.prototype.initialize = function() {
		var canvas_helper = this.canvas_helper;

		drawing_frame = setInterval(function() {
			window.requestAnimFrame(function() {
				canvas_helper.cleanUp();

				for (var i = 0; i < animations.length; i++) {
					animations[i].drawInFrame(canvas_helper);
				}
			});
		}, BattlefieldData.FRAME_LIFE_TIME);
	};

	AnimationsManager.prototype.add = function(animate_object) {
		animations.push(animate_object);
	};

	return AnimationsManager;
});