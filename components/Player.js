import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify";
import useSongInfo from "../hooks/useSongInfo";
import {
  RewindIcon,
  PauseIcon,
  PlayIcon,
  FastForwardIcon,
  ReplyIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";

import { VolumeUpIcon as VolumeDownIcon } from "@heroicons/react/outline";
import { VolumeUpIcon } from "@heroicons/react/outline";
import { debounce } from "lodash";
const Player = () => {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(50);
  const songinfo = useSongInfo();
  const [Shuffle, setShuffle] = useState(false);
  const fetchCurrentSong = () => {
    if (!songinfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id);
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };
  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSong();
      setVolume(50);
    }
  }, [currentTrackId, spotifyApi, session]);

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data?.body?.is_playing) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    });
  };
  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      handlePlayPause();
    }
  }, [spotifyApi]);
  const handleShuffle = () => {
    setShuffle(!Shuffle);
    spotifyApi.setShuffle(Shuffle);
  };
  const handleSkip = () => {
    spotifyApi.skipToNext();
    setIsPlaying(true);
    setTimeout(() => {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id);
      });
    }, 500);
  };
  const handlePrev = () => {
    spotifyApi.skipToPrevious();
    setIsPlaying(true);
    setTimeout(() => {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data?.body?.item?.id);
      });
    }, 500);
  };
  const refresh = () => {
    setTimeout(() => {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id);
      });
    }, 500);
  };

  useEffect(() => {
    refresh();
  }, [spotifyApi]);

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debouncedAdjustVolume(volume);
    }
  }, [volume]);

  const debouncedAdjustVolume = useCallback(
    debounce(
      (volume) => {
        spotifyApi.setVolume(volume);
      },
      500,
      []
    )
  );

  return (
    <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8">
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline h-10 w-10"
          src={songinfo?.album.images?.[0]?.url}
          alt=""
        />
        <div>
          <h3 className="">{songinfo?.name}</h3>
          <p>{songinfo?.artists?.[0]?.name}</p>
        </div>
      </div>
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon
          className={`button ${Shuffle ? "text-white" : "text-green-500"}`}
          onClick={() => {
            handleShuffle();
          }}
        ></SwitchHorizontalIcon>
        <RewindIcon
          className="button"
          onClick={() => handlePrev()}
        ></RewindIcon>
        {isPlaying ? (
          <PauseIcon
            className="button w-10 h-10"
            onClick={() => {
              handlePlayPause();
              spotifyApi.pause();
              refresh();
            }}
          ></PauseIcon>
        ) : (
          <PlayIcon
            className="button w-10 h-10"
            onClick={() => {
              handlePlayPause();
              spotifyApi.play();
              refresh();
            }}
          ></PlayIcon>
        )}
        <FastForwardIcon
          className="button"
          onClick={() => handleSkip()}
        ></FastForwardIcon>
        <ReplyIcon
          className="button"
          onClick={() => {
            spotifyApi.setRepeat("track");
          }}
        ></ReplyIcon>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <VolumeDownIcon
          onClick={() => {
            volume > 0 && setVolume(volume - 10);
          }}
          className="button"
        ></VolumeDownIcon>
        <input
          type="range"
          value={volume}
          min={0}
          max={100}
          className="w-14 md:w-28"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <VolumeUpIcon
          onClick={() => {
            volume < 100 && setVolume(volume + 10);
          }}
          className="button"
        ></VolumeUpIcon>
      </div>
    </div>
  );
};

export default Player;
