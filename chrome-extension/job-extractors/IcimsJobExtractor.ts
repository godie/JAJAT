// chrome-extension/job-extractors/IcimsJobExtractor.ts
// Icims-specific job data extractor

import { JobExtractor, JobData } from './JobExtractor';

export class IcimsJobExtractor implements JobExtractor {
  readonly name = 'Icims';

  canHandle(url: string): boolean {
    return url.includes('icims.com');
  }

  extract(): JobData {
    const data: JobData = {};

    return data;
  }

}