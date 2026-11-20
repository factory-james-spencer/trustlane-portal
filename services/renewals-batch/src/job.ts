/** Runs at the top of every hour. */
export const SCHEDULE = '0 * * * *';
export const BATCH_SIZE = 500;
export const REMINDER_WINDOW_DAYS = 120;

export interface ExpiringMembership {
  applicationId: string;
  expiresOn: string;
}

export interface RenewalStore {
  findExpiringWithin(days: number, limit: number, afterId?: string): Promise<ExpiringMembership[]>;
  markReminded(applicationIds: string[]): Promise<void>;
}

export interface Notifier {
  sendRenewalReminder(membership: ExpiringMembership): Promise<void>;
}

export async function runRenewalReminders(store: RenewalStore, notifier: Notifier): Promise<{ reminded: number }> {
  let reminded = 0;
  let cursor: string | undefined;

  for (;;) {
    const batch = await store.findExpiringWithin(REMINDER_WINDOW_DAYS, BATCH_SIZE, cursor);
    if (batch.length === 0) break;

    for (const membership of batch) {
      await notifier.sendRenewalReminder(membership);
    }
    await store.markReminded(batch.map((m) => m.applicationId));
    reminded += batch.length;
    cursor = batch[batch.length - 1]!.applicationId;
  }

  return { reminded };
}
