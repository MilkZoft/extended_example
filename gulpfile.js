var gulp = require('gulp');

// Tasks
gulp.task('browserify', require('./gulp/browserify'));

// Watch
gulp.task('watch', function() {
  gulp.watch('source/**/*.js', ['browserify']);
});

// Specific Tasks
gulp.task('build', ['browserify']);
gulp.task('default', ['build']);
