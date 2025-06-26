import { useEffect, useRef, useState } from "react";

import Modal from "./Modal";
import { SeriesContext } from "./SeriesContext";
import Player from "./Player";

import Slider from "./Slider";

const seasonTitle = {
  2: "Неогенный кошмар",
  3: "Грехи отцов",
  4: "ПАРТНЁРЫ ПО ОПАСНОСТИ"
};

const findedSeason = (list, season) => {
  return list.some((item) => item.season === season);
};

const SeasonSlider = () => {
  const [episode, setEpisode] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const playerContainerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [torrentUrl, setTorrentUrl] = useState("");

  const getData = () => {
    fetch("seriesList.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setSeriesList(myJson);
      });
  };

  const getDownloadData = () => {
    fetch("sp-downloadUrl.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setTorrentUrl(myJson.torrentUrl);
      });
  };

  useEffect(() => {
    getData();
    getDownloadData();
  }, []);

  return (
    <SeriesContext.Provider value={{ episode, setEpisode, torrentUrl }}>
      <div>
        <Modal onClose={() => setIsOpen(false)} isOpen={isOpen}>
          <Player
            seriesList={seriesList}
            ref={playerContainerRef}
            setIsOpen={setIsOpen}
          />
        </Modal>
        <div className="flex flex-col gap-[75px]">
          {findedSeason(seriesList, 1) && (
            <Slider
              season={1}
              seriesList={seriesList}
              setEpisode={setEpisode}
              setIsOpen={setIsOpen}
            />
          )}
          {findedSeason(seriesList, 2) && (
            <Slider
              season={2}
              seriesList={seriesList}
              setEpisode={setEpisode}
              setIsOpen={setIsOpen}
              seasonTitle={seasonTitle[2]}
            />
          )}
          {findedSeason(seriesList, 3) && (
            <Slider
              season={3}
              seriesList={seriesList}
              setEpisode={setEpisode}
              setIsOpen={setIsOpen}
              seasonTitle={seasonTitle[3]}
            />
          )}
          {findedSeason(seriesList, 4) && (
            <Slider
              season={4}
              seriesList={seriesList}
              setEpisode={setEpisode}
              setIsOpen={setIsOpen}
              seasonTitle={seasonTitle[4]}
            />
          )}
          {findedSeason(seriesList, 5) && (
            <Slider
              season={5}
              seriesList={seriesList}
              setEpisode={setEpisode}
              setIsOpen={setIsOpen}
              seasonTitle={seasonTitle[5]}
            />
          )}
        </div>
      </div>
    </SeriesContext.Provider>
  );
};

export default SeasonSlider;
