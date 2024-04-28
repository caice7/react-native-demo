import React, { useEffect, useState } from 'react';
import MType from './MType';
import MList from './MList';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event } from 'react-native-track-player';
import Loading from './components/load';

export default function Main() {
  const [page, setPage] = useState(1);

  const playbackService = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play())
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause())
    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
      const track = await TrackPlayer.getActiveTrackIndex()
      if (track == 0) {
        TrackPlayer.skipToNext()
      }
    })
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
      const track = await TrackPlayer.getActiveTrackIndex()
      if (track == 1) {
        TrackPlayer.skipToPrevious()
      }
    })
    TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
      const position = (await TrackPlayer.getProgress()).position
      await TrackPlayer.seekTo(position + interval)
    })
    TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
      const position = (await TrackPlayer.getProgress()).position
      await TrackPlayer.seekTo(position - interval)
    })

  }

  const setupPlayer = async () => {
    TrackPlayer.registerPlaybackService(() => playbackService)
    await TrackPlayer.setupPlayer()
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback
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
    })
  }

  useEffect(() => {
    //初始化音频播放器
    setupPlayer();
  }, [])

  return (
    <>
      {page === 1 ? <MType setPage={setPage} /> :
        <MList setPage={setPage} />}
      <Loading />
    </>
  )
}
