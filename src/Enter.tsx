import React, { useEffect, useRef, useState } from 'react';
import MType from './MType';
import MList from './MList';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event } from 'react-native-track-player';
import Loading from './components/load';
import { ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const playbackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    const track = await TrackPlayer.getActiveTrackIndex();
    if (track === 0) {
      TrackPlayer.skipToNext();
    }
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    const track = await TrackPlayer.getActiveTrackIndex();
    if (track === 1) {
      TrackPlayer.skipToPrevious();
    }
  });
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
    const position = (await TrackPlayer.getProgress()).position;
    await TrackPlayer.seekTo(position + interval);
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
    const position = (await TrackPlayer.getProgress()).position;
    await TrackPlayer.seekTo(position - interval);
  });
};

const initPlayer = async () => {
  TrackPlayer.registerPlaybackService(() => playbackService);
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.JumpForward, Capability.JumpBackward],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToPrevious, Capability.SkipToNext],
  });
};

export default function Enter() {
  const [page, setPage] = useState(0);
  const didMountRef = useRef(false);

  const initPage = async () => {
    const listIndex = await AsyncStorage.getItem('list-index');
    if (listIndex !== null) {
      setPage(2);
    } else {
      setPage(1);
    }
  }

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      // 不延迟执行会导致失败
      setTimeout(() => {
        //初始化音频播放器
        initPlayer();
        StatusBar.setBackgroundColor(gColor);
        initPage();
      }, 500);
    }
  }, []);

  return (
    <>
      {page === 0 ? <ActivityIndicator size={50} style={{ marginTop: "50%" }} /> : page === 1 ? <MType setPage={setPage} /> : <MList setPage={setPage} />}
      <Loading />
    </>
  );
}
