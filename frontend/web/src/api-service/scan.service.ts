import api from "@/lib/api";

export type ScanStatus = "pending" | "completed" | "failed" | "in-progress";
export type SeverityLevel = "high" | "medium" | "low" | "info";

export type ScanHistoryItem = {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  vulnerabilities: number | null;
};

export type ScanFinding = {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: string;
  remediation: string;
};

export type ScanResult = {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  duration: string;
  summary: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: ScanFinding[];
};

export const submitScan = (scanData: unknown) => {
  // Best-effort: if your backend exposes a scan endpoint, this will work.
  // Otherwise, the UI will still handle errors via toast.
  return api.post("/scan", scanData);
};

// The project currently uses mocked scan data in the UI. Keep behavior stable by
// returning mock data shapes from the service layer until scan history endpoints
// are finalized.
export const getScanHistory = async () => {
  return {
    data: [
      {
        id: "1",
        url: "https://example.com",
        type: "Full",
        status: "completed" as ScanStatus,
        date: "2023-05-08T10:30:00Z",
        vulnerabilities: 3,
      },
      {
        id: "2",
        url: "https://test-site.com",
        type: "Basic",
        status: "completed" as ScanStatus,
        date: "2023-05-07T14:20:00Z",
        vulnerabilities: 0,
      },
      {
        id: "3",
        url: "https://demo.org",
        type: "Custom",
        status: "pending" as ScanStatus,
        date: "2023-05-09T09:45:00Z",
        vulnerabilities: null,
      },
      {
        id: "4",
        url: "https://broken-site.net",
        type: "Full",
        status: "failed" as ScanStatus,
        date: "2023-05-06T16:10:00Z",
        vulnerabilities: null,
      },
    ] satisfies ScanHistoryItem[],
  };
};

export const getScanResult = async (scanId: string) => {
  return {
    data: {
      id: scanId,
      url: scanId === "1" ? "https://example.com" : "https://test-site.com",
      type: scanId === "1" ? "Full" : "Basic",
      status: "completed" as ScanStatus,
      date: new Date().toISOString(),
      duration: "1m 45s",
      summary: {
        high: scanId === "1" ? 2 : 0,
        medium: scanId === "1" ? 1 : 0,
        low: scanId === "1" ? 3 : 1,
        info: scanId === "1" ? 5 : 2,
      },
      findings:
        scanId === "1"
          ? ([
              {
                id: "CVE-2023-1234",
                severity: "high" as SeverityLevel,
                title: "SQL Injection Vulnerability",
                description:
                  "The application is vulnerable to SQL injection attacks which could lead to unauthorized data access.",
                location: "/search?q=",
                remediation: "Use parameterized queries or prepared statements.",
              },
              {
                id: "CVE-2023-5678",
                severity: "high" as SeverityLevel,
                title: "Cross-Site Scripting (XSS)",
                description:
                  "The application does not properly sanitize user input, allowing injection of malicious scripts.",
                location: "/comment",
                remediation: "Implement proper input validation and output encoding.",
              },
              {
                id: "WEAK-TLS",
                severity: "medium" as SeverityLevel,
                title: "Weak TLS Configuration",
                description: "The server is using outdated TLS protocols that have known vulnerabilities.",
                location: "Server Configuration",
                remediation: "Update server configuration to use only TLS 1.2 or higher.",
              },
              {
                id: "COOKIE-FLAGS",
                severity: "low" as SeverityLevel,
                title: "Missing Secure Flag on Cookies",
                description:
                  "Cookies are being sent without the secure flag, which could expose them to interception.",
                location: "Cookie Headers",
                remediation: "Add the Secure flag to all cookies that contain sensitive information.",
              },
            ] satisfies ScanFinding[])
          : ([
              {
                id: "COOKIE-FLAGS",
                severity: "low" as SeverityLevel,
                title: "Missing Secure Flag on Cookies",
                description:
                  "Cookies are being sent without the secure flag, which could expose them to interception.",
                location: "Cookie Headers",
                remediation: "Add the Secure flag to all cookies that contain sensitive information.",
              },
            ] satisfies ScanFinding[]),
    } satisfies ScanResult,
  };
};
