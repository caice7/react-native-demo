/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Dimensions } from 'react-native';
import Enter from '~/Enter';
import styles from "~/global.css";

function App(): React.JSX.Element {
  const window = Dimensions.get('window');
  global.gWidth = window.width;
  global.gHeight = window.height;
  global.gColor = styles.bar.backgroundColor;
  global.playName = '';
  global.listener = undefined;

  return (
    <Enter />
  );
}

export default App;
