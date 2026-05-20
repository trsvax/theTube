"use client";

import { useState, useCallback } from "react";

interface MutationResult<T = unknown> {
  submit: (data: Record<string, string>) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: T | null;
  location: string | null;
  status: number | null;
}

export function useMutation<T = unknown>(
  operation: string,
  options?: { fast?: boolean },
): MutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const submit = useCallback(
    async (params: Record<string, string>) => {
      setLoading(true);
      setError(null);
      setData(null);
      setLocation(null);

      try {
        const path = options?.fast ? "/fastevent" : "/events";
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${path}/${operation}?${query}`);

        setStatus(res.status);
        setLocation(res.headers.get("location"));

        if (res.status >= 400) {
          const body = res.headers.get("content-type")?.includes("json")
            ? await res.json()
            : null;
          setError(body?.error ?? `${res.status} ${res.statusText}`);
        } else if (res.headers.get("content-type")?.includes("json")) {
          setData(await res.json());
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [operation, options?.fast],
  );

  return { submit, loading, error, data, location, status };
}
