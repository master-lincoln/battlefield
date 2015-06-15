define('helper/canvas', [], function() {

	function CanvasHelper(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}

	CanvasHelper.prototype.cleanUpCanvas = function(ctx) {
		ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
	};

	return CanvasHelper;
});