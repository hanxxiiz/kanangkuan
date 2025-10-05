"use client";

import React, { useEffect, useRef} from "react";
import Link from "next/link";
import MascotBlink from "@/components/MascotBlink";
import CardCarousel from "@/components/CardCarousel";

export default function Home() {
  const slides = [
    { 
      title: "Decks", 
      description: "A playful collections of tools and features you can flip through with ease. Each deck is designed to keep things simple, handy, and a little more fun, so you can discover, learn, and do more without the boring stuff.", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-auto" fill="none">
          <path 
            d="M20,11h-2.528c-.155,0-.309-.036-.448-.106l-3.155-1.578c-.416-.208-.875-.316-1.34-.316h-2.029
              c-1.933,0-3.5,1.567-3.5,3.5v6.5c0,2.209,1.791,4,4,4h9c2.209,0,4-1.791,4-4v-4c0-2.209-1.791-4-4-4ZM6.54,23h-1.54
              c-2.761,0-5-2.239-5-5V6C0,3.239,2.239,1,5,1h2.528c.466,0,.925,.108,1.341,.317l3.156,1.578c.138,.069,.291,.105,.446,.105h6.528
              c2.761,0,5,2.239,5,5v2.54c-1.063-.954-2.462-1.54-4-1.54h-2.292l-2.945-1.473c-.694-.347-1.458-.527-2.234-.527h-2.029
              c-3.038,0-5.5,2.462-5.5,5.5v6.5c0,1.538,.586,2.937,1.54,4Z"
            fill="currentColor"
          />
        </svg>
      ),
      color: "bg-purple text-white" 
    },
    { 
      title: "Games", 
      description: "Learning meets play with fun multiple-choice challenges and modes that keep you on your toes. Lose (lives) for wrong answers, stay sharp, and make every round a chance to improve and earn XP points to increase your chances onto the top leaderboard.", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-auto" fill="none">
          <path 
            d="M11.994,3.212C6.644,3.212,1.155,4.343,1,12.323c.047,2.322,.562,5.382,1.607,6.983,.667,1.021,1.849,1.567,
            3.089,1.426,1.23-.14,2.254-.932,2.671-2.067,.6-1.639,1.757-2.41,3.625-2.424,1.845,.015,3.02,.829,3.643,2.472,.804,
            2.121,2.912,2.077,3.041,2.077,1.09,0,2.099-.53,2.696-1.438,1.06-1.607,1.581-4.688,1.628-7.067-.152-7.984-6.09-9.072-11.006-9.072ZM7.206,
            12.965l-.849-.849-.849,.849c-.39,.39-1.023,.391-1.414,0s-.39-1.024,0-1.414l.849-.849-.849-.849c-.391-.391-.39-1.024,0-1.414s1.023-.391,1.414,0l.849,
            .849,.849-.849c.39-.39,1.023-.391,1.414,0s.39,1.024,0,1.414l-.849,.849,.849,.849c.391,.391,.39,1.024,0,1.414s-1.023,.391-1.414,0Zm9.239-6.668c.831,
            0,1.505,.674,1.505,1.505s-.674,1.505-1.505,1.505-1.505-.674-1.505-1.505,.674-1.505,1.505-1.505Zm-2.895,5.909c-.831,0-1.505-.674-1.505-1.505s.674-1.505,
            1.505-1.505,1.505,.674,1.505,1.505-.674,1.505-1.505,1.505Zm2.895,2.9c-.831,0-1.505-.674-1.505-1.505s.674-1.505,1.505-1.505,1.505,.674,1.505,1.505-.674,
            1.505-1.505,1.505Zm2.895-2.9c-.831,0-1.505-.674-1.505-1.505s.674-1.505,1.505-1.505,1.505,.674,1.505,1.505-.674,1.505-1.505,1.505Z"
            fill="currentColor"
          />
        </svg>),
      color: "bg-pink text-white" 
    },
    { 
      title: "Leaderboard", 
      description: "Stay motivated with friendly competition! Battle it out on the friends leaderboard in the games mode, or go all-in and climb the global leaderboard to prove your smarts to the whole community.", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-auto" fill="none">
          <path 
            d="m9.829,7.762c-.141,0-.282-.045-.4-.133-.227-.17-.321-.464-.236-.734l.627-2.011-1.585-1.29c-.213-.181-.291-.476-.194-.738.096-.262.346-.437.626-.437h2.001l.708-1.987C11.472.173,11.722,0,12,0s.528.173.625.434l.708,
            1.987h2.001c.28,0,.53.175.626.438s.017.558-.197.739l-1.577,1.285.652,1.987c.089.269-.001.565-.226.738-.225.173-.534.185-.771.031l-1.836-1.196-1.805,1.208c-.112.075-.242.113-.371.113Zm3.171,1.238h-2c-1.381,0-2.5,
            1.119-2.5,2.5v10c0,1.381,1.119,2.5,2.5,2.5h2c1.381,0,2.5-1.119,2.5-2.5v-10c0-1.381-1.119-2.5-2.5-2.5Zm8.5,7h-1.5c-1.381,0-2.5,1.119-2.5,2.5v3c0,1.381,1.119,2.5,2.5,2.5h1.5c1.381,0,2.5-1.119,2.5-2.5v-3c0-1.381-1.119-2.5-2.5-2.5Zm-17.5-3h-1.5c-1.381,
            0-2.5,1.119-2.5,2.5v6c0,1.381,1.119,2.5,2.5,2.5h1.5c1.381,0,2.5-1.119,2.5-2.5v-6c0-1.381-1.119-2.5-2.5-2.5Z"
            fill="currentColor"
          />
        </svg>
      ),
      color: "bg-lime text-white" 
    },
    { 
      title: "AI Import", 
      description: "Turn your files, notes, or readings into smart decks and flashcards instantly. Study with active recall, listen to your decks with the audio player, and challenge yourself with modes that test your memory.", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-auto" fill="none">
          <path 
            d="m19.5,9c-.46,0-.874-.28-1.045-.708l-.853-1.911-1.914-.897c-.424-.179-.697-.597-.688-1.057.009-.46.297-.868.727-1.031l1.948-.738.78-1.951c.171-.427.584-.708,1.045-.708s.874.28,1.045.708l.785,1.963,1.963.785c.427.171.708.584.708,
            1.045s-.28.874-.708,1.045l-1.963.785-.785,1.963c-.171.427-.584.708-1.045.708Zm3.162,1.473c-1.222.505-2.618.675-4.076.388-2.72-.536-4.911-2.727-5.447-5.447-.287-1.458-.118-2.854.388-4.076.264-.639-.204-1.338-.895-1.338h-7.632C2.239,
            0,0,2.239,0,5v14c0,2.761,2.239,5,5,5h14c2.761,0,5-2.239,5-5v-7.632c0-.691-.699-1.159-1.338-.895Zm-8.964,8.527c-.443,0-.831-.294-.952-.72l-.643-2.28h-5.206l-.643,2.28c-.12.426-.509.72-.952.72h0c-.654,
            0-1.128-.624-.953-1.254l3.091-11.108c.141-.608.541-1.12,1.098-1.405.568-.292,1.22-.31,1.839-.05.587.246,1.037.817,1.204,1.535l3.071,11.029c.175.63-.298,1.254-.953,1.254Zm5.302-1c0,.552-.448,1-1,1s-1-.448-1-1v-4.912c0-.552.448-1,
            1-1s1,.448,1,1v4.912ZM9.39,7.165l-1.929,6.835h4.077l-1.929-6.835c-.029-.114-.191-.114-.219,0Z"
            fill="currentColor" 
          />
        </svg>
      ),
      color: "bg-cyan text-white" 
    },
  ];

  const practiceSlides = [
    {
      title: "Active Recall", 
      description: "Struggle a little, remember a lot — it’s the good kind of brain sweat!", 
      image: "active-recall.png",
      color: "bg-blue",
    },
    {
      title: "Basic Review", 
      description: "Vibe with your notes, scroll, and let the info slowly click into place.", 
      image: "basic-review.png",
      color: "bg-purple",
    },
    {
      title: "Audio Player", 
      description: "Tune in and listen to your notes anytime, anywhere.", 
      image: "audio-player.png",
      color: "bg-cyan",
    },
    {
      title: "Challenge", 
      description: "Go head-to-head with friends in real-time brain duels—fierce, and fun!", 
      image: "challenge.png",
      color: "bg-pink",
    },
    {
      title: "Lumbaanay", 
      description: "It’s a study showdown! Race your barkada in real-time to see who’s the true quiz champ!", 
      image: "lumbaanay.png",
      color: "bg-lime",
    }
  ];

  const mascotRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const leftPupil = document.getElementById("eye-left-pupil");
      const rightPupil = document.getElementById("eye-right-pupil");
      const heading = headingRef.current; 
      
      if (!leftPupil || !rightPupil || !heading) return;

      // MAXIMUM PUPIL AND TEXT MOVEMENT
      const maxPupilOffset = 30;
      const textStartOffset = -350; 
      const textEndOffset = 500; 
      const textTotalRange = textEndOffset - textStartOffset;

      //SCROLL PROGRESS CALCULATION 
      const scrollTop = window.scrollY;
      const scrollHeight = window.innerHeight;
      const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
      const pupilTranslateY = (scrollProgress * 2 - 1) * maxPupilOffset;
      const textTranslateY = textStartOffset + (scrollProgress * textTotalRange);

      leftPupil.setAttribute('transform', `translate(0, ${pupilTranslateY})`);
      rightPupil.setAttribute('transform', `translate(0, ${pupilTranslateY})`);
      heading.style.transform = `translateY(${textTranslateY}px)`;
    };
    
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center">
      {/* HERO SECTION */}
      <section className="w-full h-screen flex flex-col bg-fixed">
        <div ref={mascotRef} className="relative">
          <div
            ref={headingRef}
            className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none transition-transform duration-200 ease-out"
          >
            <h1 className="text-9xl font-main text-white">Kanang Kuan</h1>
            <p className="text-white font-body text-2xl mt-4">
              Helping your brain, one ‘kuan’ at a time.
            </p>
          </div>
          <MascotBlink />
        </div>
      </section>

      {/* CLOUDS DIVIDER */}
      <div className="relative w-full bg-transparent overflow-hidden z-20">
        <svg
            viewBox="0 0 1440 588"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
          <g clipPath="url(#clip0_344_4)">
          <path d="M11.8368 90.9197C102.398 66.6539 195.483 120.397 219.749 210.958C227.471 239.775 227.29 268.846 220.542 295.876C261.541 316.362 293.913 353.642 306.708 401.395C330.428 489.918 277.895 580.907 189.373 604.627C119.422 623.37 47.9325 594.499 9.31015 537.883C-10.3223 560.622 -36.7468 577.919 -67.9524 586.281C-123.634 601.201 -180.359 583.878 -218.307 545.759C-237.003 564.609 -260.784 578.914 -288.278 586.281C-371.113 608.476 -456.257 559.318 -478.452 476.484C-500.647 393.649 -451.49 308.505 -368.655 286.31C-356.055 282.934 -343.401 281.211 -330.923 281.004C-317.791 227.875 -276.915 183.317 -220.313 168.151C-177.571 156.698 -134.213 164.243 -99.2069 185.61C-79.0463 140.586 -39.5281 104.683 11.8368 90.9197Z" fill="white"/>
          <path d="M1419.34 75.9582C1327.21 58.5529 1238.42 119.126 1221.01 211.252C1215.47 240.567 1217.83 269.543 1226.59 295.99C1187.24 319.494 1157.76 359.097 1148.58 407.675C1131.57 497.727 1190.78 584.52 1280.83 601.533C1351.99 614.977 1421.11 580.827 1455.38 521.473C1476.66 542.676 1504.31 557.942 1536.05 563.94C1592.7 574.642 1647.96 553.114 1682.94 512.255C1703 529.651 1727.79 542.131 1755.76 547.415C1840.02 563.336 1921.24 507.93 1937.16 423.665C1953.08 339.399 1897.68 258.181 1813.41 242.261C1800.59 239.839 1787.85 239.07 1775.39 239.8C1758.31 187.806 1714.2 146.439 1656.62 135.56C1613.14 127.346 1570.47 138.121 1537.17 162.053C1513.69 118.668 1471.59 85.8302 1419.34 75.9582Z" fill="white"/>
          <path d="M436.98 115.032C488.914 115.032 534.169 143.627 557.861 185.93C573.625 179.691 590.808 176.262 608.791 176.262C675.8 176.262 731.688 223.866 744.488 287.099C766.479 308.441 780.144 338.313 780.145 371.377C780.145 436.234 727.567 488.812 662.71 488.812C641.789 488.812 622.147 483.34 605.134 473.751C580.532 496.164 547.823 509.831 511.92 509.831C467.713 509.831 428.344 489.112 402.995 456.856C379.003 476.809 348.164 488.812 314.52 488.812C238.054 488.812 176.066 426.824 176.065 350.359C176.065 277.169 232.855 217.246 304.773 212.244C322.325 155.921 374.878 115.033 436.98 115.032Z" fill="white"/>
          <path d="M997.198 131.889C945.41 135.784 902.428 167.692 881.975 211.653C865.787 206.613 848.396 204.483 830.463 205.832C763.644 210.857 711.483 262.519 703.461 326.534C683.133 349.465 671.746 380.278 674.226 413.249C679.09 477.924 735.463 526.409 800.138 521.545C821 519.976 840.176 513.047 856.422 502.209C882.635 522.714 916.278 533.889 952.079 531.196C996.162 527.881 1033.87 504.267 1056.72 470.2C1082.15 488.299 1113.8 497.954 1147.35 495.431C1223.6 489.696 1280.76 423.234 1275.03 346.983C1269.54 274 1208.41 218.505 1136.32 218.911C1114.6 164.063 1059.13 127.231 997.198 131.889Z" fill="white"/>
          <rect y="452" width="1440" height="174" fill="white"/>
          </g>
          <defs>
          <clipPath id="clip0_344_4">
          <rect width="1440" height="608"/>
          </clipPath>
          </defs>
        </svg>

      </div>

      {/* OUR FEATURES SECTION */}
      <section id="#features" className="w-full bg-white z-30 -mt-75">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-5/12 flex-shrink-0">
              <h2 className="text-8xl font-main text-gray-900">
                OUR FEATURES
              </h2>
              <p className="text-base font-body text-gray-600 leading-relaxed">
                Turn your own notes into flashcards, compete on leaderboards, and stay motivated while mastering your lessons effortlessly—all while helping you remember those “kanang-kuan” moments.
              </p>
            </div>

            <div className="w-full lg:w-7/12 relative overflow-hidden py-8">
              <div className="absolute top-0 left-0 h-full w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
              <div className="absolute top-0 right-0 h-full w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

              <CardCarousel
                cards={slides}
                breakpoints={{
                  1920: { slidesPerView: 4, spaceBetween: 8 },
                  1028: { slidesPerView: 2, spaceBetween: 8 },
                  640: { slidesPerView: 1, spaceBetween: 8 },
                }}
                renderCard={(card, isActive) => (
                  <div
                    className={`rounded-2xl h-96 flex flex-col justify-center items-center transition-all duration-300 ${
                      isActive ? "scale-100 shadow-xl" : "scale-75 opacity-50"
                    } ${card.color}`}
                  >
                    <span className="text-7xl mb-4">{card.icon}</span>
                    <span className="text-3xl font-main mb-2">{card.title}</span>
                    <span className="text-sm font-body opacity-80 px-10 text-center">
                      {card.description}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </section>

      
      {/* PRACTICE MODES */}
      <section className="w-full bg-black">
        <div className="max-w-7xl mx-auto px-8 py-16 ">
          <div className="flex flex-col items-center">
            <p className="text-lg font-body text-gray-200 leading-relaxed">
                Enjoy a fun, interactive learning experience and test your skills with
            </p>
            <h1 className="text-8xl font-main text-white">
              Practice Modes
            </h1>

            <div className="w-full relative overflow-hidden py-8">
                
              <CardCarousel
                cards={practiceSlides}
                breakpoints={{
                  1920: { slidesPerView: 5, spaceBetween: 1 },
                  1028: { slidesPerView: 3, spaceBetween: 1 },
                  640: { slidesPerView: 1, spaceBetween: 1 },
                }}
                renderCard={(card, isActive) => (
                  <div
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isActive ? "scale-100 shadow-xl" : "scale-75 opacity-50"
                    } ${card.color}`}
                    style={{ width: '400px', height: 'auto' }}
                  >
                    <div className="w-full p-4 flex flex-col items-center justify-center">
                      <div className="relative w-full h-full rounded-xl overflow-hidden bg-white shadow-sm">
                        <img 
                          src={card.image} 
                          alt={card.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="justify-left m-2">
                        <h3 className="text-3xl font-semibold font-main text-white">
                          {card.title}
                        </h3>
                        <p className="text-sm font-body text-gray-100">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </section>


      {/* ABOUT SECTION */}
      <section id="about" className="w-full bg-black">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full">
              <img
                src="about.png"
                alt="Descriptive Alt Text"
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
              <h1 className="text-5xl font-main text-white -mb-10">
                About
              </h1>
              <div className="w-full">
                <img
                  src="kanangkuan-wordmark.svg"
                  alt="Kanang Kuan"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-lg font-body text-gray-200 -mt-5 leading-relaxed">
                Kanang Kuan helps you turn those ‘hala, familiar’ moments into ‘I got this!’ wins. 
                With AI-powered decks and fun games to play with friends or classmates, studying feels less like work and more like a good time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CLOUDS DIVIDER */}
      <div className="relative w-full -mt-20 bg-transparent overflow-hidden z-20">
        <svg
            viewBox="0 0 1440 588"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
          <g clipPath="url(#clip0_344_4)">
          <path d="M11.8368 90.9197C102.398 66.6539 195.483 120.397 219.749 210.958C227.471 239.775 227.29 268.846 220.542 295.876C261.541 316.362 293.913 353.642 306.708 401.395C330.428 489.918 277.895 580.907 189.373 604.627C119.422 623.37 47.9325 594.499 9.31015 537.883C-10.3223 560.622 -36.7468 577.919 -67.9524 586.281C-123.634 601.201 -180.359 583.878 -218.307 545.759C-237.003 564.609 -260.784 578.914 -288.278 586.281C-371.113 608.476 -456.257 559.318 -478.452 476.484C-500.647 393.649 -451.49 308.505 -368.655 286.31C-356.055 282.934 -343.401 281.211 -330.923 281.004C-317.791 227.875 -276.915 183.317 -220.313 168.151C-177.571 156.698 -134.213 164.243 -99.2069 185.61C-79.0463 140.586 -39.5281 104.683 11.8368 90.9197Z" fill="white"/>
          <path d="M1419.34 75.9582C1327.21 58.5529 1238.42 119.126 1221.01 211.252C1215.47 240.567 1217.83 269.543 1226.59 295.99C1187.24 319.494 1157.76 359.097 1148.58 407.675C1131.57 497.727 1190.78 584.52 1280.83 601.533C1351.99 614.977 1421.11 580.827 1455.38 521.473C1476.66 542.676 1504.31 557.942 1536.05 563.94C1592.7 574.642 1647.96 553.114 1682.94 512.255C1703 529.651 1727.79 542.131 1755.76 547.415C1840.02 563.336 1921.24 507.93 1937.16 423.665C1953.08 339.399 1897.68 258.181 1813.41 242.261C1800.59 239.839 1787.85 239.07 1775.39 239.8C1758.31 187.806 1714.2 146.439 1656.62 135.56C1613.14 127.346 1570.47 138.121 1537.17 162.053C1513.69 118.668 1471.59 85.8302 1419.34 75.9582Z" fill="white"/>
          <path d="M436.98 115.032C488.914 115.032 534.169 143.627 557.861 185.93C573.625 179.691 590.808 176.262 608.791 176.262C675.8 176.262 731.688 223.866 744.488 287.099C766.479 308.441 780.144 338.313 780.145 371.377C780.145 436.234 727.567 488.812 662.71 488.812C641.789 488.812 622.147 483.34 605.134 473.751C580.532 496.164 547.823 509.831 511.92 509.831C467.713 509.831 428.344 489.112 402.995 456.856C379.003 476.809 348.164 488.812 314.52 488.812C238.054 488.812 176.066 426.824 176.065 350.359C176.065 277.169 232.855 217.246 304.773 212.244C322.325 155.921 374.878 115.033 436.98 115.032Z" fill="white"/>
          <path d="M997.198 131.889C945.41 135.784 902.428 167.692 881.975 211.653C865.787 206.613 848.396 204.483 830.463 205.832C763.644 210.857 711.483 262.519 703.461 326.534C683.133 349.465 671.746 380.278 674.226 413.249C679.09 477.924 735.463 526.409 800.138 521.545C821 519.976 840.176 513.047 856.422 502.209C882.635 522.714 916.278 533.889 952.079 531.196C996.162 527.881 1033.87 504.267 1056.72 470.2C1082.15 488.299 1113.8 497.954 1147.35 495.431C1223.6 489.696 1280.76 423.234 1275.03 346.983C1269.54 274 1208.41 218.505 1136.32 218.911C1114.6 164.063 1059.13 127.231 997.198 131.889Z" fill="white"/>
          <rect y="452" width="1440" height="174" fill="white"/>
          </g>
          <defs>
          <clipPath id="clip0_344_4">
          <rect width="1440" height="608"/>
          </clipPath>
          </defs>
        </svg>

      </div>

      {/* CTA SECTION */}
      <section className="w-full -mt-80 bg-white z-30">
        <div className="max-w-7xl mx-auto px-8 py-60">
          <div className="flex flex-col items-center">
            <h1 className="text-7xl font-main text-center text-black">
              Turn every ‘hala familiar’ into <br /> I got this!
            </h1>
            <Link
                href="/signin"
                className="m-10 px-40 py-5 bg-lime cursor-pointer text-white text-lg font-main rounded-full hover:bg-pink hover:scale-110 transition-all duration-300"
              >
                Start Learning
            </Link>
          </div>
        </div>
      </section>


      {/* CLOUDS DIVIDER */}
      <div className="relative -mt-90 w-full bg-transparent overflow-hidden z-20">
        <svg
            viewBox="0 0 1440 588"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto transform scale-y-[-1]"
            preserveAspectRatio="none"
          >
          <g clipPath="url(#clip0_344_4)">
          <path d="M11.8368 90.9197C102.398 66.6539 195.483 120.397 219.749 210.958C227.471 239.775 227.29 268.846 220.542 295.876C261.541 316.362 293.913 353.642 306.708 401.395C330.428 489.918 277.895 580.907 189.373 604.627C119.422 623.37 47.9325 594.499 9.31015 537.883C-10.3223 560.622 -36.7468 577.919 -67.9524 586.281C-123.634 601.201 -180.359 583.878 -218.307 545.759C-237.003 564.609 -260.784 578.914 -288.278 586.281C-371.113 608.476 -456.257 559.318 -478.452 476.484C-500.647 393.649 -451.49 308.505 -368.655 286.31C-356.055 282.934 -343.401 281.211 -330.923 281.004C-317.791 227.875 -276.915 183.317 -220.313 168.151C-177.571 156.698 -134.213 164.243 -99.2069 185.61C-79.0463 140.586 -39.5281 104.683 11.8368 90.9197Z" fill="white"/>
          <path d="M1419.34 75.9582C1327.21 58.5529 1238.42 119.126 1221.01 211.252C1215.47 240.567 1217.83 269.543 1226.59 295.99C1187.24 319.494 1157.76 359.097 1148.58 407.675C1131.57 497.727 1190.78 584.52 1280.83 601.533C1351.99 614.977 1421.11 580.827 1455.38 521.473C1476.66 542.676 1504.31 557.942 1536.05 563.94C1592.7 574.642 1647.96 553.114 1682.94 512.255C1703 529.651 1727.79 542.131 1755.76 547.415C1840.02 563.336 1921.24 507.93 1937.16 423.665C1953.08 339.399 1897.68 258.181 1813.41 242.261C1800.59 239.839 1787.85 239.07 1775.39 239.8C1758.31 187.806 1714.2 146.439 1656.62 135.56C1613.14 127.346 1570.47 138.121 1537.17 162.053C1513.69 118.668 1471.59 85.8302 1419.34 75.9582Z" fill="white"/>
          <path d="M436.98 115.032C488.914 115.032 534.169 143.627 557.861 185.93C573.625 179.691 590.808 176.262 608.791 176.262C675.8 176.262 731.688 223.866 744.488 287.099C766.479 308.441 780.144 338.313 780.145 371.377C780.145 436.234 727.567 488.812 662.71 488.812C641.789 488.812 622.147 483.34 605.134 473.751C580.532 496.164 547.823 509.831 511.92 509.831C467.713 509.831 428.344 489.112 402.995 456.856C379.003 476.809 348.164 488.812 314.52 488.812C238.054 488.812 176.066 426.824 176.065 350.359C176.065 277.169 232.855 217.246 304.773 212.244C322.325 155.921 374.878 115.033 436.98 115.032Z" fill="white"/>
          <path d="M997.198 131.889C945.41 135.784 902.428 167.692 881.975 211.653C865.787 206.613 848.396 204.483 830.463 205.832C763.644 210.857 711.483 262.519 703.461 326.534C683.133 349.465 671.746 380.278 674.226 413.249C679.09 477.924 735.463 526.409 800.138 521.545C821 519.976 840.176 513.047 856.422 502.209C882.635 522.714 916.278 533.889 952.079 531.196C996.162 527.881 1033.87 504.267 1056.72 470.2C1082.15 488.299 1113.8 497.954 1147.35 495.431C1223.6 489.696 1280.76 423.234 1275.03 346.983C1269.54 274 1208.41 218.505 1136.32 218.911C1114.6 164.063 1059.13 127.231 997.198 131.889Z" fill="white"/>
          <rect y="452" width="1440" height="174" fill="white"/>
          </g>
          <defs>
          <clipPath id="clip0_344_4">
          <rect width="1440" height="608"/>
          </clipPath>
          </defs>
        </svg>

      </div>


      {/* FOOTER */}
      <footer className="w-full bg-black -mt-20">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col items-center">
            <p className="text-base font-body text-center text-white">
              © 2025 Kanang Kuan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}