import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import styles from "~/global.css";
import Icon from "react-native-vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIST, MUSIC, save } from './MType';
import DocumentPicker from 'react-native-document-picker';
import PopupCenter from './components/popup/center';

type MODE = 'single' | 'sequence' | 'random'

export default function MList({ setPage }: {
  setPage: React.Dispatch<React.SetStateAction<number>>
}) {
  const [list, setList] = useState<LIST>([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [playName, setPlayName] = useState('');
  const [playIndex, setPlayIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [mode, setMode] = useState<MODE>('random');

  /** 初始化 */
  const init = async () => {
    const i = await AsyncStorage.getItem('list-index');
    const sto = await AsyncStorage.getItem('list');
    const m = await AsyncStorage.getItem('mode');
    if (m) setMode(m as MODE);
    if (sto && i) {
      const json: LIST = JSON.parse(sto);
      const int = parseInt(i);
      const li = json[int].children || [];
      for (let j = 0; j < li.length; j++) {
        if (li[j]?.play) {
          setPlayName(li[j].name || '');
          setPlayIndex(j);
        }
      }
      setList(json);
      setIndex(int);
    }
  }

  useEffect(() => {
    init();
  }, []);

  /** 选择文件 */
  const handleAdd = async () => {
    const res: MUSIC[] = await DocumentPicker.pick({
      //type可以是多个，用,分开就好
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: true,
    });
    if (res) {
      res.map((r, index) => r.index = index)
      list[index].children = res;
      save(list, setList);
    }
  }

  /** 播放音乐 */
  const handlePlay = (i: number) => {
    const children = list[index].children;
    if (!children?.length) return;
    children.map(c => c.play = false);
    const c = children[i];
    console.log(c)
    c.play = true;
    c.played = true;
    save(list, setList);
    setPlayIndex(i);
    setPlayName(c.name || '');
    setPlaying(true);
  }

  /** 播放暂停 */
  const handleStop = () => {
    setPlaying(!playing);
  }

  /** 下一首 */
  const handleNext = () => {
    const children = list[index].children;
    if (!children?.length) return;
    if (mode === 'random') {
      let noPlay = children.filter(li => !li.played);
      if (noPlay.length === 0) {
        children.map(c => c.played = false);
        noPlay = children;
      }
      const length = noPlay.length;
      const r = Math.floor(Math.random() * length);
      handlePlay(noPlay[r].index || 0);
    } else if (mode === 'sequence') {
      handlePlay(playIndex + 1 >= children.length ? 0 : playIndex + 1);
    }
  }

  /** 改变模式 */
  const handleMode = () => {
    setMode(mode === 'random' ? 'sequence' : mode === 'sequence' ? 'single' : 'random');
  }

  return (
    index !== -1 ? <View style={styles.flex1}>
      <View style={styles.bar}>
        <TouchableOpacity style={styles.barb} onPress={() => setPage(1)}>
          <Icon name="left" color="#fff" size={20} />
        </TouchableOpacity>
        <Text style={styles.bart}>{list[index].name}</Text>
        <TouchableOpacity style={styles.barb} onPress={handleAdd}>
          <Icon name="plus" color="#fff" size={20} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={list[index].children || []}
        renderItem={({ item: li, index }) => <View key={li.name} style={styles.line}>
          <TouchableOpacity style={styles.linel} onPress={() => handlePlay(index)}>
            <Text style={li.play ? styles.playing : null} numberOfLines={1}>{li.name}</Text>
          </TouchableOpacity>
        </View>}
        getItemLayout={(data, index) => (
          { length: 50, offset: 50 * index, index }
        )}
        keyExtractor={item => item.name || ''}
      />
      <PopupCenter visible={showTitle} handleClose={() => setShowTitle(false)}>
        <Text style={styles.title}>{playName}</Text>
      </PopupCenter>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.flex1} onPress={() => setShowTitle(true)}>
          <Text style={styles.playName} numberOfLines={1}>{playName}</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleMode}>
            <Icon style={styles.bottomb} name={mode === 'random' ? "sharealt" : mode === 'single' ? "sync" : "indent-right"} color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStop}>
            <Icon style={styles.bottomb} name={playing ? "playcircleo" : "pausecircleo"} color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Icon style={styles.bottomb} name="stepforward" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View> : <></>
  )
}
