"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var sass = require("gulp-sass");

sass.compiler = require('node-sass');

const fusv = require('find-unused-sass-variables');
// 'scss' is a folder
let unused = fusv.find('source/sass');

var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var imagemin =require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var webp =require("gulp-webp");
var posthtml = require("gulp-posthtml");
var del = require("del");
var include = require("posthtml-include");
var bem_validate = require("bem-validate");

gulp.task("unused", function() {
  console.log(unused.unused);
  // ['$foo', '$bar', '$imunused']
  console.log(unused.total);
// Total number of variables in the files
})

gulp.task("clean", function () {
  return del("build");
});

gulp.task("webp", function (){
  return gulp.src("source/img/**/*.{png,jpg,jpeg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
});

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png,jpeg,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
});

gulp.task ("sprite", function () {
  return gulp.src("source/img/sprite/*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
});

/*adds sprite to html*/
gulp.task("html", function(){
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/"
  });

  gulp.watch("source/sass/**/*.scss",gulp.series("css","refresh"));
  gulp.watch("source/img/sprite/*.svg", gulp.series("sprite","html","refresh"));
  gulp.watch("source/*.html", gulp.series("html","refresh"));
// watches if new images were added from source/img
  gulp.watch("source/img/**/*.{png,jpg,svg,webp}",gulp.series("copy","refresh"))
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("copy", function() {
  return gulp.src([
    "source/img/**/*.{png,jpg,jpeg,svg,webp,ico}",
    "source/js/**/*.js",
  ],{
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "html",
  "refresh"
));

gulp.task("start", gulp.series("build", "server"));
