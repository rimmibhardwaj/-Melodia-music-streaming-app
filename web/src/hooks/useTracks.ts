import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types";

export type ApiError = {
  type: 'QUOTA_EXCEEDED' | 'GENERIC';
  message: string;
};

export function useTracks(params?: { search?: string }) {
  const paramsKey = params?.search || "";
  
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [currentParamsKey, setCurrentParamsKey] = useState(paramsKey);

  if (paramsKey !== currentParamsKey) {
    setCurrentParamsKey(paramsKey);
    setData([]);
    setIsLoading(true);
  }

  useEffect(() => {
    let isMounted = true;
    
    const fetchTracks = async () => {
      if (!paramsKey) {
        if (isMounted) {
          setData([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const cacheKey = `melodia_cache_${paramsKey}`;
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            if (isMounted) {
              setData(JSON.parse(cached));
              setIsLoading(false);
            }
            return;
          }
        } catch (e) {
          // Ignore sessionStorage errors
        }

        const res = await fetch(`/api/youtube/search?search=${encodeURIComponent(paramsKey)}`);
        
        const json = await res.json();
        
        if (!res.ok) {
          if (json.errorType === 'QUOTA_EXCEEDED') {
            throw { type: 'QUOTA_EXCEEDED', message: json.message || "Quota exceeded" };
          }
          throw { type: 'GENERIC', message: json.message || "Failed to fetch tracks" };
        }
        
        if (json.error) {
           throw { type: 'GENERIC', message: json.error };
        }

        if (isMounted) {
          setData(json);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(json));
          } catch (e) {
            // Ignore
          }
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.type) {
            setError(err);
          } else {
            setError({ type: 'GENERIC', message: err.message || "Something went wrong" });
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      isMounted = false;
    };
  }, [paramsKey]);

  // Dummy loadMore to satisfy existing components without breaking
  const loadMore = useCallback(() => {}, []);

  return { data, isLoading, isLoadingMore: false, error, hasMore: false, loadMore };
}
