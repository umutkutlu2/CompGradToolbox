import { useState } from 'react';
import { Play, Download, Info, Edit2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function TAAssignmentCoordinator() {
  const [skillWeight, setSkillWeight] = useState([70]);
  const [facultyPrefWeight, setFacultyPrefWeight] = useState([60]);
  const [taPrefWeight, setTaPrefWeight] = useState([50]);
  const [workloadWeight, setWorkloadWeight] = useState([80]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const assignmentsByCourse = [
    {
      code: 'COMP302',
      name: 'Programming Languages',
      tas: ['Alex Thompson', 'Jamie Lee'],
      violations: 'none' as const,
    },
    {
      code: 'COMP310',
      name: 'Operating Systems',
      tas: ['Taylor Kim', 'Jordan Martinez'],
      violations: 'none' as const,
    },
    {
      code: 'COMP421',
      name: 'Database Systems',
      tas: ['Morgan Smith', 'Casey Park', 'Riley Chen'],
      violations: 'soft' as const,
    },
    {
      code: 'COMP424',
      name: 'Artificial Intelligence',
      tas: ['Sam Wilson', 'Drew Anderson'],
      violations: 'none' as const,
    },
  ];

  const assignmentsByTA = [
    {
      name: 'Alex Thompson',
      courses: ['COMP302'],
      load: 10,
      maxLoad: 20,
    },
    {
      name: 'Jamie Lee',
      courses: ['COMP302', 'COMP551'],
      load: 18,
      maxLoad: 20,
    },
    {
      name: 'Taylor Kim',
      courses: ['COMP310'],
      load: 12,
      maxLoad: 20,
    },
    {
      name: 'Jordan Martinez',
      courses: ['COMP310'],
      load: 10,
      maxLoad: 15,
    },
    {
      name: 'Morgan Smith',
      courses: ['COMP421'],
      load: 15,
      maxLoad: 20,
    },
  ];

  const handleViewDetails = (course: any) => {
    setSelectedCourse(course);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Weight Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Weights Configuration</CardTitle>
          <CardDescription>
            Adjust the importance of each factor in the TA assignment algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Skill Match</Label>
                <span className="text-sm text-neutral-600">{skillWeight[0]}%</span>
              </div>
              <Slider
                value={skillWeight}
                onValueChange={setSkillWeight}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Faculty Preference</Label>
                <span className="text-sm text-neutral-600">{facultyPrefWeight[0]}%</span>
              </div>
              <Slider
                value={facultyPrefWeight}
                onValueChange={setFacultyPrefWeight}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>TA Preference</Label>
                <span className="text-sm text-neutral-600">{taPrefWeight[0]}%</span>
              </div>
              <Slider
                value={taPrefWeight}
                onValueChange={setTaPrefWeight}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Fair Workload Distribution</Label>
                <span className="text-sm text-neutral-600">{workloadWeight[0]}%</span>
              </div>
              <Slider
                value={workloadWeight}
                onValueChange={setWorkloadWeight}
                max={100}
                step={5}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="mb-1">All hard constraints must be satisfied regardless of weights.</p>
                <p className="text-blue-700">
                  These weights only affect soft preferences and optimization.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button size="lg" className="gap-2">
              <Play className="w-4 h-4" />
              Run Assignment
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="w-4 h-4" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Results */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Results</CardTitle>
          <CardDescription>Review and manage TA assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="by-course">
            <TabsList className="mb-6">
              <TabsTrigger value="by-course">By Course</TabsTrigger>
              <TabsTrigger value="by-ta">By TA</TabsTrigger>
            </TabsList>

            <TabsContent value="by-course">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Course</th>
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Assigned TAs</th>
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentsByCourse.map((course) => (
                      <tr
                        key={course.code}
                        className="border-b border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="py-4 px-4">
                          <div className="text-sm text-neutral-900">{course.code}</div>
                          <div className="text-xs text-neutral-500">{course.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {course.tas.map((ta, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {ta}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {course.violations === 'none' ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              No violations
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              Soft preference mismatch
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(course)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="by-ta">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">TA Name</th>
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Courses Assigned</th>
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Total Load</th>
                      <th className="text-left py-3 px-4 text-sm text-neutral-600">Workload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentsByTA.map((ta, index) => (
                      <tr
                        key={index}
                        className="border-b border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="py-4 px-4">
                          <div className="text-sm text-neutral-900">{ta.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {ta.courses.map((course, i) => (
                              <Badge key={i} variant="outline">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-neutral-900">
                            {ta.load} hrs / {ta.maxLoad} hrs
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-neutral-200 rounded-full h-2 max-w-[120px]">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(ta.load / ta.maxLoad) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-neutral-600">
                              {Math.round((ta.load / ta.maxLoad) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assignment Details</SheetTitle>
            <SheetDescription>
              {selectedCourse?.code} - {selectedCourse?.name}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Assigned TAs with explanations */}
            <div className="space-y-4">
              <h4 className="text-sm text-neutral-900">Assigned TAs</h4>
              {selectedCourse?.tas.map((ta: string, index: number) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg space-y-2">
                  <div className="text-sm text-neutral-900">{ta}</div>
                  <div className="text-xs text-neutral-600 leading-relaxed">
                    Strong {selectedCourse.code.includes('302') ? 'functional programming' : 'database'} background,
                    no time conflicts, fair workload distribution
                  </div>
                  <div className="flex gap-1 pt-1">
                    <Badge variant="outline" className="text-xs">Skill match: 92%</Badge>
                    <Badge variant="outline" className="text-xs">No conflicts</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Override */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <h4 className="text-sm text-neutral-900">Manual Override</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="replace-ta">Replace TA</Label>
                  <Select>
                    <SelectTrigger id="replace-ta" className="mt-1">
                      <SelectValue placeholder="Select TA to replace" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCourse?.tas.map((ta: string, i: number) => (
                        <SelectItem key={i} value={ta}>
                          {ta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="new-ta">With TA</Label>
                  <Select>
                    <SelectTrigger id="new-ta" className="mt-1">
                      <SelectValue placeholder="Select new TA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pat-wilson">Pat Wilson</SelectItem>
                      <SelectItem value="chris-brown">Chris Brown</SelectItem>
                      <SelectItem value="sam-davis">Sam Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="override-reason">Reason for Override</Label>
                  <Textarea
                    id="override-reason"
                    placeholder="Explain why this manual override is necessary..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button className="w-full">Save Override</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
