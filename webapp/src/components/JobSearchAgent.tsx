"use client";

import { useMemo, useState } from "react";

type Geography = "india" | "global";
type ExperienceLevel = "any" | "entry" | "mid" | "senior" | "lead";
type RemotePreference = "any" | "remote" | "on-site" | "hybrid";

type SearchPayload = {
  jobProfile: string;
  geography: Geography;
  location: string;
  experienceLevel: ExperienceLevel;
  remote: RemotePreference;
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

type SearchResponse = {
  jobs: JobResult[];
};

const jobProfiles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "QA Engineer",
  "Cybersecurity Analyst",
  "Business Analyst",
  "Mobile App Developer",
  "Cloud Architect",
  "Digital Marketing Manager",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Andaman and Nicobar Islands",
  "Lakshadweep",
] as const;

const experienceOptions: ExperienceLevel[] = [
  "any",
  "entry",
  "mid",
  "senior",
  "lead",
];

const remoteOptions: RemotePreference[] = [
  "any",
  "remote",
  "on-site",
  "hybrid",
];

function formatLocation(job: JobResult) {
  const segments = [
    [job.city, job.state].filter(Boolean).join(", "),
    job.country,
  ].filter(Boolean);
  return segments.length > 0 ? segments.join(" · ") : "Location confidential";
}

