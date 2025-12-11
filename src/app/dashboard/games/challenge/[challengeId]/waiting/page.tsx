import WaitingChallengePlayers from "@/components/dashboard/games/WaitingChallengePlayers";
import Image from "next/image";


export default async function ChallengeWaitingScreen({ params }: {
    params: Promise<{ challengeId: string }>
}) {
    const { challengeId } = await params;

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
            <Image
                src="/practice/challenge-waiting.svg"
                alt="Waiting..."
                width={100}
                height={100}
                sizes="100vw"
                className="absolute w-[125%] top-10 lg:-top-10 lg:w-5/6 pointer-events-none z-20"
            />

            <Image
                src="/practice/clouds.svg"
                alt="Waiting..."
                width={100}
                height={100}
                sizes="100vw"
                className="absolute -bottom-1/8 w-full pointer-events-none z-20"
            />

            <div className="absolute z-50 bottom-[15%] ">
                <WaitingChallengePlayers challengeId={challengeId} />
            </div>
        </div>
    );
}
