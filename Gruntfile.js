module.exports = function (grunt) {

  grunt.initConfig({
     pkg: grunt.file.readJSON('package.json'),
     uglify: {
      options: {
        compress: {
          sequences     : true,  // join consecutive statemets with the “comma operator”
          properties    : true,  // optimize property access: a["foo"] → a.foo
          dead_code     : true,  // discard unreachable code
          drop_debugger : true,  // discard “debugger” statements
          unsafe        : true, // some unsafe optimizations (see below)
          unsafe_comps  : true,
          conditionals  : true,  // optimize if-s and conditional expressions
          comparisons   : true,  // optimize comparisons
          evaluate      : true,  // evaluate constant expressions
          booleans      : true,  // optimize boolean expressions
          loops         : true,  // optimize loops
          unused        : true,  // drop unused variables/functions
          hoist_funs    : true,  // hoist function declarations
          hoist_vars    : false, // hoist variable declarations
          if_return     : true,  // optimize if-s followed by return/continue
          join_vars     : true,  // join var declarations
          cascade       : true,  // try to cascade `right` into `left` in sequences
          side_effects  : true,  // drop side-effect-free statements
          negate_iife   :true,
          pure_getters  :true,
          warnings      : true,  // warn about potentially dangerous optimizations/code
          global_defs   : {},    // global definitions
          drop_console  :true,          
        },
        mangle: {
          toplevel      :true,
        },

      },
       build: {
        files: {
          'dist/testgame.min.js': 'dist/concat.min.js'
        }
        }
     },
     concat: {
    options: {
      separator: ';',
    },
    dist: {
      src: ['src/js/kontra.js','src/js/TinyMusic.js','src/js/text.js','src/js/game.js','src/js/music.js','src/js/game.js'],
      dest: 'dist/concat.min.js',
    },
  },
     processhtml: {
       dist: {
         options: {
           process: true,
           data: {
             title: 'A Day In The Life',
           }
         },
         files: {
           'dist/index.min.html': ['src/production.html']
         }
       }
     },
     htmlmin: {
       dist: {
         options: {
           removeComments: true,
           collapseWhitespace: true
         },
         files: {
           'dist/index.html': 'dist/index.min.html'
         }
       }
     },

     compress: {
      main: {
        options: {
          archive: 'dist/game.zip',
          mode: 'zip',
          level: 9
        },
        files: [{
          expand: true,
          flatten: false,
          cwd: './dist',
          src: ['index.html', 'img/*'],
          dest: './'
        }]
      }
    },

    copy: {
    main: {
      files: [
        {expand: true, flatten: true, src: ['src/img/*'], dest: 'dist/img', filter: 'isFile'},
      ],
    },
  },

     clean: ['dist*//*.min.*']


   });

  var fs = require('fs');
  grunt.registerTask('sizecheck', function() {
    var done = this.async();
    fs.stat('dist/game.zip', function(err, zip) {
      if (zip.size > 13312) {
        //If size in bytes greater than 13kb
        grunt.log.error("Zipped file greater than 13kb \x07 \n");
        grunt.log.error("WARNING! FILESIZE IS TOO BIG!");
        grunt.log.error("Zip is " + zip.size + " bytes when js13k max is 13,312 bytes");
      }else{
        grunt.log.error("Zip is " + zip.size + " bytes!");
        grunt.log.error("Filesize OK!");
      }
      done();
    });
  });
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat','uglify', 'processhtml', 'htmlmin', 'copy','compress','sizecheck', 'clean']);
};