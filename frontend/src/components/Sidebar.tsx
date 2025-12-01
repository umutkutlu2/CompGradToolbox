import { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationItem } from '../App';
import { cn } from '../lib/utils';

interface SidebarProps {
  navigationItems: NavigationItem[];
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ navigationItems, currentPage, onNavigate }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['report-checkers', 'admin']);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-neutral-900 truncate">Comp Grad Toolbox</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.id);
            const hasChildren = item.children && item.children.length > 0;
            const isActive = !hasChildren && currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(item.id);
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {hasChildren && (
                    <span className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </button>

                {hasChildren && isExpanded && (
                  <ul className="mt-1 ml-8 space-y-1">
                    {item.children?.map((child) => {
                      const isChildActive = currentPage === child.id;
                      return (
                        <li key={child.id}>
                          <button
                            onClick={() => onNavigate(child.id)}
                            className={cn(
                              'w-full px-3 py-2 rounded-lg transition-colors text-left text-sm',
                              isChildActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-neutral-600 hover:bg-neutral-50'
                            )}
                          >
                            {child.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}