# html2pdf-template
The template for html2pdf project

## 初始化

`npm install`

## 嵌入字体

- 请将 `ttf` 字体文件放到 `src/fonts/` 目录下，然后执行 `gulp` 进行字体的裁剪/嵌入。

## 新建PDF模板项目

- 安装 `create-project`， `npm install -g create-project`
- 导出项目模板， `create-project [你的新项目名称] MMHK/html2pdf-template`

## 发布外网访问url

- `gulp public`, 执行后会自动打开浏览器访问地址。

## 生成PDF

- 打开 [PDF生成内网版](http://192.168.33.126:4444/sample/)
- 找到 `Covert Link to PDF` ， 将上一步生成的URL copy到输入框，生成pdf。