
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onExpand={() => setCollapsed(false)}
      />

      <div
        className={`
          flex min-h-screen flex-col
          transition-[margin] duration-300
          ${collapsed ? "lg:ml-[84px]" : "lg:ml-[260px]"}
        `}
      >
        <Header
          collapsed={collapsed}
          onToggleSidebar={() =>
            setCollapsed((previous) => !previous)
          }
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
