import React, { useEffect, useRef, useState } from 'react';
import MType from './MType';
import MList from './MList';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event } from 'react-native-track-player';
import Loading from './components/load';
import { StatusBar } from 'react-native';

export default function Enter() {
  const [page, setPage] = useState(1);
  const didMountRef = useRef(false);

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

  const init = async () => {
    TrackPlayer.registerPlaybackService(() => playbackService);
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToPrevious,
        Capability.SkipToNext,
      ],
    });
  };

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      StatusBar.setBackgroundColor(gColor);
      //初始化音频播放器
      init();
    }
  }, []);

  return (
    <>
      {page === 1 ? <MType setPage={setPage} /> : <MList setPage={setPage} />}
      <Loading />
    </>
  );
}
