import { NextResponse } from "next/server";

type Geography = "india" | "global";
type ExperienceLevel = "any" | "entry" | "mid" | "senior" | "lead";
type RemotePreference = "any" | "remote" | "on-site" | "hybrid";

type SearchPayload = {
  jobProfile?: string;
  geography?: Geography;
  location?: string;
  experienceLevel?: ExperienceLevel;
  remote?: RemotePreference;
  rapidApiKey?: string;
};

type JobContact = {
  label: string;
  value: string;
};

type CompanyInsight = {
  name: string;
  domain?: string;
  description?: string;
  logo?: string;
  location?: string;
  linkedin?: string;
  twitter?: string;
};

type JobResult = {
  id: string;
  title: string;
  company: string;
  city?: string;
  state?: string;
  country?: string;
  remote: boolean;
  employmentType?: string;
  salary?: string;
  applyLink?: string;
  description?: string;
  highlights?: string[];
  postedAt?: string;
  contacts: JobContact[];
  companyInsight?: CompanyInsight;
};

type JobHighlights = {
  Qualifications?: string[];
  Responsibilities?: string[];
  Benefits?: string[];
};

type JobSalary = {
  currency?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  min_salary?: number;
  max_salary?: number;
  period?: string;
};

type JSearchJob = {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  employer_website?: string;
  employer_email?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote?: boolean;
  job_employment_type?: string;
  job_apply_link?: string;
  job_description?: string;
  job_highlights?: JobHighlights;
  job_salary?: JobSalary;
  job_posted_at_timestamp?: number;
  job_posted_at_datetime_utc?: string;
  job_posted_at?: string;
};

type JSearchResponse = {
  data?: JSearchJob[];
  message?: string;
};

const EMAIL_REGEX =
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE_REGEX =
  /\+?[0-9][0-9\s().-]{6,}[0-9]/g;

function ensureString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildQuery(payload: Required<SearchPayload>) {
  const parts = [
    payload.jobProfile,
    payload.location,
  ];

  if (payload.experienceLevel !== "any") {
    parts.push(`${payload.experienceLevel} level`);
  }

  if (payload.remote === "remote") {
    parts.push("remote");
  } else if (payload.remote === "hybrid") {
    parts.push("hybrid");
  } else if (payload.remote === "on-site") {
    parts.push("on-site");
  }

  if (payload.geography === "india") {
    parts.push("India");
  }

  return parts.filter(Boolean).join(" ");
}

