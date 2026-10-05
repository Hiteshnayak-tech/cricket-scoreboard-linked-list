import { Link } from 'react-router-dom';
import { Trophy, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-dark text-text-inverse border-t border-white/10 mt-auto">
      <div className="app-container">
        {/* Main Footer */}
        <div className="py-16 sm:py-20 grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 group mb-5">
              <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-accent/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                Cricket<span className="text-accent-light">Board</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-sm mb-5">
              Cricket Tournament Scoreboard and Management System. Live ball-by-ball updates,
              tournament standings, upcoming fixtures, and team performance tracking.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-live/15 border border-live/30 text-live text-xs font-semibold">
                <span className="live-dot" />
                Live Scoring Active
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/85 text-xs font-medium">
                Season 2026
              </span>
            </div>
          </div>

          {/* Tournament Links */}
          <div>
            <h3 className="font-display font-bold text-white mb-5 text-xs uppercase tracking-wider">
              Tournament
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Live Scoreboard' },
                { to: '/#upcoming-matches', label: 'Upcoming Fixtures' },
                { to: '/#recent-results', label: 'Recent Results' },
                { to: '/#points-table', label: 'Points Table' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.to}
                    className="text-sm text-text-muted hover:text-accent-light transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Management & Visualizer */}
          <div>
            <h3 className="font-display font-bold text-white mb-5 text-xs uppercase tracking-wider">
              Management
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/admin/teams', label: 'Teams' },
                { to: '/admin/players', label: 'Players' },
                { to: '/admin/visualizer', label: 'Visualizer' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted hover:text-accent-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted flex items-center gap-1.5">
            Cricket Tournament Scoreboard and Management System • Made with{' '}
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for College Cricket
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>© {new Date().getFullYear()} CricketBoard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
