import { AlertTriangle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";

export interface Violation {
  type: string;
  message: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  thumbnail?: string;
  attempt?: number;
  attempt_label?: string;
}

export interface MonitoringStatus {
  face_detection: { score: number; status: string; total_checks: number };
  eye_tracking: { score: number; status: string; total_checks: number; gaze_violations: number };
  audio_monitoring: { score: number; status: string; message?: string };
  screen_activity: { score: number; status: string; total_checks: number; tab_switches: number };
}

export interface CandidateReport {
  candidate_id?: string;
  candidateId?: string;
  session_id?: string;
  report: {
    monitoring_status: MonitoringStatus;
    integrity_score: number;
    violations: {
      summary: { total: number; critical: number; high: number; medium: number; low: number };
      timeline: Violation[];
    };
    session_info: { duration_formatted: string; total_frames_processed: number };
    overall_assessment: { status: string; message: string };
  };
}

const getScoreColor = (score: number) => {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

const formatTime = (timestamp: string) => {
  const hasTz = /[zZ]$|[+-]\d{2}:\d{2}$/.test(timestamp);
  if (!hasTz) {
    const [, raw = "00:00:00"] = timestamp.split("T");
    const [h = "00", m = "00", s = "00"] = raw.split(".")[0].split(":");
    const hour = Number.parseInt(h, 10);
    const h12 = hour % 12 || 12;
    return `${h12.toString().padStart(2, "0")}:${m}:${s} ${hour >= 12 ? "PM" : "AM"}`;
  }
  return new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const getThumbnailSrc = (thumbnail: string) => {
  if (thumbnail.startsWith("data:image")) return thumbnail;
  return `data:image/jpeg;base64,${thumbnail}`;
};

interface Props {
  candidateId: string;
  reportData: CandidateReport;
}

export const BatchReportPdfTemplate = ({ candidateId, reportData }: Props) => {
  const { report } = reportData;

  return (
    <div className="bg-white text-black p-8" style={{ width: "1180px" }}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7" />
          <h1 className="text-3xl font-bold">Proctoring & Compliance</h1>
        </div>
        <p className="text-sm">Candidate ID: <span className="font-mono">{candidateId}</span></p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-sm mb-1">Face Detection Score</p>
          <p className="text-3xl font-bold" style={{ color: getScoreColor(report.monitoring_status.face_detection.score) }}>
            {Math.round(report.monitoring_status.face_detection.score)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm mb-1">Eye Tracking Score</p>
          <p className="text-3xl font-bold" style={{ color: getScoreColor(report.monitoring_status.eye_tracking.score) }}>
            {Math.round(report.monitoring_status.eye_tracking.score)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm mb-1">Integrity Score</p>
          <p className="text-3xl font-bold" style={{ color: getScoreColor(report.integrity_score) }}>
            {Math.round(report.integrity_score)}
          </p>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Violation Timeline</h2>
        <div className="space-y-6">
          {Object.entries(
            report.violations.timeline.reduce((acc, violation) => {
              const label = violation.attempt_label || "Timeline";
              if (!acc[label]) acc[label] = [];
              acc[label].push(violation);
              return acc;
            }, {} as Record<string, Violation[]>)
          ).map(([attemptLabel, attemptViolations], attemptIndex) => (
            <div key={`attempt-${attemptIndex}`} className="space-y-3">
              <div className="flex items-center gap-4">
                <h3 className="text-[15px] font-semibold text-gray-700">{attemptLabel}</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              {attemptViolations.map((violation, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-3 border rounded-md">
                  <div className="flex items-start gap-3 flex-1">
                    {violation.thumbnail ? (
                  <img src={getThumbnailSrc(violation.thumbnail)} alt="Violation" className="w-20 h-20 object-cover rounded border" />
                ) : (
                  <div className="w-20 h-20 rounded border flex items-center justify-center bg-gray-100 text-gray-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{formatTime(violation.timestamp)}</p>
                  <p className="text-sm">{violation.message}</p>
                </div>
              </div>
                  <SeverityBadge severity={violation.severity} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p><span className="font-semibold">Total warnings:</span> {report.violations.summary.total}</p>
        <p><span className="font-semibold">Duration:</span> {report.session_info.duration_formatted}</p>
        <p><span className="font-semibold">Frames processed:</span> {report.session_info.total_frames_processed}</p>
        <p className="mt-2"><span className="font-semibold">Assessment:</span> {report.overall_assessment.message}</p>
      </Card>
    </div>
  );
};

