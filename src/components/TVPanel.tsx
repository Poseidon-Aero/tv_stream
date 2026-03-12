"use client";

import { usePolling } from "@/hooks/usePolling";
import type { TV, Video } from "@/lib/db/types";
import { TransportControls } from "./TransportControls";

type TVPanelProps = {
  tvId: string;
  isSelected: boolean;
  onToggleSelect: () => void;
};

type QueueAPIItem = {
  id: string;
  tvId: string;
  videoId: string;
  position: number;
  addedAt: string;
  video: Video;
};

export function TVPanel({ tvId, isSelected, onToggleSelect }: TVPanelProps) {
  const { data: tv } = usePolling<TV>(`/api/tvs?id=${tvId}`, 1000);
  const { data: queueData, refetch: refetchQueue } = usePolling<QueueAPIItem[]>(
    `/api/queue?tv_id=${tvId}`,
    3000
  );
  const { data: currentVideo } = usePolling<Video | null>(
    tv?.currentVideo ? `/api/videos?id=${tv.currentVideo}` : "",
    2000
  );

  const queue = queueData ?? [];

  async function removeFromQueue(queueItemId: string) {
    await fetch(`/api/queue?id=${queueItemId}`, { method: "DELETE" });
    refetchQueue();
  }

  async function toggleLoop() {
    if (!tv) return;
    await fetch("/api/tvs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tvId, loopEnabled: !tv.loopEnabled }),
    });
  }

  const isOnline = tv
    ? Date.now() - new Date(tv.lastHeartbeat ?? 0).getTime() < 10000
    : false;

  const statusColor = !tv
    ? "bg-zinc-600"
    : !isOnline
    ? "bg-red-500"
    : tv.status === "playing"
    ? "bg-green-500"
    : tv.status === "paused"
    ? "bg-yellow-500"
    : "bg-zinc-500";

  const statusText = !tv
    ? "..."
    : !isOnline
    ? "Offline"
    : tv.status === "playing"
    ? "Playing"
    : tv.status === "paused"
    ? "Paused"
    : "Idle";

  const label = tvId.replace("tv-", "TV ");

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const progress =
    tv && currentVideo?.durationSec
      ? ((tv.positionSec ?? 0) / currentVideo.durationSec) * 100
      : 0;

  return (
    <div
      className={`relative rounded-xl border-2 bg-zinc-900 transition-all ${
        isSelected
          ? "border-blue-500 shadow-lg shadow-blue-500/10"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      {/* Clickable select header */}
      <button
        onClick={onToggleSelect}
        className="flex w-full items-center justify-between p-4 pb-0 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div
            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
              isSelected
                ? "border-blue-500 bg-blue-500"
                : "border-zinc-600 bg-zinc-800"
            }`}
          >
            {isSelected && (
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${statusColor} ${isOnline && tv?.status === "playing" ? "animate-pulse" : ""}`} />
            <h2 className="text-lg font-bold">{label}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            !isOnline
              ? "bg-red-500/15 text-red-400"
              : tv?.status === "playing"
              ? "bg-green-500/15 text-green-400"
              : tv?.status === "paused"
              ? "bg-yellow-500/15 text-yellow-400"
              : "bg-zinc-800 text-zinc-500"
          }`}>
            {statusText}
          </span>
        </div>
      </button>

      <div className="p-4">
        {/* Now Playing */}
        {currentVideo ? (
          <div className="mb-4 rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Now Playing</p>
            <div className="flex items-center gap-3">
              {currentVideo.thumbnailUrl ? (
                <img
                  src={currentVideo.thumbnailUrl}
                  alt=""
                  className="h-14 w-24 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-14 w-24 items-center justify-center rounded-md bg-zinc-700">
                  <svg className="h-6 w-6 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{currentVideo.filename}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {formatTime(tv?.positionSec ?? 0)} / {formatTime(currentVideo.durationSec ?? 0)}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 w-full rounded-full bg-zinc-700">
              <div
                className="h-1 rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex h-20 items-center justify-center rounded-lg bg-zinc-800/30">
            <p className="text-sm text-zinc-600">No video playing</p>
          </div>
        )}

        {/* Transport Controls */}
        <TransportControls tvId={tvId} disabled={!isOnline} />

        {/* Loop + Queue */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Queue ({queue.length})
            </h3>
            <button
              onClick={toggleLoop}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                tv?.loopEnabled
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-zinc-800 text-zinc-600 hover:text-zinc-400"
              }`}
            >
              Loop {tv?.loopEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {queue.length === 0 ? (
            <p className="text-xs text-zinc-600">Empty — select videos and this TV to add</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {queue.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-md bg-zinc-800/40 px-3 py-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700 text-[10px] font-bold text-zinc-400">
                      {idx + 1}
                    </span>
                    <span className="truncate text-xs text-zinc-300">{item.video?.filename ?? "Unknown"}</span>
                  </div>
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded text-zinc-600 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
