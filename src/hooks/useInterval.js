import { useEffect, useRef } from "react";

export function useInterval(fn, ms) {
  const r = useRef(fn);
  useEffect(() => {
    r.current = fn;
  }, [fn]);
  useEffect(() => {
    if (!ms) return;
    const id = setInterval(() => r.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}
