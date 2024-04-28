import React, { useEffect, useState } from 'react';
import { FlatList, PermissionsAndroid, Text, TouchableOpacity, View } from 'react-native';
import styles from "~/global.css";
import Icon from "react-native-vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIST, MUSIC, save } from './MType';
import DocumentPicker from 'react-native-document-picker';
import PopupCenter from './components/popup/center';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { hideLoading, showLoading } from "~/components/load";
import RNFetchBlob from 'react-native-blob-util';

type MODE = 'single' | 'sequence' | 'random'

let playName = '';
let timmer: NodeJS.Timeout;
export default function MList({ setPage }: {
  setPage: React.Dispatch<React.SetStateAction<number>>
}) {
  const [list, setList] = useState<LIST>([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [mode, setMode] = useState<MODE>('random');
  const [showClock, setShowClock] = useState(false);

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
          playName = li[j].name || '';
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
    try {
      showLoading();
      const res = await DocumentPicker.pickDirectory();
      if (!res) return;
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      console.log(res)
      RNFetchBlob.fs.ls(res.uri)
        .then((files: any) => {
          // files 是一个包含文件夹中所有文件名的数组
          console.log(files);
        })
        .catch((error: any) => {
          console.error(error);
        });
      hideLoading();
      // if (res) {
      //   res.map((r, index) => r.index = index)
      //   list[index].children = res;
      //   save(list, setList);
      // }
    } catch (e) {
      console.log(e)
      hideLoading();
    }
  }

  /** 播放音乐 */
  const handlePlay = async (i: number) => {
    const children = list[index].children;
    if (!children?.length) return;
    children.map(c => c.play = false);
    const c = children[i];
    c.play = true;
    c.played = true;
    playName = c.name || '';
    try {
      await TrackPlayer.remove(0);
    } catch {
    } finally {
      await TrackPlayer.add([{
        id: c.name,
        url: c.fileCopyUri || '',
        title: c.name || '',
        artist: 'artist',
      }]);
      await TrackPlayer.play();
      setPlaying(true);
      save(list, setList);
      setPlayIndex(i);
    }
  }

  /** 播放暂停 */
  const handleStop = () => {
    setPlaying(!playing);
    if (playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  }

  /** 下一首 */
  const handleNext = () => {
    const children = list[index].children;
    if (!children?.length) return;
    if (mode === 'random') {
      // 随机
      let noPlay = children.filter(li => !li.played);
      if (noPlay.length === 0) {
        children.map(c => c.played = false);
        noPlay = children;
      }
      const length = noPlay.length;
      const r = Math.floor(Math.random() * length);
      handlePlay(noPlay[r].index || 0);
    } else if (mode === 'sequence') {
      // 顺序
      handlePlay(playIndex + 1 >= children.length ? 0 : playIndex + 1);
    } else {
      // 单曲
      TrackPlayer.seekTo(0);
    }
  }

  /** 改变模式 */
  const handleMode = () => {
    setMode(mode === 'random' ? 'sequence' : mode === 'sequence' ? 'single' : 'random');
  }

  /** 定时暂停 */
  const handleClock = (num: number) => {
    setShowClock(false);
    if (timmer) clearTimeout(timmer);
    timmer = setTimeout(() => {
      TrackPlayer.pause();
      setPlaying(false);
    }, num);
  }

  const ClockDom = ({ time }: { time: number }) => {
    return <TouchableOpacity style={styles.clock} onPress={() => handleClock(time)}>
      <Text style={styles.center}>{time}小时</Text>
    </TouchableOpacity>
  }

  return (
    index !== -1 ? <View style={styles.flex1}>
      {/* 顶部 */}
      <View style={styles.bar}>
        <TouchableOpacity style={styles.barb} onPress={() => setPage(1)}>
          <Icon name="left" color="#fff" size={20} />
        </TouchableOpacity>
        <Text style={styles.bart}>{list[index].name}</Text>
        <TouchableOpacity style={styles.barb} onPress={handleAdd}>
          <Icon name="plus" color="#fff" size={20} />
        </TouchableOpacity>
      </View>
      {/* 列表 */}
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
      {/* 底部栏 */}
      <View style={styles.bottom}>
        <TrackProgress />
        <TrackSlider />
        <View style={styles.btns}>
          <TouchableOpacity onPress={handleMode}>
            <Icon style={styles.bottomb} name={mode === 'random' ? "sharealt" : mode === 'single' ? "sync" : "indent-right"} color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStop}>
            <Icon style={styles.bottomb} name={playing ? "pausecircleo" : "playcircleo"} color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Icon style={styles.bottomb} name="stepforward" color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowClock(true)}>
            <Icon style={styles.bottomb} name="clockcircleo" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <PopupCenter visible={showClock} handleClose={() => setShowClock(false)}>
        <Text style={[styles.clock, { fontWeight: 'bold' }]}>自动暂停</Text>
        {[0.5, 1, 1.5, 2, 3].map(l => <ClockDom key={l} time={l} />)}
        <View style={styles.clock}></View>
      </PopupCenter>
    </View> : <></>
  )
}

/** 标题栏 */
const TrackProgress = function () {
  const { position, duration } = useProgress()
  const [showTitle, setShowTitle] = useState(false);

  function format(seconds: any) {
    let mins = (Math.trunc(seconds / 60)).toString().padStart(2, '0')
    let secs = (Math.trunc(seconds % 60)).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <PopupCenter visible={showTitle} handleClose={() => setShowTitle(false)}>
        <Text style={styles.title}>{playName}</Text>
      </PopupCenter>
      <Text style={styles.white}>{format(position)}</Text>
      <TouchableOpacity style={styles.flex1} onPress={() => setShowTitle(true)}>
        <Text style={[styles.white, styles.center]} numberOfLines={1}>{playName}</Text>
      </TouchableOpacity>
      <Text style={styles.white}>{format(duration)}</Text>
    </View>
  )
}

/** 进度条 */
const TrackSlider = function () {
  const { position, duration } = useProgress(200)

  async function handleForward() {
    let new_position = position + 5
    await TrackPlayer.seekTo(new_position)
  }

  async function handleBackward() {
    let new_position = position - 5
    await TrackPlayer.seekTo(new_position)
  }

  return (
    <View style={[styles.row, { width: '100%' }]}>
      <TouchableOpacity onPress={handleBackward}>
        <Icon style={styles.pd10} name="left" color="#fff" size={20} />
      </TouchableOpacity>
      <View style={[styles.flex1, { justifyContent: 'center' }]}>
        <Slider
          maximumValue={duration}
          minimumValue={0}
          step={1}
          value={position}
          onValueChange={(value) => { TrackPlayer.seekTo(value) }}
          thumbTintColor="white"
        />
      </View>
      <TouchableOpacity onPress={handleForward}>
        <Icon style={styles.pd10} name="right" color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  )
}