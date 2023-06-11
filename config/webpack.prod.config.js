const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

// const OpenBrowserPlugin = require("open-browser-webpack4-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpackConfigBase = require("./webpack.base.config");

// const PORT = 8080;

const webpackConfigDev = {
  mode: "development",
  plugins: [
    new CleanWebpackPlugin({
      protectWebpackAssets: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[fullhase:4].css'
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      title: "React APP",
      filename: "index.html",
      template: path.join(__dirname, "../src/index.html"),
    }),
  ],
  devtool: 'eval-source-map',
};

module.exports = merge(webpackConfigBase, webpackConfigDev);
