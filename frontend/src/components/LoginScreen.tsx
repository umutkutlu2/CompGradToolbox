import { GraduationCap, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { UserRole } from '../App';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-blue-900 mb-2">Comp Grad Toolbox</h1>
          <p className="text-neutral-600">
            TA Assignment & Report Checker for the Computer Engineering Department
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <div className="space-y-4">
            <Button
              onClick={() => onLogin('faculty')}
              className="w-full h-12"
              size="lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Log in with University Account
            </Button>

            {/* Demo role selectors */}
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-neutral-500 text-sm mb-3">Demo: Select a role to preview</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => onLogin('faculty')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Faculty
                </Button>
                <Button
                  onClick={() => onLogin('student')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Student
                </Button>
                <Button
                  onClick={() => onLogin('admin')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Admin
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 leading-relaxed">
              This system processes academic data in accordance with university privacy policies.
              All data is handled securely and used solely for TA assignment and report validation purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          Computer Engineering Department © 2025
        </p>
      </div>
    </div>
  );
}
