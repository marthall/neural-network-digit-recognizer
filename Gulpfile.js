var gulp = require('gulp');
var concat = require('gulp-concat');

var paths = {
  scripts: './lib/*.js',
  data: './data/*.js'
};

gulp.task('scripts', function() {
  return gulp.src([paths.scripts, paths.data])
    .pipe(concat('out/script.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
})