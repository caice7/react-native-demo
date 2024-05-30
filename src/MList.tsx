import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, NativeModules, TextInput, Linking } from 'react-native';
import styles from '~/global.css';
import Icon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIST, MUSIC, save } from './MType';
import DocumentPicker from 'react-native-document-picker';
import PopupCenter from './components/popup/center';
import TrackPlayer, { useProgress, Event } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { hideLoading, showLoading } from '~/components/load';
import RNFetchBlob from 'rn-fetch-blob';

const { MusicModule } = NativeModules;
type MODE = 'single' | 'sequence' | 'random';

let timmer: NodeJS.Timeout;
let lastSearch = '';
export default function MList({ setPage }: { setPage: React.Dispatch<React.SetStateAction<number>> }) {
  const flatRef = useRef<any>();
  const [list, setList] = useState<LIST>([]);
  const [listI, setListI] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [playI, setPlayI] = useState(0);
  const [mode, setMode] = useState<MODE>('random');
  const [showClock, setShowClock] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [noResult, setNoResult] = useState(false);

  /** 初始化 */
  const init = async () => {
    const i = await AsyncStorage.getItem('list-index');
    const sto = await AsyncStorage.getItem('list');
    const m = await AsyncStorage.getItem('mode');
    if (m) setMode(m as MODE);
    if (sto && i) {
      const json: LIST = JSON.parse(sto);
      const int = parseInt(i, 10);
      const li = json[int].children || [];
      for (let j = 0; j < li.length; j++) {
        if (li[j]?.play) {
          playName = li[j].name || '';
          setPlayI(j);
        }
      }
      setList(json);
      setListI(int);
    }
  };

  useEffect(() => {
    init();
  }, []);

  /** 选择文件 */
  const handleAdd = async () => {
    try {
      showLoading();
      try {
        const r = await DocumentPicker.pickDirectory();
        const res: MUSIC[] = await MusicModule.readFolder(r?.uri);
        const sortedData = res.sort((a, b) => a.name.localeCompare(b.name));
        sortedData.map((li: any, index: number) => {
          li.index = index;
          li.path = `${r?.uri}%2F${encodeURIComponent(li.name)}`;
        });
        list[listI].children = sortedData;
        save(list, setList);
        hideLoading();
      } catch {
        Linking.openSettings().catch(() => { });
      }
    } catch (e) {
      hideLoading();
    }
  };

  /** 播放音乐 */
  const handlePlay = async (i: number) => {
    const children = list[listI].children;
    if (!children?.length) return;
    children.map(c => {
      c.play = false;
    });
    const c = children[i];
    c.play = true;
    c.played = true;
    playName = c.name || '';
    try {
      await TrackPlayer.reset();
    } catch {
    } finally {
      const newFile = await RNFetchBlob.fs.stat(c.path.replace('/tree/', '/document/'));
      await TrackPlayer.add([
        {
          id: c.name,
          url: newFile.path,
          title: c.name || '',
          artist: 'artist',
        },
      ]);
      await TrackPlayer.play();
      setPlaying(true);
      save(list, setList);
      setPlayI(i);
      if (isFirst) {
        if (listener) {
          listener.remove();
        }
        listener = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => handleNext());
        setIsFirst(false);
      }
    }
  };

  /** 播放暂停 */
  const handleStop = () => {
    setPlaying(!playing);
    if (playing) {
      TrackPlayer.pause();
    } else {
      if (isFirst) {
        // 播放上次未播完的歌曲
        const children = list[listI].children;
        if (!children?.length) return;
        let num = 0;
        for (let i = 0; i < children.length; i++) {
          if (children[i].play) {
            num = i;
            break;
          }
        }
        handlePlay(num);
      } else {
        TrackPlayer.play();
      }
    }
  };

  /** 下一首 */
  const handleNext = () => {
    const children = list[listI].children;
    if (!children?.length) return;
    if (mode === 'random') {
      // 随机
      let noPlay = children.filter(li => !li.played);
      if (noPlay.length === 0) {
        children.map(c => {
          c.played = false;
        });
        noPlay = children;
      }
      const length = noPlay.length;
      const r = Math.floor(Math.random() * length);
      handlePlay(noPlay[r].index || 0);
    } else if (mode === 'sequence') {
      // 顺序
      handlePlay(playI + 1 >= children.length ? 0 : playI + 1);
    } else {
      // 单曲
      TrackPlayer.seekTo(0);
    }
  };

  /** 清除已找歌的标记 */
  const clearSearch = () => {
    const children = list[listI].children || [];
    children.map(c => {
      c.searched = false;
    });
  }

  /** 显示搜索歌曲弹窗 */
  const popupSearch = () => {
    clearSearch();
    setShowSearch(true);
  }

  /** 搜索歌曲 */
  const handleSearch = () => {
    if (lastSearch && lastSearch !== searchName) {
      // 搜索名不一致时先清
      clearSearch();
    }
    const children = list[listI].children || [];
    let num = -1;
    for (let i = 0; i < children.length; i++) {
      if (children[i].name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()) && !children[i].searched) {
        children[i].searched = true;
        num = i;
        lastSearch = searchName;
        break;
      }
    }
    if (num === -1) {
      setNoResult(true);
    } else {
      if (noResult) setNoResult(false);
      flatRef.current.scrollToOffset({ offset: num * 50, animated: true });
    }
  }

  /** 改变模式 */
  const handleMode = () => {
    setMode(mode === 'random' ? 'sequence' : mode === 'sequence' ? 'single' : 'random');
  };

  /** 返回 */
  const back = () => {
    setPage(1);
    if (playing) {
      handleStop();
    }
  };

  return listI !== -1 ? (
    <View style={styles.flex1}>
      {/* 顶部 */}
      <View style={styles.bar}>
        <TouchableOpacity style={styles.barb} onPress={back}>
          <Icon name="left" color="#fff" size={20} />
        </TouchableOpacity>
        <Text style={styles.bart}>{list[listI].name}</Text>
        <TouchableOpacity style={styles.barb} onPress={handleAdd}>
          <Icon name="plus" color="#fff" size={20} />
        </TouchableOpacity>
      </View>
      {/* 列表 */}
      <FlatList
        ref={flatRef}
        data={list[listI].children || []}
        renderItem={({ item: li, index }) => (
          <View key={li.name} style={styles.line}>
            <TouchableOpacity style={styles.linel} onPress={() => handlePlay(index)}>
              <Text style={li.play ? styles.playing : null} numberOfLines={1}>
                {li.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
        keyExtractor={item => item.name || ''}
      />
      {/* 底部栏 */}
      <View style={styles.bottom}>
        <TrackProgress />
        <TrackSlider />
        <View style={styles.btns}>
          <TouchableOpacity onPress={popupSearch}>
            <Icon style={styles.bottomb} name="search1" color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMode}>
            <Icon style={styles.bottomb} name={mode === 'random' ? 'sharealt' : mode === 'single' ? 'sync' : 'indent-right'} color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStop}>
            <Icon style={styles.bottomb} name={playing ? 'pausecircleo' : 'playcircleo'} color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Icon style={styles.bottomb} name="stepforward" color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowClock(true)}>
            <Icon style={styles.bottomb} name="clockcircleo" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <PopupCenter visible={showSearch} handleClose={() => setShowSearch(false)}>
        <Text style={styles.search}>搜索歌曲 {noResult && "--未找到歌曲"}</Text>
        <View style={[styles.row, styles.searchBottom]}>
          <TextInput style={styles.searchInput} onChangeText={setSearchName} value={searchName} />
          <TouchableOpacity style={styles.center} onPress={handleSearch}>
            <Icon name="search1" size={20} />
          </TouchableOpacity>
        </View>
      </PopupCenter>
      <PopupCenter visible={showClock} handleClose={() => setShowClock(false)}>
        <Text style={[styles.clock, { fontWeight: 'bold' }]}>自动暂停</Text>
        {[0.5, 1, 1.5, 2, 3].map(l => (
          <ClockDom key={l} time={l} setShowClock={setShowClock} setPlaying={setPlaying} />
        ))}
        <View style={styles.clock} />
      </PopupCenter>
    </View>
  ) : (
    <></>
  );
}

