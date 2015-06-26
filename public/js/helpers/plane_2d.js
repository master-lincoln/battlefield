define('helper/plane_2d', [], function() {
	return {
		vectorLength : function(vector) {
			return Math.sqrt(vector.map(function (a) {
				return a * a;
			}).reduce(function (a, b) {
				return a + b;
			}));
		},

		getPointOnLine : function getPointOnLine(x1, y1, x2, y2, percent) {
			var vector_length = this.vectorLength([x1 - x2, y1 - y2]),
				distance = -((vector_length / 100) * percent),
				vx = x1 - x2,
				vy = y1 - y2,
				mag = Math.sqrt(vx * vx + vy * vy);

			return {
				x : (x2 + (vx / mag) * (mag + distance)),
				y : (y2 + (vy / mag) * (mag + distance))
			};
		}
	};
});