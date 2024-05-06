import React, { useEffect, useState } from 'react';
import { NativeModules, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '~/global.css';
import Icon from 'react-native-vector-icons/AntDesign';
import Confirm from './components/popup/confirm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PopupCenter from './components/popup/center';

export type MUSIC = {
  name: string;
  path: string;
  play?: boolean;
  played?: boolean;
  index?: number;
};

export type LIST = {
  id: number;
  name: string;
  children?: MUSIC[];
}[];

/** 保存本地  */
export const save = (
  li: LIST,
  setList: React.Dispatch<React.SetStateAction<LIST>>,
) => {
  AsyncStorage.setItem('list', JSON.stringify(li));
  setList([...li]);
};

export default function MType({ setPage }: {
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [addPopup, setAddPopup] = useState(false);
  const [addInput, setAddInput] = useState('');
  const [delPopup, setDelPopup] = useState(false);
  const [delNumber, setDelNumber] = useState(0);
  const [list, setList] = useState<LIST>([]);

  /** 初始化 */
  const init = async () => {
    const sto = await AsyncStorage.getItem('list');
    if (sto) {
      setList(JSON.parse(sto));
    }
  };

  useEffect(() => {
    init();
  }, []);

  /** 显示添加分类 */
  const showAdd = () => {
    setAddPopup(true);
  };

  /** 添加分类 */
  const add = () => {
    list.push({ name: addInput, id: new Date().getTime() });
    save(list, setList);
    setAddPopup(false);
  };

  /** 显示删除分类 */
  const showDel = (id: number) => {
    setDelNumber(id);
    setDelPopup(true);
  };

  /** 删除分类 */
  const del = () => {
    const li = list.filter(l => l.id !== delNumber);
    save(li, setList);
  };

  /** 进入列表页 */
  const handleList = (index: number) => {
    AsyncStorage.setItem('list-index', index + '');
    setPage(2);
  };

  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.barb} />
        <Text style={styles.bart}>首页</Text>
        <TouchableOpacity style={styles.barb} onPress={showAdd}>
          <Icon name="plus" color="#fff" size={20} />
        </TouchableOpacity>
      </View>
      {list.map((li, index) => <View key={li.id} style={styles.line}>
        <TouchableOpacity style={styles.linel} onPress={() => handleList(index)}>
          <Text>{li.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.liner} onPress={() => showDel(li.id)}>
          <Icon name="minuscircleo" />
        </TouchableOpacity>
      </View>)}
      {__DEV__ && <TouchableOpacity style={[styles.box, styles.center]} onPress={() => NativeModules.DevSettings.setIsDebuggingRemotely(true)} >
        <Text>测试</Text>
      </TouchableOpacity>}
      {/* 弹窗 */}
      <Confirm content="确定要删除此分类吗？" visible={delPopup} setVisible={setDelPopup} callback={del} />
      <PopupCenter visible={addPopup} handleClose={() => setAddPopup(false)}>
        <View style={styles.addView}>
          <View style={styles.center}>
            <Text>分类名称：</Text>
          </View>
          <TextInput style={[styles.bd, styles.addInput]} onChangeText={text => setAddInput(text)} />
        </View>
        <TouchableOpacity style={[styles.btn, styles.addBtn]} onPress={add}>
          <Text style={styles.btnt}>添加</Text>
        </TouchableOpacity>
      </PopupCenter>
    </View>
  );
}
