// ============================================================
// USER TYPES
// ============================================================

export type UserRole = 'admin' | 'captain' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id?: string | null;
  created_at: string;
}

// ============================================================
// TOURNAMENT TYPES
// ============================================================

export type TournamentFormat = 'league' | 'knockout';
export type TournamentStatus = 'upcoming' | 'active' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  overs_per_match: number;
  max_teams: number;
  start_date: string;
  end_date: string;
  venue: string;
  status: TournamentStatus;
  created_at: string;
}

// ============================================================
// TEAM TYPES
// ============================================================

export interface Team {
  id: string;
  name: string;
  college_name: string;
  logo_url?: string;
  tournament_id: string;
  captain_id?: string | null;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  net_run_rate: number;
  points: number;
  created_at: string;
}

// ============================================================
// PLAYER TYPES
// ============================================================

export type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  team_id: string;
  jersey_number: number;
  total_runs: number;
  total_balls_faced: number;
  total_fours: number;
  total_sixes: number;
  total_wickets: number;
  total_overs_bowled: number;
  total_runs_conceded: number;
  matches_played: number;
  created_at: string;
}

// ============================================================
// MATCH TYPES
// ============================================================

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type TossDecision = 'bat' | 'bowl';

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  venue: string;
  match_date: string;
  status: MatchStatus;
  toss_winner_id?: string | null;
  toss_decision?: TossDecision | null;
  winner_id?: string | null;
  result_summary?: string | null;
  current_innings: number;
  created_at: string;
  // Joined fields (optional, for display)
  team1?: Team;
  team2?: Team;
  winner?: Team;
  tournament?: Tournament;
}

// ============================================================
// INNINGS TYPES
// ============================================================

export type InningsStatus = 'in_progress' | 'completed';

export interface Innings {
  id: string;
  match_id: string;
  innings_number: number;
  batting_team_id: string;
  bowling_team_id: string;
  total_runs: number;
  wickets: number;
  overs: number;
  extras_wides: number;
  extras_noballs: number;
  extras_byes: number;
  extras_legbyes: number;
  status: InningsStatus;
  created_at: string;
  // Joined
  batting_team?: Team;
  bowling_team?: Team;
}

// ============================================================
// BALL EVENT TYPES
// ============================================================

export type ExtraType = 'none' | 'wide' | 'noball' | 'bye' | 'legbye';
export type WicketType = 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket';

export interface BallEvent {
  id: string;
  match_id: string;
  innings_id: string;
  over_number: number;
  ball_number: number;
  batsman_id: string;
  non_striker_id: string;
  bowler_id: string;
  runs_scored: number;
  extra_type: ExtraType;
  extra_runs: number;
  is_wicket: boolean;
  wicket_type?: WicketType | null;
  fielder_id?: string | null;
  is_boundary: boolean;
  is_six: boolean;
  created_at: string;
  // Joined
  batsman?: Player;
  bowler?: Player;
}

// ============================================================
// SCORECARD TYPES
// ============================================================

export interface BattingScorecard {
  id: string;
  innings_id: string;
  player_id: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  dismissal_type?: string | null;
  dismissed_by?: string | null;
  fielder_id?: string | null;
  batting_position: number;
  // Joined
  player?: Player;
}

export interface BowlingScorecard {
  id: string;
  innings_id: string;
  player_id: string;
  overs: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  wides: number;
  noballs: number;
  economy: number;
  // Joined
  player?: Player;
}

// ============================================================
// NEWS UPDATE TYPES
// ============================================================

export type NewsCategory = 'match' | 'team' | 'player' | 'tournament';

export interface NewsUpdate {
  id: string;
  tournament_id?: string | null;
  title: string;
  content: string;
  category: NewsCategory;
  created_at: string;
}

// ============================================================
// POINTS TABLE TYPE (Computed)
// ============================================================

export interface PointsTableEntry {
  rank: number;
  team: Team;
  played: number;
  won: number;
  lost: number;
  points: number;
  nrr: number;
}

// ============================================================
// LINKED LIST VISUALIZER TYPES
// ============================================================

export type VisualizerDataSource = 'teams' | 'players' | 'matches';

export type VisualizerOperation = 'insert' | 'delete' | 'search' | 'traverse' | 'idle';

export interface OperationLogEntry {
  id: string;
  operation: VisualizerOperation;
  detail: string;
  timestamp: Date;
  success: boolean;
}
