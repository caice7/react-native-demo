module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '~': './src/',
        },
      },
    ],
    'react-native-classname-to-style',
    [
      'react-native-platform-specific-extensions',
      {
        extensions: ['scss', 'css'],
      },
    ],
  ],
};
