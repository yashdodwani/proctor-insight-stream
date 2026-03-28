import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Example candidate ID - in your main app, you'll redirect directly
  const handleViewReport = () => {
    navigate("/report/04c2ab25-f62a-46a6-a047-f704007fd4e4");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-4">
        <Shield className="w-20 h-20 text-primary mx-auto mb-6" />
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Proctoring Report System
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          View detailed exam compliance and monitoring reports
        </p>
        <Button onClick={handleViewReport} size="lg">
          View Sample Report
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">
          In your main app, redirect to: <br />
          <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
            /report/&#123;candidateId&#125;
          </code>
        </p>
      </div>
    </div>
  );
};

export default Index;
