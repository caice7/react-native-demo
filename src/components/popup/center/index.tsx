import React from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import styles from "~/global.css";

export default function PopupCenter({ visible, handleClose, width, isRule, children }: {
  visible: boolean,
  handleClose?: () => void,
  children: any,
  width?: number,
  isRule?: boolean,
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={isRule ? undefined : handleClose}
    >
      {isRule ? <View style={[styles.block, styles.center]}>
        <View style={[styles.bg, { overflow: 'visible' }, width ? { width: gWidth * width } : null]}>
          {children}
        </View>
      </View> : <TouchableOpacity style={[styles.block, styles.center]} onPress={handleClose}>
        <TouchableWithoutFeedback>
          <View style={[styles.bg, { overflow: 'visible' }, width ? { width: gWidth * width } : null]}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>}
    </Modal>
  )
}
