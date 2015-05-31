module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			development: {
				options: {

				},
				files: {
					"css/battlefield/terrain.css": "less/battlefield/terrain.less",
					"css/styles.css" : "less/styles.less"
				}
			}
		},
		watch: {
			less: {
				files: ['less/**/*.less'],
				tasks: ['less:development'],
				options: {

				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', []);
};
