import { ChevronDown, LogOut } from 'lucide-react';
import { UserRole } from '../App';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TopBarProps {
  pageTitle: string;
  name: string;
  userRole: UserRole;
  onLogout: () => void;
}

export default function TopBar({ pageTitle, name, userRole, onLogout }: TopBarProps) {
  const getRoleLabel = () => {
    switch (userRole) {
      case 'faculty':
        return 'Faculty';
      case 'student':
        return 'TA / Student';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-neutral-900">{pageTitle}</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pilot
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">
                {name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm text-neutral-900">{name}</div>
              <div className="text-xs text-neutral-500">{getRoleLabel()}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm">{name}</div>
              <div className="text-xs text-neutral-500">{getRoleLabel()}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
