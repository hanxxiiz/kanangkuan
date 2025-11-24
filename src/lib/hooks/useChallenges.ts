"use client";

import { Challenge } from '@/utils/supabase/models';
import React, { useEffect, useState } from 'react'
import { challengeService } from '../services';

export function useChallenges(challengeId?: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null); 
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  useEffect(() => {
    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId]);

  async function loadChallenge() {
    if (!challengeId) return;

    try{
        setChallengeLoading(true);
        setChallengeError(null);
        const data = await challengeService.getChallenge(challengeId);
        setChallenge(data);
    } catch (err){
        setChallengeError (err instanceof Error ? err.message : "Failed to load deck.");
    } finally{
        setChallengeLoading(false);
    }
  }

  async function createChallenge(challengeData: {
    hostId: string,
    joinCode: string,
    status: string,
  }) {
    try{
        const newChallenge = await challengeService.createChallenge({
            host_id: challengeData.hostId,
            join_code: challengeData.joinCode,
            status: challengeData.status
        });
        setChallenge(newChallenge);
        return newChallenge;
    } catch (err) {
        setChallengeError (err instanceof Error ? err.message : "Failed to create challenge.");
    }
  }

  async function generateUniqueJoinCode(): Promise<string> {
    try {
        return await challengeService.generateUniqueJoinCode();
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to generate unique code.");
        throw err;
    }
  }

  async function validateJoinCode(joinCode: string): Promise<{ isValid: boolean; challengeId?: string; message?: string }> {
    try {
        return await challengeService.validateJoinCode(joinCode);
    } catch (err) {
        setChallengeError(err instanceof Error ? err.message : "Failed to validate join code.");
        return { isValid: false, message: "Error validating code. Please try again." };
    }
  }

  return { 
    challenge, 
    challengeLoading, 
    challengeError, 
    createChallenge,
    generateUniqueJoinCode,
    validateJoinCode
  }
}