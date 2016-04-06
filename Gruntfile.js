module.exports = function(grunt) {

	// =========================================================================
	// CONFIGURE GRUNT =========================================================
	// =========================================================================
	grunt.initConfig({
		// get the configuration info from package.json
		// this way we can use things like name and version (pkg.name)
		pkg: grunt.file.readJSON('package.json'),

		clean: ['build', 'dist'],

		// configure jshint to validate js files
		jshint: {
			options: {
				reporter: require('jshint-stylish'),
				"esnext": true,
				ignores: ['src/js/lib/*'],
				"predef": [ "X2JS" ]
			},
			all: ['Grunfile.js', 'src/js/**/*.js']
		},

		browserify: {
			options: {
				browserifyOptions: {
					debug: true
				}
			},
			dist: {
				files: {
					'build/js/bundle.js': 'src/js/**/*.js'
				}
			}
		},

		// configure uglify to minify js files
		uglify: {
			all_js: {
				options: {
					sourceMap : true
				},
				files: [{
					expand: true,
					cwd: 'build/js',
					src: ['**/*.js'],
					dest: 'dist/js',
					ext: '.min.js'
				}]
			}
		},

		sass: {
			dist: {
				files: [{
					expand: true,
					cwd: 'src/css',
					src: ['**/*.scss'],
					dest: 'build/css',
					ext: '.css'
				}]
			}
		},

		// configure cssmin to minify css files
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'build/css',
					src: ['*.css', '!*.min.css'],
					dest: 'dist/css',
					ext: '.min.css'
				}]
			}
		},

		// configure watch to auto update ------------------------------------------
		watch: {
			all: {
				files: ['src/*.html'],
				options: {
					livereload: true
				}
			},
			stylesheets: {
				files: ['src/**/*.scss'],
				tasks: ['sass', 'cssmin'],
				options: {
					livereload: true
				}
			},
			scripts: {
				files: 'src/**/*.js',
				tasks: ['jshint', 'browserify', 'uglify']
			}
		},

		copy: {
			main: {
				files: [
					{expand: true, cwd: 'src/', src: '*.html', dest: 'dist/'},
					{expand: true, cwd: 'src/maps/', src: '*.xml', dest: 'dist/maps'},
					{expand: true, cwd: 'src/js/lib/', src: '*.min.js', dest: 'dist/js'}
				]
			}
		},

        connect: {
            server: {
                options: {
                    port: 8080,
                    base: 'dist',
                    middleware: function(connect, options, middlewares) {
                        middlewares.push(function(req, res, next) {
                            res.setHeader('Access-Control-Allow-Origin', 'localhost, 10.216.100.218, www.calcxml.com');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST*');
                            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With, X-File-Name');
                            return next();
                        });

                        return middlewares;
                    }
                }
            }
        }

	});

	// =========================================================================
	// LOAD GRUNT PLUGINS ======================================================
	// =========================================================================
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');

	// =========================================================================
	// CREATE TASKS ============================================================
	// =========================================================================
	grunt.registerTask('default', ['clean', 'jshint', 'browserify', 'uglify', 'sass', 'cssmin', 'copy', 'connect:server', 'watch']);
};

