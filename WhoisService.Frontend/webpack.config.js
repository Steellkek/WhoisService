﻿'use strict';

let webpack = require('webpack');
let path = require('path');

const bundleFolder = "./wwwroot/assets/";
const srcFolder = "./App/";

module.exports = {
    entry: [
        srcFolder + "index.jsx"
    ],
    devtool: "source-map",
    output: {
        filename: "bundle.js",
        publicPath: 'assets/',
        path: path.resolve(__dirname, bundleFolder)
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: "babel-loader",
                query: {
                    presets: [ "@babel/preset-env", "@babel/preset-react",],
                    plugins: [
                        "@babel/plugin-proposal-class-properties",
                        "@babel/plugin-proposal-function-bind",
                        "@babel/plugin-transform-parameters",
                        "@babel/plugin-transform-spread",
                    ]
                }
            },
            {
                test: /\.css$/,
                loaders: [
                    'style-loader', 
                    'css-loader'
                ]
            },
            {
                test: /\.(jpg|svg|png)$/,
                loader: 'file-loader'
            }
        ]
    },
    plugins: []
};