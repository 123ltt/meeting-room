module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = '会议室预约看板'
        return args
      })
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3100/'
      }
    }
  }
}
