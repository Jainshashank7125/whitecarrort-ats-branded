import type { Job } from '../supabase/client';

export interface CSVRow {
  title?: string;
  work_policy?: string;
  location?: string;
  department?: string;
  employment_type?: string;
  experience_level?: string;
  job_type?: string;
  salary_range?: string;
}

export const requiredFields = ['title', 'location', 'employment_type'];

export function validateCsvRows(rows: CSVRow[]) {
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const missing = requiredFields.filter(
      (f) => !row[f as keyof CSVRow] || String(row[f as keyof CSVRow]).trim() === ''
    );
    if (missing.length) errors.push(`Row ${i + 1}: missing ${missing.join(',')}`);
  }
  return errors;
}

export function mapCsvRowToJob(row: CSVRow, companyId: string): Partial<Job> {
  const mapEmploymentType = (type = '') => {
    const t = type.trim();
    const map: Record<string, string> = {
      'Full time': 'full-time',
      'Part time': 'part-time',
      Contract: 'contract',
      Internship: 'internship',
      Temporary: 'contract',
      Permanent: 'full-time',
    };
    return (
      map[t] || t.toLowerCase().split(/\s+/).join('-') || 'full-time'
    );
  };

  return {
    company_id: companyId,
    title: row.title || 'Untitled Position',
    description: `Role: ${row.title || 'Unknown'}`,
    location: row.location || 'Not specified',
    job_type: mapEmploymentType(row.employment_type),
    department: row.department || undefined,
    salary_range: row.salary_range || undefined,
    is_active: true,
  };
}
