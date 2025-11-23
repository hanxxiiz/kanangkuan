"use client";

import { use, useContext } from 'react';
import { PracticeDataContext } from '@/components/dashboard/practice/PracticeLayout';

export default function ActiveRecallPage({ 
  params 
}: { 
  params: Promise<{ deckId: string }> 
}) {
  const { deckId } = use(params);
  const initialData = useContext(PracticeDataContext);
  
  // PracticeLayout already generated blank words and loaded cards
  // So cards are ready to use here!
  const cards = initialData?.cards || [];

  return (
    <div>
      {/* Your flashcard UI here */}
      {/* Use the cards - they already have blank_words populated */}
    </div>
  );
}