"use client";

import { useCallback, useEffect, useState } from "react";
import { folderService } from "../services"
import { useUser } from "./useUser";
import { Folder } from "@/utils/supabase/models";

export function useFolders(folderId?: string, userId?: string) {
    const { user } = useUser(); 
    const [folders, setFolders] = useState<Folder[]>([])
    const [folder, setFolder] = useState<Folder | null>(null);
    const [folderLoading, setFolderLoading] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);

    const targetUserId = userId || user?.id;

    const loadFolders = useCallback( async () =>  {
        if (!targetUserId) return;

        try{
            setFolderLoading(true);
            setFolderError(null);
            const data = await folderService.getFolders(targetUserId);
            setFolders(data);
        } catch (err){
            setFolderError (err instanceof Error ? err.message : "Failed to load folders.");
        } finally{
            setFolderLoading(false);
        }
    }, [targetUserId]);

    const getFolder = useCallback(
        async (folderId: string) => {
        if (!targetUserId) return;
        try{
            setFolderLoading(true);
            setFolderError(null);
            const data = await folderService.getFolder(targetUserId, folderId);
            setFolder(data);
        } catch (err){
            setFolderError (err instanceof Error ? err.message : "Failed to load folder.");
        } finally{
            setFolderLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        if (targetUserId && folderId) {
            getFolder(folderId);
        } else if (targetUserId) {
            loadFolders();
        }
    }, [targetUserId, folderId, getFolder, loadFolders]);

    async function createFolder(folderData: {
        folderName: string,
        folderColor: string,
    }) {
        if (!user) throw new Error("User not authenticated");

        try{
            const newFolder = await folderService.createFolder({
                created_by: user?.id,
                folder_name: folderData.folderName,
                folder_color: folderData.folderColor,
            });
            setFolders((prev) => [newFolder, ...prev]);
        } catch (err) {
            setFolderError (err instanceof Error ? err.message : "Failed to create folder.");
        }
    }

    async function updateFolder(folderId: string, folderData: {
        folderName?: string,
        folderColor?: string,
    }) {
        try {
            const updates: any = {};
            if (folderData.folderName !== undefined) updates.folder_name = folderData.folderName;
            if (folderData.folderColor !== undefined) updates.folder_color = folderData.folderColor;

            const updatedFolder = await folderService.updateFolder(folderId, updates);
            setFolders((prev) => prev.map((f) => f.id === folderId ? updatedFolder : f));
            if (folder?.id === folderId) {
                setFolder(updatedFolder);
            }
        } catch (err) {
            setFolderError(err instanceof Error ? err.message : "Failed to update folder.");
        }
    }

    async function deleteFolder(folderId: string) {
        try {
            await folderService.deleteFolder(folderId);
            setFolders((prev) => prev.filter((f) => f.id !== folderId));
            if (folder?.id === folderId) {
                setFolder(null);
            }
        } catch (err) {
            setFolderError(err instanceof Error ? err.message : "Failed to delete folder.");
            throw err; // Re-throw so component can handle it
        }
    }

    return {folders, folder, folderLoading, folderError, getFolder, loadFolders, createFolder, updateFolder, deleteFolder}
}
