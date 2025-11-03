"use client";

import { useEffect, useState } from "react";
import { folderService } from "../services"
import { useUser } from "./useUser";
import { Folder } from "@/utils/supabase/models";

export function useFolders() {
    const { user } = useUser(); 
    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderLoading, setFolderLoading] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadFolders();
        }
    }, [user]);

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
    return {folders, folderLoading, folderError, createFolder}
}
