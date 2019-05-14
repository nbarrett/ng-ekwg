/*global module*/

module.exports = function(grunt) {

  var DIST_ROOT = 'src/ekwg-legacy';
  var CLIENT_ROOT = 'src/legacy/src';

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
        process: function(src, filepath) {
          return '/* concatenated from ' + filepath + ' */\n\n' + src;
        }
      },
      angular_min: {
        src: [
          CLIENT_ROOT + '/vendor/angular/angular.min.js',
          CLIENT_ROOT + '/vendor/angular-resource/angular-resource.min.js',
          CLIENT_ROOT + '/vendor/angular-route/angular-route.min.js',
          CLIENT_ROOT + '/vendor/angular-sanitize/angular-sanitize.min.js',
          CLIENT_ROOT + '/vendor/angular-cookies/angular-cookies.min.js',
          CLIENT_ROOT + '/vendor/angular-animate/angular-animate.min.js'],
        dest: DIST_ROOT + '/vendor/angular/angular-all.js'
      },
      angular: {
        src: [
          CLIENT_ROOT + '/vendor/angular/angular.js',
          CLIENT_ROOT + '/vendor/angular-resource/angular-resource.js',
          CLIENT_ROOT + '/vendor/angular-route/angular-route.js',
          CLIENT_ROOT + '/vendor/angular-sanitize/angular-sanitize.js',
          CLIENT_ROOT + '/vendor/angular-cookies/angular-cookies.js',
          CLIENT_ROOT + '/vendor/angular-animate/angular-animate.js'],
        dest: DIST_ROOT + '/vendor/angular/angular-all.js'
      },
      app: {
        src: [CLIENT_ROOT + '/app/js/globals.js', CLIENT_ROOT + '/app/js/app.js', CLIENT_ROOT + '/app/js/!(globals).js', CLIENT_ROOT + '/app/js/!(app).js'],
        dest: DIST_ROOT + '/app/js/tmp/<%= pkg.name %>.js',
        nonull: true
      }
    },
    copy: {
      vendor: {
        files: [
          {expand: true, cwd: 'node_modules/angular-logger/dist', src: 'angular-logger.min.js', dest: DIST_ROOT + '/vendor/angular-logger'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular-easyfb/build', src: 'angular-easyfb.min.js', dest: DIST_ROOT + '/vendor/angular-easyfb'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angularjs-mongolab-promise', src: 'mongolabResourceHttp.js', dest: DIST_ROOT + '/vendor/angularjs-mongolab-promise'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular-bootstrap', src: 'ui-bootstrap-tpls.min.js', dest: DIST_ROOT + '/vendor/angular-bootstrap'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular-modal-service/dst', src: 'angular-modal-service.*', dest: DIST_ROOT + '/vendor/angular-modal-service'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular-ui-select/dist', src: 'select*', dest: DIST_ROOT + '/vendor/angular-ui-select'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/ng-file-upload', src: 'ng-file-upload.min.js', dest: DIST_ROOT + '/vendor/ng-file-upload'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/ng-csv/build', src: 'ng-csv.min.js', dest: DIST_ROOT + '/vendor/ng-csv'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular', src: 'angular.min.js.map', dest: DIST_ROOT + '/vendor/angular'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular-cookies', src: 'angular-cookies.min.js.map', dest: DIST_ROOT + '/vendor/angular'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/bootstrap/dist', src: '**/*.*', dest: DIST_ROOT + '/vendor/bootstrap/dist'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/font-awesome/css', src: '**/*.*', dest: DIST_ROOT + '/vendor/font-awesome/css'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/font-awesome/fonts', src: '**/*.*', dest: DIST_ROOT + '/vendor/font-awesome/fonts'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/font-awesome/less', src: '**/*.*', dest: DIST_ROOT + '/vendor/font-awesome/less'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/font-awesome/scss', src: '**/*.*', dest: DIST_ROOT + '/vendor/font-awesome/scss'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/html5boilerplate', src: '**/*.css', dest: DIST_ROOT + '/vendor/html5boilerplate'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/jquery/dist', src: 'jquery.slim.min.*', dest: DIST_ROOT + '/vendor/jquery'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/json3', src: 'json3.min.js', dest: DIST_ROOT + '/vendor/json3'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/moment/min', src: 'moment.min.js', dest: DIST_ROOT + '/vendor/moment/min'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/moment-timezone/builds', src: 'moment-timezone-with-data.min.js', dest: DIST_ROOT + '/vendor/moment/min'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/es5-shim', src: '**/*.*', dest: DIST_ROOT + '/vendor/es5-shim'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/respond/dest', src: 'respond.min.js', dest: DIST_ROOT + '/vendor/respond'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/html5shiv/dist', src: 'html5shiv.min.js', dest: DIST_ROOT + '/vendor/respond'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/underscore', src: '**/*underscore-min.*', dest: DIST_ROOT + '/vendor/underscore'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/underscore.string/dist', src: 'underscore.string.min.js', dest: DIST_ROOT + '/vendor/underscore-string'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/showdown/dist', src: 'showdown.min.js*', dest: DIST_ROOT + '/vendor/showdown'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/angular-markdown-directive', src: 'markdown.js', dest: DIST_ROOT + '/vendor/angular-markdown-directive'},
          {expand: true, cwd: CLIENT_ROOT + '/vendor/xml2json', src: '**/*.*', dest: DIST_ROOT + '/vendor/xml2json'}
        ]
      },
      appChangingRarely: {
        files: [
          {expand: true, cwd: CLIENT_ROOT, src: '*.html', dest: DIST_ROOT},
          {expand: true, cwd: CLIENT_ROOT + '/new', src: '*.html', dest: DIST_ROOT + '/new'},
          {expand: true, cwd: CLIENT_ROOT + '/assets/fonts', src: '**/*.*', dest: DIST_ROOT + '/assets/fonts'},
          {expand: true, cwd: CLIENT_ROOT + '/assets/images', src: '**/*.*', dest: DIST_ROOT + '/assets/images'}
        ]
      },
      appChangingOften: {
        files: [
          {expand: true, cwd: CLIENT_ROOT, src: '*.html', dest: DIST_ROOT},
          {expand: true, cwd: CLIENT_ROOT + '/partials', src: '**/*.html', dest: DIST_ROOT + '/partials'},
          {expand: true, cwd: CLIENT_ROOT + '/new', src: '*.html', dest: DIST_ROOT + '/new'},
          {expand: true, cwd: CLIENT_ROOT + '/assets/css', src: '**/*.*', dest: DIST_ROOT + '/assets/css'}
        ]
      }
    },
    watch: {
      files: files,
      tasks: 'default timestamp'
    },
    jshint: {
      files: files,
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        globals: {require: false, __dirname: false, console: false, module: false, exports: false}
      }
    }
  });

  grunt.registerTask('default', ['run']);

  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });

  grunt.registerTask('server', function() {
    this.async();
    require('supervisor').run(['server.js']);
  });

  grunt.registerTask('dist', ['concat:angular', 'concat:app', 'ngAnnotate:dist', 'copy']);
  grunt.registerTask('client', ['clean:pre', 'dist', 'clean:post']);
  grunt.registerTask('run', ['client', 'server']);
};
