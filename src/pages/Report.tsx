import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MonitoringCard } from "@/components/MonitoringCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Shield, Eye, Monitor, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS, getApiHeaders } from "@/config/api";
import { downloadElementAsPdf } from "@/lib/pdf";

interface Violation {
  type: string;
  message: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  thumbnail?: string; // base64 encoded image
  attempt?: number;
  attempt_label?: string;
}

interface MonitoringStatus {
  face_detection: {
    score: number;
    status: string;
    total_checks: number;
  };
  eye_tracking: {
    score: number;
    status: string;
    total_checks: number;
    gaze_violations: number;
  };
  audio_monitoring: {
    score: number;
    status: string;
    message?: string;
  };
  screen_activity: {
    score: number;
    status: string;
    total_checks: number;
    tab_switches: number;
  };
}

interface ReportData {
  report: {
    monitoring_status: MonitoringStatus;
    integrity_score: number;
    violations: {
      summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      timeline: Violation[];
    };
    session_info: {
      duration_formatted: string;
      total_frames_processed: number;
    };
    overall_assessment: {
      status: string;
      message: string;
    };
  };
}

const Report = () => {
  const { candidateId } = useParams();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const getCandidateReportUrls = useCallback((id: string): string[] => {
    const primary = API_ENDPOINTS.getCandidateReports(id);
    if (!import.meta.env.DEV) return [primary];

    const direct = `${API_BASE_URL}/reports/candidate/${id}`;
    const proxied = `/reports/candidate/${id}`;
    const fallback = primary.startsWith("http") ? proxied : direct;
    return [primary, fallback].filter((url, idx, arr) => arr.indexOf(url) === idx);
  }, []);

  const fetchCandidateReportWithFallback = useCallback(async (id: string): Promise<{ response: Response; url: string }> => {
    const urls = getCandidateReportUrls(id);

    for (let attempt = 0; attempt < urls.length; attempt += 1) {
      const url = urls[attempt];
      try {
        const response = await fetch(url, { headers: getApiHeaders() });

        if (response.ok) {
          return { response, url };
        }

        const canRetryInDev = import.meta.env.DEV && attempt < urls.length - 1;
        const isHTML = response.headers.get("content-type")?.includes("text/html");
        const isLikelyTransportProxyError = response.status >= 500 || (response.status === 404 && isHTML);
        if (canRetryInDev && isLikelyTransportProxyError) {
          console.warn(`Report fetch failed on ${url} with HTTP ${response.status}${isHTML ? " (HTML response)" : ""}, retrying alternate URL...`);
          continue;
        }

        return { response, url };
      } catch (error) {
        const canRetryInDev = import.meta.env.DEV && attempt < urls.length - 1;
        if (canRetryInDev) {
          console.warn(`Report fetch network error on ${url}, retrying alternate URL...`, error);
          continue;
        }
        throw error;
      }
    }

    throw new Error("Failed to fetch report from all candidate report URLs");
  }, [getCandidateReportUrls]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const candidate = candidateId || "";
        const { response, url } = await fetchCandidateReportWithFallback(candidate);

        if (!response.ok) {
          let errorMessage = "Failed to fetch report";
          try {
            const contentType = response.headers.get("content-type");
            const isJSON = contentType?.includes("application/json");
            const errData = isJSON ? await response.json() : {};
            if (errData?.detail) errorMessage = errData.detail;
          } catch (_) { /* ignore JSON parse errors */ }

          if (response.status === 403) {
            setErrorStatus(403);
            setErrorDetail("Invalid or missing API key.");
            toast.error("Access denied: invalid or missing API key.");
          } else if (response.status === 503) {
            setErrorStatus(503);
            setErrorDetail(errorMessage);
            toast.error(`Service unavailable: ${errorMessage}. The reporting database may be temporarily down. Please try again later.`);
          } else if (response.status === 404) {
            setErrorStatus(404);
            setErrorDetail("No report found for this candidate ID.");
            toast.error("No report found for this candidate ID.");
          } else {
            setErrorStatus(response.status);
            setErrorDetail(`${errorMessage} (URL: ${url})`);
            toast.error(`Error ${response.status}: ${errorMessage}`);
          }
          return;
        }

        const data = await response.json();
        if (data.reports && data.reports.length > 0) {
          setReportData(data.reports[0]);
          console.log('Report data:', data.reports[0]);
          console.log('Violations with thumbnails:', data.reports[0]?.report?.violations?.timeline?.filter((v: Violation) => v.thumbnail));
        } else {
          toast.error("No report found for this candidate");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setErrorStatus(null);
        const urls = getCandidateReportUrls(candidateId || "");
        setErrorDetail(`Network/DNS error. Tried: ${urls.join(" | ")}`);
        toast.error("Failed to load report data. Check your network connection.");
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchReport();
    }
  }, [candidateId, fetchCandidateReportWithFallback, getCandidateReportUrls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    const is503 = errorStatus === 503;
    const is404 = errorStatus === 404;
    const is403 = errorStatus === 403;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${is503 ? "text-critical" : "text-warning"}`} />
          <h2 className="text-2xl font-bold mb-2">
            {is503 ? "Service Unavailable" : is404 ? "Report Not Found" : is403 ? "Access Denied" : "Error Loading Report"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {is503
              ? "The proctoring reports database is currently unavailable. Please try again in a few minutes."
              : is404
                ? "No proctoring report available for this candidate ID."
                : is403
                  ? "Invalid or missing API key. Please verify the VITE_API_KEY environment variable is set correctly."
                  : errorDetail || "An unexpected error occurred. Please try again."}
          </p>
          {errorStatus && (
            <p className="text-xs text-muted-foreground font-mono">
              HTTP {errorStatus} — {errorDetail}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const { report } = reportData;
  const { monitoring_status, integrity_score, violations, session_info, overall_assessment } = report;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-critical";
  };

  const hasExplicitTimezone = (timestamp: string) => /[zZ]$|[+-]\d{2}:\d{2}$/.test(timestamp);

  const formatTimeFromNaiveIso = (timestamp: string) => {
    const [, rawTime = "00:00:00"] = timestamp.split("T");
    const [hh = "00", mm = "00", ss = "00"] = rawTime.split(".")[0].split(":");
    const hour24 = Number.parseInt(hh, 10);
    const hour12 = hour24 % 12 || 12;
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    return `${hour12.toString().padStart(2, "0")}:${mm}:${ss} ${meridiem}`;
  };

  const formatDateFromNaiveIso = (timestamp: string) => {
    const [rawDate = ""] = timestamp.split("T");
    const [year, month, day] = rawDate.split("-");
    if (!year || !month || !day) return rawDate;
    return `${month}/${day}`;
  };

  const formatTimestamp = (timestamp: string) => {
    if (!hasExplicitTimezone(timestamp)) {
      return formatTimeFromNaiveIso(timestamp);
    }

    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    if (!hasExplicitTimezone(timestamp)) {
      return formatDateFromNaiveIso(timestamp);
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getThumbnailSrc = (thumbnail: string) => {
    // Check if the thumbnail already has the data URL prefix
    if (thumbnail.startsWith('data:image')) {
      return thumbnail;
    }
    // Otherwise, add the prefix (try multiple formats)
    // Most common formats: jpeg, jpg, png, webp
    return `data:image/jpeg;base64,${thumbnail}`;
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    toast.info("Generating PDF, please wait...");

    try {
      await downloadElementAsPdf(reportRef.current, `proctoring-report-${candidateId}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto" ref={reportRef}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Proctoring & Compliance</h1>
            </div>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed no-print"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
          <p className="text-muted-foreground">
            Candidate ID: <span className="font-mono">{candidateId}</span>
          </p>
        </div>

        {/* Monitoring Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MonitoringCard
            icon={Eye}
            title="Face Detection"
            score={monitoring_status.face_detection.score}
            status={monitoring_status.face_detection.status === "active" ? "score" : "NA"}
            details={`${monitoring_status.face_detection.total_checks} Total checks`}
            scoreColor={getScoreColor(monitoring_status.face_detection.score)}
          />
          <MonitoringCard
            icon={Eye}
            title="Eye Tracking"
            score={monitoring_status.eye_tracking.score}
            status={violations.summary.critical > 0 ? "Critical" : undefined}
            details={`${monitoring_status.eye_tracking.total_checks} total`}
            scoreColor={getScoreColor(monitoring_status.eye_tracking.score)}
          />
          <MonitoringCard
            icon={Monitor}
            title="Screen Activity"
            score={monitoring_status.screen_activity.score}
            status={monitoring_status.screen_activity.status === "active" ? "NA" : undefined}
            details={
              monitoring_status.screen_activity.tab_switches > 0
                ? `${monitoring_status.screen_activity.tab_switches} tab switches`
                : "Suspicious screen ac..."
            }
            scoreColor={getScoreColor(monitoring_status.screen_activity.score)}
          />
        </div>

        {/* Integrity Score and Violation Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Live Integrity Score */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Live Integrity Score</h2>
            <div>
              <p className="text-sm text-critical font-semibold mb-2">Integrity Score</p>
              <div className={`text-7xl font-bold ${getScoreColor(integrity_score)}`}>
                {Math.round(integrity_score)}
              </div>
            </div>
          </Card>

          {/* Violation Timeline Preview */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Violation Timeline (Preview)</h2>
            <div className="space-y-6">
              {Object.entries(
                violations.timeline.slice(0, 3).reduce((acc, violation) => {
                  const label = violation.attempt_label || "Timeline";
                  if (!acc[label]) acc[label] = [];
                  acc[label].push(violation);
                  return acc;
                }, {} as Record<string, Violation[]>)
              ).map(([attemptLabel, attemptViolations], attemptIndex) => (
                <div key={`preview-attempt-${attemptIndex}`} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold">{attemptLabel}</h3>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  {attemptViolations.map((violation, index) => (
                    <div
                      key={`${attemptIndex}-${index}`}
                      className="flex items-start justify-between gap-4 pb-3 border-b last:border-b-0"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {violation.thumbnail ? (
                      <img
                        src={getThumbnailSrc(violation.thumbnail)}
                        alt="Violation snapshot"
                        className="w-16 h-16 object-cover rounded border border-border flex-shrink-0"
                        onError={(e) => {
                          console.error('Failed to load thumbnail:', violation.thumbnail.substring(0, 50));
                          // Replace with placeholder
                          const target = e.currentTarget;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                          target.classList.add('opacity-30');
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border border-border flex-shrink-0 bg-muted flex items-center justify-center opacity-30">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1">
                        {formatTimestamp(violation.timestamp)} {formatDate(violation.timestamp)}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {violation.message}
                      </div>
                    </div>
                  </div>
                  <SeverityBadge severity={violation.severity} />
                </div>
              ))}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Full Violation Timeline */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Violation Timeline</h2>
          <div className="space-y-8">
            {Object.entries(
              violations.timeline.reduce((acc, violation) => {
                const label = violation.attempt_label || "Timeline";
                if (!acc[label]) acc[label] = [];
                acc[label].push(violation);
                return acc;
              }, {} as Record<string, Violation[]>)
            ).map(([attemptLabel, attemptViolations], attemptIndex) => (
              <div key={`attempt-${attemptIndex}`} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">{attemptLabel}</h3>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                {attemptViolations.map((violation, index) => (
                  <div
                    key={`${attemptIndex}-${index}`}
                    className="flex items-start justify-between gap-4 p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {violation.thumbnail ? (
                    <img
                      src={getThumbnailSrc(violation.thumbnail)}
                      alt="Violation snapshot"
                      className="w-24 h-24 object-cover rounded-lg border border-border flex-shrink-0 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                      onError={(e) => {
                        console.error('Failed to load thumbnail:', violation.thumbnail?.substring(0, 50));
                        // Replace with placeholder
                        const target = e.currentTarget;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                        target.classList.add('opacity-30');
                        target.style.cursor = 'default';
                      }}
                      onClick={(e) => {
                        // Only open if image loaded successfully
                        if (!e.currentTarget.classList.contains('opacity-30')) {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`<img src="${getThumbnailSrc(violation.thumbnail)}" alt="Violation snapshot full view" style="max-width:100%; height:auto;" />`);
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg border border-border flex-shrink-0 bg-muted flex items-center justify-center opacity-30">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium">
                        {formatTimestamp(violation.timestamp)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(violation.timestamp)}
                      </span>
                    </div>
                    <p className="text-foreground">{violation.message}</p>
                  </div>
                </div>
                <SeverityBadge severity={violation.severity} />
              </div>
            ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Session Stats */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Session Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Live Warnings</span>
              <span className="font-semibold">{violations.summary.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-critical">
                {session_info.duration_formatted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Frames Processed</span>
              <span className="font-semibold">{session_info.total_frames_processed}</span>
            </div>
          </div>
        </Card>

        {/* Overall Assessment */}
        <Card className="p-8 border-2 border-critical/20 bg-critical/5">
          <div className="space-y-2">
            <p className="text-foreground font-medium">{overall_assessment.message}</p>
            {violations.summary.critical > 0 && (
              <p className="text-critical font-semibold">Critical violations require attention.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Report;
