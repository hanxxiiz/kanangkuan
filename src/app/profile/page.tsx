"use client";
import React, {useRef, useState, useEffect} from 'react';
import FeedPanel from '@/components/profile/FeedPanel';
import StatsPanel from '@/components/profile/StatsPanel';
import DecksPanel from '@/components/profile/DecksPanel';



function ProfilePage() {
    // Navbar animation
    const navbarRef = useRef<HTMLDivElement>(null);
    const feedRef = useRef<HTMLLIElement>(null);
    const statsRef = useRef<HTMLLIElement>(null);
    const decksRef = useRef<HTMLLIElement>(null);
    const containerRef = useRef<HTMLUListElement>(null);

    function moveNavbar(targetRef: { current: HTMLLIElement | null }) {
        if (navbarRef.current && targetRef.current && containerRef.current) {
            // Get positions relative to container
            const containerRect = containerRef.current.getBoundingClientRect();
            const targetRect = targetRef.current.getBoundingClientRect();
            
            // Calculate the center position of the target relative to container
            const targetCenter = targetRect.left - containerRect.left + (targetRect.width / 2);
            const indicatorHalfWidth = navbarRef.current.offsetWidth / 2;
            
            // Position indicator centered under the target
            navbarRef.current.style.left = `${targetCenter - indicatorHalfWidth}px`;
        }
    }

    //Navbar Panels
    const [activePanel, setActivePanel] = useState<'feed' | 'stats' | 'decks'>('feed');
    const handlePanelClick = (tab: 'feed' | 'stats' | 'decks', ref: { current: HTMLLIElement | null }) => {
        setActivePanel(tab);
        moveNavbar(ref); // your existing function
    };

    //initialize ang position sa navbar
    useEffect(() => {
        moveNavbar(feedRef);
    }, []);

    return (
         <main className="min-h-screen w-full bg-white">
            {/* Top Navbar */}
            <section>
                <div className="flex justify-between max-w-full mx-auto px-4 py-3 sm:px-6 lg:px-8" 
                        style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.20)' }}>
                    <div className="flex">
                        <button className="items-center bg-blue-500 text-white w-10 h-10 lg:w-10 lg:h-10 sm:w-9 sm:h-9 rounded-full">
                            </button>
                        <h1 className="items-center text-2xl font-bold font-main text-gray-900 px-4" 
                            style={{color:"#8AFF00"}}>Kanang Kuan</h1>
                    </div>        
                    
                    <div className="flex flex-row lg:gap-1 sm:gap-1">
                        <button className="bg-blue-500 text-white lg:w-10 lg:h-10 sm:w-8 sm:h-8 min-h-8 min-w-8 rounded-full"></button>
                        <button className="bg-blue-500 text-white lg:w-10 lg:h-10 sm:w-8 sm:h-8 min-h-8 min-w-8 rounded-full"></button>
                        <button className="bg-blue-500 text-white lg:w-10 lg:h-10 sm:w-8 sm:h-8 min-h-8 min-w-8 rounded-full"></button>                   
                    </div>
                    
                    
                </div>
            </section>
            

            <section className="flex overflow-y-auto">
                {/* slidebar */}
                <div className="bg-[#101220] min-h-screen max-w-13em lg:w-52 md:w-40 sm:w-32"></div>

                {/* main content */}
                <section className="min-h-screen w-full transition-all duration-500 ease-in-out mx-16">
                    <div className="flex my-3.5 mb-8 items-center justify-between max-w-full ">
                        <h1 className="font-bold text-5xl text-gray-900 mr-0">Profile</h1>
                        <div className="flex">
                            <div className="bg-blue-500 text-white w-8 h-8 mx-2 rounded-full"></div>
                            <div className="flex bg-blue-500 w-30 h-8 mx-2 rounded-full" style={{background: "#00FFD1"}}>
                                <p className="flex text-gray-900 px-9 items-center font-body font-bold">Profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <section>
                        <div className="relative max-h-70 h-70 w-full">
                            <div className="absolute max-h-2xl h-50 w-full rounded rounded-2xl"
                                style={{ background: "linear-gradient(80deg, #8AFF00 0%, #00FFD1 44%, #00FFD1 100%)"}}
                            ></div>
                            <img src="mascot-hero.svg" className="absolute bottom-0 m-10 max-w-xs max-h-xs w-50 h-50 rounded-full bg-gray-900 z-10"></img>
                            <div className="relative flex flex-col left-70 top-10">
                                <p className="text-gray-900 text-4xl font-bold font-main">[Username]</p>
                                <p className="text-gray-900 text-2xl font-body my-2">[Name]</p>
                                
                                <div className="flex items-center">
                                    <p className="text-gray-800 text-md font-body">0 Following</p>
                                    <div className="w-1 h-1 bg-gray-900 rounded-full m-3"></div>
                                    <p className="text-gray-900 text-md font-body">0 Followers</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Navbar */}
                    <section className="mb-5">
                        <ul ref={containerRef} 
                            className="flex items-center justify-center mb-5 lg:gap-40 sm:gap-20 text-2xl text-gray-900 font-body list-none"
                            role="PanelList">
                            <li ref ={feedRef}>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activePanel === 'feed'}
                                    onClick={() => handlePanelClick('feed', feedRef)}
                                    className={activePanel === 'feed' ? 'font-bold cursor-pointer' : 'opacity-70 cursor-pointer'}
                                    >
                                    Feed
                                    </button>
                                </li>
                                <li ref={statsRef}>
                                    <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activePanel === 'stats'}
                                    onClick={() => handlePanelClick('stats', statsRef)}
                                    className={activePanel === 'stats' ? 'font-bold cursor-pointer' : 'opacity-70 cursor-pointer'}
                                    >
                                    Stats
                                    </button>
                                </li>
                                <li ref={decksRef}>
                                    <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activePanel === 'decks'}
                                    onClick={() => handlePanelClick('decks', decksRef)}
                                    className={activePanel === 'decks' ? 'font-bold cursor-pointer' : 'opacity-70 cursor-pointer'}
                                    >
                                    Decks
                                    </button>
                            </li>
                        </ul>
                        <div className="relative h-1 w-full rounded bg-gray-200 rounded-2xl">
                            <div className="Navbar absolute h-1 w-35 rounded bg-gray-900 transition-all duration-500 ease-in-out"
                                ref={navbarRef}
                                style={{ left: '0px' }}></div>
                        </div>
                    </section>

                    {/* Panel Content */}
                    <section className="mt-6">
                        {activePanel === "feed" && <FeedPanel switchToDecks={() => 
                            {setActivePanel('decks');
                             moveNavbar(decksRef);
                            }} />}
                        {activePanel === "stats" && <StatsPanel />}
                        {activePanel === "decks" && <DecksPanel />}
                    </section>
                    
                </section>

            </section>
        </main>
        
    );
}

export default ProfilePage;
