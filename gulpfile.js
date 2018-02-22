var gulp = require("gulp");
var fontmin = require("gulp-fontmin");
var GulpSSH = require('gulp-ssh');
var open = require('gulp-open');


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

gulp.task('public:html', function () {
    return gulp.src('./*.html')
        .pipe(gulpSSH.dest(config.prefix))
});

gulp.task('public:fonts', function () {
    return gulp.src('./fonts/*.*')
        .pipe(gulpSSH.dest(config.prefix + "fonts/"))
});

gulp.task('public:css', function () {
    return gulp.src('./*.css')
        .pipe(gulpSSH.dest(config.prefix))
});

function minifyFont(text, cb) {
    gulp
        .src('src/fonts/*.ttf')
        .pipe(fontmin({
            text: text
        }))
        .pipe(gulp.dest('./fonts/'))
        .on('end', cb);
}
 
gulp.task('font', function(cb) {
 
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
gulp.task("public", ["public:html", "public:fonts", "public:css"], function () {
    gulp.src(__filename)
        .pipe(open({uri: remote}));
});

gulp.task("default", ["font"]);