const ClockDom = ({ time, setShowClock, setPlaying }: any) => {
  /** 定时暂停 */
  const handleClock = (num: number) => {
    setShowClock(false);
    if (timmer) clearTimeout(timmer);
    timmer = setTimeout(() => {
      TrackPlayer.pause();
      setPlaying(false);
    }, num);
  };

  return (
    <TouchableOpacity style={styles.clock} onPress={() => handleClock(time)}>
      <Text style={styles.center}>{time}小时</Text>
    </TouchableOpacity>
  );
};

/** 标题栏 */
const TrackProgress = function () {
  const { position, duration } = useProgress(200);
  const [showTitle, setShowTitle] = useState(false);

  function format(seconds: any) {
    let mins = Math.trunc(seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = Math.trunc(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <>
      <View style={styles.titleBar}>
        <Text style={[styles.white, styles.w60]}>{format(position)}</Text>
        <TouchableOpacity style={styles.flex1} onPress={() => setShowTitle(true)}>
          <Text style={[styles.white, styles.center]} numberOfLines={1}>
            {playName}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.white, styles.w60]}>{format(duration)}</Text>
      </View>
      <PopupCenter visible={showTitle} handleClose={() => setShowTitle(false)}>
        <Text style={styles.title}>{playName}</Text>
      </PopupCenter>
    </>
  );
};

/** 进度条 */
const TrackSlider = function () {
  const { position, duration } = useProgress();

  async function handleForward() {
    let new_position = position + 5;
    await TrackPlayer.seekTo(new_position);
  }

  async function handleBackward() {
    let new_position = position - 5;
    await TrackPlayer.seekTo(new_position);
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
          onValueChange={value => {
            TrackPlayer.seekTo(value);
          }}
          thumbTintColor="white"
        />
      </View>
      <TouchableOpacity onPress={handleForward}>
        <Icon style={styles.pd10} name="right" color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  );
};
