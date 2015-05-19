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
          'src/helpers.js',
          'conf.js',
          'src/app.js'
        ],
				// the location of the resulting JS file
				dest: DEST + APP_NAME
			},
			libs: {
				// the files to concatenate
				src: [
					'src/lib/d3/d3.js',
					'src/lib/IndexedDBShim/IndexedDBShim.js',
					'src/lib/latlon/latlon-ellipsoidal.js',
          'src/lib/latlon/vector3d.js',
          'src/lib/latlon/dms.js',
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
        src: [DEST + APP_NAME],
        overwrite: true, // overwrite matched source files
        replacements: [{
          from: /(VERSION:).*version grunt replaced/g, // string replacement
          to: '$1 \'<%= pkg.version %>\','
        },
          {
            from: /(NAME:).*name grunt replaced/g,  // string replacement
            to: '$1 \'<%= pkg.name %>\','
          }
        ]
      },
		libs: {
			src: ['../../scripts/' + LIBS_NAME],
			overwrite: true, // Fix klass.js no ';' problem
			replacements: [{
          from: '\/\/ PhotoSwipe',
          to: ';\/\/ photoswipe'
        },
        {
          from: 'use strict',
          to: ''
        },
        {
          from: 'shim(\'indexedDB\', idbModules.shimIndexedDB);',
          to:  'shim(\'_indexedDB\', idbModules.shimIndexedDB);'
        },
        {
          from: 'shim(\'IDBKeyRange\', idbModules.IDBKeyRange);',
          to:  'shim(\'_IDBKeyRange\', idbModules.IDBKeyRange);'
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
