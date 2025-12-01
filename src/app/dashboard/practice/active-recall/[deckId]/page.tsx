"use client";

import { use, useContext } from 'react';
import { PracticeDataContext } from '@/components/dashboard/practice/PracticeLayout';

export default function ActiveRecallPage({ 
  params 
}: { 
  params: Promise<{ deckId: string }> 
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { deckId } = use(params);
  const initialData = useContext(PracticeDataContext);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _cards = initialData?.cards || [];

  return (
    <div>
      {/* Your flashcard UI here */}
      {/* Use the cards - they already have blank_words populated */}
    </div>
  );
}