import React from "react";
import { useRecoilValue } from "recoil";
import { playlistState } from "../atoms/playlistatom";
import Song from "../components/Song";
const Songs = () => {
  const playlist = useRecoilValue(playlistState);

  return (
    <div className="px-8 flex flex-col space-y-1 pb-28 text-white">
      {playlist?.tracks.items.map((track, i) => (
        <div key={track.track.id}>
          <Song track={track} order={i}></Song>
        </div>
      ))}
    </div>
  );
};

export default Songs;
