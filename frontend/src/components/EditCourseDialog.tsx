import { useEffect, useMemo, useState } from "react";
import { X, Plus, Sparkles, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { apiUrl } from "../lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

type EditPayload = { num_tas_requested: number; skills: string[] };

interface Props {
  open: boolean;
  onClose: () => void;
  course: {
    course_id: number;
    course_code: string;
    num_tas_requested: number;
    skills: string[];
  } | null;
  username: string;

  existingSkills?: string[];

  onSaved: (updated: EditPayload) => void;
}

export default function EditCourseDialog({
  open,
  onClose,
  course,
  username,
  existingSkills = [],
  onSaved,
}: Props) {
  const [numTAs, setNumTAs] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);

  // new UI states
  const [skillSelect, setSkillSelect] = useState<string>("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (course) {
      setNumTAs(Number(course.num_tas_requested ?? 0));
      setSkills(course.skills ?? []);
    } else {
      setNumTAs(0);
      setSkills([]);
    }
    setSkillSelect("");
    setSkillInput("");
  }, [course, open]);

  const selectableSkills = useMemo(() => {
    const current = new Set(skills.map((s) => s.trim()));
    return existingSkills
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !current.has(s))
      .sort();
  }, [existingSkills, skills]);

  const addSkill = (raw: string) => {
    const s = raw.trim();
    if (!s) return;
    setSkills((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const removeSkill = (s: string) => {
    setSkills((prev) => prev.filter((x) => x !== s));
  };

  const save = async () => {
    if (!course) return;

    const res = await fetch(
      apiUrl(`/courses/update?user=${encodeURIComponent(username)}`),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.course_id,
          num_tas_requested: numTAs,
          skills,
        }),
      }
    );

    if (!res.ok) {
      // keep it simple; you can swap to toast if you want
      const msg = await res.text();
      alert(msg || "Failed to update course");
      return;
    }

    onSaved({ num_tas_requested: numTAs, skills });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="w-[120vw] max-w-2xl max-h-[90vh] overflow-y-auto border-neutral-200 shadow-2xl">
        {/* Modern gradient header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-t-lg z-0" />
        
        <DialogHeader className="relative pb-6">
          <div className="flex items-center">
            <div>
              <DialogTitle className="text-2xl">
                {course?.course_code}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Configure your TA requirements and skill preferences
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Number of TAs - Modern card style */}
          <div className="group">
            <Label className="text-sm flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Number of TAs Needed</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                value={numTAs}
                onChange={(e) => setNumTAs(Number(e.target.value))}
                className="text-lg h-12 pr-12 border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Skills Section - Enhanced */}
          <div className="space-y-3">
            <Label className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Required Skills</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {skills.length} selected
              </Badge>
            </Label>

            {/* Selected skills - Modern pill design */}
            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4 min-h-[100px] transition-all hover:border-neutral-300">
              {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-neutral-400" />
                  </div>
                  <span className="text-sm text-neutral-500">
                    No skills added yet
                  </span>
                  <span className="text-xs text-neutral-400 mt-1">
                    Add skills using the options below
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group/badge animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span>{s}</span>
                      <button
                        onClick={() => removeSkill(s)}
                        className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Add skills interface - Tabbed design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="text-xs uppercase tracking-wide text-emerald-700 mb-2">
                From Existing
            </div>

            {selectableSkills.length === 0 ? (
            <div className="text-sm text-neutral-500 bg-white/60 rounded-lg p-3">
                No other skills available
            </div>
            ) : (
            <div
                className="
                max-h-36 overflow-y-auto overflow-x-hidden
                rounded-lg bg-white/60 p-2
                "
            >
                <div className="flex flex-wrap gap-2">
                {selectableSkills.map((s) => (
                    <Badge
                    key={s}
                    variant="outline"
                    role="button"
                    tabIndex={0}
                    onClick={() => addSkill(s)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        addSkill(s);
                        }
                    }}
                    className="
                        cursor-pointer select-none
                        px-3 py-1.5
                        bg-gradient-to-r from-blue-50 to-indigo-50
                        border-blue-200 text-blue-700
                        hover:from-blue-100 hover:to-indigo-100
                        transition-all duration-200
                        break-words
                    "
                    title="Click to add"
                    >
                    {s}
                    <span className="ml-2 text-xs text-blue-500 opacity-70">+</span>
                    </Badge>
                ))}
                </div>
            </div>
            )}
            </div>


              {/* New skill card */}
              <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                <div className="text-xs uppercase tracking-wide text-violet-700 mb-2">
                  Create New
                </div>
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g., Python, React"
                  className="bg-white border-violet-200 focus:ring-violet-100"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                      setSkillInput("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="w-full bg-white hover:bg-violet-50 border-violet-200 text-violet-700"
                  onClick={() => {
                    addSkill(skillInput);
                    setSkillInput("");
                  }}
                  disabled={!skillInput.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Modern floating style */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-neutral-100">
          <Button 
            variant="outline" 
            className="flex-1 h-11 hover:bg-neutral-50" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 h-11 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40" 
            onClick={save}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Save Changes
          </Button>


        </div>
      </DialogContent>
    </Dialog>
  );
}
