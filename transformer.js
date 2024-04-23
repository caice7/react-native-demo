// For React Native version 0.73 or later
var upstreamTransformer = require("@react-native/metro-babel-transformer");

var postcssTransformer = require("react-native-postcss-transformer");
var svgTransformer = require("react-native-svg-transformer");
var postCSSExtensions = ["css", "pcss"]; // <-- Add other extensions if needed.

module.exports.transform = function ({ src, filename, options }) {
  if (postCSSExtensions.some((ext) => filename.endsWith("." + ext))) {
    return postcssTransformer.transform({ src, filename, options });
  } else if (filename.endsWith(".svg")) {
    return svgTransformer.transform({ src, filename, options });
  }
  return upstreamTransformer.transform({ src, filename, options });
};