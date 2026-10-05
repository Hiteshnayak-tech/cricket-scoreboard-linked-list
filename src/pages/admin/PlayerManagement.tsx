import { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Check,
  ChevronDown,
  AlertCircle,
  Trophy,
  Target,
  Crosshair,
} from 'lucide-react';
import { useLinkedList } from '../../context/LinkedListContext';
import type { Player, PlayerRole } from '../../types';

const ROLES: { value: PlayerRole; label: string; icon: typeof User }[] = [
  { value: 'batsman', label: 'Batsman', icon: Trophy },
  { value: 'bowler', label: 'Bowler', icon: Target },
  { value: 'allrounder', label: 'All-rounder', icon: Crosshair },
  { value: 'wicketkeeper', label: 'Wicketkeeper', icon: User },
];

export default function PlayerManagement() {
  const { teamList, getPlayerList, logOperation, refresh, version } = useLinkedList();

  const teams = teamList.getAllTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlayerRole | 'all'>('all');

  const [formData, setFormData] = useState({
    name: '',
    role: 'batsman' as PlayerRole,
    jersey_number: 0,
  });

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const playerList = selectedTeamId ? getPlayerList(selectedTeamId) : null;
  const allPlayers = playerList?.getAllPlayers() || [];

  // Filter
  let filteredPlayers = allPlayers;
  if (searchQuery) {
    filteredPlayers = filteredPlayers.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (roleFilter !== 'all') {
    filteredPlayers = filteredPlayers.filter((p) => p.role === roleFilter);
  }

  const resetForm = () => {
    setFormData({ name: '', role: 'batsman', jersey_number: 0 });
    setEditingPlayer(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerList || !selectedTeamId) return;

    if (editingPlayer) {
      const success = playerList.updatePlayer(editingPlayer.id, (player) => ({
        ...player,
        name: formData.name,
        role: formData.role,
        jersey_number: formData.jersey_number,
      }));
      logOperation(
        'insert',
        `Updated player "${formData.name}" in team's player linked list`,
        success
      );
    } else {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: formData.name,
        role: formData.role,
        team_id: selectedTeamId,
        jersey_number: formData.jersey_number,
        total_runs: 0,
        total_balls_faced: 0,
        total_fours: 0,
        total_sixes: 0,
        total_wickets: 0,
        total_overs_bowled: 0,
        total_runs_conceded: 0,
        matches_played: 0,
        created_at: new Date().toISOString(),
      };
      playerList.addPlayer(newPlayer);
      logOperation(
        'insert',
        `Inserted player "${newPlayer.name}" at END of ${selectedTeam?.name}'s player list`,
        true
      );
    }

    refresh();
    resetForm();
  };

  const handleDelete = (player: Player) => {
    if (!playerList) return;
    const removed = playerList.removePlayer(player.id);
    logOperation(
      'delete',
      `Deleted player "${player.name}" — traversed list, re-linked prev.next to skip deleted node`,
      !!removed
    );
    refresh();
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      role: player.role,
      jersey_number: player.jersey_number,
    });
    setShowForm(true);
  };

  const getRoleBadgeColor = (role: PlayerRole) => {
    switch (role) {
      case 'batsman':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'bowler':
        return 'bg-emerald-50 text-accent border-emerald-200';
      case 'allrounder':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'wicketkeeper':
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <div className="page-enter app-container py-10" key={version}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            Player Management
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            Each team has its own PlayerLinkedList. Select a team to view and manage its squad.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={!selectedTeamId}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm sm:text-base hover:bg-accent-dark transition-all duration-200 shadow-md shadow-accent/20 hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed self-start md:self-auto min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          Add Player
        </button>
      </div>

      {/* Team Selector */}
      {teams.length === 0 ? (
        <div className="bg-surface-card rounded-3xl p-12 shadow-sm border border-border-light text-center">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-text-primary mb-2">
            No Teams Available
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Add teams first from the Team Management page. Each team creates a new PlayerLinkedList.
          </p>
        </div>
      ) : (
        <>
          {/* Team tabs */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {teams.map((team) => {
              const pl = getPlayerList(team.id);
              const count = pl.getPlayerCount();
              const isSelected = selectedTeamId === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`shrink-0 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border flex items-center gap-2.5 min-h-[44px] ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-surface-card text-text-secondary border-border-light hover:border-primary-100 hover:text-text-primary shadow-xs'
                  }`}
                >
                  {team.name}
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-surface text-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected team info */}
          {selectedTeam && playerList && (
            <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-100/60 mb-8">
              <p className="text-xs sm:text-sm font-mono text-primary-lighter leading-relaxed">
                📋 <strong>{selectedTeam.name}'s Squad Linked List</strong> ({allPlayers.length} nodes): HEAD →{' '}
                {playerList.toString()}
              </p>
            </div>
          )}

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter transition-all shadow-xs min-h-[44px]"
              />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as PlayerRole | 'all')}
                className="appearance-none px-5 py-3 pr-11 rounded-xl bg-surface-card border border-border text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter cursor-pointer shadow-xs min-h-[44px]"
              >
                <option value="all">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-surface-card rounded-3xl p-6 sm:p-8 shadow-md border border-border-light mb-8 ll-node-enter">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-text-primary">
                  {editingPlayer ? 'Edit Player' : 'Add New Player'}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Player Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as PlayerRole })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter min-h-[44px]"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                    Jersey # *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="99"
                    value={formData.jersey_number}
                    onChange={(e) =>
                      setFormData({ ...formData, jersey_number: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter min-h-[44px]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm sm:text-base hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
                  >
                    <Check className="w-5 h-5" />
                    {editingPlayer ? 'Save Changes' : 'Add Player'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Players Table List */}
          {filteredPlayers.length === 0 ? (
            <div className="bg-surface-card rounded-3xl p-12 shadow-sm border border-border-light text-center">
              {allPlayers.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-text-primary mb-2">
                    Player List is Empty
                  </h3>
                  <p className="text-sm text-text-secondary font-mono">HEAD → NULL</p>
                  <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-sm mx-auto">
                    Add players to {selectedTeam?.name}'s linked list to populate squad statistics.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <h3 className="font-display font-bold text-lg text-text-primary mb-1">No Results</h3>
                  <p className="text-sm text-text-secondary">
                    No players match your search criteria.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-surface-card rounded-3xl shadow-sm border border-border-light overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="bg-primary-50/50 border-b border-border-light">
                      <th className="text-left px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Node
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Player
                      </th>
                      <th className="text-center px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Jersey
                      </th>
                      <th className="text-center px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-center px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Runs
                      </th>
                      <th className="text-center px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Wickets
                      </th>
                      <th className="text-center px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="text-right px-6 py-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, index) => (
                      <tr
                        key={player.id}
                        className="border-b border-border-light last:border-0 hover:bg-primary-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-primary-lighter bg-primary-50 px-2.5 py-1 rounded-md">
                            [{index}]
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-text-primary text-base">{player.name}</p>
                        </td>
                        <td className="text-center px-6 py-4">
                          <span className="w-8 h-8 rounded-lg bg-surface-dark text-white text-xs font-bold inline-flex items-center justify-center font-mono">
                            {player.jersey_number}
                          </span>
                        </td>
                        <td className="text-center px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              player.role
                            )}`}
                          >
                            {player.role}
                          </span>
                        </td>
                        <td className="text-center px-6 py-4 font-mono font-bold text-text-primary">
                          {player.total_runs}
                        </td>
                        <td className="text-center px-6 py-4 font-mono font-bold text-accent">
                          {player.total_wickets}
                        </td>
                        <td className="text-center px-6 py-4 font-mono font-medium text-text-secondary">
                          {player.matches_played}
                        </td>
                        <td className="text-right px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(player)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-primary-lighter hover:bg-primary-50 transition-colors"
                              title="Edit player"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(player)}
                              className="px-3.5 py-2 rounded-xl text-live hover:bg-red-50 border border-red-200/60 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[36px]"
                              title="Delete player from linked list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Linked list structure visualization ribbon */}
          {allPlayers.length > 0 && (
            <div className="mt-8 p-6 rounded-3xl bg-surface-card border border-border-light shadow-sm">
              <h3 className="font-display font-bold text-base text-text-primary mb-4">
                {selectedTeam?.name}'s Player Linked List
              </h3>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3">
                <span className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-mono font-bold shrink-0">
                  HEAD
                </span>
                <span className="text-text-muted text-xs font-bold">→</span>
                {allPlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-1.5 shrink-0">
                    <span className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-medium">
                      {player.name} (#{player.jersey_number})
                    </span>
                    <span className="text-text-muted text-xs font-bold">→</span>
                  </div>
                ))}
                <span className="px-3 py-1.5 rounded-lg bg-red-50 text-live text-xs font-mono font-bold shrink-0">
                  NULL
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
