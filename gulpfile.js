var gulp = require("gulp");
var fontmin = require("gulp-fontmin");


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

gulp.task("default", ["font"]);