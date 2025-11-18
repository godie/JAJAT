// chrome-extension/job-extractors/JobExtractor.ts
// Interface for job data extractors from different job boards

export interface JobData {
  position?: string;
  company?: string;
  description?: string;
  location?: string;
  jobType?: string; // Remote, Hybrid, On-site, etc.
  salary?: string;
  postedDate?: string; // ISO format date string (YYYY-MM-DD)
}

/**
 * Interface that all job extractors must implement.
 * This allows for easy extension to support new job boards.
 */
export interface JobExtractor {
  /**
   * Name of the job board (e.g., "LinkedIn", "Greenhouse", "Lever")
   */
  readonly name: string;

  /**
   * Check if the current page is a job posting page for this extractor
   * @param url The current page URL
   * @returns true if this extractor can handle this URL
   */
  canHandle(url: string): boolean;

  /**
   * Extract job data from the current page
   * @returns JobData object with extracted information
   */
  extract(): JobData;
}

