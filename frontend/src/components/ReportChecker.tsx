import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, XCircle, Download, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ReportCheckerProps {
  type: 'comp590' | 'comp291-391';
}

export default function ReportChecker({ type }: ReportCheckerProps) {
  const [uploadedFile, setUploadedFile] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<string[]>([]);

  const toggleIssue = (id: string) => {
    setExpandedIssues((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const comp590Checks = [
    { id: '1', name: 'Abstract present', status: 'pass' as const, page: null },
    { id: '2', name: 'Section order correct', status: 'pass' as const, page: null },
    { id: '3', name: 'Page limit respected (≤8 pages)', status: 'fail' as const, page: null, detail: 'Report has 10 pages. Maximum allowed is 8 pages.' },
    { id: '4', name: 'References section present', status: 'pass' as const, page: 7 },
    { id: '5', name: 'Proper citation format', status: 'warning' as const, page: 5, detail: 'Some citations may not follow IEEE format. Please verify references on page 5.' },
    { id: '6', name: 'Figures have captions', status: 'pass' as const, page: null },
    { id: '7', name: 'Page margins correct', status: 'pass' as const, page: null },
  ];

  const comp291Checks = [
    { id: '1', name: 'Company information complete', status: 'pass' as const, category: 'Company Information' },
    { id: '2', name: 'Internship duration stated', status: 'pass' as const, category: 'Duration' },
    { id: '3', name: 'Required weeks completed (≥12)', status: 'pass' as const, category: 'Duration', detail: '14 weeks detected' },
    { id: '4', name: 'Weekly logs present for all weeks', status: 'fail' as const, category: 'Weekly Logs', detail: 'Missing logs for weeks 8 and 12' },
    { id: '5', name: 'Supervisor signature present', status: 'warning' as const, category: 'Signatures', detail: 'Signature appears to be missing or unclear on page 16' },
    { id: '6', name: 'Student signature present', status: 'pass' as const, category: 'Signatures' },
    { id: '7', name: 'Formatting and structure', status: 'pass' as const, category: 'Formatting' },
  ];

  const checks = type === 'comp590' ? comp590Checks : comp291Checks;
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getOverallStatus = () => {
    if (failCount > 0) return 'fail';
    if (warningCount > 0) return 'warning';
    return 'pass';
  };

  const handleFileUpload = () => {
    setUploadedFile(true);
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'comp590' ? 'COMP590 Seminar Report' : 'COMP291/391 Internship Report'}
          </CardTitle>
          <CardDescription>
            Upload your report for automated format validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-900 mb-1">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-neutral-500">Maximum file size: 10MB</p>
                  </div>
                  <Button onClick={handleFileUpload}>Upload PDF</Button>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="mb-1">
                    This checker validates format and structure only. It does NOT grade content.
                  </p>
                  <p className="text-amber-700">
                    Passing all checks does not guarantee passing the course.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-neutral-900">
                    {type === 'comp590' ? 'seminar_report.pdf' : 'internship_report.pdf'}
                  </div>
                  <div className="text-xs text-neutral-500">2.4 MB • Uploaded just now</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setUploadedFile(false)}>
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFile && (
        <>
          {/* Status Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-green-600">{passCount}</div>
                    <div className="text-sm text-neutral-600">Passed</div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-amber-600">{warningCount}</div>
                    <div className="text-sm text-neutral-600">Warnings</div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-red-600">{failCount}</div>
                    <div className="text-sm text-neutral-600">Failed</div>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Checks Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Report Status</CardTitle>
                      <CardDescription>
                        {failCount > 0
                          ? `${failCount} issue${failCount > 1 ? 's' : ''} found`
                          : warningCount > 0
                          ? `${warningCount} warning${warningCount > 1 ? 's' : ''} found`
                          : 'All checks passed'}
                      </CardDescription>
                    </div>
                    {getOverallStatus() === 'pass' ? (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                    ) : getOverallStatus() === 'warning' ? (
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-amber-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-7 h-7 text-red-600" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checks.map((check) => (
                      <div
                        key={check.id}
                        className="border border-neutral-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => check.detail && toggleIssue(check.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getStatusIcon(check.status)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-neutral-900">{check.name}</div>
                              {'page' in check && check.page && (
                                <div className="text-xs text-neutral-500">Page {check.page}</div>
                              )}
                            </div>
                          </div>
                          {check.detail && (
                            <span>
                              {expandedIssues.includes(check.id) ? (
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              )}
                            </span>
                          )}
                        </button>
                        {check.detail && expandedIssues.includes(check.id) && (
                          <div className="px-4 pb-4 pt-2 bg-neutral-50 border-t border-neutral-200">
                            <p className="text-sm text-neutral-700 leading-relaxed">
                              {check.detail}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Feedback */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Download Feedback PDF
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Export Summary (JSON)
                  </Button>

                  {type === 'comp291-391' && (
                    <div className="pt-4 border-t border-neutral-200">
                      <h4 className="text-sm text-neutral-900 mb-2">Internship Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Weeks detected:</span>
                          <span className="text-neutral-900">14</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Weeks required:</span>
                          <span className="text-neutral-900">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Status:</span>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Meets requirement
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
