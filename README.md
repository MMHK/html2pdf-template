# html2pdf-template
The template for html2pdf project

## 初始化

`npm install`

## 嵌入字体

- 请将**中文** `ttf` 字体文件放到 `src/fonts/chi` 目录下，然后执行 `gulp font` 进行字体的裁剪/嵌入。
- 请将**英文** `ttf` 字体文件放到 `src/fonts/eng` 目录下，然后执行 `gulp font:eng` 生成对应的webfont集合。

## 新建PDF模板项目

- 安装 `create-project`， `npm install -g create-project`
- 导出项目模板， `create-project [你的新项目名称] MMHK/html2pdf-template`

## 发布外网访问url

- `gulp public`, 执行后会自动打开浏览器访问地址。

## 生成PDF

- 打开 [PDF生成内网版](http://192.168.33.126:4444/sample/)
- 找到 `Covert Link to PDF` ， 将上一步生成的URL copy到输入框，生成pdf。

## PDF A4尺寸说明

- 现在的PDF生成器，是按照150PDI的分辨率生成PDF，所以单页的尺寸是 1240px x 1754px
- 而且生成PDF并没有按照print的media query进行处理。
- 真实的打印中，页面需要加入 print media query的规则(暂时chrome 支持最好)，[具体css规则说明](http://www.css88.com/archives/4731)

