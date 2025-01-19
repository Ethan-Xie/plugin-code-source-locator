## Vite 插件

1. 在dom元素节点上，可查看vue组件代码路径，还支持按住alt键点击鼠标右键，可跳转到编辑器打开对应代码，极大地提升开发者的开发和调试效率。
2. JS 代码定位日志插件：支持在控制台中打印 JS 代码的定位信息，包括函数名、该函数执行所花时间信息。
> 该功能默认关闭，你可以在入口文件 index.html 中直接设置 window.jsDebug = true 来启用该功能，也可以在控制台中进行临时打开或关闭。

## 如何使用

pnpm i -D plugin-code-source-locator

## 配置

在 .env.development 文件中配置自动打开文件的编辑器，此功能需要配置好编辑器命令行运行的环境变量。

然后在 vite.config.ts 文件中实例化插件，示例如下：
```
import sourceLocator from 'plugin-code-source-locator';

export default defineConfig({
  plugins: [
      sourceLocator(env),
  ],
});
```
然后，你可以通过在页面上按下 alt 键并左键点击元素来定位组件文件。


## JS 代码定位日志插件

该功能默认关闭，你可以在入口文件 index.html 中直接设置 window.jsDebug = true 来启用该功能，也可以在控制台中进行临时打开或关闭。