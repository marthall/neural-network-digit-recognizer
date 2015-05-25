var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function() {
  return gulp.src(['./lib/*.js', './data/*.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('.'));
});