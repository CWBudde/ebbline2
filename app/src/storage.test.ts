import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, Store, type Backing } from "./storage.ts";

function memory(): Backing & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const broken: Backing = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("store", () => {
  it("falls back to defaults and keeps unknown settings out", () => {
    const backing = memory();
    const store = new Store(backing);
    expect(store.settings()).toEqual(DEFAULT_SETTINGS);
    backing.data.set("ebbline2.settings", '{"volume":0.2}');
    expect(store.settings()).toEqual({ ...DEFAULT_SETTINGS, volume: 0.2 });
    backing.data.set("ebbline2.settings", "not json");
    expect(store.settings()).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps the language setting, and reads settings stored without one as automatic", () => {
    const backing = memory();
    const store = new Store(backing);
    backing.data.set("ebbline2.settings", '{"volume":0.2,"music":false,"edgeScroll":true,"reducedMotion":false}');
    expect(store.settings().language).toBe("auto");
    store.setSettings({ ...store.settings(), language: "de" });
    expect(new Store(backing).settings()).toEqual({
      language: "de",
      volume: 0.2,
      music: false,
      edgeScroll: true,
      reducedMotion: false,
    });
    backing.data.set("ebbline2.settings", '{"language":"tlh"}');
    expect(store.settings().language).toBe("auto");
  });

  it("reads a save stored before level ids were kept", () => {
    const backing = memory();
    backing.data.set("ebbline2.save", '{"name":"First Light","seconds":12,"when":5,"data":"{}"}');
    expect(new Store(backing).saved()).toEqual({ id: "", name: "First Light", seconds: 12, when: 5, data: "{}" });
  });

  it("keeps only the best time per level", () => {
    const store = new Store(memory());
    expect(store.recordWin("c1", 300)).toBe(true);
    expect(store.recordWin("c1", 400)).toBe(false);
    expect(store.recordWin("c1", 250)).toBe(true);
    expect(store.progress()).toEqual({ c1: 250 });
  });

  it("stores and clears one saved game", () => {
    const store = new Store(memory());
    expect(store.saved()).toBeUndefined();
    const game = { id: "c1", name: "First Light", seconds: 12, when: 5, data: "{}" };
    expect(store.setSaved(game)).toBe(true);
    expect(store.saved()).toEqual(game);
    store.clearSaved();
    expect(store.saved()).toBeUndefined();
  });

  it("remembers which descriptions were shown", () => {
    const backing = memory();
    const store = new Store(backing);
    expect(store.seen()).toEqual([]);
    store.setSeen(["pylon", "lance"]);
    expect(new Store(backing).seen()).toEqual(["pylon", "lance"]);
    backing.data.set("ebbline2.seen", '{"pylon":true}');
    expect(store.seen()).toEqual([]);
  });

  it("works without storage, or with storage that throws", () => {
    for (const store of [new Store(null), new Store(broken)]) {
      expect(store.settings()).toEqual(DEFAULT_SETTINGS);
      expect(store.progress()).toEqual({});
      expect(store.seen()).toEqual([]);
      store.setSeen(["pylon"]);
      expect(store.saved()).toBeUndefined();
      expect(store.setSaved({ id: "", name: "x", seconds: 0, when: 0, data: "" })).toBe(false);
      expect(store.recordWin("c1", 1)).toBe(true);
      store.clearSaved();
    }
  });
});
