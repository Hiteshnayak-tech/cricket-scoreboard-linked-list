import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Undo2,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Trophy,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useLinkedList } from '../../context/LinkedListContext';
import type { BallEvent, ExtraType, WicketType, Player } from '../../types';

export default function LiveScoringConsole() {
  const { matchId } = useParams<{ matchId: string }>();
  const { teamList, matchHistory, undoStack, logOperation, refresh, version, getPlayerList } =
    useLinkedList();

  const match = matchHistory.findMatch(matchId || '');
  const teams = teamList.getAllTeams();

  // Local state for scoring
  const [battingTeamId, setBattingTeamId] = useState(teams[0]?.id || '');
  const [bowlingTeamId, setBowlingTeamId] = useState(teams[1]?.id || '');
  const [innings, setInnings] = useState(1);
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0);
  const [balls, setBalls] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [currentBatsmanIdx, setCurrentBatsmanIdx] = useState(0);
  const [currentBowlerIdx, setCurrentBowlerIdx] = useState(0);

  const battingTeam = teams.find((t) => t.id === battingTeamId);
  const bowlingTeam = teams.find((t) => t.id === bowlingTeamId);

  const battingPlayers = battingTeamId ? getPlayerList(battingTeamId).getAllPlayers() : [];
  const bowlingPlayers = bowlingTeamId ? getPlayerList(bowlingTeamId).getAllPlayers() : [];

  const currentBatsman = battingPlayers[currentBatsmanIdx] || null;
  const currentBowler = bowlingPlayers[currentBowlerIdx] || null;

  // Ball events from the undo stack
  const ballEvents = undoStack.toArray();
  const currentOverBalls = ballEvents.filter(
    (e) => e.over_number === overs && e.innings_id === `innings-${innings}`
  );

  const runRate = useMemo(() => {
    const totalOvers = overs + balls / 6;
    return totalOvers > 0 ? (totalRuns / totalOvers).toFixed(2) : '0.00';
  }, [totalRuns, overs, balls]);

  const recordBall = useCallback(
    (runs: number, extraType: ExtraType = 'none', extraRuns: number = 0, isWicket: boolean = false, wicketType?: WicketType) => {
      if (!isPlaying) return;

      const event: BallEvent = {
        id: crypto.randomUUID(),
        match_id: matchId || 'demo-match',
        innings_id: `innings-${innings}`,
        over_number: overs,
        ball_number: balls + 1,
        batsman_id: currentBatsman?.id || '',
        non_striker_id: '',
        bowler_id: currentBowler?.id || '',
        runs_scored: runs,
        extra_type: extraType,
        extra_runs: extraRuns,
        is_wicket: isWicket,
        wicket_type: wicketType || null,
        fielder_id: null,
        is_boundary: runs === 4,
        is_six: runs === 6,
        created_at: new Date().toISOString(),
      };

      // Push onto stack (for undo)
      undoStack.push(event);
      logOperation('insert', `Pushed ball event onto undo stack (Stack.push — O(1))`, true);

      // Update scoring state
      const totalRunsForBall = runs + extraRuns;
      setTotalRuns((r) => r + totalRunsForBall);

      if (isWicket) {
        setWickets((w) => w + 1);
      }

      // Handle ball counting (wides and no-balls don't count as legal deliveries)
      if (extraType !== 'wide' && extraType !== 'noball') {
        const newBalls = balls + 1;
        if (newBalls >= 6) {
          setOvers((o) => o + 1);
          setBalls(0);
          // Rotate bowler
          setCurrentBowlerIdx((idx) => (idx + 1) % Math.max(1, bowlingPlayers.length));
        } else {
          setBalls(newBalls);
        }
      }

      // Rotate strike on odd runs
      if (runs % 2 === 1) {
        // Strike rotation would happen here in a full implementation
      }

      refresh();
    },
    [
      matchId,
      innings,
      overs,
      balls,
      isPlaying,
      currentBatsman,
      currentBowler,
      undoStack,
      logOperation,
      refresh,
      bowlingPlayers.length,
    ]
  );

  const handleUndo = useCallback(() => {
    const lastEvent = undoStack.pop();
    if (!lastEvent) return;

    logOperation(
      'delete',
      `Popped last ball event from undo stack (Stack.pop — O(1), LIFO)`,
      true
    );

    // Reverse scoring
    const totalRunsForBall = lastEvent.runs_scored + lastEvent.extra_runs;
    setTotalRuns((r) => Math.max(0, r - totalRunsForBall));

    if (lastEvent.is_wicket) {
      setWickets((w) => Math.max(0, w - 1));
    }

    // Reverse ball counting
    if (lastEvent.extra_type !== 'wide' && lastEvent.extra_type !== 'noball') {
      if (balls === 0 && overs > 0) {
        setOvers((o) => o - 1);
        setBalls(5);
      } else {
        setBalls((b) => Math.max(0, b - 1));
      }
    }

    refresh();
  }, [undoStack, logOperation, balls, overs, refresh]);

  const getBallBadgeClass = (event: BallEvent): string => {
    if (event.is_wicket) return 'ball-badge ball-wicket';
    if (event.extra_type === 'wide') return 'ball-badge ball-wide';
    if (event.extra_type === 'noball') return 'ball-badge ball-noball';
    if (event.is_six) return 'ball-badge ball-six';
    if (event.is_boundary) return 'ball-badge ball-four';
    if (event.runs_scored === 0) return 'ball-badge ball-dot';
    if (event.runs_scored === 1) return 'ball-badge ball-single';
    if (event.runs_scored === 2) return 'ball-badge ball-two';
    if (event.runs_scored === 3) return 'ball-badge ball-three';
    return 'ball-badge ball-single';
  };

  const getBallLabel = (event: BallEvent): string => {
    if (event.is_wicket) return 'W';
    if (event.extra_type === 'wide') return 'WD';
    if (event.extra_type === 'noball') return 'NB';
    if (event.extra_type === 'bye') return 'B';
    if (event.extra_type === 'legbye') return 'LB';
    return String(event.runs_scored);
  };

  // If no teams, show setup prompt
  if (teams.length < 2) {
    return (
      <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-warm" />
        </div>
        <h1 className="font-display font-bold text-2xl text-text-primary mb-3">
          Not Enough Teams
        </h1>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          You need at least 2 teams to start scoring a match. Add teams and players first.
        </p>
        <Link
          to="/admin/teams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-dark transition-colors min-h-[40px]"
        >
          Go to Team Management
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter app-container py-8" key={version}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors border border-border-light"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-text-primary flex items-center gap-2">
            <Zap className="w-6 h-6 text-warm" />
            Live Scoring Console
          </h1>
          <p className="text-sm text-text-secondary">
            Ball-by-ball tournament match scoring with instant undo and stats updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
              isPlaying
                ? 'bg-red-50 border-red-200 text-live hover:bg-red-100'
                : 'bg-green-50 border-green-200 text-accent hover:bg-green-100'
            }`}
            title={isPlaying ? 'Pause Match' : 'Resume Match'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Team Selection (for demo mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Batting Team
          </label>
          <select
            value={battingTeamId}
            onChange={(e) => setBattingTeamId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-border text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 min-h-[44px]"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Bowling Team
          </label>
          <select
            value={bowlingTeamId}
            onChange={(e) => setBowlingTeamId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-border text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 min-h-[44px]"
          >
            {teams.filter((t) => t.id !== battingTeamId).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================================
            MAIN SCOREBOARD
            ============================================================ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Display */}
          <div className="bg-primary rounded-2xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-sm font-medium text-white/70">
                    {battingTeam?.name || 'Batting'}
                  </span>
                </div>
                <span className="text-sm text-white/50">
                  Innings {innings}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="score-large">{totalRuns}/{wickets}</span>
                <span className="score-medium text-white/60">
                  ({overs}.{balls})
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/60">
                <span>
                  CRR: <span className="font-mono font-semibold text-white/80">{runRate}</span>
                </span>
                <span>
                  vs <span className="font-medium text-white/80">{bowlingTeam?.name || 'Bowling'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Current Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-card rounded-xl p-4 border border-border-light">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">🏏 Batsman</p>
              <p className="font-display font-semibold text-text-primary">
                {currentBatsman?.name || 'Select from player list'}
              </p>
              {currentBatsman && (
                <p className="text-xs text-text-muted mt-1 font-mono">
                  #{currentBatsman.jersey_number} • {currentBatsman.role}
                </p>
              )}
            </div>
            <div className="bg-surface-card rounded-xl p-4 border border-border-light">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">🎯 Bowler</p>
              <p className="font-display font-semibold text-text-primary">
                {currentBowler?.name || 'Select from player list'}
              </p>
              {currentBowler && (
                <p className="text-xs text-text-muted mt-1 font-mono">
                  #{currentBowler.jersey_number} • {currentBowler.role}
                </p>
              )}
            </div>
          </div>

          {/* Scoring Buttons */}
          <div className="bg-surface-card rounded-2xl p-6 border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-sm text-text-primary mb-4">
              Score Ball
            </h3>

            {/* Run buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-4">
              {[0, 1, 2, 3].map((runs) => (
                <button
                  key={runs}
                  onClick={() => recordBall(runs)}
                  disabled={!isPlaying}
                  className="scoring-btn scoring-btn-runs disabled:opacity-40"
                >
                  {runs}
                </button>
              ))}
              <button
                onClick={() => recordBall(4)}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-boundary disabled:opacity-40"
              >
                4
              </button>
              <button
                onClick={() => recordBall(6)}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-six disabled:opacity-40"
              >
                6
              </button>
              <button
                onClick={() => recordBall(0, 'none', 0, true, 'bowled')}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-wicket disabled:opacity-40"
              >
                W
              </button>
            </div>

            {/* Extras */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <button
                onClick={() => recordBall(0, 'wide', 1)}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-extra disabled:opacity-40 text-base"
              >
                WD
              </button>
              <button
                onClick={() => recordBall(0, 'noball', 1)}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-extra disabled:opacity-40 text-base"
              >
                NB
              </button>
              <button
                onClick={() => recordBall(0, 'bye', 1)}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-extra disabled:opacity-40 text-base"
              >
                B
              </button>
              <button
                onClick={() => recordBall(0, 'legbye', 1)}
                disabled={!isPlaying}
                className="scoring-btn scoring-btn-extra disabled:opacity-40 text-base"
              >
                LB
              </button>
            </div>

            {/* Undo */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleUndo}
                disabled={undoStack.isEmpty()}
                className="scoring-btn scoring-btn-undo flex-1 disabled:opacity-30 gap-2 text-base"
              >
                <Undo2 className="w-4 h-4" />
                Undo (Stack.pop)
              </button>
              <button
                onClick={() => {
                  undoStack.clear();
                  setTotalRuns(0);
                  setWickets(0);
                  setOvers(0);
                  setBalls(0);
                  refresh();
                }}
                className="scoring-btn scoring-btn-undo gap-2 text-base"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* This Over */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-sm text-text-primary mb-3">
              This Over (Over {overs + 1})
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {ballEvents
                .filter(
                  (e) =>
                    e.over_number === overs &&
                    e.innings_id === `innings-${innings}`
                )
                .reverse()
                .map((event) => (
                  <div key={event.id} className={getBallBadgeClass(event)}>
                    {getBallLabel(event)}
                  </div>
                ))}
              {ballEvents.filter(
                (e) => e.over_number === overs && e.innings_id === `innings-${innings}`
              ).length === 0 && (
                <p className="text-sm text-text-muted italic">No deliveries yet</p>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            SIDEBAR — UNDO STACK VISUALIZATION
            ============================================================ */}
        <div className="space-y-6">
          {/* Stack Visualization */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-light shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm text-text-primary">
                Undo Stack (LIFO)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-lighter text-xs font-mono font-medium">
                {undoStack.size} items
              </span>
            </div>

            {undoStack.isEmpty() ? (
              <div className="text-center py-8">
                <p className="text-sm text-text-muted font-mono">Stack is empty</p>
                <p className="text-xs text-text-muted mt-1">TOP → NULL</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ballEvents.slice(0, 15).map((event, index) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      index === 0
                        ? 'bg-primary-50 border-primary-100 shadow-sm'
                        : 'bg-surface border-border-light'
                    }`}
                  >
                    <div className={getBallBadgeClass(event)} style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                      {getBallLabel(event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        Over {event.over_number + 1}.{event.ball_number}
                      </p>
                      <p className="text-xs text-text-muted">
                        {event.runs_scored} run{event.runs_scored !== 1 ? 's' : ''}
                        {event.is_wicket ? ' • WICKET' : ''}
                        {event.extra_type !== 'none' ? ` • ${event.extra_type}` : ''}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-accent text-white text-xs font-bold shrink-0">
                        TOP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 rounded-lg bg-primary-50/50 border border-primary-100/50">
              <p className="text-xs font-mono text-primary-lighter leading-relaxed">
                Stack uses Node chain: TOP → event(n) → event(n-1) → ... → NULL.
                Push/Pop are O(1) operations.
              </p>
            </div>
          </div>

          {/* Match Summary */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warm" />
              Match Summary
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Total Balls', value: ballEvents.length },
                { label: 'Boundaries', value: ballEvents.filter((e) => e.is_boundary).length },
                { label: 'Sixes', value: ballEvents.filter((e) => e.is_six).length },
                { label: 'Wickets', value: wickets },
                { label: 'Dot Balls', value: ballEvents.filter((e) => e.runs_scored === 0 && !e.is_wicket && e.extra_type === 'none').length },
                {
                  label: 'Extras',
                  value: ballEvents.filter((e) => e.extra_type !== 'none').length,
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-text-secondary">{stat.label}</span>
                  <span className="font-mono font-medium text-sm text-text-primary">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
