const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const webpackConfigBase = {
  entry: path.join(__dirname, '../src/index.jsx'),
  output: {
    path: path.join(__dirname, '../dist'),
    filename: '[name].[fullhase:4].js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.[j|t]s[x]/,
        use: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sc|c)ss/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};

module.exports = webpackConfigBase;
