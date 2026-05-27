export interface Job {
  id: string;
  review?: string | null;
  rating?: number | null;
  job_type?: string | null;
  completed_date?: string | null;
  created_at?: string | null;
}

class JobManager {
  async getAllJobs(): Promise<Job[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!url || !key) return [];

    try {
      const res = await fetch(
        `${url.replace(/\/$/, "")}/rest/v1/jobs?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 300 },
        },
      );

      if (!res.ok) {
        console.warn("[supabase] jobs fetch failed:", res.status);
        return [];
      }

      return (await res.json()) as Job[];
    } catch (error) {
      console.warn("[supabase] jobs fetch error:", error);
      return [];
    }
  }
}

export const jobManager = new JobManager();
