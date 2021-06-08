const path = require("path");
const { merge } = require("lodash");
const { getLoader, injectBabelPlugin } = require("react-app-rewired");
// const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackVisualizerPlugin = require("webpack-visualizer-plugin");
const { UnusedFilesWebpackPlugin } = require("unused-files-webpack-plugin");
const matcher = require("matcher");

module.exports = function override(config, env) {
  config = injectBabelPlugin("lodash", config);

  config.entry.unshift("babel-polyfill");

  const cssLoader = getLoader(
    config.module.rules,
    rule => String(rule.test) === String(/\.css$/)
  );

  let stylusRules;

  if (false) {
    config.plugins.push(
      new UnusedFilesWebpackPlugin({
        patterns: ["src/**/*.*"]
      })
    );
  }

  config.plugins.push(
    new WebpackVisualizerPlugin({
      filename: "./build/stats.html"
    })
  );

  if (env === "development") {
    // config = rewireReactHotLoader(config, env);

    stylusRules = {
      test: /\.styl$/,
      use: [
        { loader: "style-loader", options: { sourceMap: true } },
        {
          loader: "css-loader",
          options: {
            sourceMap: true,
            modules: true,
            importLoaders: 2,
            localIdentName: "[folder]--[local]--[hash:base64:2]"
          }
        },
        { loader: "postcss-loader", options: { sourceMap: true } },
        { loader: "stylus-loader", options: { sourceMap: true } }
      ]
    };
  } else {
    const cssExtractTextLoader = cssLoader.loader[0];
    if (!cssExtractTextLoader.loader.includes("extract-text-webpack-plugin")) {
      throw new Error("Unable to find extract-text loader for CSS, aborting");
    }

    stylusRules = {
      test: /\.styl$/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: true,
              importLoaders: 2,
              localIdentName: "[folder]--[local]--[hash:base64:2]"
            }
          },
          { loader: "postcss-loader", options: { sourceMap: true } },
          { loader: "stylus-loader", options: { sourceMap: true } }
        ]
      })
    };
  }

  const oneOfRule = config.module.rules.find(rule => rule.oneOf !== undefined);
  if (oneOfRule) {
    oneOfRule.oneOf.unshift(stylusRules);
  } else {
    // Fallback to previous behaviour of adding to the end of the rules list.
    config.module.rules.push(stylusRules);
  }

  return merge(config, {
    resolve: {
      alias: {
        app: path.resolve(__dirname, "src"),
        src: path.resolve(__dirname, "src")
      }
    }
  });
};
