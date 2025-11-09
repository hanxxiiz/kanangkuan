"use client";

import Card from "@/components/dashboard/my-decks/Card";
import CardsPageLayout from "@/components/dashboard/my-decks/CardsPageLayout";
import { useDecks } from "@/lib/hooks/useDecks";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function MyDeckPage({
    params,
}: {
    params: Promise<{ deckId: string }>
}) {
    const { deckId } = use(params);
    const { deck, deckLoading, deckError } = useDecks(deckId); 

    const deckName = deckLoading
        ? "Loading..."
        : deck?.deck_name || "Deck Not Found";

    return (
      <div className="w-full bg-white p-10">
        <CardsPageLayout
            title={deckName}
            onAddClick={() => {
                console.log("click");
            }}
        >   
            <Card
                id="sick"
                color="blue"
                front={`Basketball, basketball
                Ang sarap-sarap mag-basketball
                Ang lapad ng court, ang linis ng court
                Ang luwang ng ring ng basketball
                Pwedeng mag-dribble
                Bago ka mag-shoot
                Pwedeng shoot, sabay dribble`}
                back="justin nabuntura"
                />

            <Card
                id="sick"
                color="blue"
                front={`Basketball, basketball
                Ang sarap-sarap mag-basketball
                Ang lapad ng court, ang linis ng court`}
                back="justin nabuntura"
                />

            <Card
                id="sick"
                color="blue"
                front={`Basketball, basketball
                Ang sarap-sarap mag-basketball
                Ang lapad ng court, ang linis ng court
                Ang luwang ng ring ng basketball
                Pwedeng mag-dribble
                Bago ka mag-shoot
                Pwedeng shoot, sabay dribble`}
                back="justin nabuntura"
                />

            <Card
                id="sick"
                color="blue"
                front={`Basketball, basketball
                Ang sarap-sarap mag-basketball
                Ang lapad ng court, ang linis ng court`}
                back="justin nabuntura"
                />
        </CardsPageLayout>
      </div>
    )
}
