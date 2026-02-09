import { Link, Outlet, useLocation } from "react-router";
import { ClipboardList, FileText, Menu } from "lucide-react";
import { useState } from "react";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#13294B] border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <ClipboardList className="size-6 sm:size-8 text-[#E84A27]" />
              <h1 className="text-base sm:text-xl font-semibold text-white">
                <span className="hidden sm:inline">HereIllinois Attendance</span>
                <span className="sm:hidden">HereIllinois</span>
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-[#E84A27] text-white"
                    : "text-gray-200 hover:bg-[#1F3A5F] hover:text-white"
                }`}
              >
                Attendance
              </Link>
              <Link
                to="/logs"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/logs")
                    ? "bg-[#E84A27] text-white"
                    : "text-gray-200 hover:bg-[#1F3A5F] hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="size-4" />
                  <span>Audit Logs</span>
                </div>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-white hover:bg-[#1F3A5F]"
            >
              <Menu className="size-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="sm:hidden pb-4 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-[#E84A27] text-white"
                    : "text-gray-200 hover:bg-[#1F3A5F]"
                }`}
              >
                Attendance
              </Link>
              <Link
                to="/logs"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/logs")
                    ? "bg-[#E84A27] text-white"
                    : "text-gray-200 hover:bg-[#1F3A5F]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="size-4" />
                  <span>Audit Logs</span>
                </div>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}