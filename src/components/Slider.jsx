import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";

import Episode from "./Episode";

const Slider = ({ setIsOpen, setEpisode, seriesList, season, seasonTitle }) => {
  const nextRef = useRef(null);
  const prevRef = useRef(null);
  const swiperRef = useRef(null);
  const [seasonSeriesList, setseasonSeriesList] = useState([]);

  useEffect(() => {
    const filteredList = seriesList.filter(
      (seriesItem) => seriesItem.season === season
    );
    setseasonSeriesList(filteredList);
  }, [season, seriesList]);

  const selectEpisode = (itemEpisode) => {
    setEpisode(itemEpisode);
    setIsOpen(true);
    const audio = new Audio("thwip.mp3");
    audio.volume = 0.01;
    audio.play();
    window.ym(95413257, "reachGoal", "watch_sm_episode");
  };

  const pagination = {
    clickable: true,
    renderBullet: function (index, className) {
      return `<div class="${className} md:hidden"></div>`;
    },
  };

  return (
    <div className="md:px-14">
      <div className="grid grid-cols-1 md:grid-cols-2 1xl:grid-cols-3">
        <div className="max-w-[482px] w-full mx-auto text-center md:text-left flex gap-4 items-center flex-wrap md:flex-nowrap">
          <div
            className="flex-shrink-0 text-4xl md:text-6xl text-[#443b30] w-auto inline-block bg-[length:100%_64px] md:bg-[length:100%_116px] bg-no-repeat px-3 py-3 md:px-8 md:py-7"
            style={{ backgroundImage: 'url("img/1 сезон.webp")' }}
          >
            {season} сезон
          </div>
          {seasonTitle && (
            <div
              className="text-2xl whitespace-nowrap md:text-3xl text-[#443b30] w-auto inline-block bg-[length:100%_56px] md:bg-[length:100%_78px] bg-no-repeat px-3 py-3 md:px-6 md:py-6"
              style={{ backgroundImage: 'url("img/season-title.webp")' }}
            >
              {seasonTitle}
            </div>
          )}
        </div>
      </div>
      <div className="mt-7 md:mt-14 relative custom-swiper-container">
        {nextRef?.current && prevRef?.current && (
          <Swiper
            ref={swiperRef}
            slidesPerView={1}
            spaceBetween={10}
            pagination={pagination}
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: nextRef?.current || undefined,
              prevEl: prevRef?.current || undefined,
              disabledClass: "md:hidden",
              hiddenClass: "md:hidden",
            }}
            breakpoints={{
              1000: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1500: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
          >
            {seasonSeriesList.map((item) => (
              <SwiperSlide key={item.id}>
                <Episode item={item} selectEpisode={selectEpisode} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <button
          ref={prevRef}
          className="hidden md:block max-w-[24px] md:max-w-[40px] absolute top-[25%] -translate-y-1/2 -left-6 md:-left-12"
        >
          <img src="img/arrow-left.webp" alt="prev" className="w-full" />
        </button>
        <button
          ref={nextRef}
          className="hidden md:block max-w-[24px] md:max-w-[40px] absolute top-[25%] -translate-y-1/2 -right-6 md:-right-12"
        >
          <img src="img/arrow-right.webp" alt="next" className="w-full" />
        </button>
      </div>
    </div>
  );
};

export default Slider;
