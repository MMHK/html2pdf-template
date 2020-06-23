const gulp = require("gulp");
const fontmin = require("gulp-fontmin");
const GulpSSH = require('gulp-ssh');
const open = require('gulp-open');
const fonteditor = require("./src/fonteditor");
const webserver = require('gulp-webserver');


const dir = {
    path: Date.now()
};
const remote = "http://pdf.demo2.mixmedia.com/" + dir.path;

const config = {
    host: '192.168.33.6',
    port: 222,
    username: 'temp',
    password : 'temp',
    prefix: "/webroot/" + dir.path + "/"
};

const gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config
});

/**
 * 发布子任务，发布文件
 */
gulp.task('public:asset', function () {
    return gulp.src('./dist/**/*')
        .pipe(gulpSSH.dest(config.prefix))
});

function minifyFont(text) {
    return gulp
        .src('src/fonts/chi/*.ttf')
        .pipe(fontmin({
            text: text
        }))
        .pipe(gulp.dest('./fonts/'))
}

/**
 * 将英文字体转换成webfont
 */
gulp.task("font:eng", function () {
    return gulp.src(["./src/fonts/eng/*.ttf"])
        .pipe(fonteditor())
        .pipe(gulp.dest("./fonts/"))
});
/**
 * 将中文字体裁剪转换成webfont
 */
gulp.task("font:chi", function () {
    const buffers = [];
    return gulp
        .src('./*.html')
        .on('data', function(file) {
            buffers.push(file.contents);
        })
        .on('end', function() {
            const text = Buffer.concat(buffers).toString('utf-8');
            return minifyFont(text);
        });
});

/**
 * 压缩中文字体
 */
gulp.task('font', gulp.parallel("font:eng", "font:chi"));

//打包模版
gulp.task("build", gulp.series("font", gulp.parallel((callback) => {
    gulp.src([
        "./*.html",
        "./*.css"
    ])
        .pipe(gulp.dest("./dist/"))
        .on("end", function(){
            callback();
        })
}, (callback) => {
    gulp.src("./asset/**/*")
        .pipe(gulp.dest("./dist/asset/"))
        .on("end", function(){
            callback();
        });
}, (callback) => {
    gulp.src("./fonts/*")
        .pipe(gulp.dest("./dist/fonts/"))
        .on("end", () => {
            callback();
        });
})));


gulp.task("public", gulp.series("build", "public:asset", (callback) => {
    gulp.src(__filename)
        .pipe(open({uri: remote}))
        .on("end", () => {
            callback()
        });
}));

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

gulp.task("default", gulp.series("font"));