"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var del = require("del");
var copy = require("gulp-copy");
var rename = require("gulp-rename");
var cssmin = require("gulp-csso");
var jsmin = require("gulp-minify");
var webp = require("gulp-webp");
var imgmin = require("gulp-imagemin");
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");
var run = require("run-sequence");
var rsp = require('remove-svg-properties').stream;

gulp.task("clean", function () {
  return del("build");
});

gulp.task("imgmin-content", function () {
  return gulp.src("img/content/*.{jpg,png,svg}")
    .pipe(imgmin([
      imgmin.jpegtran({progressive: true}),
      imgmin.optipng({optimizationLevel: 5}),
      imgmin.svgo()
    ]))
    .pipe(gulp.dest("build/img/content"));
});

gulp.task("imgmin-bg", function () {
  return gulp.src("img/backgrounds/*.{jpg,png,svg}")
    .pipe(imgmin([
      imgmin.jpegtran({progressive: true}),
      imgmin.optipng({optimizationLevel: 5}),
      imgmin.svgo()
    ]))
    .pipe(gulp.dest("build/img/backgrounds"))
});

gulp.task("imgmin-logo", function () {
  return gulp.src("img/logo/*.svg")
    .pipe(imgmin([
      imgmin.svgo()
    ]))
    .pipe(gulp.dest("build/img/logo"));
});

gulp.task("webp", ["imgmin-content"], function () {
  return gulp.src("build/img/content/*.jpg")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img/content"));
});

gulp.task("copy-decor", function () {
  return gulp.src("img/decor/*.{jpg,png,ico,svg}")
    .pipe(gulp.dest("build/img/decor"));
});

gulp.task("svg-sprite", function () {
  return gulp.src("img/svg/*.svg")
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("svg-fill-remove", function () {
  return gulp.src("img/svg/*.svg")
    .pipe(rsp.remove({
      properties: [rsp.PROPS_FILL]
    }))
    .pipe(gulp.dest("img/svg-fill-removed"));
});

gulp.task("copy-fonts", function () {
  return gulp.src("fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"));
});

gulp.task("copy-html", function () {
  return gulp.src("*.html")
    .pipe(copy("build"))
    .pipe(server.reload({stream: true}))
});

gulp.task("minify-js", function () {
  return gulp.src("js/*.js")
    .pipe(gulp.dest("build/js"))
    .pipe(jsmin({
      ext: {
        min: ".min.js"
      }
    }))
    .pipe(gulp.dest("build/js"))
    .pipe(server.reload({stream: true}));
});

gulp.task("style", function () {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(cssmin())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("serve", ["watch"], function () {
  server.init({
    server: "build",
    notify: false,
    open: true,
    port: process.env.PORT || 5000,
    cors: true,
    ui: false
  });
});

gulp.task("watch", function () {
  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("js/*.js", ["minify-js"]);
  gulp.watch("*.html", ["copy-html"]);
});
gulp.task('default', ['watch']);

gulp.task("build", function (done) {
  run(
    "clean",
    "imgmin-bg",
    "webp",
    "imgmin-logo",
    "copy-decor",
    "svg-sprite",
    "copy-fonts",
    "copy-html",
    "minify-js",
    "style",
    done
  );
});
