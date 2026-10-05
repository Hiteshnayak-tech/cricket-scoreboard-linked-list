import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, User, GitBranch, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/admin/teams', label: 'Teams', icon: Users },
  { to: '/admin/players', label: 'Players', icon: User },
  { to: '/admin/visualizer', label: 'Visualizer', icon: GitBranch },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-primary sticky top-0 z-50 shadow-md border-b border-white/10 w-full">
      <div className="app-container">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shadow-accent/25">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Cricket<span className="text-accent-light">Board</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-inner'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Live Indicator + Admin Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-live/15 border border-live/30">
              <span className="live-dot" />
              <span className="text-xs font-semibold text-live tracking-wide">LIVE</span>
            </div>
            <Link
              to="/admin/teams"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 text-xs font-semibold tracking-wider transition-colors"
            >
              ADMIN
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-1 pt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="flex items-center justify-between px-4 pt-3 border-t border-white/10 mt-2">
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-xs font-semibold text-live">LIVE SCORING</span>
                </div>
                <Link
                  to="/admin/teams"
                  onClick={() => setMobileOpen(false)}
                  className="px-2.5 py-1 rounded bg-white/10 text-white text-xs font-semibold"
                >
                  ADMIN CONSOLE
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
