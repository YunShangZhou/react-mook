const path = require('path')

const webpackConfigBase = {
    entry: path.join(__dirname, '../src/index.jsx'),
    output: {
        path: path.join(__dirname,'../dist'),
        filename: '[name].[fullhase:4].js'
    },
    resolve: {
        extensions: ['.js','.jsx','.tsx']
    },
    module: {
        rules: [
            {
                test: /\.js[x]/,
                use: 'babel-loader'
            },{
                test: /\.(sc|c)ss/,
                use: ['style-loader','css-loader']
            }
        ]
    }
}

module.exports = webpackConfigBase

