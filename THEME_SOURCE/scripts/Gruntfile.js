module.exports = function(grunt) {
    var DEST = '../../scripts/';
    var APP_NAME = 'app.js';
    var LIBS_NAME = 'libs.js';
    
    var  banner = "/*!\n" +
        " * <%= pkg.title %>. \n" +
        " * Version: <%= pkg.version %>\n" +
        " *\n" +        " * <%= pkg.homepage %>\n" +
        " *\n" +
        " * Author <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
        " * Released under the <%= _.pluck(pkg.licenses, 'type').join(', ') %> license.\n" +
        " */\n\n";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
	bower: {
	    install:{
		options:{
		    targetDir: 'src/lib',
		    cleanBowerDir: true
		}
	    }
	},
	karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: '\n\n'
            },
            app: {
                options: {
                    banner: banner
                },
                // the files to concatenate
                src: [
                    'src/app/*.js',
                    'conf.js',
		    'src/app.js'
                ],
                // the location of the resulting JS file
                dest: DEST + APP_NAME
            },
	    libs: {
                // the files to concatenate
                src: [
		    'src/lib/IndexedDBShim/IndexedDBShim.js',
		    'src/lib/latlon/vector3d.js',
		    'src/lib/latlon/geo.js',
		    'src/lib/latlon/latlon-ellipsoid.js',
		    'src/lib/latlon/osgridref.js',
		    'src/lib/handlebars/handlebars.js',
		    'src/lib/photoswipe/lib/klass.min.js',
		    'src/lib/photoswipe/code.photoswipe.jquery-3.0.5.min.js',
		    'src/lib/morel/morel.js'
                ],
                // the location of the resulting JS file
                dest: DEST + LIBS_NAME
            }
        },
        replace: {
            main: {
                src: ['../../scripts/app.js'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                        from: /(app\.CONF.VERSION =) \'0\';/g, // string replacement
                        to: '$1 \'<%= pkg.version %>\';'
                    },
                    {
                        from: /(app\.CONF\.NAME =) \'app\';/g,  // string replacement
                        to: '$1 \'<%= pkg.name %>\';'
                    }
                ]
            },
	    libs: {
                src: ['../../scripts/' + LIBS_NAME],
                overwrite: true, // Fix klass.js no ';' problem
                replacements: [{
                    from: '\/\/ PhotoSwipe',
                    to: ';\/\/ photoswipe'
                    }
                ]
            }
        },
        uglify: {
            dist: {
                options: {
                    // the banner is inserted at the top of the output
                    banner: banner
                },
                files: {
                   '../../scripts/app.min.js' : ['<%= concat.app.dest %>']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('init', ['bower']);
    grunt.registerTask('build', ['concat', 'replace', 'uglify']);
    grunt.registerTask('default', ['init', 'build']);
};
