const through = require('through2');
const gutil = require('gulp-util');
const File = gutil.File;
const sources = []; // store the source file paths
const Font = require('fonteditor-core').Font;
const path = require("path");
const fs = require('fs');

// Consts
const PLUGIN_NAME = 'gulp-mm-webfont';
const WEB_FONT_TYPE = ["eot", "woff", "svg", "ttf"];

const bufferContents = function(file, enc, cb) {
    if (file.isNull()) {
        return cb();
    }

    if (file.isStream()) {
        cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return;
    }
    else if (file.isBuffer()) {
        const ext = path.extname(file.path).toLowerCase().replace(".", "");
        const font = Font.create(file.contents, {
            type: ext, // support ttf,woff,eot,otf,svg
            hinting: true, // save font hinting
            compound2simple: true, // transform ttf compound glyf to simple
            inflate: null, // inflate function for woff
            combinePath: false // for svg path
        });

        const fontName = font.get().name.postScriptName;

        WEB_FONT_TYPE.forEach(function (type) {
            let buf = font.write({
                type: type,
                toBuffer: true,
                hinting: true,
                deflate: null
            });
            if (!Buffer.isBuffer(buf)) {
                buf = Buffer.from(buf);
            }
            const _file = new File({
                cwd: file.cwd,
                base: file.base,
                path: path.join(file.base, fontName + "." + type),
                contents: buf
            });
            sources.push(_file);
        });
    }
    cb();
};


const endStream = function (cb) {
    // all the input files are in, now convert them
    const self = this;
    if (sources.length <= 0) {
        cb();
        return;
    }

    sources.forEach(function (file) {
        self.push(file);
    });
    cb();
    gutil.log("webfont generated")
};
function gulpWebfont(o) {
    options = o || {};
    // Creating a stream through which each file will pass
    return through.obj(bufferContents, endStream);
}

// Exporting the plugin main function
module.exports = gulpWebfont;