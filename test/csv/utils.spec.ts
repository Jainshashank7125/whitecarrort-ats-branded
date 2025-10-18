import { describe, it, expect } from "vitest";
import { validateCsvRows, mapCsvRowToJob } from "../../lib/csv/utils";

describe("CSV utils", () => {
  it("validates missing required fields", () => {
    const rows = [{ title: "", location: "", employment_type: "" }];
    const errors = validateCsvRows(rows as any);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("Row 1");
  });

  it("maps a csv row to a job object", () => {
    const row = {
      title: "Engineer",
      location: "Remote",
      employment_type: "Full time",
    } as any;
    const job = mapCsvRowToJob(row, "company-123");
    expect(job.company_id).toBe("company-123");
    expect(job.title).toBe("Engineer");
    expect(job.job_type).toBe("full-time");
  });
});
