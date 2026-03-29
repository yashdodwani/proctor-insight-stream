import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createRoot } from "react-dom/client";
import JSZip from "jszip";
import { AlertTriangle, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, getApiHeaders } from "@/config/api";
import { BatchReportPdfTemplate, type CandidateReport } from "@/components/BatchReportPdfTemplate";
import { downloadBlob, elementToPdfBlob } from "@/lib/pdf";

const safeFileName = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_");

const getCandidateId = (report: CandidateReport, index: number) => {
  return (
    report.candidateId ||
    report.candidate_id ||
    report.session_id ||
    `candidate_${index + 1}`
  );
};

const waitForImages = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
};

const renderBatchPdfBlob = async (report: CandidateReport, candidateId: string): Promise<Blob> => {
  const mountNode = document.createElement("div");
  mountNode.style.position = "fixed";
  mountNode.style.left = "-10000px";
  mountNode.style.top = "0";
  mountNode.style.zIndex = "-1";
  mountNode.style.background = "#ffffff";
  document.body.appendChild(mountNode);

  const root = createRoot(mountNode);
  root.render(<BatchReportPdfTemplate candidateId={candidateId} reportData={report} />);

  await new Promise((resolve) => setTimeout(resolve, 80));
  await waitForImages(mountNode);
  const blob = await elementToPdfBlob(mountNode);

  root.unmount();
  document.body.removeChild(mountNode);
  return blob;
};

const BatchReport = () => {
  const { batchId } = useParams();
  const [reports, setReports] = useState<CandidateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatchReports = async () => {
      if (!batchId) {
        setErrorMessage("Missing batch ID in URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.getBatchReports(batchId), {
          headers: getApiHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setErrorMessage(errorData?.detail || `Failed to fetch batch reports (${response.status})`);
          return;
        }

        const data = await response.json();
        const fetchedReports = Array.isArray(data?.reports) ? data.reports : [];
        setReports(fetchedReports);

        if (fetchedReports.length === 0) {
          setErrorMessage("No reports found for this batch ID.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to fetch batch reports.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchReports();
  }, [batchId]);

  const downloadAllAsZip = async () => {
    if (!batchId || reports.length === 0) return;

    setDownloading(true);
    toast.info(`Generating ${reports.length} PDFs. This can take a moment...`);

    try {
      const zip = new JSZip();

      for (let index = 0; index < reports.length; index += 1) {
        const report = reports[index];
        const candidateId = getCandidateId(report, index);
        const pdfBlob = await renderBatchPdfBlob(report, candidateId);
        zip.file(`${safeFileName(candidateId)}_report.pdf`, pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `batch_reports_${safeFileName(batchId)}.zip`);
      toast.success("Batch ZIP downloaded successfully.");
    } catch (error) {
      console.error("Batch ZIP generation failed:", error);
      toast.error("Failed to generate ZIP. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Loading batch reports...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <h1 className="text-2xl font-bold mb-2">Unable to load batch</h1>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <p className="text-xs font-mono text-muted-foreground">Batch ID: {batchId || "N/A"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Batch Reports</h1>
            <p className="text-muted-foreground">
              Batch ID: <span className="font-mono">{batchId}</span>
            </p>
          </div>
          <Button onClick={downloadAllAsZip} disabled={downloading || reports.length === 0}>
            {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {downloading ? "Generating ZIP..." : "Download All as ZIP"}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3 font-semibold">Candidate ID</th>
                  <th className="text-left p-3 font-semibold">Integrity Score</th>
                  <th className="text-left p-3 font-semibold">Violations</th>
                  <th className="text-left p-3 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => {
                  const candidateId = getCandidateId(report, index);
                  const integrityScore = report.report?.integrity_score ?? 0;
                  const violations = report.report?.violations?.summary?.total ?? 0;
                  const duration = report.report?.session_info?.duration_formatted || "-";

                  return (
                    <tr key={`${candidateId}-${index}`} className="border-t">
                      <td className="p-3 font-mono">{candidateId}</td>
                      <td className="p-3">{Math.round(integrityScore)}</td>
                      <td className="p-3">{violations}</td>
                      <td className="p-3">{duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4 flex items-center text-sm text-muted-foreground gap-2">
          <FileText className="h-4 w-4" />
          {reports.length} report{reports.length === 1 ? "" : "s"} ready for download.
        </div>
      </div>
    </div>
  );
};

export default BatchReport;
