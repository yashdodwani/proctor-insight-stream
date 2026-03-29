import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getApiHeaders } from "@/config/api";
import { Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
export function BatchProctoring() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "completed" | "failed">("idle");
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 20) {
        toast({
          title: "Too many files",
          description: "Maximum 20 videos allowed in a batch",
          variant: "destructive",
        });
        return;
      }
      setFiles(selectedFiles);
    }
  };
  const startBatch = async () => {
    if (files.length === 0) return;
    setStatus("uploading");
    setErrorMessage("");
    const formData = new FormData();
    files.forEach(file => {
      formData.append("videos", file);
    });
    try {
      const response = await fetch(API_ENDPOINTS.batchProctoring, {
        method: "POST",
        headers: getApiHeaders(),
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to start batch processing");
      }

      setJobId(data.job_id);
      setStatus("processing");
      setProgressText(data.message || "Processing started");
    } catch (error: any) {
      setStatus("failed");
      setErrorMessage(error.message);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (status === "processing" && jobId) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(API_ENDPOINTS.batchStatus(jobId), {
            headers: getApiHeaders(),
          });
          const data = await response.json();
          if (data.status === "completed") {
            setStatus("completed");
            setProgressText(data.progress || "All videos processed");
            clearInterval(intervalId);
            toast({
              title: "Processing Complete",
              description: "Your batch report is ready to download.",
            });
          } else if (data.status === "failed") {
            setStatus("failed");
            setErrorMessage(data.error || "Processing failed");
            clearInterval(intervalId);
            toast({
              title: "Processing Failed",
              description: data.error || "An error occurred during processing.",
              variant: "destructive",
            });
          } else {
            setProgressText(data.progress || "Processing...");
          }
        } catch (error) {
          console.error("Error polling batch status:", error);
        }
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, jobId, toast]);
  const handleDownload = () => {
    if (!jobId) return;
    fetch(API_ENDPOINTS.downloadBatch(jobId), {
      headers: getApiHeaders(),
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to download");
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `batch_report_${jobId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        toast({
          title: "Download Failed",
          description: "Could not download the batch results.",
          variant: "destructive",
        });
      });
  };
  const getProgressPercentage = () => {
    if (!progressText) return 0;
    const match = progressText.match(/(\d+)\/(\d+)/);
    if (match) {
      const current = parseInt(match[1]);
      const total = parseInt(match[2]);
      if (total === 0) return 0;
      return (current / total) * 100;
    }
    if (status === "completed") return 100;
    return 0;
  };
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Batch Video Proctoring</CardTitle>
        <CardDescription>Upload up to 20 videos at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" || status === "failed" ? (
          <div className="space-y-4">
            <Input
              type="file"
              multiple
              accept="video/mp4,video/webm,video/avi,video/*"
              onChange={handleFileChange}
              disabled={status === "uploading"}
            />
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected {files.length} video(s)
              </p>
            )}
            {status === "failed" && (
              <div className="flex items-center text-destructive text-sm mt-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errorMessage}
              </div>
            )}
            <Button 
              onClick={startBatch} 
              disabled={files.length === 0 || status === "uploading"}
              className="w-full"
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Start Processing"
              )}
            </Button>
          </div>
        ) : status === "processing" ? (
          <div className="space-y-4 text-center">
             <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
             <p className="text-sm font-medium">{progressText}</p>
             <Progress value={getProgressPercentage()} className="w-full" />
             <p className="text-xs text-muted-foreground">
               Job ID: <span className="font-mono">{jobId}</span>
             </p>
          </div>
        ) : status === "completed" ? (
          <div className="space-y-4 text-center">
             <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
             <p className="font-medium">Batch Processing Complete!</p>
             <p className="text-sm text-muted-foreground">{progressText}</p>
             <Button onClick={handleDownload} className="w-full mt-4">
               <Download className="mr-2 h-4 w-4" />
               Download Results
             </Button>
             <Button variant="outline" onClick={() => {
                setStatus("idle");
                setFiles([]);
                setJobId(null);
                setProgressText("");
             }} className="w-full">
               Process Another Batch
             </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}