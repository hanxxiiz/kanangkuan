"use client";

import { Lumbaanay } from '@/utils/supabase/models';
import React, { useEffect, useState } from 'react'
import { lumbaanayService } from '../services';

export function useLumbaanays(lumbaanayId?: string) {
  const [lumbaanay, setLumbaanay] = useState<Lumbaanay | null>(null); 
  const [lumbaanayLoading, setLumbaanayLoading] = useState(true);
  const [lumbaanayError, setLumbaanayError] = useState<string | null>(null);

  useEffect(() => {
    if (lumbaanayId) {
      loadLumbaanay();
    }
  }, [lumbaanayId]);

  async function loadLumbaanay() {
    if (!lumbaanayId) return;

    try{
        setLumbaanayLoading(true);
        setLumbaanayError(null);
        const data = await lumbaanayService.getLumbaanay(lumbaanayId);
        setLumbaanay(data);
    } catch (err){
        setLumbaanayError (err instanceof Error ? err.message : "Failed to load lumbaanay game.");
    } finally{
        setLumbaanayLoading(false);
    }
  }

  async function createLumbaanay(lumbaanayData: {
    hostId: string,
    joinCode: string,
    status: string,
  }) {
    try{
        const newLumbaanay = await lumbaanayService.createLumbaanay({
            host_id: lumbaanayData.hostId,
            join_code: lumbaanayData.joinCode,
            status: lumbaanayData.status
        });
        setLumbaanay(newLumbaanay);
        return newLumbaanay;
    } catch (err) {
        setLumbaanayError (err instanceof Error ? err.message : "Failed to create lumbaanay.");
    }
  }

  async function incrementMaxPlayers(id: string) {
  try {
    await lumbaanayService.incrementMaxPlayers(id);

    const updatedLumbaanay = await lumbaanayService.getLumbaanay(id);
    setLumbaanay(updatedLumbaanay);

    return updatedLumbaanay;
  } catch (err) {
    setLumbaanayError(err instanceof Error ? err.message : "Failed to increment max players.");
    return false;
  }
}


  async function markPlayerReady(currentReadyPlayers: number) {
    if (!lumbaanay) return;

    try {
      const updatedLumbaanay = await lumbaanayService.markPlayerReady(lumbaanay.id, currentReadyPlayers);
      setLumbaanay(updatedLumbaanay);
      return updatedLumbaanay;
    } catch (err) {
      setLumbaanayError(err instanceof Error ? err.message : 'Failed to mark player ready.');
    }
  }

  async function generateUniqueJoinCode(): Promise<string> {
    try {
        return await lumbaanayService.generateUniqueJoinCode();
    } catch (err) {
        setLumbaanayError(err instanceof Error ? err.message : "Failed to generate unique code.");
        throw err;
    }
  }

  async function validateJoinCode(joinCode: string): Promise<{ isValid: boolean; lumbaanayId?: string; message?: string }> {
    try {
        return await lumbaanayService.validateJoinCode(joinCode);
    } catch (err) {
        setLumbaanayError(err instanceof Error ? err.message : "Failed to validate join code.");
        return { isValid: false, message: "Error validating code. Please try again." };
    }
  }

  return { 
    lumbaanay, 
    lumbaanayLoading, 
    lumbaanayError, 
    createLumbaanay,
    incrementMaxPlayers,
    generateUniqueJoinCode,
    validateJoinCode,
    markPlayerReady
  }
}