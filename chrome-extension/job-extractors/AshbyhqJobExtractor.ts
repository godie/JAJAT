// chrome-extension/job-extractors/AshbyhqJobExtractor.ts
export class AshbyhqJobExtractor {
  public static HOST = "jobs.ashbyhq.com";

  public isHost(url: string): boolean {
    return url.includes(AshbyhqJobExtractor.HOST);
  }

  public extract(): unknown {
    return {};
  }

  public extractJobDescription(): string {
    return '';
  }

  public extractSalary(): string {
    return '';
  }
}
