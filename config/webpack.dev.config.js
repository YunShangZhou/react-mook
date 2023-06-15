const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const OpenBrowserPlugin = require("open-browser-webpack4-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-v5-plugin");
const webpackConfigBase = require("./webpack.base.config");
const mockMiddleware = require('./mock.config');

const swp = new SpeedMeasurePlugin();

const PORT = 8081;

const webpackConfigDev = {
  mode: "development",
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热更新插件
    new HtmlWebpackPlugin({
      inject: "body",
      title: "React APP",
      filename: "index.html",
      template: path.join(__dirname, "../src/index.html"),
    }),
    new OpenBrowserPlugin({
      url: `http://localhost:${PORT}/#/`,
    }),
  ],
  devtool: 'eval-source-map',
  devServer: {
    // host: '0.0.0.0',
    proxy: {
      '/': {
        target: 'http://localhost:3000/mock/11',
      },
    },
    // static: path.join(__dirname, '.'),
    // historyApiFallback: false,
    onBeforeSetupMiddleware(devServer) {
      // const { app } = devServer
      // const projectDir = path.resolve()
      // const mockDir = './mock';
      // app.use(mockMiddleware({ projectDir, mockDir }))
    },
  },
};

module.exports = merge(webpackConfigBase, webpackConfigDev);
// module.exports = swp.wrap(merge(webpackConfigBase, webpackConfigDev));
