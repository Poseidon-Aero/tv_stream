"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { TVPanel } from "@/components/TVPanel";
import { VideoSidebar } from "@/components/VideoSidebar";
import { ActionBar } from "@/components/ActionBar";

const TV_IDS = ["tv-1", "tv-2", "tv-3"] as const;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [selectedTvs, setSelectedTvs] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const toggleVideo = useCallback((videoId: string) => {
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  }, []);

  const toggleTv = useCallback((tvId: string) => {
    setSelectedTvs((prev) => {
      const next = new Set(prev);
      if (next.has(tvId)) next.delete(tvId);
      else next.add(tvId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVideos(new Set());
    setSelectedTvs(new Set());
  }, []);

  const sendToTvs = useCallback(async () => {
    if (selectedVideos.size === 0 || selectedTvs.size === 0) return;
    setSending(true);
    const videoIds = Array.from(selectedVideos);
    const promises = Array.from(selectedTvs).map((tvId) =>
      fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tv_id: tvId, video_ids: videoIds }),
      })
    );
    await Promise.all(promises);
    clearSelection();
    setSending(false);
  }, [selectedVideos, selectedTvs, clearSelection]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session.user} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — Video Library */}
        <VideoSidebar
          selectedVideos={selectedVideos}
          onToggleVideo={toggleVideo}
        />

        {/* Right main area — TV Panels */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              TVs {selectedTvs.size > 0 && `— ${selectedTvs.size} selected`}
            </h2>
            {selectedTvs.size > 0 && (
              <button
                onClick={() => setSelectedTvs(new Set())}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear TV selection
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 lg:grid-cols-2">
            {TV_IDS.map((tvId) => (
              <TVPanel
                key={tvId}
                tvId={tvId}
                isSelected={selectedTvs.has(tvId)}
                onToggleSelect={() => toggleTv(tvId)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Floating action bar */}
      <ActionBar
        selectedVideoCount={selectedVideos.size}
        selectedTvCount={selectedTvs.size}
        sending={sending}
        onSend={sendToTvs}
        onClear={clearSelection}
      />
    </div>
  );
}
