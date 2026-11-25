"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RELEASES } from "./content";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (id: string) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (v: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type YTApi = {
  Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type MusicPlayer = ReturnType<typeof useYouTube>;

/**
 * Hidden YouTube player. It lives at the top of the app, so a track keeps
 * playing while the visitor moves around the stadium. The script loads only
 * after `enable()` is called.
 */
export function useYouTube() {
  const [enabled, setEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(RELEASES[0].duration);
  const [volume, setVolumeState] = useState(80);
  const [ready, setReady] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);

  const select = useCallback((idx: number) => {
    setEnabled(true);
    setIndex(idx);
    setTime(0);
    setDuration(RELEASES[idx].duration);
    const p = playerRef.current;
    if (p && typeof p.loadVideoById === "function") {
      try {
        p.loadVideoById(RELEASES[idx].id);
      } catch {
        pendingRef.current = idx;
      }
    } else {
      pendingRef.current = idx;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const init = () => {
      if (!mounted || !hostRef.current || playerRef.current || !window.YT) return;
      const api = window.YT;
      const start = pendingRef.current ?? 0;
      playerRef.current = new api.Player(hostRef.current, {
        height: "1",
        width: "1",
        videoId: RELEASES[start].id,
        playerVars: {
          autoplay: pendingRef.current != null ? 1 : 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          fs: 0,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (!mounted) return;
            setReady(true);
            try {
              e.target.setVolume(volumeRef.current);
              const d = e.target.getDuration();
              if (d) setDuration(d);
              if (pendingRef.current != null) {
                pendingRef.current = null;
                e.target.playVideo();
              }
            } catch {}
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (!mounted) return;
            if (e.data === api.PlayerState.PLAYING) {
              setPlaying(true);
              try {
                const d = e.target.getDuration();
                if (d) setDuration(d);
              } catch {}
            } else if (e.data === api.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (e.data === api.PlayerState.ENDED) {
              setPlaying(false);
              setIndex((i) => {
                const next = (i + 1) % RELEASES.length;
                setTime(0);
                setDuration(RELEASES[next].duration);
                try {
                  playerRef.current?.loadVideoById(RELEASES[next].id);
                } catch {}
                return next;
              });
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      init();
    } else {
      const tagId = "yt-iframe-api";
      if (!document.getElementById(tagId)) {
        const tag = document.createElement("script");
        tag.id = tagId;
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        init();
      };
    }
    return () => {
      mounted = false;
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime();
        if (Number.isFinite(t)) setTime(t);
      } catch {}
    }, 250);
    return () => window.clearInterval(id);
  }, [playing]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      select(index);
      return;
    }
    try {
      if (playing) p.pauseVideo();
      else p.playVideo();
    } catch {}
  }, [playing, index, select]);

  const prev = useCallback(
    () => select((index - 1 + RELEASES.length) % RELEASES.length),
    [index, select],
  );
  const next = useCallback(() => select((index + 1) % RELEASES.length), [index, select]);

  const seek = useCallback((value: number) => {
    setTime(value);
    try {
      playerRef.current?.seekTo(value, true);
    } catch {}
  }, []);

  const enable = useCallback(() => setEnabled(true), []);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    try {
      playerRef.current?.setVolume(v);
    } catch {}
  }, []);

  return {
    hostRef,
    enable,
    enabled,
    ready,
    index,
    playing,
    time,
    duration,
    volume,
    select,
    toggle,
    prev,
    next,
    seek,
    setVolume,
  };
}
