'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var path = require('path');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");


/**
 * 压缩js
 */
gulp.task('jsmin', function() {
    return gulp.src('builds/js/*.js')
        .pipe(uglify())
        .pipe(rename(function(path) {
            path.basename += '.min'
        }))
        .pipe(gulp.dest('builds/compressed/js'));
});
/**
 * 启动服务器
 */
gulp.task('default', function() {
    browserSync({
        server: true
    });
});
