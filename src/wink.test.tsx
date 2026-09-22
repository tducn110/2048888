// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { useWink, type WinkIntegration, type WinkLeaderboardEntry } from './wink';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function entry(over: Partial<WinkLeaderboardEntry> = {}): WinkLeaderboardEntry {
  return {
    id: 'e1',
    userId: 'u1',
    isAnonymous: false,
    rank: 1,
    score: 2048,
    playTime: 60,
    displayName: 'Người chơi',
    avatarUrl: null,
    createdAt: null,
    ...over,
  };
}

/**
 * A stand-in for the SDK. It is deliberately not a mock of the transport: the
 * whole point of the migration is that this game no longer knows there is one.
 */
function installSdk(over: Record<string, unknown> = {}) {
  const listeners = new Map<string, Set<() => void>>();
  const sdk = {
    init: vi.fn(() => Promise.resolve()),
    gameplayStart: vi.fn(),
    gameplayStop: vi.fn(),
    submitScore: vi.fn(() => Promise.resolve({})),
    getLeaderboard: vi.fn(() => Promise.resolve({ entries: [entry()], me: entry({ score: 512, rank: 7 }), total: 1 })),
    getPersonalBest: vi.fn(() => Promise.resolve({ me: entry({ score: 512, rank: 7 }) })),
    on: vi.fn((event: string, listener: () => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return () => listeners.get(event)!.delete(listener);
    }),
    can: vi.fn(() => true),
    status: 'online',
    ...over,
  };
  (window as unknown as { Wink: unknown }).Wink = sdk;
  const fire = (event: string) => {
    for (const listener of listeners.get(event) ?? []) listener();
  };
  return { sdk, fire, listeners };
}

let root: Root | null = null;
let host: HTMLDivElement | null = null;

async function mount(): Promise<() => WinkIntegration> {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  let latest: WinkIntegration | null = null;
  function Probe() {
    latest = useWink();
    return null;
  }
  await act(async () => {
    root!.render(<Probe />);
  });
  // One more flush: the effect awaits Wink.init() before it binds or reads.
  await act(async () => {});
  return () => latest!;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  vi.restoreAllMocks();
});

it('reads the board once the SDK has answered, and takes the best from `me`', async () => {
  const { sdk } = installSdk();
  const wink = await mount();

  expect(sdk.init).toHaveBeenCalledTimes(1);
  expect(sdk.getLeaderboard).toHaveBeenCalledWith({ limit: 10 });
  expect(wink().leaderboard).toHaveLength(1);
  expect(wink().playerEntry?.rank).toBe(7);
  // The player's own best is on screen at load, not only after a round.
  expect(wink().bestScore).toBe(512);
});

it('a board that has no `me` yet leaves the player row empty rather than throwing', async () => {
  // wink-be ships `me` after the games relax their reading of the response, so
  // for a window the field is simply absent.
  installSdk({
    getLeaderboard: vi.fn(() => Promise.resolve({ entries: [entry()], total: 1 })),
    getPersonalBest: vi.fn(() => Promise.resolve({ me: null })),
  });
  const wink = await mount();
  expect(wink().playerEntry).toBeNull();
  expect(wink().bestScore).toBe(0);
  expect(wink().leaderboard).toHaveLength(1);
});

it('does not read the leaderboard when the capability is unavailable', async () => {
  const { sdk } = installSdk({
    can: vi.fn((capability: string) => capability !== 'getLeaderboard'),
  });
  const wink = await mount();

  expect(sdk.getLeaderboard).not.toHaveBeenCalled();
  expect(wink().leaderboard).toEqual([]);
  expect(wink().bestScore).toBe(512);
});

it('follows the parent into pause and mute, and back out', async () => {
  const { fire } = installSdk();
  const wink = await mount();
  expect(wink().hostPaused).toBe(false);

  await act(async () => fire('pause'));
  expect(wink().hostPaused).toBe(true);
  await act(async () => fire('resume'));
  expect(wink().hostPaused).toBe(false);

  await act(async () => fire('mute'));
  expect(wink().parentMuted).toBe(true);
  await act(async () => fire('unmute'));
  expect(wink().parentMuted).toBe(false);
});

it('a failed score submission logs a warning without setting a UI error', async () => {
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { sdk } = installSdk({
    submitScore: vi.fn(() => Promise.reject(Object.assign(new Error('nope'), { code: 'NETWORK_ERROR' }))),
  });
  const wink = await mount();

  await act(async () => {
    await wink().submitScore(1024, 42);
  });

  expect(sdk.submitScore).toHaveBeenCalledWith({ score: 1024, playTime: 42 });
  expect(wink().error).toBeNull();
  expect(consoleSpy).toHaveBeenCalledWith('Wink score submission failed', expect.any(Object));
  consoleSpy.mockRestore();
});

it('does not submit a score when the capability is unavailable', async () => {
  const { sdk } = installSdk({
    can: vi.fn((capability: string) => capability !== 'submitScore'),
  });
  const wink = await mount();

  await act(async () => {
    await wink().submitScore(1024, 42);
  });

  expect(sdk.submitScore).not.toHaveBeenCalled();
  expect(wink().error).toBeNull();
});

it('a score that lands clears the error and re-reads the board', async () => {
  const { sdk } = installSdk();
  const wink = await mount();
  expect(sdk.getLeaderboard).toHaveBeenCalledTimes(1);

  await act(async () => {
    await wink().submitScore(4096, 90);
  });

  expect(wink().error).toBeNull();
  expect(sdk.getLeaderboard).toHaveBeenCalledTimes(2);
});

it('a board that fails to load keeps the last one rather than raising a banner', async () => {
  installSdk({
    getLeaderboard: vi.fn(() => Promise.reject(new Error('offline'))),
  });
  const wink = await mount();
  expect(wink().leaderboard).toEqual([]);
  expect(wink().error).toBeNull();
});

it('detaches its listeners when the game unmounts', async () => {
  const { listeners } = installSdk();
  await mount();
  expect(listeners.get('pause')?.size).toBe(1);
  act(() => root!.unmount());
  root = null;
  expect(listeners.get('pause')?.size).toBe(0);
});
