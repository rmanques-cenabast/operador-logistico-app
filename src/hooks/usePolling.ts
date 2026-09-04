import { useState, useEffect, useRef } from 'react';

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  initialData?: T | null;
  intervalMs?: number;
  minLoadingTimeMs?: number;
  dependencies?: any[];
}

export function usePolling<T>({
  fetcher,
  initialData = null,
  intervalMs = 20000,
  minLoadingTimeMs = 400,
  dependencies = []
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let isMounted = true;

    const doFetch = async (isFirstLoad: boolean) => {
      if (document.hidden && !isFirstLoad) return;

      const startTime = Date.now();
      if (isFirstLoad) {
        setIsLoading(true);
      }

      try {
        const result = await fetcherRef.current();
        
        if (!isMounted) return;

        if (isFirstLoad && minLoadingTimeMs > 0) {
          const elapsed = Date.now() - startTime;
          if (elapsed < minLoadingTimeMs) {
            await new Promise(resolve => setTimeout(resolve, minLoadingTimeMs - elapsed));
          }
        }

        if (isMounted) {
          setData(result);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Polling fetch error:", err);
          setError(err);
          setIsLoading(false);
        }
      }
    };

    // Carga inicial
    doFetch(!initialData);

    // Polling recurrente
    const intervalId = setInterval(() => {
      doFetch(false);
    }, intervalMs);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        doFetch(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, dependencies);

  return { data, isLoading, error, setData };
}
