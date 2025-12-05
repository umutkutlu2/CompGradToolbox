import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface AssignmentResult {
  assignments: Record<string, string[]>;
  workloads: Record<string, number>;
}

export default function TAAssignmentResult() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignment() {
      setLoading(true);
      try {
        const res = await fetch("/api/run-assignment");
        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, []);

  const getWorkloadBadge = (workload: number) => {
    if (workload === 0) {
      return <Badge className="bg-neutral-100 text-neutral-700">0 hrs</Badge>;
    }
    if (workload <= 5) {
      return <Badge className="bg-amber-100 text-amber-700">{workload} hrs</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700">{workload} hrs</Badge>;
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-red-600 text-center py-20">
        {error}
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">TA Assignment Results</h1>

      {Object.entries(result.assignments).map(([prof, tas]) => (
        <Card key={prof}>
          <CardHeader>
            <CardTitle>{prof}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tas.length > 0 ? (
              tas.map((ta) => (
                <div
                  key={ta}
                  className="flex justify-between items-center border border-neutral-200 rounded-lg p-3"
                >
                  <div>{ta}</div>
                  <div>{getWorkloadBadge(result.workloads[ta] || 0)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-500">No TAs assigned</div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
