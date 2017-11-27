const gulp       = require('gulp');
const mocha      = require('gulp-mocha');
const eslint     = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

// Lint

gulp.task('lint:src', function() {
  return gulp.src('./src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:bin', function() {
  return gulp.src('./bin/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:test', function() {
  return gulp.src('./test/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Build task

gulp.task('babel:src', function() {
  return gulp.src('./src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2017']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['lint:src', 'babel:src']);

// Tests tasks

gulp.task('test', ['lint:test', 'lint:src', 'lint:bin', 'babel:src'], () =>
	gulp.src('./test/**/*.js', { read: false })
		.pipe(mocha())
);

// Watch tasks

gulp.task('watch', function() {
  gulp.watch('test/**/*.js', ['test']);
  gulp.watch('src/**/*.js', ['test']);
  gulp.watch('bin/**/*.js', ['test']);
});

gulp.task('default', ['test', 'watch']);
