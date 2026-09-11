import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { MobileNavigation } from '../MobileNavigation/MobileNavigation';
import { TopBar } from '../TopBar/TopBar';
import './FindRoomShell.css';

interface FindRoomShellProps {
  children?: ReactNode;
}

export function FindRoomShell({ children }: FindRoomShellProps) {
  return (
    <div className="findroom-shell">
      <Sidebar />
      <div className="findroom-main">
        <TopBar />
        <main className="findroom-content">
          {children ?? <Outlet />}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
