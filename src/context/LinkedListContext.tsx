import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  Team,
  Player,
  Match,
  BallEvent,
  OperationLogEntry,
  VisualizerOperation,
} from '../types';
import {
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  INITIAL_UPCOMING_MATCHES,
} from '../data/seedData';

// ============================================================
// CONTEXT TYPES
// ============================================================

export interface TournamentContextType {
  // Teams
  teams: Team[];
  addTeam: (team: Team, position?: 'head' | 'tail') => void;
  updateTeam: (teamId: string, updater: (team: Team) => Team) => boolean;
  deleteTeam: (teamId: string) => boolean;
  findTeam: (teamId: string) => Team | null;
  getTeamsByPoints: () => Team[];

  // Players keyed by teamId
  playersMap: Record<string, Player[]>;
  getPlayersByTeam: (teamId: string) => Player[];
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updater: (player: Player) => Player) => boolean;
  deletePlayer: (playerId: string, teamId: string) => boolean;
  findPlayer: (playerId: string, teamId: string) => Player | null;

  // Matches
  matches: Match[];
  upcomingMatches: Match[];
  addMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => boolean;
  findMatch: (matchId: string) => Match | null;

  // Ball events for live scoring
  ballEvents: BallEvent[];
  addBallEvent: (event: BallEvent) => void;
  undoBallEvent: () => BallEvent | null;
  clearBallEvents: () => void;

  // Visualizer operation logs
  operationLog: OperationLogEntry[];
  logOperation: (operation: VisualizerOperation, detail: string, success: boolean) => void;
  clearLog: () => void;

  version: number;
  refresh: () => void;

  // Compatibility adapters for existing views
  teamList: {
    getAllTeams: () => Team[];
    getTeamsByPoints: () => Team[];
    addTeam: (team: Team) => void;
    updateTeam: (teamId: string, updater: (team: Team) => Team) => boolean;
    removeTeam: (teamId: string) => Team | null;
    findTeam: (teamId: string) => Team | null;
    toString: () => string;
    getVisualizerData: () => Array<{ data: Team; hasNext: boolean; index: number }>;
  };
  matchHistory: {
    getAllMatches: () => Match[];
    addMatch: (match: Match) => void;
    removeMatch: (matchId: string) => Match | null;
    findMatch: (matchId: string) => Match | null;
    getVisualizerData: () => Array<{ data: Match; hasNext: boolean; index: number }>;
  };
  matchQueue: {
    toArray: () => Match[];
  };
  getPlayerList: (teamId: string) => {
    getAllPlayers: () => Player[];
    getPlayerCount: () => number;
    addPlayer: (player: Player) => void;
    updatePlayer: (playerId: string, updater: (player: Player) => Player) => boolean;
    removePlayer: (playerId: string) => Player | null;
    toString: () => string;
    getVisualizerData: () => Array<{ data: Player; hasNext: boolean; index: number }>;
  };
  undoStack: {
    toArray: () => BallEvent[];
    pop: () => BallEvent | null;
    push: (event: BallEvent) => void;
    clear: () => void;
    isEmpty: () => boolean;
    size: number;
  };
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export function LinkedListProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [playersMap, setPlayersMap] = useState<Record<string, Player[]>>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>(INITIAL_UPCOMING_MATCHES);
  const [ballEvents, setBallEvents] = useState<BallEvent[]>([]);
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // Team actions
  const addTeam = useCallback((newTeam: Team, position: 'head' | 'tail' = 'tail') => {
    setTeams((prev) => (position === 'head' ? [newTeam, ...prev] : [...prev, newTeam]));
    setVersion((v) => v + 1);
  }, []);

  const updateTeam = useCallback((teamId: string, updater: (team: Team) => Team): boolean => {
    let updated = false;
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          updated = true;
          return updater(t);
        }
        return t;
      })
    );
    setVersion((v) => v + 1);
    return updated;
  }, []);

  const deleteTeam = useCallback((teamId: string): boolean => {
    let deleted = false;
    setTeams((prev) => {
      const filtered = prev.filter((t) => t.id !== teamId);
      if (filtered.length !== prev.length) deleted = true;
      return filtered;
    });
    setVersion((v) => v + 1);
    return deleted;
  }, []);

  const findTeam = useCallback((teamId: string): Team | null => {
    return teams.find((t) => t.id === teamId) || null;
  }, [teams]);

  const getTeamsByPoints = useCallback((): Team[] => {
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.net_run_rate - a.net_run_rate;
    });
  }, [teams]);

  // Player actions
  const getPlayersByTeam = useCallback((teamId: string): Player[] => {
    return playersMap[teamId] || [];
  }, [playersMap]);

  const addPlayer = useCallback((player: Player) => {
    setPlayersMap((prev) => ({
      ...prev,
      [player.team_id]: [...(prev[player.team_id] || []), player],
    }));
    setVersion((v) => v + 1);
  }, []);

  const updatePlayer = useCallback((playerId: string, updater: (player: Player) => Player): boolean => {
    let updated = false;
    setPlayersMap((prev) => {
      const nextMap: Record<string, Player[]> = {};
      Object.keys(prev).forEach((teamId) => {
        nextMap[teamId] = prev[teamId].map((p) => {
          if (p.id === playerId) {
            updated = true;
            return updater(p);
          }
          return p;
        });
      });
      return nextMap;
    });
    setVersion((v) => v + 1);
    return updated;
  }, []);

  const deletePlayer = useCallback((playerId: string, teamId: string): boolean => {
    let deleted = false;
    setPlayersMap((prev) => {
      const teamPlayers = prev[teamId] || [];
      const filtered = teamPlayers.filter((p) => p.id !== playerId);
      if (filtered.length !== teamPlayers.length) deleted = true;
      return {
        ...prev,
        [teamId]: filtered,
      };
    });
    setVersion((v) => v + 1);
    return deleted;
  }, []);

  const findPlayer = useCallback((playerId: string, teamId: string): Player | null => {
    const list = playersMap[teamId] || [];
    return list.find((p) => p.id === playerId) || null;
  }, [playersMap]);

  // Match actions
  const addMatch = useCallback((match: Match) => {
    setMatches((prev) => [match, ...prev]);
    setVersion((v) => v + 1);
  }, []);

  const deleteMatch = useCallback((matchId: string): boolean => {
    let deleted = false;
    setMatches((prev) => {
      const filtered = prev.filter((m) => m.id !== matchId);
      if (filtered.length !== prev.length) deleted = true;
      return filtered;
    });
    setVersion((v) => v + 1);
    return deleted;
  }, []);

  const findMatch = useCallback((matchId: string): Match | null => {
    return matches.find((m) => m.id === matchId) || upcomingMatches.find((m) => m.id === matchId) || null;
  }, [matches, upcomingMatches]);

  // Ball Event actions
  const addBallEvent = useCallback((event: BallEvent) => {
    setBallEvents((prev) => [event, ...prev]);
    setVersion((v) => v + 1);
  }, []);

  const undoBallEvent = useCallback((): BallEvent | null => {
    let popped: BallEvent | null = null;
    setBallEvents((prev) => {
      if (prev.length === 0) return prev;
      popped = prev[0];
      return prev.slice(1);
    });
    setVersion((v) => v + 1);
    return popped;
  }, []);

  const clearBallEvents = useCallback(() => {
    setBallEvents([]);
    setVersion((v) => v + 1);
  }, []);

  // Visualizer logging
  const logOperation = useCallback(
    (operation: VisualizerOperation, detail: string, success: boolean) => {
      const entry: OperationLogEntry = {
        id: crypto.randomUUID(),
        operation,
        detail,
        timestamp: new Date(),
        success,
      };
      setOperationLog((prev) => [entry, ...prev].slice(0, 50));
    },
    []
  );

  const clearLog = useCallback(() => {
    setOperationLog([]);
  }, []);

  // Compatibility adapters
  const teamList = {
    getAllTeams: () => teams,
    getTeamsByPoints,
    addTeam,
    updateTeam,
    removeTeam: (id: string) => {
      const t = teams.find((x) => x.id === id) || null;
      deleteTeam(id);
      return t;
    },
    findTeam,
    toString: () => (teams.length === 0 ? 'NULL' : teams.map((t) => t.name).join(' -> ') + ' -> NULL'),
    getVisualizerData: () =>
      teams.map((t, idx) => ({
        data: t,
        hasNext: idx < teams.length - 1,
        index: idx,
      })),
  };

  const matchHistory = {
    getAllMatches: () => matches,
    addMatch,
    removeMatch: (id: string) => {
      const m = matches.find((x) => x.id === id) || null;
      deleteMatch(id);
      return m;
    },
    findMatch,
    getVisualizerData: () =>
      matches.map((m, idx) => ({
        data: m,
        hasNext: idx < matches.length - 1,
        index: idx,
      })),
  };

  const matchQueue = {
    toArray: () => upcomingMatches,
  };

  const getPlayerList = useCallback(
    (teamId: string) => {
      const pList = playersMap[teamId] || [];
      return {
        getAllPlayers: () => pList,
        getPlayerCount: () => pList.length,
        addPlayer,
        updatePlayer,
        removePlayer: (playerId: string) => {
          const p = pList.find((x) => x.id === playerId) || null;
          deletePlayer(playerId, teamId);
          return p;
        },
        toString: () => (pList.length === 0 ? 'NULL' : pList.map((p) => p.name).join(' -> ') + ' -> NULL'),
        getVisualizerData: () =>
          pList.map((p, idx) => ({
            data: p,
            hasNext: idx < pList.length - 1,
            index: idx,
          })),
      };
    },
    [playersMap, addPlayer, updatePlayer, deletePlayer]
  );

  const undoStack = {
    toArray: () => ballEvents,
    pop: undoBallEvent,
    push: addBallEvent,
    clear: clearBallEvents,
    isEmpty: () => ballEvents.length === 0,
    get size() {
      return ballEvents.length;
    },
  };

  return (
    <TournamentContext.Provider
      value={{
        teams,
        addTeam,
        updateTeam,
        deleteTeam,
        findTeam,
        getTeamsByPoints,
        playersMap,
        getPlayersByTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        findPlayer,
        matches,
        upcomingMatches,
        addMatch,
        deleteMatch,
        findMatch,
        ballEvents,
        addBallEvent,
        undoBallEvent,
        clearBallEvents,
        operationLog,
        logOperation,
        clearLog,
        version,
        refresh,
        teamList,
        matchHistory,
        matchQueue,
        getPlayerList,
        undoStack,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useLinkedList(): TournamentContextType {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useLinkedList must be used within a LinkedListProvider');
  }
  return context;
}
