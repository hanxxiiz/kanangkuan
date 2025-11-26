import WaitingLumbaanayPlayers from "@/components/dashboard/games/WaitingLumbaanayPlayers";


export default async function LumbaanayWaitingScreen({ params }: {
    params: Promise<{ lumbaanayId: string }>
}) {
    const { lumbaanayId } = await params;

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
            <img
                src="/practice/challenge-waiting.svg"
                className="absolute w-full -top-10 lg:w-5/6 pointer-events-none z-20"
            />

            <img
                src="/practice/clouds.svg"
                className="absolute -bottom-1/8 w-full pointer-events-none z-20"
            />

            <div className="absolute z-50 bottom-[15%] ">
                <WaitingLumbaanayPlayers lumbaanayId={lumbaanayId} />
            </div>
        </div>
    );
}
