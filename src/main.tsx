import React from 'react';
import { Text, View } from 'react-native';
import styles from "~/global.css";
import Icon from "react-native-vector-icons/AntDesign";

export default function Main() {
  return (
    <View>
      <Text>test</Text>
      <Icon style={styles.icon} name="checksquare" size={16} color="#777" />
    </View>
  )
}
