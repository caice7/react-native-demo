import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import istyles from './index.css';
import gstyles from '~/global.css';
import PopupCenter from '../center';

export default function Confirm({ content, callback, visible, setVisible }: { content: string; callback: any; visible: boolean; setVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
  const styles = { ...gstyles, ...istyles };

  const submit = (show: boolean) => {
    if (show) {
      callback();
    }
    setVisible(false);
  };
  return (
    <PopupCenter visible={visible} width={0.8} handleClose={() => setVisible(false)}>
      <View style={styles.confirm}>
        <View style={styles['text-view-top']}>
          <Text style={styles['content-text']}>{content}</Text>
        </View>
        <View style={[styles['btn-view'], { borderColor: styles.bd.color }]}>
          <TouchableOpacity style={[styles['cancel-view'], { borderColor: styles.bd.color }]} onPress={() => submit(false)}>
            <Text style={[styles['content-text']]}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles['success-view']} onPress={() => submit(true)}>
            <Text style={styles['content-text-confirm']}>确认</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PopupCenter>
  );
}
