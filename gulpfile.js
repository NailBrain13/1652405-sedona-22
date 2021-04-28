const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const htmlmin = require("gulp-htmlmin");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

//HTML
const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = htmlmin;

//Images
const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(gulp.dest("build/img"))
}

exports.images = copyImages;

const optimizeImages = () => {
  return gulp.src("build/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}
exports.images = optimizeImages;


//Webp
const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"))
}
exports.createWebp = createWebp;

//Sprite
const sprite = () => {
  return gulp.src("build/img/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
}
exports.sprite = sprite;

//Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.{jpg,png,svg}",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}
exports.copy = copy;

//Clean

const clean = () => {
  return del("build");
};
exports.clean = clean;

//Build
const build = gulp.series(
  clean,
  copy,
  styles,
  html,
  copyImages,
  optimizeImages,
  createWebp,
  sprite
)
exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload
const reload = (done) => {
  sync.reload();
  done();
}

exports.reload = reload;


// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

exports.default = gulp.series(
  clean,
  copy,
  gulp.parallel(
    styles,
    html,
    copyImages,
    optimizeImages,
    createWebp,
    sprite
  ),
  gulp.series(
    server,
    watcher
  ));
