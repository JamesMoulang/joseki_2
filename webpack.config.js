const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const JavaScriptObfuscator = require('webpack-obfuscator');

console.log(path.join(__dirname, 'src'));

module.exports = (env, argv) => {
  console.log(argv.mode);
  if (argv.mode == 'production') {
    return {
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            include: [
              path.join(__dirname, '../src')
            ],
            use: {
              loader: "babel-loader",
            }
          },
          {
            test: /\.js/,
            loader: 'string-replace-loader',
            query: {
              search: '$assets',
              replace: './assets' // prod
              // replace: '' // dev
            },
            include: path.join(__dirname, 'src')
          }
        ]
      },
      plugins: [
        new JavaScriptObfuscator ({
            rotateUnicodeArray: true
        })
      ]
    };
  } else {
    return {
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            include: [
              path.join(__dirname, '../src')
            ],
            use: {
              loader: "babel-loader"
            }
          },
          {
            test: /\.js/,
            loader: 'string-replace-loader',
            query: {
              search: '$assets',
              replace: './assets' // prod
              // replace: '' // dev
            },
            include: path.join(__dirname, 'src')
          },
          {
            test: /\.html$/,
            use: [
              {
                loader: "html-loader"
              }
            ]
          }
        ]
      },
      plugins: [
        new HtmlWebPackPlugin({
          template: "./dist.html",
          filename: "./index.html"
        })
      ]
    };
  }
};