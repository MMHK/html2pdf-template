# html2pdf-template
The template for html2pdf project

## 初始化

`npm install` 或 `yarn install`

## 嵌入字体

- 先准备好 `@font-face` block。
```
@font-face {
font-family: "[FontName]";
font-path: "../fonts/[FontName].ttf";
src: url("../fonts/[FontName].ttf") format("truetype");
font-style: normal;
font-weight: 400;
}
```
- 按 `webfont` 规矩，请将 `ttf` 字体文件放到 `src` 目录下。
- 然后补完 `woff` `woff2` `svg` `eot` 文件，只需要 ttf 文件需要有内容，其他文件新建空白文件即可。
  `PostCSS` 的 `fontpath` plugin 会自动根据 `font-path`，补完其他 webfont 字型的定义。
  
## 新建PDF模板项目

- 安装 `create-project`， `npm install -g create-project`
- 导出项目模板， `create-project [你的新项目名称] MMHK/html2pdf-template`

## 发布外网访问url

- `yarn serve`, 选择 `允许外网访问` 。

## 生成PDF

- 打开 [PDF生成内网版](http://192.168.33.6:4444/sample/)
- 找到 `Covert Link to PDF` ， 将上一步生成的URL copy到输入框，生成pdf。

## 打包模版

`yarn build`, 执行后会将模版资源打包到 `dist`目录下。

## 开发服务器

```bash
yanr 
```

## PDF A4尺寸说明

- 现在的PDF生成器，是按照150PDI的分辨率生成PDF，所以单页的尺寸是 1240px x 1754px
- 而且生成PDF并没有按照print的media query进行处理。
- 真实的打印中，页面需要加入 print media query的规则(暂时chrome 支持最好)，[具体css规则说明](http://www.css88.com/archives/4731)

