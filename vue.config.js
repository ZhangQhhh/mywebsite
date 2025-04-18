const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 禁用生产环境的源映射，提高性能并隐藏源代码
  productionSourceMap: false,
  // 配置打包时的优化
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      // 优化性能配置
      config.performance = {
        hints: false // 禁用性能提示
      };
    }
  },
  // 配置构建时的CSS
  css: {
    // 是否将组件中的CSS提取到一个独立的CSS文件中
    extract: process.env.NODE_ENV === 'production',
    // 是否为 CSS 开启 source map
    sourceMap: false
  },
  // 配置开发服务器
  devServer: {
    host: '127.0.0.1',
    port: 8080,
    // 在Vue CLI 5.x中，disableHostCheck已被弃用，使用allowedHosts代替
    allowedHosts: 'all'
  },
  // 配置打包后的输出目录
  outputDir: 'dist',
  // 配置静态资源目录
  assetsDir: 'static',
  // 配置打包后的文件名称
  filenameHashing: true
})
