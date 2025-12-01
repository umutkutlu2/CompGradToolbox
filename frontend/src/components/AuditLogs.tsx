import { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const logs = [
    {
      id: '1',
      timestamp: '2025-11-11 14:32:15',
      user: 'Admin User',
      role: 'admin' as const,
      action: 'Ran TA assignment',
      module: 'TA Assignment',
      details: 'Fall 2025 term, 12 courses processed',
    },
    {
      id: '2',
      timestamp: '2025-11-11 13:45:22',
      user: 'Alex Thompson',
      role: 'student' as const,
      action: 'Uploaded COMP590 report',
      module: 'Report Checker',
      details: 'seminar_report.pdf, 2.4 MB',
    },
    {
      id: '3',
      timestamp: '2025-11-11 12:18:41',
      user: 'Dr. Sarah Chen',
      role: 'faculty' as const,
      action: 'Updated preferences for COMP302',
      module: 'TA Assignment',
      details: 'Changed required TAs from 2 to 3, added skill: Scala',
    },
    {
      id: '4',
      timestamp: '2025-11-11 11:05:33',
      user: 'Admin User',
      role: 'admin' as const,
      action: 'Manual override for COMP421',
      module: 'TA Assignment',
      details: 'Replaced Casey Park with Pat Wilson, reason: Schedule conflict resolution',
    },
    {
      id: '5',
      timestamp: '2025-11-11 10:22:18',
      user: 'Jamie Lee',
      role: 'student' as const,
      action: 'Updated TA profile',
      module: 'TA Assignment',
      details: 'Added skills: Python, TensorFlow; Updated availability',
    },
    {
      id: '6',
      timestamp: '2025-11-10 16:41:52',
      user: 'Morgan Smith',
      role: 'student' as const,
      action: 'Uploaded COMP291 report',
      module: 'Report Checker',
      details: 'internship_report.pdf, 3.1 MB, passed all checks',
    },
    {
      id: '7',
      timestamp: '2025-11-10 15:30:11',
      user: 'Admin User',
      role: 'admin' as const,
      action: 'Updated report checker rules',
      module: 'Admin',
      details: 'Changed COMP590 max pages from 10 to 8',
    },
    {
      id: '8',
      timestamp: '2025-11-10 14:15:44',
      user: 'Dr. Michael Park',
      role: 'faculty' as const,
      action: 'Updated preferences for COMP424',
      module: 'TA Assignment',
      details: 'Added preferred skill: Machine Learning',
    },
    {
      id: '9',
      timestamp: '2025-11-10 13:02:27',
      user: 'Taylor Kim',
      role: 'student' as const,
      action: 'Uploaded COMP590 report',
      module: 'Report Checker',
      details: 'seminar_report_v2.pdf, 1.8 MB, 2 warnings found',
    },
    {
      id: '10',
      timestamp: '2025-11-10 11:47:33',
      user: 'Admin User',
      role: 'admin' as const,
      action: 'Exported assignment results',
      module: 'TA Assignment',
      details: 'Fall 2025 assignments, CSV format',
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Admin</Badge>;
      case 'faculty':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Faculty</Badge>;
      case 'student':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Student</Badge>;
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    const matchesModule =
      moduleFilter === 'all' || log.module.toLowerCase().includes(moduleFilter.toLowerCase());

    return matchesSearch && matchesRole && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="ta">TA Assignment</SelectItem>
                  <SelectItem value="report">Report Checker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>
                {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm text-neutral-600">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm text-neutral-600">User</th>
                  <th className="text-left py-3 px-4 text-sm text-neutral-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm text-neutral-600">Action</th>
                  <th className="text-left py-3 px-4 text-sm text-neutral-600">Module</th>
                  <th className="text-left py-3 px-4 text-sm text-neutral-600">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-600 whitespace-nowrap">
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-900">{log.user}</div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(log.role)}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-900">{log.action}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-600">{log.module}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-600 max-w-md truncate">
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
