define('manager/animation', [], function() {
	var drawing_frame,
		frame_life_time = 130;

	var animations = [];

	function AnimationsManager(canvas_helper) {
		this.canvas_helper = canvas_helper;

		this.initialize();
	}

	AnimationsManager.prototype.initialize = function() {
		var canvas_helper = this.canvas_helper;

		drawing_frame = setInterval(function() {
			window.requestAnimationFrame(function() {
				canvas_helper.cleanUp();

				for (var i = 0; i < animations.length; i++) {
					animations[i].drawInFrame(canvas_helper);
				}
			});
		}, frame_life_time);
	};

	AnimationsManager.prototype.add = function(animate_object) {
		animations.push(animate_object);
	};

	return AnimationsManager;
});