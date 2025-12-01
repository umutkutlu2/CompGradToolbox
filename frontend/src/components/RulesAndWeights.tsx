import { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function RulesAndWeights() {
  const [skillWeight, setSkillWeight] = useState([70]);
  const [facultyPrefWeight, setFacultyPrefWeight] = useState([60]);
  const [taPrefWeight, setTaPrefWeight] = useState([50]);
  const [workloadWeight, setWorkloadWeight] = useState([80]);

  const [comp590Rules, setComp590Rules] = useState({
    abstractRequired: true,
    maxPages: 8,
    referencesRequired: true,
    citationFormat: true,
    figuresNeedCaptions: true,
  });

  const [comp291Rules, setComp291Rules] = useState({
    minWeeks: 12,
    weeklyLogsRequired: true,
    supervisorSignature: true,
    studentSignature: true,
    companyInfoRequired: true,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="ta-assignment">
        <TabsList>
          <TabsTrigger value="ta-assignment">TA Assignment Weights</TabsTrigger>
          <TabsTrigger value="report-rules">Report Checker Rules</TabsTrigger>
        </TabsList>

        {/* TA Assignment Weights */}
        <TabsContent value="ta-assignment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Algorithm Weights</CardTitle>
              <CardDescription>
                Configure the importance of each factor in the TA assignment process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Skill Match Weight</Label>
                  <span className="text-sm text-neutral-600">{skillWeight[0]}%</span>
                </div>
                <Slider
                  value={skillWeight}
                  onValueChange={setSkillWeight}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-neutral-500">
                  How much to prioritize matching TA skills with course requirements
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Faculty Preference Weight</Label>
                  <span className="text-sm text-neutral-600">{facultyPrefWeight[0]}%</span>
                </div>
                <Slider
                  value={facultyPrefWeight}
                  onValueChange={setFacultyPrefWeight}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-neutral-500">
                  How much to prioritize instructor preferences for specific TAs
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>TA Preference Weight</Label>
                  <span className="text-sm text-neutral-600">{taPrefWeight[0]}%</span>
                </div>
                <Slider
                  value={taPrefWeight}
                  onValueChange={setTaPrefWeight}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-neutral-500">
                  How much to prioritize TA course preferences and interests
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Fair Workload Distribution Weight</Label>
                  <span className="text-sm text-neutral-600">{workloadWeight[0]}%</span>
                </div>
                <Slider
                  value={workloadWeight}
                  onValueChange={setWorkloadWeight}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-neutral-500">
                  How much to prioritize balanced workload across all TAs
                </p>
              </div>

              <div className="pt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p>
                      These weights are used only for soft preferences. All hard constraints
                      (time conflicts, grade requirements, etc.) are always enforced regardless
                      of weight settings.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Effect</CardTitle>
              <CardDescription>
                Estimated impact of current weight configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="text-neutral-600 mb-1">Most Emphasized Factor</div>
                  <div className="text-neutral-900">Fair Workload Distribution</div>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="text-neutral-600 mb-1">Least Emphasized Factor</div>
                  <div className="text-neutral-900">TA Preference</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Checker Rules */}
        <TabsContent value="report-rules" className="space-y-6">
          {/* COMP590 Rules */}
          <Card>
            <CardHeader>
              <CardTitle>COMP590 Seminar Report Rules</CardTitle>
              <CardDescription>
                Configure format validation rules for seminar reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="abstract-req">Abstract Required</Label>
                  <p className="text-xs text-neutral-500">
                    Report must contain an abstract section
                  </p>
                </div>
                <Switch
                  id="abstract-req"
                  checked={comp590Rules.abstractRequired}
                  onCheckedChange={(checked) =>
                    setComp590Rules({ ...comp590Rules, abstractRequired: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-pages">Maximum Page Limit</Label>
                <Input
                  id="max-pages"
                  type="number"
                  value={comp590Rules.maxPages}
                  onChange={(e) =>
                    setComp590Rules({ ...comp590Rules, maxPages: parseInt(e.target.value) })
                  }
                  className="max-w-[120px]"
                />
                <p className="text-xs text-neutral-500">
                  Maximum number of pages allowed (excluding references)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="refs-req">References Section Required</Label>
                  <p className="text-xs text-neutral-500">
                    Report must contain a references section
                  </p>
                </div>
                <Switch
                  id="refs-req"
                  checked={comp590Rules.referencesRequired}
                  onCheckedChange={(checked) =>
                    setComp590Rules({ ...comp590Rules, referencesRequired: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="citation-fmt">Validate Citation Format</Label>
                  <p className="text-xs text-neutral-500">
                    Check for proper citation formatting (IEEE style)
                  </p>
                </div>
                <Switch
                  id="citation-fmt"
                  checked={comp590Rules.citationFormat}
                  onCheckedChange={(checked) =>
                    setComp590Rules({ ...comp590Rules, citationFormat: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="fig-captions">Figures Need Captions</Label>
                  <p className="text-xs text-neutral-500">
                    All figures and tables must have descriptive captions
                  </p>
                </div>
                <Switch
                  id="fig-captions"
                  checked={comp590Rules.figuresNeedCaptions}
                  onCheckedChange={(checked) =>
                    setComp590Rules({ ...comp590Rules, figuresNeedCaptions: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* COMP291/391 Rules */}
          <Card>
            <CardHeader>
              <CardTitle>COMP291/391 Internship Report Rules</CardTitle>
              <CardDescription>
                Configure validation rules for internship reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="min-weeks">Minimum Required Weeks</Label>
                <Input
                  id="min-weeks"
                  type="number"
                  value={comp291Rules.minWeeks}
                  onChange={(e) =>
                    setComp291Rules({ ...comp291Rules, minWeeks: parseInt(e.target.value) })
                  }
                  className="max-w-[120px]"
                />
                <p className="text-xs text-neutral-500">
                  Minimum number of internship weeks required
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="weekly-logs">Weekly Logs Required</Label>
                  <p className="text-xs text-neutral-500">
                    Report must contain logs for all internship weeks
                  </p>
                </div>
                <Switch
                  id="weekly-logs"
                  checked={comp291Rules.weeklyLogsRequired}
                  onCheckedChange={(checked) =>
                    setComp291Rules({ ...comp291Rules, weeklyLogsRequired: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="supervisor-sig">Supervisor Signature Required</Label>
                  <p className="text-xs text-neutral-500">
                    Validate presence of supervisor signature
                  </p>
                </div>
                <Switch
                  id="supervisor-sig"
                  checked={comp291Rules.supervisorSignature}
                  onCheckedChange={(checked) =>
                    setComp291Rules({ ...comp291Rules, supervisorSignature: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="student-sig">Student Signature Required</Label>
                  <p className="text-xs text-neutral-500">
                    Validate presence of student signature
                  </p>
                </div>
                <Switch
                  id="student-sig"
                  checked={comp291Rules.studentSignature}
                  onCheckedChange={(checked) =>
                    setComp291Rules({ ...comp291Rules, studentSignature: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="company-info">Company Information Required</Label>
                  <p className="text-xs text-neutral-500">
                    Report must include complete company details
                  </p>
                </div>
                <Switch
                  id="company-info"
                  checked={comp291Rules.companyInfoRequired}
                  onCheckedChange={(checked) =>
                    setComp291Rules({ ...comp291Rules, companyInfoRequired: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
