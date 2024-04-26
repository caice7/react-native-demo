import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import styles from './index.css';

let load: any = {};
let timer: any;

export const showLoading = (duration?: number) => {
  if (!load.setLoading) return;
  if (timer) clearTimeout(timer);
  load.setLoading(true);
  timer = setTimeout(() => {
    load.setLoading(false);
  }, duration || 30000);
}

export const hideLoading = () => {
  if (!load.setLoading) return;
  load.setLoading(false);
}

export default function Loading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load.setLoading = setLoading;
  }, []);
  return (
    loading ? <View style={styles.view}>
      <View style={styles.inner}>
        <ActivityIndicator color="#fff" size={40} />
        <Text style={styles.text}>加载中</Text>
      </View>
    </View> : <></>
  )
}
