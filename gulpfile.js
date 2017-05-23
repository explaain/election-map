/* Building front-end for both Development and Production */

const
gulp = require('gulp'),
JSuglify = require('gulp-uglify'),
CSSuglify = require('gulp-uglifycss'),
browserify = require('gulp-browserify'),
concat = require('gulp-concat'),
babel = require('gulp-babel'),
download = require('gulp-download'),
insert = require('gulp-insert'),
runSequence = require('run-sequence')
watch = require('gulp-watch')
;

/* Lists and variables - feel free to modify */

// Files and folders to be watched during development
const watchFiles = [
  'conf/*',
  'views/*/*',
  'views/main.js',
  'services/*',
  'models/*',
  'services/*',
  'package.json',
  'public/css/*',
  'public/data/*',
  'public/img/*',
  'public/js/*',
];

// JS Files to compile (babel, browserify)
const JSIndex = [
  'views/main.js'
];

// JS Files to concat and compress
const JSFiles = [
  'public/js/jquery.js',
  'public/js/bootstrap.js',
  'public/js/leaflet.js',
  'public/data/boundaries.js',
  'public/data/allParties.js',
  'public/data/testdata.js',
  'views/main.js.tmp',
];

// CSS files to concat and compress
const CSSFiles = [
  'public/css/normalize.css',
  'public/css/bootstrap.css',
  'public/css/fontawesome.css',
  'public/css/explaain.css',
  'public/css/leaflet.css',
  'public/css/main.css',
];

/* General tasks */

// No general tasks

/* Production only tasks */

// This task browserifies index.js and then transcodes it to ES5
gulp.task('js-build-main-production', function(){
  return gulp.src(JSIndex)
  .pipe(browserify())
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(concat('main.js.tmp'))
  .pipe(gulp.dest('views'));
});

// This task concats and compresses JS for production
gulp.task('js-pack-production', function(){
  return gulp.src(JSFiles)
  .pipe(concat('compiled.js'))
  .pipe(JSuglify())
  .pipe(gulp.dest('public'));
});

// This task concats and compresses CSS for production
gulp.task('css-pack-production', function(){
  return gulp.src(CSSFiles)
  .pipe(concat('compiled.css'))
  .pipe(CSSuglify())
  .pipe(gulp.dest('public'));
});

// This task runs a sequence of tasks for production build
gulp.task('build-production', function(done){
  runSequence(
    'js-build-main-production',
    'js-pack-production',
    'css-pack-production',
    function() {
      done();
    }
  )
});

/* Development only tasks */

// This task browserifies index.js
gulp.task('js-build-main-development', function(){
  return gulp.src(JSIndex)
  .pipe(browserify())
  .pipe(concat('main.js.tmp'))
  .pipe(gulp.dest('views'));
});

// This task concats and compresses JS for production
gulp.task('js-pack-development', function(){
  return gulp.src(JSFiles)
  .pipe(concat('compiled.js'))
  .pipe(gulp.dest('public'));
});

// This task concats and compresses CSS for production
gulp.task('css-pack-development', function(){
  return gulp.src(CSSFiles)
  .pipe(concat('compiled.css'))
  .pipe(gulp.dest('public'));
});

// This task runs the app and watches front-end files
gulp.task('watch-development', function () {
  runSequence('build-development');
  gulp.watch(watchFiles, ['build-development']);
});

// This task runs a sequence of tasks for development build
gulp.task('build-development', function(done){
  console.log("Watch: Files building... " + (new Date()))
  runSequence(
    'js-build-main-development',
    'js-pack-development',
    'css-pack-development',
    function() {
      console.log("Watch: Files built.      " + (new Date()))
      done();
    }
  )
});
