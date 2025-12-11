"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaCheck } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import NotificationCards from "@/components/notification/NotificationCards";
import FilterDropdown from "@/components/notification/FilterDropdown";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Notification, NotificationFilter } from "@/types/notification";
import StylishLoader2 from "@/components/ui/StylishLoader2";

const NotificationPage = () => {
  const { supabase, session } = useSupabase();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>("newest");

  const userId = session?.user?.id;

  const filteredNotifications = useMemo(() => {
    let items = [...notifications];
    switch (filter) {
      case "unread":
        items = items.filter((n) => !n.read);
        break;
      case "read":
        items = items.filter((n) => n.read);
        break;
      case "oldest":
        items.sort((a, b) =>
          (a.created_at ?? "").localeCompare(b.created_at ?? "")
        );
        break;
      case "newest":
      default:
        items.sort((a, b) =>
          (b.created_at ?? "").localeCompare(a.created_at ?? "")
        );
    }
    return items;
  }, [notifications, filter]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!supabase || !userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("id, created_at, user_id, type, message, read")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        setNotifications(data ?? []);
      }
      setLoading(false);
    };

    loadNotifications();
  }, [supabase, userId, filter]);

  const toggleSelectionMode = () => {
    const next = !selectionMode;
    setSelectionMode(next);
    if (!next) {
      setSelectedIds(new Set());
    } else {
      // preselect all unread when entering selection mode
      const unreadIds = filteredNotifications
        .filter((n) => !n.read)
        .map((n) => n.id);
      setSelectedIds(new Set(unreadIds));
    }
  };

  const handleToggleSelect = (id: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleMarkSelectedRead = async () => {
    if (!supabase || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", ids);
    if (error) {
      console.error("Error marking notifications read:", error);
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleMarkOneRead = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) {
      console.error("Error marking notification read:", error);
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleFilterSelect = (value: string) => {
    setFilter(value as NotificationFilter);
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <StylishLoader2 />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-16 ">
      {/* Header Section */}
      <div className="flex sm:flex-row items-center justify-between w-full mb-8 gap-4 text-center sm:text-left">
        <h1 className="font-main text-3xl sm:text-4xl lg:text-5xl text-gray-900">
          Notification
        </h1>
      </div>

      {/* Filter Button & Dropdown */}
      <div className="flex justify-end relative">
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 text-gray-500 text-md font-body group transition-colors"
          >
            <span className="group-hover:text-black transition-colors">
              Filter
            </span>
            <RiArrowDropDownLine
              className={`text-3xl transform transition-transform duration-300 group-hover:text-black ${
                isDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          <FilterDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onFilterSelect={handleFilterSelect}
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col border-black border-t-1 border-l-1 border-r-1 rounded-t-2xl my-5 shadow-[0_12px_12px_rgba(0,0,0,0.25)]">
        <div className="flex flex-row items-center border-b border-black rounded-t-2xl h-14">
          {/* Select All Button */}
          <button
            onClick={toggleSelectionMode}
            className="gap-2 flex items-center justify-center my-4 ml-10 mr-15 bg-white hover:cursor-pointer transition-all duration-300 mx-5"
          >
            <div
              className={`border border-black rounded-sm h-6 w-6 flex items-center justify-center transition-all duration-300 ${
                selectionMode ? "bg-black" : "bg-white"
              }`}
            >
              <FaCheck
                className={`text-white text-sm transition-opacity duration-200 ${
                  selectionMode ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            <h1 className="text-black text-md font-body">Select All</h1>
          </button>

          {/* Mark selected as read */}
          <AnimatePresence>
            {selectionMode && (
              <motion.button
                onClick={handleMarkSelectedRead}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{
                  type: "tween",
                  ease: "easeInOut",
                  duration: 0.5,
                }}
                className="gap-2 flex items-center justify-center px-3 py-1 border border-black rounded-sm hover:cursor-pointer transition-all duration-300 hover:bg-gray-100"
                disabled={selectedIds.size === 0}
              >
                <span className="text-black text-md font-body">
                  Mark read {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Cards */}
        <div className="flex flex-col">
          {filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500 font-body text-lg">
                No notifications
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCards
                key={notification.id}
                id={notification.id}
                username={notification.message ?? "Notification"}
                action=""
                type={undefined}
                profileUrl="/dashboard/default-picture.png"
                isRead={!!notification.read}
                showCheckbox={selectionMode}
                isChecked={selectedIds.has(notification.id)}
                onToggleSelect={handleToggleSelect}
                onMarkAsRead={handleMarkOneRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
