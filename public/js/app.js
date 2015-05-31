define('app', [
	'manager/observer'
], function(
	observerManager
) {
	var app = {
		observer : observerManager
	};

	return app;
});
