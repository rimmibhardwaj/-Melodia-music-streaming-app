"use client";

import { useSearchParams } from "next/navigation";
import { useTracks } from "@/hooks/useTracks";
import { SongCard } from "@/components/SongCard";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/ApiUnavailable";
import { SearchX } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data, isLoading, isLoadingMore, error, hasMore, loadMore } = useTracks({ search: query });

  const SkeletonCard = () => (
    <div className="animate-pulse bg-[#201633] rounded-xl p-4 min-w-[160px] max-w-[200px] aspect-square flex flex-col gap-4">
      <div className="w-full aspect-square bg-[#32234f] rounded-md"></div>
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-[#32234f] rounded w-3/4"></div>
        <div className="h-3 bg-[#32234f] rounded w-1/2"></div>
      </div>
    </div>
  );

  if (!query) {
    return (
      <div className="text-gray-400 mt-10 text-center">
        <p className="text-xl">Search for a song, artist, or album</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <ApiUnavailable error={error} className="max-w-xl mx-auto" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-white mb-6">Top results for &quot;{query}&quot;</h3>
      
      {isLoading ? (
        <div className="flex flex-wrap gap-4 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data && data.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-4 lg:gap-6 animate-in fade-in duration-500">
            {data.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 flex justify-center w-full">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide"
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-10 mt-10 rounded-2xl flex flex-col items-center justify-center text-center gap-4 max-w-xl mx-auto animate-in fade-in duration-500">
          <SearchX className="text-[#9D84C7] w-12 h-12 mb-2 opacity-50" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">No results found for &quot;{query}&quot;</h3>
            <p className="text-[#9D84C7] text-sm">Try different keywords or check your spelling.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="p-6 pb-24">
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Search</h2>
      <Suspense fallback={<div className="text-gray-400 mt-10">Loading search interface...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
