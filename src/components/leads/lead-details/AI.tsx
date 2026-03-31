import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGenerateLeadBrief } from "@/lib/tanstack/useAI";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { BriefContent } from "./BriefContent";


export const AI = ({ leadId }: { leadId: string }) => {
  const [error, setError] = useState<string | null>(null);
  const generateBrief = useGenerateLeadBrief(leadId);

  const handleGenerate = () => {
    setError(null)
    generateBrief.mutate(undefined, {
      onError: (error) => {
        setError(error.message);
      }
    })
  }

  const brief = generateBrief.data;
  const isPending = generateBrief.isPending;

  // Initial state: Generate button
  if (!brief) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          AI will analyze this lead&apos;s activity history and suggest actions.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={generateBrief.isPending}
        >
          {generateBrief.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Brief...
            </>
          ) : (
            "Generate Lead Brief"
          )}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI-Generated Brief</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isPending ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          AI suggestions can be wrong. Always verify before taking action.
        </AlertDescription>
      </Alert>

      {/* Brief sections */}
      <BriefContent brief={brief} />

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}