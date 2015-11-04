var gulp = require('gulp');
var concat = require('gulp-concat');

var paths = {
  scripts: './src/js/*.js',
  data: './data/*.js'
};

gulp.task('scripts', function() {
  return gulp.src([paths.scripts, paths.data])
    .pipe(concat('out/script.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('copy', function () {
  return gulp
    .src(['src/index.html', 'src/css/*.css')
    .pipe(gulp.dest('out'))
})

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts, copy']);
})