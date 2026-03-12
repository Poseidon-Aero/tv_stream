"use client";

type ActionBarProps = {
  selectedVideoCount: number;
  selectedTvCount: number;
  sending: boolean;
  onSend: () => void;
  onClear: () => void;
};

export function ActionBar({
  selectedVideoCount,
  selectedTvCount,
  sending,
  onSend,
  onClear,
}: ActionBarProps) {
  if (selectedVideoCount === 0 && selectedTvCount === 0) return null;

  const canSend = selectedVideoCount > 0 && selectedTvCount > 0;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/95 px-6 py-3 shadow-2xl shadow-black/50 backdrop-blur-md">
        {/* Selection summary */}
        <div className="flex items-center gap-3">
          {selectedVideoCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              {selectedVideoCount} video{selectedVideoCount > 1 ? "s" : ""}
            </span>
          )}
          {selectedTvCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {selectedTvCount} TV{selectedTvCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-700" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Clear
          </button>
          <button
            onClick={onSend}
            disabled={!canSend || sending}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              canSend && !sending
                ? "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending...
              </span>
            ) : canSend ? (
              `Queue on ${selectedTvCount} TV${selectedTvCount > 1 ? "s" : ""}`
            ) : selectedVideoCount === 0 ? (
              "Select videos"
            ) : (
              "Select TVs"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
