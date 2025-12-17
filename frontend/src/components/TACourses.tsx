import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

type Course = {
  course_id: number;
  course_code: string;
  professor_name?: string | null;
  assignedTAs?: string[];
  skills?: string[];
  ps_lab_sections?: string | null;
  enrollment_capacity?: number | null;
  actual_enrollment?: number | null;
};

export default function TACourses({ username }: { username: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);
  

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/courses/by-ta?username=${username}`)
      .then((r) => r.json())
      .then((data) => {
        const normalized = (data ?? []).map((c: any) => ({
          ...c,
          skills: c.skills ?? [],
          assignedTAs: c.assignedTAs ?? [],
        }));
        setCourses(normalized);
      })
      .catch(console.error);
  }, [username]);

  const openCourse = (c: Course) => {
    setSelected(c);
    setOpen(true);
  };

  const selectedSkills = useMemo(
    () => (selected?.skills ?? []).filter(Boolean),
    [selected]
  );
  const selectedTeam = useMemo(
    () => (selected?.assignedTAs ?? []).filter(Boolean),
    [selected]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-neutral-900 mb-1">My Assigned Courses</h1>
        <p className="text-neutral-600">
          Courses you are currently assigned to as a TA
        </p>
      </div>

      {/* Empty */}
      {courses.length === 0 ? (
        <Card className="border-neutral-200">
          <CardContent className="py-12 text-center">
            <div className="text-neutral-900 font-medium">No courses yet</div>
            <div className="text-sm text-neutral-500 mt-1">
              You are not assigned to any courses at the moment.
            </div>
          </CardContent>
        </Card>
      ) : (
    <div className="space-y-4">
    {courses.map((c) => {
        const skills = (c.skills ?? []).filter(Boolean);
        const team = (c.assignedTAs ?? []).filter(Boolean);
        const initials = (c.course_code ?? "CO").trim().slice(0, 2).toUpperCase();


        return (
        <button
            key={c.course_id}
            type="button"
            onClick={() => openCourse(c)}
            className="w-full text-left"
        >
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/70 hover:shadow-lg hover:ring-neutral-300/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            {/* subtle hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-50/80 via-transparent to-indigo-50/60" />

            <div className="relative p-6">
                {/* header row */}
                <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-bold text-sm">
                        {initials}
                    </span>
                    </div>

                    <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-neutral-900 truncate">
                        {c.course_code}
                        </h3>
                        <Badge className="rounded-full bg-green-50 text-green-700 border border-blue-200/80 px-3 py-0.5 text-xs font-medium">
                        Assigned
                        </Badge>
                    </div>

                    <div className="text-sm text-neutral-500 mt-1.5">
                        {c.professor_name ? (
                        <>
                            Professor{" "}
                            <span className="text-neutral-700 font-medium">
                            {c.professor_name}
                            </span>
                        </>
                        ) : (
                        "Professor —"
                        )}
                    </div>
                    </div>
                </div>

                {(c.ps_lab_sections ||
                (c.actual_enrollment != null && c.enrollment_capacity != null)) && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {c.ps_lab_sections && (
                    <Badge
                        variant="outline"
                        className="rounded-full bg-blue-50 text-blue-700 border-neutral-200 text-xs font-medium"
                    >
                        PS/Lab: {c.ps_lab_sections}
                    </Badge>
                    )}

                    {c.actual_enrollment != null && c.enrollment_capacity != null && (
                    <Badge
                        variant="outline"
                        className="rounded-full bg-blue-50 text-blue-700 border-neutral-200 text-xs font-medium"
                    >
                        Enrollment: {c.actual_enrollment}/{c.enrollment_capacity}
                    </Badge>
                    )}
                </div>
                )}
                </div>

                {/* 2 columns: Skills | TA Team */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Skills (left) */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-3">
                        Skills Needed
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                        {skills.length ? (
                            skills.map((s) => (
                            <span
                                key={s}
                                className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/80"
                            >
                                {s}
                            </span>
                            ))
                        ) : (
                            <span className="text-sm text-neutral-400">No skills specified</span>
                        )}
                        </div>
                    </div>

                    {/* TA Team (right) */}
                    <div className="md:justify-end rounded-xl bg-neutral-50/90 ring-1 ring-neutral-200/80 p-4">
                        <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-3">
                        TA Team
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                        {team.length ? (
                            team.map((n) => (
                            <Badge
                                key={n}
                                variant="outline"
                                className="rounded-full bg-blue-50 text-blue-700 border-neutral-200 text-xs font-medium px-3 py-1"
                            >
                                {n}
                            </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-neutral-400">You're the only TA listed</span>
                        )}
                        </div>
                    </div>
                    </div>

            </div>
            </div>
        </button>
        );
    })}
    </div>


      )}

      {/* Details Dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-neutral-900">
              {selected?.course_code ?? "Course"}
            </DialogTitle>
            <DialogDescription>
              {selected?.professor_name ? (
                <>
                  Professor{" "}
                  <span className="text-neutral-900 font-medium">
                    {selected.professor_name}
                  </span>
                </>
              ) : (
                "Professor —"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Meta badges */}
            <div className="flex flex-wrap gap-2">
              {selected?.ps_lab_sections && (
                <Badge
                  variant="outline"
                  className="rounded-full bg-neutral-50 text-neutral-700 border-neutral-200"
                >
                  PS/Lab: {selected.ps_lab_sections}
                </Badge>
              )}

              {selected?.actual_enrollment != null &&
                selected?.enrollment_capacity != null && (
                  <Badge
                    variant="outline"
                    className="rounded-full bg-neutral-50 text-neutral-700 border-neutral-200"
                  >
                    Enrollment: {selected.actual_enrollment}/{selected.enrollment_capacity}
                  </Badge>
                )}
            </div>

            {/* Two columns in dialog too */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50/80 ring-1 ring-neutral-200/70 p-4">
                <div className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-2">
                  SKILLS NEEDED
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.length ? (
                    selectedSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs text-neutral-800 ring-1 ring-neutral-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-500">—</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50/80 ring-1 ring-neutral-200/70 p-4">
                <div className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-2">
                  TA TEAM
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTeam.length ? (
                    selectedTeam.map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs text-neutral-800 ring-1 ring-neutral-200"
                      >
                        {n}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-500">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
