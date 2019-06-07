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
      angular: {
        src: [
          CLIENT_ROOT + '/vendor/angular/angular.min.js',
          CLIENT_ROOT + '/vendor/angular-resource/angular-resource.min.js',
          CLIENT_ROOT + '/vendor/angular-route/angular-route.min.js',
          CLIENT_ROOT + '/vendor/angular-sanitize/angular-sanitize.min.js',
          CLIENT_ROOT + '/vendor/angular-cookies/angular-cookies.min.js',
          CLIENT_ROOT + '/vendor/angular-animate/angular-animate.min.js'],
        dest: DIST_ROOT + '/vendor/angular/angular-all.js'
      },
      app: {
        src: [CLIENT_ROOT + '/app/js/globals.js', CLIENT_ROOT + '/app/js/app.js', CLIENT_ROOT + '/app/js/!(globals).js', CLIENT_ROOT + '/app/js/!(app).js'],
        dest: DIST_ROOT + '/app/js/tmp/<%= pkg.name %>.js',
        nonull: true
      }
    }
  });

  grunt.registerTask('dist', ['concat:angular', 'concat:app', 'ngAnnotate:dist']);
  grunt.registerTask('client', ['clean:pre', 'dist', 'clean:post']);
};
