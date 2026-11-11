export type ReadState = {
  data?: unknown;
  error?: string;
  loading: boolean;
  refreshing?: boolean;
  at?: number;
};
type Entry = {
  state: ReadState;
  controller?: AbortController;
  pending?: Promise<void>;
  generation: number;
};
export class ReadCache {
  private denied = false;
  private deniedState: ReadState = {
    loading: false,
    error: "Your evaluator session has expired. Sign in again.",
  };
  private entries = new Map<string, Entry>();
  private listeners = new Map<string, Set<() => void>>();
  constructor(
    readonly scope: string,
    private fetcher: (url: string, signal: AbortSignal) => Promise<unknown>,
    private now = () => Date.now(),
  ) {}
  get size() {
    return this.entries.size;
  }
  ttl(url: string) {
    return url === "/api/catalog"
      ? 300000
      : /^\/api\/employees\/\d+$/.test(url)
        ? 15000
        : 30000;
  }
  private entry(url: string) {
    const key = this.scope + ":" + url;
    let e = this.entries.get(key);
    if (!e) {
      e = { state: { loading: true }, generation: 0 };
      this.entries.set(key, e);
      while (this.entries.size > 24) {
        const first = this.entries.keys().next().value!;
        this.entries.get(first)?.controller?.abort();
        this.entries.delete(first);
      }
    }
    return e;
  }
  read = (url: string): ReadState => {
    if (this.denied) return this.deniedState;
    const e = this.entry(url);
    if (
      e.state.data !== undefined &&
      this.now() - (e.state.at ?? 0) > this.ttl(url) + 120000
    )
      e.state = { loading: true };
    return e.state;
  };
  subscribe = (url: string, listener: () => void) => {
    let listeners = this.listeners.get(url);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(url, listeners);
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) this.listeners.delete(url);
    };
  };
  private notify(url?: string) {
    const groups = url ? [this.listeners.get(url)] : this.listeners.values();
    for (const listeners of groups)
      if (listeners) for (const listener of listeners) listener();
  }
  async load(url: string, force = false) {
    if (this.denied) return;
    const e = this.entry(url);
    if (!force && e.pending) return e.pending;
    if (
      !force &&
      e.state.data !== undefined &&
      this.now() - (e.state.at ?? 0) < this.ttl(url)
    )
      return;
    e.controller?.abort();
    const controller = new AbortController(),
      generation = ++e.generation;
    e.controller = controller;
    const data = e.state.data;
    e.state = {
      data,
      at: e.state.at,
      loading: data === undefined,
      refreshing: data !== undefined,
    };
    this.notify(url);
    e.pending = this.fetcher(url, controller.signal)
      .then(
        (data) => {
          if (!controller.signal.aborted && generation === e.generation) {
            e.state = { data, at: this.now(), loading: false };
            this.notify(url);
          }
        },
        (error) => {
          if (!controller.signal.aborted && generation === e.generation) {
            e.state = {
              ...e.state,
              loading: false,
              refreshing: false,
              error: error instanceof Error ? error.message : "Request failed.",
            };
            this.notify(url);
          }
        },
      )
      .finally(() => {
        if (generation === e.generation) e.pending = undefined;
      });
    return e.pending;
  }
  invalidateSalary(updated?: { id: number }) {
    for (const [key, e] of this.entries)
      if (!key.endsWith(":/api/catalog")) {
        e.generation++;
        e.controller?.abort();
        this.entries.delete(key);
      }
    if (updated)
      this.entry("/api/employees/" + updated.id).state = {
        data: updated,
        at: this.now(),
        loading: false,
      };
    this.notify();
  }
  clear(denied = false) {
    this.denied = denied;
    for (const e of this.entries.values()) {
      e.generation++;
      e.controller?.abort();
    }
    this.entries.clear();
    this.notify();
  }
}