export function JobSearchAgent() {
  const [jobProfile, setJobProfile] = useState(jobProfiles[0]);
  const [geography, setGeography] = useState<Geography>("india");
  const [selectedState, setSelectedState] = useState<typeof indianStates[number]>(
    "Karnataka",
  );
  const [customLocation, setCustomLocation] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("any");
  const [remotePreference, setRemotePreference] =
    useState<RemotePreference>("any");
  const [rapidApiKey, setRapidApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<JobResult[]>([]);

  const locationPlaceholder = useMemo(
    () =>
      geography === "india"
        ? "Select an Indian state"
        : "City, state, or country (e.g. Singapore, APAC, Europe)",
    [geography],
  );

  const effectiveLocation = useMemo(() => {
    if (geography === "india") {
      return selectedState;
    }
    return customLocation.trim() || "India";
  }, [customLocation, geography, selectedState]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: SearchPayload = {
        jobProfile,
        geography,
        location: effectiveLocation,
        experienceLevel,
        remote: remotePreference,
        rapidApiKey: rapidApiKey.trim() || undefined,
      };

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error ?? "Unable to fetch hiring data.");
      }

      const data = (await response.json()) as SearchResponse;
      setResults(data.jobs);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected issue while fetching hiring data.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="rounded-3xl border border-zinc-200 bg-white/60 p-6 shadow-sm backdrop-blur sm:p-10">
        <form
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div className="col-span-1 lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Job profile
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              list="job-profiles"
              value={jobProfile}
              placeholder="e.g. Product Manager"
              onChange={(event) => setJobProfile(event.target.value)}
              required
            />
            <datalist id="job-profiles">
              {jobProfiles.map((profile) => (
                <option key={profile} value={profile} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Geography
            </label>
            <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-1">
              <button
                type="button"
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  geography === "india"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
                onClick={() => setGeography("india")}
              >
                India
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  geography === "global"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
                onClick={() => setGeography("global")}
              >
                Worldwide
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              {geography === "india" ? "Indian state" : "Preferred location"}
            </label>
            {geography === "india" ? (
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={selectedState}
                onChange={(event) =>
                  setSelectedState(event.target.value as typeof indianStates[number])
                }
              >
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={customLocation}
                placeholder={locationPlaceholder}
                onChange={(event) => setCustomLocation(event.target.value)}
              />
            )}
            <p className="mt-2 text-xs text-zinc-500">
              Target cities, regions, or countries. Leave blank to broaden searches
              globally.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Experience level
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={experienceLevel}
              onChange={(event) =>
                setExperienceLevel(event.target.value as ExperienceLevel)
              }
            >
              {experienceOptions.map((level) => (
                <option key={level} value={level}>
                  {level === "any" ? "Any experience" : level.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Work style
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={remotePreference}
              onChange={(event) =>
                setRemotePreference(event.target.value as RemotePreference)
              }
            >
              {remoteOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "any" ? "Any" : option.replace("-", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              RapidAPI key (JSearch)
            </label>
            <input
              className="w-full rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 px-4 py-3 text-sm shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={rapidApiKey}
              placeholder="Paste your RapidAPI key for the Jobs Search (JSearch) API"
              onChange={(event) => setRapidApiKey(event.target.value)}
            />
            <p className="mt-2 text-xs text-zinc-500">
              The key is only used by the API route to reach RapidAPI. Leave empty if the
              server exposes RAPIDAPI_KEY.
            </p>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-400"
              disabled={loading}
            >
              {loading ? "Searching hiring teams…" : "Find hiring contacts"}
            </button>
            {error ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-zinc-900">Hiring teams</h2>
          <p className="text-sm text-zinc-600">
            Showing the latest people and companies hiring {jobProfile} roles in{" "}
            {effectiveLocation}.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-zinc-200 bg-white/70 p-10 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-indigo-500 border-r-transparent" />
              Gathering live job intelligence…
            </div>
          </div>
        ) : null}

        {!loading && results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm text-zinc-500 shadow-sm">
            Run a search to surface HR contacts, hiring managers, and company intel for
            your chosen role.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          {results.map((job) => (
            <article
              key={job.id}
              className="flex h-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                {job.companyInsight?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.companyInsight.logo}
                    alt={job.company}
                    className="h-12 w-12 rounded-xl border border-zinc-200 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm font-semibold text-zinc-500">
                    {job.company
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">
                    {job.company}
                  </p>
                  <h3 className="text-lg font-semibold text-zinc-900">{job.title}</h3>
                  <p className="text-xs text-zinc-500">{formatLocation(job)}</p>
                </div>
              </div>

              {job.highlights && job.highlights.length > 0 ? (
                <ul className="flex flex-wrap gap-2 text-xs text-zinc-600">
                  {job.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="text-sm leading-relaxed text-zinc-600">
                {job.description ?? "No description available."}
              </p>

              <dl className="grid grid-cols-2 gap-3 text-xs text-zinc-600">
                {job.salary ? (
                  <div>
                    <dt className="font-medium text-zinc-500">Compensation</dt>
                    <dd className="text-sm text-zinc-800">{job.salary}</dd>
                  </div>
                ) : null}
                {job.employmentType ? (
                  <div>
                    <dt className="font-medium text-zinc-500">Type</dt>
                    <dd className="text-sm text-zinc-800">{job.employmentType}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="font-medium text-zinc-500">Work mode</dt>
                  <dd className="text-sm text-zinc-800">
                    {job.remote ? "Remote or Hybrid" : "On-site"}
                  </dd>
                </div>
                {job.postedAt ? (
                  <div>
                    <dt className="font-medium text-zinc-500">Posted</dt>
                    <dd className="text-sm text-zinc-800">{job.postedAt}</dd>
                  </div>
                ) : null}
              </dl>

              {job.contacts.length > 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                    HR & hiring contacts
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-emerald-800">
                    {job.contacts.map((contact) => (
                      <li key={`${contact.label}-${contact.value}`}>
                        <span className="font-medium">{contact.label}:</span>{" "}
                        <a
                          href={
                            contact.value.includes("@")
                              ? `mailto:${contact.value}`
                              : contact.value.startsWith("http")
                                ? contact.value
                                : undefined
                          }
                          className="break-all underline decoration-emerald-400"
                          target={
                            contact.value.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noreferrer"
                        >
                          {contact.value}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-4 text-sm text-zinc-600">
                  No direct HR contacts detected. Use the apply link or company site to
                  reach the talent team.
                </div>
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                {job.applyLink ? (
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Apply / Contact →
                  </a>
                ) : null}

                {job.companyInsight?.domain ? (
                  <a
                    href={`https://${job.companyInsight.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-700"
                  >
                    {job.companyInsight.domain}
                  </a>
                ) : null}
              </div>

              {job.companyInsight ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900">
                  <div className="flex flex-wrap items-center gap-3 text-indigo-700">
                    {job.companyInsight.linkedin ? (
                      <a
                        href={job.companyInsight.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                    {job.companyInsight.twitter ? (
                      <a
                        href={job.companyInsight.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        Twitter
                      </a>
                    ) : null}
                  </div>
                  {job.companyInsight.description ? (
                    <p className="mt-2 leading-relaxed text-zinc-600">
                      {job.companyInsight.description}
                    </p>
                  ) : null}
                  {job.companyInsight.location ? (
                    <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-indigo-500">
                      {job.companyInsight.location}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
