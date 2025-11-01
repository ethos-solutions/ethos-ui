import { ReactNode, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Components_old/Header";
import SideNavigation from "../Components_old/SideNavigation";
import { Iconbutton } from "@ethos-frontend/ui";
import {
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined,
} from "@mui/icons-material";
import { EthosLogo, EthosSmallLogo } from "@ethos-frontend/assets";

interface Props {
  children?: ReactNode;
}

export default function Layout({ children }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("adminSidebarCollapsed");
    return stored === "true";
  });

  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem("adminSidebarCollapsed");
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      // ignore
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("adminSidebarCollapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside
        className={`relative bg-white border-r transition-[width] duration-300 ease-in-out shrink-0 ${
          collapsed ? "w-16" : "w-56"
        }`}
        aria-label="Sidebar"
        aria-expanded={!collapsed}
        data-collapsed={collapsed}
      >
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={toggle}
          className="absolute z-20 -right-3 top-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/10"
        >
          <Iconbutton
            MuiIcon={
              collapsed ? ArrowForwardIosOutlined : ArrowBackIosNewOutlined
            }
            size="small"
          />
        </button>
        <Link
          to="/"
          className={`flex items-center justify-center ${collapsed ? "p-2" : "p-4"}`}
        >
          {collapsed ? <EthosSmallLogo /> : <EthosLogo />}
        </Link>

        <SideNavigation collapsed={collapsed} />
      </aside>

      <div className="flex flex-1 min-w-0 flex-col">
        <Header />
        <main className="flex-1 min-w-0 overflow-y-auto p-4 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
