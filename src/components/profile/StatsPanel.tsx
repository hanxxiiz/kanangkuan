"use client"

export default function StatsPanel() {
    return (
        <div>
            {/* XP */}
                    <div className="py-3.5">
                        <h1 className="font-bold text-3xl text-gray-900 py-3.5">XP</h1>
                        <div className="flex border-2 border-gray-900 max-h-2xl h-50 w-full rounded-2xl">
                            <img src="mascot-hero.svg" className=" content-center max-h-2xl h-50 w-50 rounded-2xl"></img>
                            <div className="mx-10 my-10 w-full">
                                <p className="text-gray-900 text-3xl font-body">Level: 50</p>
                                <div className="flex">
                                    <div className="relative w-full my-5 bg-gray-900 lg:h-sm h-7 rounded-2xl overflow-visible">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-sm h-7 rounded-2xl z-10"
                                            style={{ background: "linear-gradient(90deg, #FD14BB 0%, #C401DB 100%)"}}></div>
                                    </div>
                                    <p className="text-gray-900 text-3xl font-body pl-5">50 XP</p>
                                </div>
                            </div>
                        </div>
                    </div>

            {/* My Progress */}
                    <div className="py-3.5">
                        <h1 className="font-bold text-3xl text-gray-900 py-3.5">MY PROGRESS</h1>
                        <div className="h-150 w-full rounded bg-gray-500 rounded-2xl"  style={{background: "#00FFD1"}}>
                            {/* Weekdays header */}
                            <div className="p-10">
                                <div className="grid grid-cols-7 gap-x-2 px-4 text-gray-900">
                                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                                        <div key={d} className="text-center text-2xl font-body text-muted-foreground">{d}</div>
                                    ))}
                                </div>

                                {/* Days grid: 5 rows x 7 columns (35 items) */}
                                <div className="grid grid-cols-7 gap-x-2 gap-y-10 px-4 mt-10 place-items-center">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-center">
                                    <div className="size-11 sm:size-12 md:size-13 rounded-full border-2 border-gray-900" />
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
        </div>
    )
}
