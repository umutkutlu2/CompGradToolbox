import { useEffect, useMemo, useState } from "react";
import { History, Search, Eye, RefreshCw, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { apiUrl } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

type RunRow = {
  run_id: number;
  created_at: string;
  created_by?: string | null;
  notes?: string | null;
  courses_count?: number;
  pairs_count?: number;
};

type RunDetail = {
  run_id: number;
  created_at: string;
  created_by?: string | null;
  notes?: string | null;
  assignments: Record<string, { professor: string; tas: string[] }>;
  workloads: Record<string, number>;
};

type CourseAssignmentRow = {
  code: string;
  professor: string;
  tas: string[];
};

type TAAssignmentRow = {
  name: string;
  courses: string[];
  load: number;
};

export default function AssignmentHistory() {
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [q, setQ] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<RunDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/assignment-runs?limit=200'));
      if (!res.ok) throw new Error("Failed to fetch runs");
      const data = await res.json();
      setRuns(data ?? []);
    } catch (e) {
      console.error(e);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const filteredRuns = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return runs;
    return runs.filter((r) => {
      const hay = `${r.run_id} ${r.created_by ?? ""} ${r.notes ?? ""} ${r.created_at ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [runs, q]);

  const openRun = async (run_id: number) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedRun(null);
    try {
      const res = await fetch(apiUrl(`/api/assignment-runs/${run_id}`));
      if (!res.ok) throw new Error("Failed to load run details");
      const data: RunDetail = await res.json();
      setSelectedRun(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const coursesView: CourseAssignmentRow[] = useMemo(() => {
    if (!selectedRun?.assignments) return [];
    return Object.entries(selectedRun.assignments)
      .map(([code, info]) => ({
        code,
        professor: info.professor ?? "",
        tas: info.tas ?? [],
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [selectedRun]);

  const tasView: TAAssignmentRow[] = useMemo(() => {
    if (!selectedRun?.assignments || !selectedRun?.workloads) return [];

    // build TA -> courses from assignments
    const taToCourses: Record<string, string[]> = {};
    for (const [courseCode, info] of Object.entries(selectedRun.assignments)) {
      for (const ta of info.tas ?? []) {
        (taToCourses[ta] ??= []).push(courseCode);
      }
    }

    return Object.entries(selectedRun.workloads)
      .map(([taName, load]) => ({
        name: taName,
        load: Number(load ?? 0),
        courses: (taToCourses[taName] ?? []).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => b.load - a.load || a.name.localeCompare(b.name));
  }, [selectedRun]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Assignment History
          </CardTitle>
          <CardDescription>
            Browse previously saved assignment runs. Open any run to view results.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                className="pl-10"
                placeholder="Search by run id, user, notes..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <Button variant="outline" className="gap-2" onClick={fetchRuns} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Runs table */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Runs</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-neutral-500">Loading runs…</div>
          ) : filteredRuns.length === 0 ? (
            <div className="text-sm text-neutral-500">No runs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm text-neutral-600">Run</th>
                    <th className="text-left py-3 px-4 text-sm text-neutral-600">Created</th>
                    <th className="text-left py-3 px-4 text-sm text-neutral-600">User</th>
                    <th className="text-left py-3 px-4 text-sm text-neutral-600">Summary</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRuns.map((r) => (
                    <tr key={r.run_id} className="border-b hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div className="font-medium">#{r.run_id}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-2 text-sm text-neutral-700">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          {formatDate(r.created_at)}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm text-neutral-800">{r.created_by ?? "-"}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {typeof r.courses_count === "number" && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {r.courses_count} courses
                            </Badge>
                          )}
                          {typeof r.pairs_count === "number" && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              {r.pairs_count} assignments
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex gap-2"
                          onClick={() => openRun(r.run_id)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={async () => {
                                if (!confirm(`Apply Run #${r.run_id}? This will overwrite the current active assignments.`)) return;

                                const res = await fetch(apiUrl(`/api/assignment-runs/${r.run_id}/apply?user=${encodeURIComponent("Admin")}`), {
                                method: "POST",
                                });

                                if (!res.ok) {
                                alert("Failed to apply run");
                                return;
                                }

                                alert(`Applied Run #${r.run_id} successfully`);
                            }}
                            >
                            Apply
                        </Button>

                      </td>
                      <td className="py-4 px-4">
                        <Button
                            className="bg-rose-100 border-rose-200"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                if (!confirm(`Delete run #${r.run_id}?`)) return;

                                const res = await fetch(apiUrl(`/api/assignment-runs/${r.run_id}?user=${encodeURIComponent("Admin")}`), {
                                method: "DELETE",
                                });

                                if (!res.ok) {
                                alert("Failed to delete run");
                                return;
                                }

                                // refresh runs list
                                await fetchRuns();
                            }}
                            >
                            Delete
                        </Button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRun ? `Run #${selectedRun.run_id}` : "Run Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedRun
                ? `${formatDate(selectedRun.created_at)} • ${selectedRun.created_by ?? "Unknown"} • ${selectedRun.notes ?? ""}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <div className="text-sm text-neutral-500">Loading run details…</div>
          )}

          {!detailsLoading && selectedRun && (
            <Tabs defaultValue="by-course">
              <TabsList className="mb-4">
                <TabsTrigger value="by-course">By Course</TabsTrigger>
                <TabsTrigger value="by-ta">By TA</TabsTrigger>
              </TabsList>

              {/* By Course */}
              <TabsContent value="by-course">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course</th>
                        <th className="text-left py-3 px-4">Professor</th>
                        <th className="text-left py-3 px-4">Assigned TAs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesView.map((c) => (
                        <tr key={c.code} className="border-b hover:bg-neutral-50">
                          <td className="py-4 px-4">
                            <div className="font-medium">{c.code}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-1 rounded-md text-blue-700 bg-blue-50 border border-blue-200 text-sm">
                              {c.professor || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {c.tas.length === 0 ? (
                              <span className="text-sm text-neutral-400">None</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {c.tas.map((t, i) => (
                                  <Badge key={i} variant="outline">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* By TA */}
              <TabsContent value="by-ta">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">TA</th>
                        <th className="text-left py-3 px-4">Courses</th>
                        <th className="text-left py-3 px-4">Load</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasView.map((ta) => (
                        <tr key={ta.name} className="border-b hover:bg-neutral-50">
                          <td className="py-4 px-4">{ta.name}</td>
                          <td className="py-4 px-4">
                            {ta.courses.length === 0 ? (
                              <span className="text-sm text-neutral-400">None</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {ta.courses.map((code) => (
                                  <Badge key={code} variant="outline">
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="bg-neutral-50 border-neutral-200">
                              {ta.load}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