function formatSalary(job: JSearchJob) {
  const salary = job.job_salary;
  if (!salary) {
    return undefined;
  }

  const {
    currency,
    salary_min,
    salary_max,
    salary_period,
    min_salary,
    max_salary,
    period,
  } = salary;
  const min = salary_min ?? min_salary;
  const max = salary_max ?? max_salary;
  const resolvedPeriod = salary_period ?? period;

  if (!min && !max) {
    return undefined;
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency ?? "INR",
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(Number(min))} - ${formatter.format(Number(max))}${
      resolvedPeriod ? ` / ${resolvedPeriod}` : ""
    }`;
  }

  const value = min ?? max;
  return value
    ? `${formatter.format(Number(value))}${
        resolvedPeriod ? ` / ${resolvedPeriod}` : ""
      }`
    : undefined;
}

function formatPosted(dateSource: JSearchJob) {
  const iso =
    ensureString(dateSource?.job_posted_at_datetime_utc) ??
    ensureString(dateSource?.job_posted_at) ??
    ensureString(dateSource?.job_posted_at_timestamp);

  let date: Date | undefined;
  if (iso) {
    const candidate = new Date(iso);
    if (!Number.isNaN(candidate.getTime())) {
      date = candidate;
    }
  }

  if (!date && typeof dateSource?.job_posted_at_timestamp === "number") {
    date = new Date(dateSource.job_posted_at_timestamp * 1000);
  }

  if (!date) {
    return undefined;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours <= 1 ? "Posted less than an hour ago" : `Posted ${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return diffDays === 1 ? "Posted yesterday" : `Posted ${diffDays} days ago`;
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function extractContacts(job: JSearchJob): JobContact[] {
  const contactMap = new Map<string, JobContact>();

  const description = ensureString(job?.job_description) ?? "";
  const applyLink = ensureString(job?.job_apply_link);
  const employerWebsite = ensureString(job?.employer_website);
  const employerEmails: string[] = [];

  const employerEmail = ensureString(job?.employer_email);
  if (employerEmail) {
    employerEmails.push(employerEmail);
  }

  if (applyLink?.startsWith("mailto:")) {
    const email = applyLink.slice("mailto:".length);
    employerEmails.push(email);
  }

  if (description) {
    const matches = description.match(EMAIL_REGEX);
    if (matches) {
      employerEmails.push(...matches);
    }
  }

  employerEmails
    .map((email) => email.toLowerCase())
    .filter((email) => email.includes("@"))
    .forEach((email) => {
      if (!contactMap.has(email)) {
        contactMap.set(email, {
          label: email.includes("hr") ? "HR email" : "Contact email",
          value: email,
        });
      }
    });

  const phones = new Set<string>();
  if (description) {
    const matches = description.match(PHONE_REGEX);
    if (matches) {
      matches.forEach((match) => {
        const normalized = match.replace(/\s+/g, " ").trim();
        if (normalized.length >= 8) {
          phones.add(normalized);
        }
      });
    }
  }

  Array.from(phones).forEach((phone) => {
    const key = `phone-${phone}`;
    if (!contactMap.has(key)) {
      contactMap.set(key, {
        label: "Phone",
        value: phone,
      });
    }
  });

  if (employerWebsite) {
    contactMap.set("website", {
      label: "Company website",
      value: employerWebsite.startsWith("http")
        ? employerWebsite
        : `https://${employerWebsite}`,
    });
  }

  return Array.from(contactMap.values());
}

type ClearbitSuggestion = {
  name: string;
  domain?: string;
  logo?: string;
  description?: string;
  location?: string;
  twitter?: { handle: string } | null;
  linkedin?: { handle: string } | null;
};

async function fetchCompanyInsight(name: string): Promise<CompanyInsight | undefined> {
  try {
    const response = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as ClearbitSuggestion[];

    if (!Array.isArray(data) || data.length === 0) {
      return undefined;
    }

    const bestMatch = data[0];
    return {
      name: bestMatch.name,
      domain: bestMatch.domain,
      description: bestMatch.description,
      logo: bestMatch.logo,
      location: bestMatch.location,
      twitter: bestMatch.twitter?.handle
        ? `https://twitter.com/${bestMatch.twitter.handle}`
        : undefined,
      linkedin: bestMatch.linkedin?.handle
        ? `https://www.linkedin.com/${bestMatch.linkedin.handle}`
        : undefined,
    };
  } catch (error) {
    console.error("Failed to fetch company insight", error);
    return undefined;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchPayload;

    const jobProfile = ensureString(body.jobProfile);
    const location = ensureString(body.location);
    const geography = body.geography ?? "india";
    const experienceLevel = body.experienceLevel ?? "any";
    const remote = body.remote ?? "any";
    const rapidApiKey = ensureString(body.rapidApiKey) ?? ensureString(process.env.RAPIDAPI_KEY);

    if (!jobProfile) {
      return NextResponse.json(
        { error: "jobProfile is required" },
        { status: 400 },
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: "location is required" },
        { status: 400 },
      );
    }

    if (!rapidApiKey) {
      return NextResponse.json(
        {
          error:
            "RapidAPI key missing. Provide it in the request or configure RAPIDAPI_KEY.",
        },
        { status: 401 },
      );
    }

    const payload = {
      jobProfile,
      geography,
      location,
      experienceLevel,
      remote,
      rapidApiKey,
    } as Required<SearchPayload>;

    const query = buildQuery(payload);

    const searchParams = new URLSearchParams({
      query,
      page: "1",
      num_pages: "1",
    });

    if (remote === "remote") {
      searchParams.append("remote_jobs_only", "true");
    } else if (remote === "on-site") {
      searchParams.append("remote_jobs_only", "false");
    }

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`,
      {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      },
    );

    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      console.error("JSearch error", detail);
      return NextResponse.json(
        {
          error:
            detail?.message ??
            `JSearch API returned ${response.status}. Check RapidAPI quota and key.`,
        },
        { status: response.status },
      );
    }

    const result = (await response.json()) as JSearchResponse;
    const jobs: JSearchJob[] = Array.isArray(result?.data) ? result.data : [];

    if (jobs.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const trimmedJobs = jobs.slice(0, 12);

    const enrichedJobs: JobResult[] = await Promise.all(
      trimmedJobs.map(async (job) => {
        const companyName = ensureString(job.employer_name) ?? "Unknown company";
        const contacts = extractContacts(job);
        const highlightSections: string[] = [];

        if (Array.isArray(job?.job_highlights?.Qualifications)) {
          highlightSections.push(...job.job_highlights.Qualifications);
        }

        if (Array.isArray(job?.job_highlights?.Responsibilities)) {
          highlightSections.push(...job.job_highlights.Responsibilities);
        }

        if (Array.isArray(job?.job_highlights?.Benefits)) {
          highlightSections.push(...job.job_highlights.Benefits);
        }

        const companyInsight =
          companyName !== "Unknown company"
            ? await fetchCompanyInsight(companyName)
            : undefined;

        return {
          id: ensureString(job.job_id) ?? crypto.randomUUID(),
          title: ensureString(job.job_title) ?? payload.jobProfile,
          company: companyName,
          city: ensureString(job.job_city),
          state: ensureString(job.job_state),
          country: ensureString(job.job_country),
          remote: Boolean(job.job_is_remote),
          employmentType: ensureString(job.job_employment_type),
          salary: formatSalary(job),
          applyLink: ensureString(job.job_apply_link) ?? undefined,
          description: ensureString(job.job_description),
          highlights: highlightSections.slice(0, 6),
          postedAt: formatPosted(job),
          contacts,
          companyInsight,
        };
      }),
    );

    return NextResponse.json({
      jobs: enrichedJobs,
    });
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json(
      {
        error: "Unexpected server error while fetching hiring intelligence.",
      },
      { status: 500 },
    );
  }
}
