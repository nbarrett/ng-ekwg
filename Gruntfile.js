/*global module*/

module.exports = function (grunt) {

  var DIST_ROOT = 'src/ekwg-legacy';
  var CLIENT_ROOT = 'src/legacy';

  require('load-grunt-tasks')(grunt);

  var files = ['gruntFile.js', 'server.js', 'lib/*.js', 'client/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      pre: [DIST_ROOT],
      post: [DIST_ROOT + '/app/js/tmp']
    },
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: DIST_ROOT + '/app/js/tmp',
          src: '<%= pkg.name %>.js',
          dest: DIST_ROOT + '/app/js'
        }]
      }
    },
    concat: {
      options: {
        separator: '\n\n',
        process: function (src, filepath) {
          return '/* concatenated from ' + filepath + ' */\n\n' + src;
        }
      },
      app: {
        src: [CLIENT_ROOT + '/app/js/globals.js', CLIENT_ROOT + '/app/js/app.js', CLIENT_ROOT + '/app/js/!(globals).js', CLIENT_ROOT + '/app/js/!(app).js'],
        dest: DIST_ROOT + '/app/js/tmp/<%= pkg.name %>.js',
        nonull: true
      }
    }
  });

  grunt.registerTask('dist', ['concat:app', 'ngAnnotate:dist']);
  grunt.registerTask('client', ['clean:pre', 'dist', 'clean:post']);
};
