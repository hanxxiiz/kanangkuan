"use client";

import { useEffect, useState } from "react";
import { folderService } from "../services"
import { useUser } from "./useUser";
import { Folder } from "@/utils/supabase/models";

export function useFolders(folderId?: string) {
    const { user } = useUser(); 
    const [folders, setFolders] = useState<Folder[]>([])
    const [folder, setFolder] = useState<Folder | null>(null);
    const [folderLoading, setFolderLoading] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);

    useEffect(() => {
        if (user && folderId) {
            getFolder(folderId)
        }else if (user){
            loadFolders();
        }
    }, [user, folderId]);

    async function loadFolders() {
        if (!user) return;

        try{
            setFolderLoading(true);
            setFolderError(null);
            const data = await folderService.getFolders(user?.id);
            setFolders(data);
        } catch (err){
            setFolderError (err instanceof Error ? err.message : "Failed to load folders.");
        } finally{
            setFolderLoading(false);
        }
    }

    async function getFolder(folderId: string) {
        if (!user) return;

        try{
            setFolderLoading(true);
            setFolderError(null);
            const data = await folderService.getFolder(user?.id, folderId);
            setFolder(data);
        } catch (err){
            setFolderError (err instanceof Error ? err.message : "Failed to load folder.");
        } finally{
            setFolderLoading(false);
        }
    }

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
    return {folders, folder, folderLoading, folderError, createFolder}
}
