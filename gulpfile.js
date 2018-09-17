var gulp = require("gulp");
var fontmin = require("gulp-fontmin");
var GulpSSH = require('gulp-ssh');
var open = require('gulp-open');
var fonteditor = require("./src/fonteditor");
var webserver = require('gulp-webserver');


var dir = {
    path: Date.now()
};
var remote = "http://pdf.demo2.mixmedia.com/" + dir.path;

var config = {
    host: '192.168.33.6',
    port: 222,
    username: 'temp',
    password : 'temp',
    prefix: "/webroot/" + dir.path + "/"
};

var gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config
});

/**
 * 发布子任务，发布html文件
 */
gulp.task('public:html', function () {
    return gulp.src('./*.html')
        .pipe(gulpSSH.dest(config.prefix))
});
/**
 * 发布子任务，发布字体文件
 */
gulp.task('public:fonts', function () {
    return gulp.src('./fonts/*.*')
        .pipe(gulpSSH.dest(config.prefix + "fonts/"))
});
/**
 * 发布子任务，发布css文件
 */
gulp.task('public:css', function () {
    return gulp.src('./*.css')
        .pipe(gulpSSH.dest(config.prefix))
});
/**
 * 发布子任务，发布静态资源文件
 */
gulp.task('public:asset', function () {
    return gulp.src('./asset/**/*')
        .pipe(gulpSSH.dest(config.prefix + "asset/"))
});

function minifyFont(text, cb) {
    gulp
        .src('src/fonts/chi/*.ttf')
        .pipe(fontmin({
            text: text
        }))
        .pipe(gulp.dest('./fonts/'))
        .on('end', cb);
}
/**
 * 压缩中文字体
 */
gulp.task('font', ["font:eng"],function(cb) {
    var buffers = [];
    gulp
        .src('./*.html')
        .on('data', function(file) {
            buffers.push(file.contents);
        })
        .on('end', function() {
            var text = Buffer.concat(buffers).toString('utf-8');
            minifyFont(text, cb);

        });
});
gulp.task("public", ["public:html", "public:fonts", "public:asset" ,"public:css"], function () {
    gulp.src(__filename)
        .pipe(open({uri: remote}));
});
/**
 * 将英文字体转换成webfont
 */
gulp.task("font:eng", function () {
    gulp.src(["./src/fonts/eng/*.ttf"])
        .pipe(fonteditor())
        .pipe(gulp.dest("./fonts/"))
});

/**
 * 开发服务器
 */
gulp.task("dev", function () {
    gulp.src('./')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: true
        }));
});

gulp.task("default", ["font"]);