import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MonitoringCard } from "@/components/MonitoringCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Shield, Eye, Monitor, Volume2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Violation {
  type: string;
  message: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
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

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `https://proctoring-reports-4.onrender.com/reports/candidate/${candidateId}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }

        const data = await response.json();
        if (data.reports && data.reports.length > 0) {
          setReportData(data.reports[0]);
        } else {
          toast.error("No report found for this candidate");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchReport();
    }
  }, [candidateId]);

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground">
            No proctoring report available for this candidate.
          </p>
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Proctoring & Compliance</h1>
          </div>
          <p className="text-muted-foreground">
            Candidate ID: <span className="font-mono">{candidateId}</span>
          </p>
        </div>

        {/* Monitoring Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
          <MonitoringCard
            icon={Volume2}
            title="Audio Monitoring"
            score="N/A"
            details={monitoring_status.audio_monitoring.message || "No suspicions"}
            scoreColor="text-muted-foreground"
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
            <h2 className="text-xl font-semibold mb-6">Violation Timeline</h2>
            <div className="space-y-3">
              {violations.timeline.slice(0, 3).map((violation, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 pb-3 border-b last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1">
                      {formatTimestamp(violation.timestamp)} {formatDate(violation.timestamp)}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {violation.message}
                    </div>
                  </div>
                  <SeverityBadge severity={violation.severity} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Full Violation Timeline */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Violation Timeline</h2>
          <div className="space-y-4">
            {violations.timeline.map((violation, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
              >
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
                <SeverityBadge severity={violation.severity} />
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
            {monitoring_status.audio_monitoring.status === "disabled" && (
              <p className="text-muted-foreground">Audio monitoring was not active.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Report;
