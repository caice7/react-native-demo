/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Dimensions } from 'react-native';
import Main from '~/Main';

function App(): React.JSX.Element {
  const window = Dimensions.get('window');
  global.gWidth = window.width;
  global.gHeight = window.height;

  return (
    <Main />
  );
}

export default App;
