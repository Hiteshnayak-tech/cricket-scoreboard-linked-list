import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Activity,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Clock,
  MapPin,
  Flame,
  ShieldCheck,
  Radio,
  FileText,
  User,
} from 'lucide-react';
import { useLinkedList } from '../../context/LinkedListContext';

export default function HomePage() {
  const { teamList, matchHistory, matchQueue } = useLinkedList();

  const teams = teamList.getAllTeams();
  const sortedTeams = teamList.getTeamsByPoints();
  const matches = matchHistory.getAllMatches();
  const upcomingMatches = matchQueue.toArray();
  const liveMatches = matches.filter((m) => m.status === 'live');
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const activeLiveMatch = liveMatches[0] || null;

  return (
    <div className="page-enter w-full flex flex-col gap-16 pb-24">

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section className="w-full relative bg-primary text-white overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-light rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-primary-lighter rounded-full blur-3xl" />
        </div>
        <div className="app-container relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-accent-light text-xs font-semibold tracking-wider uppercase mb-6">
              <Trophy className="w-3.5 h-3.5" />
              CRICKET TOURNAMENT 2026
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Cricket Tournament<br />Scoreboard
            </h1>
            <p className="mt-6 text-base sm:text-xl text-white/80 leading-relaxed max-w-2xl">
              Follow live scores, upcoming matches, tournament standings and player performance in real time.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#live-match"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-accent text-white font-semibold text-sm sm:text-base hover:bg-accent-dark transition-all duration-200 shadow-lg shadow-accent/30"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                View Live Matches
              </a>
              <a
                href="#tournament-spotlight"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 text-white font-semibold text-sm sm:text-base border border-white/15 hover:bg-white/20 transition-all duration-200"
              >
                <Trophy className="w-4 h-4" />
                View Tournament
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS ─────────────────────────────────────────── */}
      <section className="app-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[
            { label: 'Teams Competing', value: teams.length > 0 ? teams.length : 12, icon: Users, color: 'text-primary-lighter', bg: 'bg-primary-50' },
            { label: 'Total Matches', value: matches.length + upcomingMatches.length > 0 ? matches.length + upcomingMatches.length : 28, icon: Activity, color: 'text-accent', bg: 'bg-emerald-50' },
            { label: 'Live Matches Now', value: liveMatches.length > 0 ? liveMatches.length : 1, icon: Zap, color: 'text-live', bg: 'bg-red-50' },
            { label: 'Upcoming Fixtures', value: upcomingMatches.length > 0 ? upcomingMatches.length : 6, icon: Target, color: 'text-warm', bg: 'bg-amber-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-surface-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border-light flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-mono font-bold text-3xl text-text-primary leading-none">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-text-secondary font-medium mt-1.5 leading-tight">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. LIVE MATCH ────────────────────────────────────── */}
      <section id="live-match" className="app-container">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <span className="live-dot-lg" />
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">Live Match</h2>
          </div>
          <span className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full bg-red-50 text-live border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live animate-ping" />
            MATCH IN PROGRESS
          </span>
        </div>

        {activeLiveMatch ? (
          <div className="bg-surface-card rounded-3xl border border-red-200/90 shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-8 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-live text-white text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE NOW
                </span>
                <span className="text-sm sm:text-base text-white/90 font-medium">
                  Inter-College Championship • 2nd Innings
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/85">
                <MapPin className="w-4 h-4 text-accent-light shrink-0" />
                <span>{activeLiveMatch.venue || 'Wankhede Stadium, Mumbai'}</span>
              </div>
            </div>

            {/* Scores */}
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center pb-8 sm:pb-10">
                {/* Batting */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-accent uppercase tracking-wider border border-emerald-100">BATTING</span>
                    <span className="text-sm text-text-muted font-medium">Target: 181</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-text-primary tracking-tight">
                    {activeLiveMatch.team1?.name || 'Mumbai College'}
                  </h3>
                  <div className="flex flex-wrap items-baseline gap-3 my-3 sm:my-4">
                    <span className="font-mono font-extrabold text-4xl sm:text-5xl text-text-primary tracking-tight">
                      156 <span className="text-2xl text-text-secondary font-normal">/ 4</span>
                    </span>
                    <span className="font-mono text-base sm:text-lg font-semibold text-text-secondary">(17.2 Ov)</span>
                  </div>
                  <span className="inline-block px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs sm:text-sm text-accent-dark font-semibold">
                    Need 25 runs in 16 balls • CRR: 9.00 • RRR: 9.38
                  </span>
                </div>

                {/* VS */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 border-y lg:border-y-0 lg:border-x border-border-light">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-border-light shadow-sm">
                    <span className="font-display font-extrabold text-base text-text-secondary">VS</span>
                  </div>
                  <span className="text-xs text-text-muted font-medium mt-2">2nd Innings</span>
                </div>

                {/* Bowling */}
                <div className="lg:col-span-5 lg:flex lg:flex-col lg:items-end">
                  <div className="mb-3">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface text-text-secondary uppercase tracking-wider border border-border-light">
                      1ST INNINGS
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-text-primary lg:text-right">
                    {activeLiveMatch.team2?.name || 'Pune College'}
                  </h3>
                  <div className="flex flex-wrap items-baseline gap-3 my-3 sm:my-4 lg:justify-end">
                    <span className="font-mono font-bold text-2xl sm:text-3xl text-text-secondary">180 / 6</span>
                    <span className="font-mono text-sm text-text-muted">(20.0 Ov)</span>
                  </div>
                  <p className="text-sm text-text-muted font-medium lg:text-right">Target Set: 181 Runs</p>
                </div>
              </div>

              {/* Batsmen & Bowler */}
              <div className="border-t border-border-light pt-7 sm:pt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border-light">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 pb-3 border-b border-border-light flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                      Current Batsmen
                    </span>
                    <span className="text-[11px] text-text-muted font-normal normal-case tracking-normal">R (B) • 4s • 6s • SR</span>
                  </h4>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-text-primary text-sm flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        Rahul Sharma *
                      </span>
                      <span className="font-mono text-xs text-text-primary whitespace-nowrap">
                        <strong className="text-sm font-extrabold">58</strong> (34) • 6 • 2 • <span className="text-accent font-bold">170.5</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-text-secondary">
                      <span className="font-medium text-sm flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-border" />
                        Aarav Patel
                      </span>
                      <span className="font-mono text-xs whitespace-nowrap">
                        <strong className="text-sm font-semibold text-text-primary">24</strong> (16) • 2 • 1 • 150.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border-light flex flex-col">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 pb-3 border-b border-border-light flex items-center justify-between">
                      <span>Current Bowler</span>
                      <span className="text-[11px] text-text-muted font-normal normal-case tracking-normal">O • M • R • W • Econ</span>
                    </h4>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-text-primary text-sm shrink-0">Vikram Singh</span>
                      <span className="font-mono text-xs text-text-primary whitespace-nowrap">
                        3.2 • 0 • 28 • <strong className="text-live font-bold text-sm">2</strong> • 8.40
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto pt-5 border-t border-border-light mt-5 flex items-center gap-3">
                    <span className="text-xs font-semibold text-text-secondary shrink-0">Recent:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { label: '1', cls: 'ball-single' },
                        { label: '4', cls: 'ball-four' },
                        { label: '•', cls: 'ball-dot' },
                        { label: '6', cls: 'ball-six' },
                        { label: 'W', cls: 'ball-wicket' },
                        { label: '2', cls: 'ball-two' },
                      ].map((b, i) => (
                        <span key={i} className={`${b.cls} w-8 h-8 rounded-full text-xs font-mono font-bold flex items-center justify-center`}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-7 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span className="live-dot" />
                  <span className="font-medium">Live Scoring Console • 2nd Innings in progress</span>
                </div>
                <Link
                  to={`/admin/scoring/${activeLiveMatch.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-accent text-white font-bold text-sm sm:text-base hover:bg-accent-dark transition-all duration-200 shadow-lg shadow-accent/25 min-h-[52px]"
                >
                  View Live Scorecard & Console
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-card rounded-3xl p-12 border border-border-light text-center shadow-sm">
            <Radio className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-text-primary">No Live Match In Progress</h3>
            <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto">Check the upcoming fixtures below for today's match schedule.</p>
            <a
              href="#upcoming-matches"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark mt-6 px-5 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors min-h-[44px]"
            >
              View Upcoming Fixtures
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </section>

      {/* ── 4. UPCOMING MATCHES ──────────────────────────────── */}
      <section id="upcoming-matches" className="app-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-accent" />
              Upcoming Matches
            </h2>
            <p className="text-sm text-text-muted mt-1">Tournament match fixtures & schedule</p>
          </div>
          <Link to="/admin/teams" className="text-sm font-semibold text-accent hover:text-white hover:bg-accent px-4 py-2.5 rounded-xl bg-accent/10 transition-all flex items-center gap-1.5 min-h-[40px]">
            Manage Schedule
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(upcomingMatches.length > 0 ? upcomingMatches : [
            { id: 'up-1', team1: { name: 'Delhi College' }, team2: { name: 'Bangalore College' }, venue: 'Wankhede Stadium, Mumbai', match_date: 'Tomorrow, 10:00 AM' },
            { id: 'up-2', team1: { name: 'Chennai College' }, team2: { name: 'Hyderabad College' }, venue: 'DY Patil Stadium, Navi Mumbai', match_date: 'Tomorrow, 2:30 PM' },
            { id: 'up-3', team1: { name: 'Mumbai College' }, team2: { name: 'Delhi College' }, venue: 'Brabourne Stadium, Mumbai', match_date: 'Oct 8, 10:00 AM' },
          ]).map((match, idx) => (
            <div key={match.id || idx} className="bg-surface-card rounded-2xl p-6 sm:p-7 border border-border-light hover:border-accent/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[230px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="px-3 py-1.5 rounded-full bg-amber-50 text-warm text-xs font-bold uppercase tracking-wider">UPCOMING</span>
                  <span className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {match.match_date || 'Upcoming'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 my-4">
                  <span className="font-display font-bold text-lg text-text-primary">{match.team1?.name || 'Team 1'}</span>
                  <span className="text-xs text-text-muted font-bold px-2.5 py-1 bg-surface rounded-md border border-border-light">vs</span>
                  <span className="font-display font-bold text-lg text-text-primary text-right">{match.team2?.name || 'Team 2'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                  <span>{match.venue || 'College Cricket Ground'}</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border-light flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">T20 League Stage</span>
                <Link to={`/admin/scoring/${match.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white transition-all font-semibold text-xs min-h-[36px]">
                  View Match <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. RECENT RESULTS ────────────────────────────────── */}
      <section id="recent-results" className="app-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-accent" />
              Recent Results
            </h2>
            <p className="text-sm text-text-muted mt-1">Completed match scores and summaries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(completedMatches.length > 0 ? completedMatches : [
            { id: 'res-1', team1: { name: 'Mumbai College' }, team2: { name: 'Pune College' }, result_summary: 'Mumbai College won by 7 runs', venue: 'Wankhede Stadium, Mumbai', match_date: 'Yesterday' },
            { id: 'res-2', team1: { name: 'Bangalore College' }, team2: { name: 'Delhi College' }, result_summary: 'Bangalore College won by 5 wickets', venue: 'Chinnaswamy Stadium', match_date: 'Oct 3, 2026' },
            { id: 'res-3', team1: { name: 'Chennai College' }, team2: { name: 'Hyderabad College' }, result_summary: 'Chennai College won by 33 runs', venue: 'Chepauk Stadium, Chennai', match_date: 'Oct 2, 2026' },
          ]).map((match, idx) => (
            <div key={match.id || idx} className="bg-surface-card rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[230px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-accent text-xs font-bold uppercase tracking-wider">COMPLETED</span>
                  <span className="text-xs text-text-muted font-medium">{match.match_date || 'Recent'}</span>
                </div>
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-text-primary">{match.team1?.name || 'Team 1'}</span>
                    <span className="font-mono font-bold text-text-primary">172/6</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-secondary">{match.team2?.name || 'Team 2'}</span>
                    <span className="font-mono font-medium text-text-secondary">165/8</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs sm:text-sm font-semibold text-accent-dark">
                  {match.result_summary || 'Match concluded'}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border-light flex items-center justify-between gap-3">
                <span className="text-xs text-text-muted font-medium truncate">{match.venue}</span>
                <Link to={`/admin/scoring/${match.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white transition-all font-semibold text-xs shrink-0 min-h-[36px]">
                  Scorecard <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. TOURNAMENT SPOTLIGHT ──────────────────────────── */}
      <section id="tournament-spotlight" className="app-container">
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-3xl p-8 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <Trophy className="w-72 h-72 text-white" />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="px-4 py-1.5 rounded-full bg-white/15 text-accent-light text-xs font-semibold uppercase tracking-wider inline-block mb-4">
                TOURNAMENT SPOTLIGHT
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                Inter-College Cricket Championship 2026
              </h3>
              <p className="text-base text-white/85 mt-4 max-w-xl leading-relaxed">
                The premier annual college cricket tournament featuring top engineering and university teams battling across Mumbai & Pune venues.
              </p>
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm mb-3 text-white/90">
                  <span className="font-medium">Tournament Progress (Super 4 Stage)</span>
                  <span className="font-mono font-bold">18 / 28 Matches (64%)</span>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div className="bg-accent-light h-full rounded-full" style={{ width: '64%' }} />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Teams Competing', value: '12 Colleges' },
                { label: 'Current Leader', value: 'Mumbai College' },
                { label: 'Matches Remaining', value: '10 Fixtures' },
                { label: 'Grand Finale', value: 'Sunday Night' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
                  <p className="text-xs text-white/70 font-medium">{item.label}</p>
                  <p className="font-display font-bold text-lg text-white mt-1.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. POINTS TABLE ──────────────────────────────────── */}
      <section id="points-table" className="app-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-accent" />
              Points Table
            </h2>
            <p className="text-sm text-text-muted mt-1">Top teams standings and Net Run Rates</p>
          </div>
          <Link to="/admin/teams" className="text-sm font-semibold text-accent hover:text-white hover:bg-accent px-4 py-2.5 rounded-xl bg-accent/10 transition-all flex items-center gap-1.5 min-h-[40px]">
            Full Table <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-surface-card rounded-2xl shadow-sm border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border-light">
                  {['Pos', 'Team', 'P', 'W', 'L', 'Pts', 'NRR'].map((h, i) => (
                    <th key={h} className={`py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider ${i < 2 ? 'text-left px-6' : 'text-center px-5'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTeams.slice(0, 6).map((team, index) => {
                  const isTop = index < 4;
                  return (
                    <tr key={team.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isTop ? 'bg-accent/15 text-accent' : 'bg-surface text-text-muted'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isTop && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                          <div>
                            <p className="font-bold text-text-primary">{team.name}</p>
                            <p className="text-xs text-text-muted">{team.college_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-5 py-4 font-mono font-medium text-text-primary">{team.matches_played}</td>
                      <td className="text-center px-5 py-4 font-mono font-bold text-accent">{team.matches_won}</td>
                      <td className="text-center px-5 py-4 font-mono font-medium text-live">{team.matches_lost}</td>
                      <td className="text-center px-5 py-4 font-mono font-bold text-lg text-primary-lighter">{team.points}</td>
                      <td className="text-center px-5 py-4 font-mono text-xs font-medium text-text-secondary">
                        {team.net_run_rate >= 0 ? '+' : ''}{team.net_run_rate.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-surface border-t border-border-light flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-text-muted">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              Top 4 qualify for Semifinals & Finals
            </span>
            <Link to="/admin/teams" className="font-semibold text-accent hover:text-white hover:bg-accent px-3.5 py-1.5 rounded-lg bg-accent/10 transition-all inline-flex items-center min-h-[32px]">
              Manage Teams
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. PLAYER SPOTLIGHT ──────────────────────────────── */}
      <section id="player-spotlight" className="app-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary flex items-center gap-2.5">
              <Award className="w-6 h-6 text-accent" />
              Player Spotlight
            </h2>
            <p className="text-sm text-text-muted mt-1">Top individual performers in the tournament</p>
          </div>
          <Link to="/admin/players" className="text-sm font-semibold text-accent hover:text-white hover:bg-accent px-4 py-2.5 rounded-xl bg-accent/10 transition-all flex items-center gap-1.5 min-h-[40px]">
            All Players <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { category: 'Top Run Scorer', name: 'Rahul Sharma', team: 'Mumbai College', stat: '342 Runs', detail: '5 Inns • Avg 68.4 • SR 154.2', badgeBg: 'bg-amber-50 text-amber-700' },
            { category: 'Top Wicket Taker', name: 'Vikram Singh', team: 'Pune College', stat: '14 Wickets', detail: '18.4 Overs • Avg 12.8 • Econ 6.10', badgeBg: 'bg-emerald-50 text-accent' },
            { category: 'Best Strike Rate', name: 'Rohan Gupta', team: 'Delhi College', stat: '188.5 SR', detail: '218 Runs • 16 Sixes • 5 Inns', badgeBg: 'bg-primary-50 text-primary-lighter' },
            { category: 'Best Economy', name: 'Siddharth Rao', team: 'Bangalore College', stat: '5.42 Econ', detail: '20 Overs • 11 Wickets • 1 Maiden', badgeBg: 'bg-blue-50 text-blue-700' },
          ].map((card) => (
            <div key={card.category} className="bg-surface-card rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[260px]">
              <div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${card.badgeBg}`}>{card.category}</span>
                <div className="mt-5">
                  <h4 className="font-display font-bold text-xl text-text-primary">{card.name}</h4>
                  <p className="text-sm text-text-muted mt-0.5 font-medium">{card.team}</p>
                </div>
                <div className="mt-4">
                  <p className="font-mono font-extrabold text-3xl text-text-primary">{card.stat}</p>
                  <p className="text-sm text-text-secondary mt-1.5">{card.detail}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border-light">
                <Link to="/admin/players" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white transition-all font-semibold text-sm min-h-[38px]">
                  View Profile <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. TOURNAMENT UPDATES ────────────────────────────── */}
      <section id="tournament-updates" className="app-container">
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-accent" />
            Tournament Updates
          </h2>
          <p className="text-sm text-text-muted mt-1">Latest announcements and tournament news</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: 'Mumbai College qualifies for semifinal after thrilling 7-run victory', date: '2 hours ago', category: 'Match Report' },
            { title: 'Tournament Final scheduled for Sunday night under floodlights at Wankhede', date: '5 hours ago', category: 'Schedule' },
            { title: 'Rahul Sharma leads tournament run charts with back-to-back half centuries', date: 'Yesterday', category: 'Player Spotlight' },
            { title: 'Pune College announces revised 15-player squad for the upcoming knockout stage', date: 'Yesterday', category: 'Squad Update' },
          ].map((item, idx) => (
            <div key={idx} className="bg-surface-card rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm hover:shadow-md hover:border-accent/30 transition-all min-h-[130px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1.5 rounded-lg bg-surface text-text-secondary text-xs font-semibold border border-border-light">{item.category}</span>
                  <span className="text-xs text-text-muted font-medium">{item.date}</span>
                </div>
                <h4 className="font-display font-bold text-base sm:text-lg text-text-primary leading-snug">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. QUICK ACCESS ─────────────────────────────────── */}
      <section id="quick-access" className="app-container">
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">Quick Access</h2>
          <p className="text-sm text-text-muted mt-1">Direct navigation to tournament sections & management</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {[
            { label: 'Live Matches', href: '#live-match', icon: Radio, isLink: false },
            { label: 'Fixtures', href: '#upcoming-matches', icon: Calendar, isLink: false },
            { label: 'Scorecards', href: '#recent-results', icon: FileText, isLink: false },
            { label: 'Points Table', href: '#points-table', icon: TrendingUp, isLink: false },
            { label: 'Players', href: '/admin/players', icon: User, isLink: true },
            { label: 'Teams', href: '/admin/teams', icon: Users, isLink: true },
          ].map((item) => {
            const Icon = item.icon;
            const cls = "bg-surface-card rounded-2xl p-5 border border-border-light hover:border-accent/40 hover:bg-surface shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[120px]";
            const inner = (
              <>
                <div className="w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-accent/15 flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6 text-primary-lighter group-hover:text-accent transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{item.label}</span>
              </>
            );
            return item.isLink
              ? <Link key={item.label} to={item.href} className={cls}>{inner}</Link>
              : <a key={item.label} href={item.href} className={cls}>{inner}</a>;
          })}
        </div>
      </section>
    </div>
  );
}
