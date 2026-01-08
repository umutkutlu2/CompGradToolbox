import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { apiUrl } from '../lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type ActivityLog = {
  id: string;
  timestamp: string;
  user: string;
  role: "admin" | "faculty" | "student";
  action: string;
  module: string;
  details: string;
  type: "success" | "warning" | "info";
  minutes_ago: number;
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/logs'));
      if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.statusText}`);
      }
      const data = await res.json();
      // Transform backend data to match expected format
      const transformedLogs: ActivityLog[] = (data || []).map((log: any, index: number) => {
        const timestamp = log.minutes_ago 
          ? new Date(Date.now() - log.minutes_ago * 60000).toLocaleString()
          : new Date().toLocaleString();
        
        return {
          id: `log-${index}-${log.action}-${log.user}`,
          timestamp,
          user: log.user || 'Unknown',
          role: 'admin' as const, // Backend doesn't provide role, defaulting
          action: log.action || 'Unknown action',
          module: 'System', // Backend doesn't provide module, defaulting
          details: log.type || 'info',
          type: (log.type as "success" | "warning" | "info") || "info",
          minutes_ago: log.minutes_ago || 0,
        };
      });
      setLogs(transformedLogs);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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

  // Use fetched logs if available, otherwise fall back to empty array
  const logsToFilter = logs.length > 0 ? logs : [];

  const filteredLogs = logsToFilter.filter((log) => {
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
            <Button variant="outline" className="gap-2" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                {loading ? 'Loading...' : `${filteredLogs.length} ${filteredLogs.length === 1 ? 'entry' : 'entries'}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          {loading && logs.length === 0 ? (
            <div className="text-sm text-neutral-500 py-8 text-center">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-sm text-neutral-500 py-8 text-center">No logs found.</div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
