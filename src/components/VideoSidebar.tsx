"use client";

import { useState } from "react";
import { usePolling } from "@/hooks/usePolling";
import type { Video } from "@/lib/db/types";

type VideoSidebarProps = {
  selectedVideos: Set<string>;
  onToggleVideo: (videoId: string) => void;
};

export function VideoSidebar({ selectedVideos, onToggleVideo }: VideoSidebarProps) {
  const { data: videos } = usePolling<Video[]>("/api/videos", 5000);
  const [search, setSearch] = useState("");

  const videoList = (videos ?? []).filter((v) =>
    search === "" || v.filename.toLowerCase().includes(search.toLowerCase())
  );

  function formatDuration(sec: number | null) {
    if (!sec) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  return (
    <aside className="flex w-80 flex-col border-r border-zinc-800 bg-zinc-900/60">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Videos
          </h2>
          {selectedVideos.size > 0 && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
              {selectedVideos.size} selected
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full rounded-lg bg-zinc-800 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Video list */}
      <div className="flex-1 overflow-y-auto">
        {videoList.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center px-4">
            <svg className="mb-2 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-sm text-zinc-500">No videos yet</p>
            <p className="mt-1 text-xs text-zinc-600 text-center">
              Videos appear once Mac agents sync from Google Drive
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {videoList.map((video) => {
              const isSelected = selectedVideos.has(video.id);
              return (
                <button
                  key={video.id}
                  onClick={() => onToggleVideo(video.id)}
                  className={`group flex w-full items-start gap-3 rounded-lg p-2 text-left transition-all ${
                    isSelected
                      ? "bg-blue-500/15 ring-1 ring-blue-500/40"
                      : "hover:bg-zinc-800/80"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-6 w-6 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                        </svg>
                      </div>
                    )}
                    {/* Duration badge */}
                    {video.durationSec && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                        {formatDuration(video.durationSec)}
                      </span>
                    )}
                    {/* Selection checkmark */}
                    {isSelected && (
                      <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-md">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={`truncate text-sm font-medium ${isSelected ? "text-blue-200" : "text-zinc-200"}`}>
                      {video.filename}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {[formatDuration(video.durationSec), formatSize(video.fileSize)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t border-zinc-800 px-4 py-2">
        <p className="text-xs text-zinc-600">
          {videoList.length} video{videoList.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </p>
      </div>
    </aside>
  );
}
