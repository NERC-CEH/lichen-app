module.exports = function(grunt) {
    var DEST = '../../scripts/';
    var NAME = 'theme.js';

    var  banner = "/*!\n" +
        " * <%= pkg.title %>. \n" +
        " * Version: <%= pkg.version %>\n" +
        " *\n" +
        " * <%= pkg.homepage %>\n" +
        " *\n" +
        " * Author <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
        " * Released under the <%= _.pluck(pkg.licenses, 'type').join(', ') %> license.\n" +
        " */\n\n";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
            dist: {
                options: {
                    banner: banner
                },
                // the files to concatenate
                src: [
                    'src/controllers/*.js',
                    'conf.js',
                    'src/app.js'
                ],
                // the location of the resulting JS file
                dest: DEST + NAME
            }
        },
        replace: {
            main: {
                src: ['../../scripts/theme.js'],
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
            }
        },
        uglify: {
            dist: {
                options: {
                    // the banner is inserted at the top of the output
                    banner: banner
                },
                files: {
                   '../../scripts/theme.min.js' : ['<%= concat.dist.dest %>']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['concat', 'replace', 'uglify']);

};
