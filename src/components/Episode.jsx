import { Transition } from "@headlessui/react";
import { Fragment, useContext, useState } from "react";
import { SeriesContext } from "./SeriesContext";
import { DateTime } from "luxon";

const Episode = ({ item, selectEpisode }) => {
  const [isHoverEpisode, setIsHoverEpisode] = useState(false);
  const [isHoverShow, setIsHoverShow] = useState(false);
  const [isHoverDownload, setIsHoverDownload] = useState(false);
  const { torrentUrl } = useContext(SeriesContext);

  const scheduled = DateTime.fromISO(`${item.release}T18:00:00`, {
    zone: "Europe/Moscow",
  });

  const handleSelectEpisode = () => {
    const now = DateTime.now().setZone("Europe/Moscow");

    if (now >= scheduled) {
      selectEpisode(item);
    } else {
      console.log("Episode not yet released");
    }
  };

  return (
    <div className="max-w-[482px] mx-auto">
      <div>
        <div
          onClick={handleSelectEpisode}
          className="w-full relative cursor-pointer"
          onMouseEnter={() => setIsHoverEpisode(true)}
          onMouseLeave={() => setIsHoverEpisode(false)}
        >
          <img
            src={`content/slider/${item.season}/${item.imageSlider}`}
            loading="lazy"
            alt={`preview-${item.id}`}
          />
          <Transition
            as={Fragment}
            show={item.release && isHoverEpisode}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <img
              loading="lazy"
              src="img/play-player.webp"
              alt="play btn"
              className="w-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </Transition>
        </div>
        <h3 className="text-2xl md:text-3xl text-[#443b30] mt-5">{`${item.seriesNumber}. ${item.title}`}</h3>
        <p className="text-lg md:text-[22px] text-[#a39c94] md:whitespace-pre-line">
          {item.description}
        </p>
      </div>
      {item.release && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => selectEpisode(item)}
            onMouseEnter={() => setIsHoverShow(true)}
            onMouseLeave={() => setIsHoverShow(false)}
            className={`bg-no-repeat py-1 pl-9 pr-4 text-sm md:text-[22px] md:leading-[30px] ransition-all bg-contain`}
            style={{
              backgroundImage: isHoverShow
                ? "url(img/watch-btn-hover.webp)"
                : "url(img/watch-btn.webp)",
            }}
          >
            <span className="opacity-0">Смотреть</span>
          </button>

          <a
            href={torrentUrl}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setIsHoverDownload(true)}
            onMouseLeave={() => setIsHoverDownload(false)}
            className={`bg-no-repeat py-1 pl-9 pr-4 text-sm md:text-[22px] md:leading-[30px] transition-all bg-contain`}
            style={{
              backgroundImage: isHoverDownload
                ? "url(img/download-btn-hover.webp)"
                : "url(img/download-btn.webp)",
            }}
          >
            <span className="opacity-0">Скачать</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Episode;
