"use client";

import Card from "@/components/dashboard/my-decks/Card";
import CardsPageLayout from "@/components/dashboard/my-decks/CardsPageLayout";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function MyDeckPage({
    params,
}: {
    params: Promise<{ deckId: string }>
}) {
    const { deckId } = use(params);

    const router = useRouter();

    return (
      <div className="w-full bg-white p-10">
        <CardsPageLayout
            title="[Deck Name]"
            onAddClick={() => {
                console.log("cick");
            }}
        >
            <Card 
                id="sick"
                color="lime"
                front="Basketball, basketball Ang sarap-sarap mag-basketball"
                back="justin nabuntura"
            />

            <Card 
                id="sick"
                color="purple"
                front="Basketball, basketball Ang sarap-sarap mag-basketball"
                back="justin nabuntura"
            />

            <Card 
                id="sick"
                color="blue"
                front="Basketball, basketball Ang sarap-sarap mag-basketball Ang lapad ng court, ang linis ng court Ang luwang ng ring ng basketball Pwedeng mag-dribble Bago ka mag-shoot Pwedeng shoot, sabay dribble"
                back="justin nabuntura"
            />

            <Card 
                id="sick"
                color="pink"
                front="Basketball, basketball Ang sarap-sarap mag-basketball"
                back="justin nabuntura"
            />

            <Card 
                id="sick"
                color="cyan"
                front="Basketball, basketball Ang sarap-sarap mag-basketball"
                back="justin nabuntura"
            />
        </CardsPageLayout>
      </div>
    )
}
