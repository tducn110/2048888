// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWinkIntegration, resetGlobalWinkInit } from '../useWinkIntegration';
import type { WinkIntegration, WinkSDK } from '../types';

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

function mountHook(): {
  getLatest: () => WinkIntegration;
  unmount: () => void;
} {
  let latest!: WinkIntegration;
  function Probe() {
    latest = useWinkIntegration();
    return null;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(<Probe />);
  });

  return {
    getLatest: () => latest,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe('useWinkIntegration for 02_2048 (Wink SDK v1 Contract)', () => {
  let originalWink: unknown;

  beforeEach(() => {
    resetGlobalWinkInit();
    originalWink = window.Wink;
  });

  afterEach(() => {
    resetGlobalWinkInit();
    window.Wink = originalWink as WinkSDK;
  });

  it('runs safely in standalone mode when SDK is absent', async () => {
    delete (window as any).Wink;
    const { getLatest, unmount } = mountHook();

    await act(async () => {
      await getLatest().readyPromise;
    });

    expect(getLatest().isReady).toBe(true);
    expect(getLatest().status).toBe('standalone');
    expect(getLatest().mode).toBe('offline');
    expect(getLatest().canSubmitScore).toBe(false);
    expect(getLatest().leaderboard).toEqual([]);

    unmount();
  });

  it('connects to window.Wink SDK v1 and handles full lifecycle', async () => {
    const listeners: Record<string, Function[]> = {
      pause: [],
      resume: [],
      mute: [],
      unmute: [],
      locale: [],
    };

    const mockSdk: WinkSDK = {
      init: vi.fn(async () => mockSdk),
      gameplayStart: vi.fn(),
      gameplayStop: vi.fn(),
      submitScore: vi.fn(async () => ({
        entry: { rank: 1, score: 2048, playTime: 60, displayName: 'Peanut Hero', avatarUrl: null },
        isNewBest: true,
        previousBest: null,
      })),
      getLeaderboard: vi.fn(async () => ({
        entries: [{ rank: 1, score: 2048, playTime: 60, displayName: 'Peanut Hero', avatarUrl: null }],
        me: { rank: 1, score: 2048, playTime: 60, displayName: 'Peanut Hero', avatarUrl: null },
        total: 1,
      })),
      getPersonalBest: vi.fn(async () => ({
        me: { rank: 1, score: 2048, playTime: 60, displayName: 'Peanut Hero', avatarUrl: null },
      })),
      track: vi.fn(async () => {}),
      on: vi.fn((event, cb) => {
        listeners[event]?.push(cb);
        return () => {
          listeners[event] = listeners[event]?.filter((l) => l !== cb);
        };
      }),
      can: vi.fn((cap) => cap === 'submitScore' || cap === 'getLeaderboard' || cap === 'track'),
      player: { isGuest: false, displayName: 'Peanut Hero', avatarUrl: null },
      locale: 'vi',
      muted: false,
      status: 'online',
      version: '1.0.0',
      protocolVersion: 1,
      destroy: vi.fn(),
    };

    window.Wink = mockSdk;

    const { getLatest, unmount } = mountHook();

    await act(async () => {
      await getLatest().readyPromise;
    });

    expect(mockSdk.init).toHaveBeenCalled();
    expect(getLatest().status).toBe('online');
    expect(getLatest().mode).toBe('wink');
    expect(getLatest().displayName).toBe('Peanut Hero');
    expect(getLatest().canSubmitScore).toBe(true);

    // Test mute event
    act(() => {
      listeners.mute.forEach((cb) => cb());
    });
    expect(getLatest().parentMuted).toBe(true);

    // Test pause event
    act(() => {
      listeners.pause.forEach((cb) => cb());
    });
    expect(getLatest().hostPaused).toBe(true);

    // Test gameplayStart & gameplayStop
    act(() => {
      getLatest().gameplayStart();
      getLatest().gameplayStop();
    });
    expect(mockSdk.gameplayStart).toHaveBeenCalledTimes(1);
    expect(mockSdk.gameplayStop).toHaveBeenCalledTimes(1);

    // Test track
    act(() => {
      getLatest().track('move_tile', { direction: 'up' });
    });
    expect(mockSdk.track).toHaveBeenCalledWith('move_tile', { direction: 'up' });

    // Test score submission
    await act(async () => {
      await getLatest().submitFinalScore({
        roundId: 'r-1',
        score: 2048,
        playTimeSec: 60,
      });
    });
    expect(mockSdk.submitScore).toHaveBeenCalled();

    unmount();
  });
});
