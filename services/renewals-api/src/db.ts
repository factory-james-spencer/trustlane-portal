export const POOL_CONFIG = {
  // The primary's DNS name follows failover; never point this at a specific host.
  host: 'portal-db-primary.portal.internal',
  database: 'portal',
  max: 20,
  acquireTimeoutMs: 3_000,
};

export interface Connection {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  release(): void;
}

export type Connect = () => Promise<Connection>;

export class PoolTimeoutError extends Error {
  constructor(max: number, timeoutMs: number) {
    super(`timed out after ${timeoutMs} ms waiting for a connection (pool max ${max})`);
    this.name = 'PoolTimeoutError';
  }
}

export class ConnectionPool {
  readonly max: number;
  readonly #acquireTimeoutMs: number;
  readonly #connect: Connect;
  #active = 0;
  #waiters: Array<() => void> = [];

  constructor(connect: Connect, options: { max: number; acquireTimeoutMs: number } = POOL_CONFIG) {
    this.#connect = connect;
    this.max = options.max;
    this.#acquireTimeoutMs = options.acquireTimeoutMs;
  }

  async acquire(): Promise<Connection> {
    if (this.#active < this.max) this.#active++;
    else await this.#waitForSlot();

    try {
      const connection = await this.#connect();
      return {
        query: (sql, params) => connection.query(sql, params),
        release: () => {
          connection.release();
          this.#releaseSlot();
        },
      };
    } catch (error) {
      this.#releaseSlot();
      throw error;
    }
  }

  #waitForSlot(): Promise<void> {
    return new Promise((resolve, reject) => {
      const waiter = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        this.#waiters = this.#waiters.filter((w) => w !== waiter);
        reject(new PoolTimeoutError(this.max, this.#acquireTimeoutMs));
      }, this.#acquireTimeoutMs);
      this.#waiters.push(waiter);
    });
  }

  // A released slot is handed straight to the next waiter so the active count never dips
  // below max while requests are queued.
  #releaseSlot(): void {
    const next = this.#waiters.shift();
    if (next) next();
    else this.#active--;
  }
}
