export const POOL_CONFIG = {
  host: 'portal-db-primary.portal.internal',
  database: 'portal',
  max: 10,
  acquireTimeoutMs: 2_000,
};

export interface Queryable {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}

export interface ApplicationStatus {
  applicationId: string;
  program: 'air' | 'land' | 'commercial';
  status: 'received' | 'in_review' | 'approved' | 'denied';
  updatedAt: string;
}

export async function getApplicationStatus(
  db: Queryable,
  applicationId: string,
): Promise<ApplicationStatus | undefined> {
  const rows = await db.query<ApplicationStatus>(
    `select application_id as "applicationId", program, status, updated_at as "updatedAt"
       from application_status
      where application_id = $1`,
    [applicationId],
  );
  return rows[0];
}
