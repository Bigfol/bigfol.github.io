import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import store from "storejs";

import { SeriesContext } from "./SeriesContext";
import Control from "./Control/Control";
import { useIdleTimer } from "react-idle-timer";

const format = (seconds) => {
  if (isNaN(seconds)) {
    return `00:00`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const storageName = "stateEpisodes";

let count = 0;

const Player = forwardRef(({ seriesList, setIsOpen }, ref) => {
  const [isCustomControls] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [timeDisplayFormat, setTimeDisplayFormat] = useState("normal");
  const [videoState, setVideoState] = useState({
    playing: true,
    muted: false,
    volume: 0.5,
    played: 0,
    loaded: 0,
    seeking: false,
    Buffer: true,
    maxTime: 0,
  });
  const { episode, setEpisode } = useContext(SeriesContext);
  const videoPlayerRef = useRef();
  const controlsRef = useRef(null);
  const [isButtons, setIsButtons] = useState(false);
  const [vimeoPlayer, setVimeoPlayer] = useState(null);
  const [startVideo, setStartVideo] = useState(false);

  const { playing, muted, volume, playbackRate, played, loaded, seeking } =
    videoState;

  useEffect(() => {
    if (videoPlayerRef.current && !vimeoPlayer) {
      setVimeoPlayer(videoPlayerRef.current.getInternalPlayer());
    }
  }, [videoPlayerRef, vimeoPlayer]);

  const updateTimeStorage = () => {
    const stateTimeArray = store.get(storageName);
    const currentStateTime = {
      id: episode.id,
      seekTime: videoState.played,
    };

    if (!stateTimeArray) {
      store.set(storageName, [currentStateTime]);
    } else {
      const findEpisode = stateTimeArray.find((item) => item.id === episode.id);

      if (findEpisode) {
        const indexEpisode = stateTimeArray.findIndex(
          (item) => item.id === findEpisode.id
        );
        const newArray = [
          ...stateTimeArray.splice(0, indexEpisode),
          currentStateTime,
          ...stateTimeArray.splice(indexEpisode + 1),
        ];

        store.set(storageName, newArray);
      } else {
        const newArray = [...stateTimeArray, currentStateTime];
        store.set(storageName, newArray);
      }
    }
  };

  const removeTimeStorage = () => {
    const stateTimeArray = store.get(storageName);

    if (stateTimeArray) {
      const findEpisode = stateTimeArray.find((item) => item.id === episode.id);

      if (findEpisode) {
        const indexEpisode = stateTimeArray.findIndex(
          (item) => item.id === findEpisode.id
        );
        const newArray = [
          ...stateTimeArray.splice(0, indexEpisode),
          ...stateTimeArray.splice(indexEpisode + 1),
        ];

        store.set(storageName, newArray);
      }
    }
  };

  const setSeekTimeFromStorage = () => {
    const stateTimeArray = store.get(storageName);

    if (stateTimeArray) {
      const findEpisode = stateTimeArray.find((item) => item.id === episode.id);

      if (findEpisode) {
        videoPlayerRef.current.seekTo(findEpisode.seekTime);
        removeTimeStorage();
      }
    }
  };

  const playPauseHandler = () => {
    setVideoState({ ...videoState, playing: !videoState.playing });
  };

  const rewindHandler = () => {
    videoPlayerRef.current.seekTo(videoPlayerRef.current.getCurrentTime() - 5);
  };

  const handleFastFoward = () => {
    videoPlayerRef.current.seekTo(videoPlayerRef.current.getCurrentTime() + 10);
  };

  const progressHandler = (state) => {
    if (count > 3 && controlsRef?.current) {
      controlsRef.current.style.visibility = "hidden";
      count = 0;
    }
    if (
      controlsRef?.current &&
      controlsRef.current.style.visibility === "visible"
    ) {
      count += 1;
    }

    renderEpisodesNav();

    if (!seeking) {
      setVideoState({ ...videoState, ...state });
    }
  };

  const seekHandler = (e, value) => {
    setVideoState({
      ...videoState,
      played: parseFloat(value) / 100,
    });
  };

  const seekMouseUpHandler = (e, value) => {
    setVideoState({ ...videoState, seeking: false });
    videoPlayerRef.current.seekTo(value / 100);
  };

  const onSeekMouseDownHandler = (e) => {
    setVideoState({ ...videoState, seeking: true });
  };

  const bufferStartHandler = () => {
    setVideoState({ ...videoState, buffer: true });
  };

  const bufferEndHandler = () => {
    setVideoState({ ...videoState, buffer: false });
  };

  const handleVolumeSeekDown = (e, newValue) => {
    setVideoState({
      ...videoState,
      seeking: false,
      volume: parseFloat(newValue / 100),
    });
  };
  const handleVolumeChange = (e, newValue) => {
    setVideoState({
      ...videoState,
      volume: parseFloat(newValue / 100),
      muted: newValue === 0 ? true : false,
    });
  };

  const handleMouseMove = () => {
    if (controlsRef?.current) {
      controlsRef.current.style.visibility = "visible";
      controlsRef.current.style.cursor = "auto";
      count = 0;
    }
  };

  const hanldeMouseLeave = () => {
    if (controlsRef?.current) {
      controlsRef.current.style.visibility = "hidden";
      count = 0;
    }
  };

  const handleDisplayFormat = () => {
    setTimeDisplayFormat(
      timeDisplayFormat === "normal" ? "remaining" : "normal"
    );
  };

  const handlePlaybackRate = (rate) => {
    setVideoState({ ...videoState, playbackRate: rate });
  };

  const hanldeMute = () => {
    setVideoState({ ...videoState, muted: !videoState.muted });
  };

  useIdleTimer({
    onIdle: () => {
      if (controlsRef.current) {
        controlsRef.current.style.visibility = "hidden";
        ref.current.style.cursor = "none";
      }
    },
    onActive: () => {
      if (controlsRef.current) {
        controlsRef.current.style.visibility = "visible";
        ref.current.style.cursor = "auto";
      }
    },
    timeout: 3_000,
    throttle: 1000,
  });

  const currentTime =
    videoPlayerRef && videoPlayerRef.current
      ? videoPlayerRef.current.getCurrentTime()
      : "00:00";

  const duration =
    videoPlayerRef && videoPlayerRef.current
      ? videoPlayerRef.current.getDuration()
      : "00:00";
  const elapsedTime =
    timeDisplayFormat === "normal"
      ? format(currentTime)
      : `-${format(duration - currentTime)}`;

  const totalDuration = format(duration);

  const nextEpisode = () => {
    const currentIndexEpisode = seriesList.findIndex(
      (item) => item.id === episode.id
    );

    if (
      currentIndexEpisode !== -1 &&
      seriesList[currentIndexEpisode + 1] &&
      seriesList[currentIndexEpisode + 1].release
    ) {
      return seriesList[currentIndexEpisode + 1];
    }

    return null;
  };

  const prevEpisode = () => {
    const currentIndexEpisode = seriesList.findIndex(
      (item) => item.id === episode.id
    );

    if (
      currentIndexEpisode !== -1 &&
      currentIndexEpisode !== 0 &&
      seriesList[currentIndexEpisode - 1] &&
      seriesList[currentIndexEpisode - 1].release
    ) {
      return seriesList[currentIndexEpisode - 1];
    }

    return null;
  };

  const handleNextEpisode = (item) => {
    setEpisode(item);
  };

  const closeVideo = () => {
    updateTimeStorage();
    setIsOpen(false);
  };

  const renderEpisodesNav = () => {
    const player = videoPlayerRef?.current?.player;

    if (player) {
      if (player?.isPlaying) {
        setIsButtons(false);
      }

      if (!player?.isPlaying) {
        setIsButtons(true);
      }
    }

    if (!player && videoPlayerRef?.current) {
      if (isEnd) {
        setIsButtons(true);
      } else {
        setIsButtons(false);
      }
    }
  };

  return (
    <div
      ref={ref}
      className="mx-auto text-white relative custom-player h-screen"
      onMouseMove={handleMouseMove}
      onMouseLeave={hanldeMouseLeave}
    >
      <button
        onClick={closeVideo}
        className="absolute w-10 h-10 md:w-14 md:h-14 right-2 md:right-7 top-7 outline-none z-20"
      >
        <img
          src="img/close.webp"
          alt="close"
          className="scale-75 opacity-80 hover:scale-100 hover:opacity-100 transition-transform"
        />
      </button>
      {/* <ReactPlayer
        url='https://play.boomstream.com/a0qdsfLW'
        width="100%"
        height="100vh"
        controls
        light={
          <div
            className="absolute w-full h-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${episode.previewImageUrl})` }}
          />
        }
        playIcon={
          <div>
            <img
              src="img/play-player.webp"
              className="opacity-60 scale-75 hover:opacity-100 hover:scale-100 w-[65px] md:w-[107px] transition-transform"
              alt="play icon"
            />
          </div>
        }
        onPlay={() => {
          setIsEnd(false);
        }}
        onEnded={() => {
          removeTimeStorage();
          videoPlayerRef?.current.showPreview();
          setIsButtons(true);
          setIsEnd(true);
        }}
        onPause={() => {
          updateTimeStorage();
        }}
      /> */}
      {!startVideo ? (
        <div>
          <div
            className="absolute w-full h-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(content/previews/${episode.season}/${episode.previewImageUrl})`,
            }}
          />
          <button
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setStartVideo(true)}
          >
            <img
              src="img/play-player.webp"
              className="opacity-60 scale-75 hover:opacity-100 hover:scale-100 w-[65px] md:w-[107px] transition-transform"
              alt="play icon"
            />
          </button>
        </div>
      ) : (
        <iframe
          src={`${episode.url}?autostart=1&size=0`}
          className="w-full h-full"
          title={episode.title}
          frameborder="0"
          scrolling="no"
          allowfullscreen=""
        />
      )}
      {isCustomControls && videoPlayerRef.current && (
        <Control
          ref={controlsRef}
          onPlayPause={playPauseHandler}
          playing={playing}
          onRewind={rewindHandler}
          onForward={handleFastFoward}
          played={played}
          loaded={loaded}
          onSeek={seekHandler}
          onSeekMouseUp={seekMouseUpHandler}
          onMouseSeekDown={onSeekMouseDownHandler}
          onMute={hanldeMute}
          muted={muted}
          onVolumeChange={handleVolumeChange}
          onVolumeSeekDown={handleVolumeSeekDown}
          onChangeDispayFormat={handleDisplayFormat}
          playbackRate={playbackRate}
          onPlaybackRateChange={handlePlaybackRate}
          volume={volume}
          elapsedTime={elapsedTime}
          totalDuration={totalDuration}
          title={episode.title}
          closeVideo={closeVideo}
        />
      )}
      {isButtons && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-end z-30">
            {nextEpisode() && nextEpisode().release && (
              <div
                className="max-w-[125px] md:max-w-[220px] mr-3 md:mr-6 p-2 rounded-xl hover:bg-white/20 cursor-pointer"
                onClick={() => handleNextEpisode(nextEpisode())}
              >
                <div className="relative group">
                  <img
                    src={`content/previews/${nextEpisode().season}/${
                      nextEpisode().previewImageUrl
                    }`}
                    alt="preview"
                  />
                </div>
                <div className="text-xs md:text-base mt-2 flex items-center md:gap-3">
                  <p>Следующий эпизод</p>
                  <img
                    src="img/arrow-for-episode.webp"
                    alt="arrow"
                    className="w-3"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-start">
            {prevEpisode() && prevEpisode().release && (
              <div
                className="max-w-[125px] md:max-w-[220px] ml-3 md:ml-6 p-2 rounded-xl hover:bg-white/20 cursor-pointer"
                onClick={() => handleNextEpisode(prevEpisode())}
              >
                <div className="relative group">
                  <img
                    src={`content/previews/${prevEpisode().season}/${
                      prevEpisode().previewImageUrl
                    }`}
                    alt="preview"
                  />
                </div>
                <div className="text-xs md:text-base mt-2 flex items-center gap-1">
                  <img
                    src="img/arrow-for-episode.webp"
                    alt="arrow"
                    className="w-3 rotate-180"
                  />
                  <p>Предыдущий эпизод</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default Player;
