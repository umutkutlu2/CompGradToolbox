import { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

export default function TAProfileStudent() {
  const [skills, setSkills] = useState(['Python', 'Java', 'Machine Learning', 'Databases']);
  const [workload, setWorkload] = useState([50]);

  const courses = [
    { code: 'COMP302', name: 'Programming Languages', interest: 'high' as const },
    { code: 'COMP310', name: 'Operating Systems', interest: 'medium' as const },
    { code: 'COMP421', name: 'Database Systems', interest: 'high' as const },
    { code: 'COMP424', name: 'Artificial Intelligence', interest: 'low' as const },
    { code: 'COMP551', name: 'Applied Machine Learning', interest: 'high' as const },
  ];

  const [courseInterests, setCourseInterests] = useState(
    courses.reduce((acc, course) => ({ ...acc, [course.code]: course.interest }), {})
  );

  const handleInterestChange = (courseCode: string, interest: 'high' | 'medium' | 'low') => {
    setCourseInterests((prev) => ({ ...prev, [courseCode]: interest }));
  };

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case 'high':
        return 'bg-green-600 hover:bg-green-700';
      case 'medium':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'low':
        return 'bg-neutral-400 hover:bg-neutral-500';
      default:
        return 'bg-neutral-400 hover:bg-neutral-500';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic profile details (read-only)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-neutral-500">Full Name</Label>
              <div className="text-sm text-neutral-900 mt-1">Alex Thompson</div>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Student ID</Label>
              <div className="text-sm text-neutral-900 mt-1">260123456</div>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Email</Label>
              <div className="text-sm text-neutral-900 mt-1">alex.thompson@mail.mcgill.ca</div>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Program</Label>
              <div className="text-sm text-neutral-900 mt-1">M.Sc. Computer Engineering</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Expertise */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
          <CardDescription>
            Add relevant courses, programming languages, and technical skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 p-4 border border-neutral-200 rounded-lg min-h-[100px]">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="gap-1 bg-blue-50 text-blue-700 border-blue-200"
              >
                {skill}
                <button onClick={() => setSkills(skills.filter((_, i) => i !== index))}>
                  <X className="w-3 h-3 cursor-pointer hover:text-blue-900" />
                </button>
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Skill
          </Button>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Set your weekly availability for TA duties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Time slots grid - simplified */}
            <div className="border border-neutral-200 rounded-lg p-4">
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div className="text-neutral-500"></div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <div key={day} className="text-center text-neutral-600">
                    {day}
                  </div>
                ))}
                {['9-12', '12-15', '15-18'].map((time) => (
                  <>
                    <div key={time} className="text-neutral-500 py-2">
                      {time}
                    </div>
                    {[1, 2, 3, 4, 5].map((day) => (
                      <button
                        key={`${time}-${day}`}
                        className="h-10 rounded border border-neutral-200 hover:bg-green-100 bg-white transition-colors"
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Click cells to mark your available time slots
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Workload Preference */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Preference</CardTitle>
          <CardDescription>
            How many hours per week are you willing to commit?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Low (5 hrs/week)</span>
              <span className="text-neutral-900">{Math.round((workload[0] / 100) * 15 + 5)} hrs/week</span>
              <span className="text-neutral-600">High (20 hrs/week)</span>
            </div>
            <Slider
              value={workload}
              onValueChange={setWorkload}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Course Preferences</CardTitle>
          <CardDescription>
            Indicate your interest level for being a TA for each course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses.map((course) => {
              const interest = courseInterests[course.code] || 'low';
              return (
                <div
                  key={course.code}
                  className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm text-neutral-900">{course.code}</div>
                    <div className="text-xs text-neutral-500">{course.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={interest === 'high' ? 'default' : 'outline'}
                      className={interest === 'high' ? getInterestColor('high') : ''}
                      onClick={() => handleInterestChange(course.code, 'high')}
                    >
                      High
                    </Button>
                    <Button
                      size="sm"
                      variant={interest === 'medium' ? 'default' : 'outline'}
                      className={interest === 'medium' ? getInterestColor('medium') : ''}
                      onClick={() => handleInterestChange(course.code, 'medium')}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      variant={interest === 'low' ? 'default' : 'outline'}
                      className={interest === 'low' ? getInterestColor('low') : ''}
                      onClick={() => handleInterestChange(course.code, 'low')}
                    >
                      Low
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          Save Profile
        </Button>
      </div>
    </div>
  );
}
