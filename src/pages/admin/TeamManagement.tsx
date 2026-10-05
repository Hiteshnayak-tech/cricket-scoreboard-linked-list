import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Check,
  ChevronRight,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useLinkedList } from '../../context/LinkedListContext';
import type { Team } from '../../types';

export default function TeamManagement() {
  const { teamList, logOperation, refresh, version } = useLinkedList();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    college_name: '',
    logo_url: '',
  });

  const teams = teamList.getAllTeams();

  // Filter teams by search
  const filteredTeams = searchQuery
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.college_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teams;

  const resetForm = () => {
    setFormData({ name: '', college_name: '', logo_url: '' });
    setEditingTeam(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTeam) {
      // UPDATE — uses LinkedList.update() which traverses to find the node
      const success = teamList.updateTeam(editingTeam.id, (team) => ({
        ...team,
        name: formData.name,
        college_name: formData.college_name,
        logo_url: formData.logo_url || undefined,
      }));
      logOperation(
        'insert',
        `Updated team "${formData.name}" (traversed list to find node)`,
        success
      );
    } else {
      // INSERT — uses LinkedList.insert() which traverses to end and adds a new Node
      const newTeam: Team = {
        id: crypto.randomUUID(),
        name: formData.name,
        college_name: formData.college_name,
        logo_url: formData.logo_url || undefined,
        tournament_id: 'default-tournament',
        captain_id: null,
        matches_played: 0,
        matches_won: 0,
        matches_lost: 0,
        net_run_rate: 0,
        points: 0,
        created_at: new Date().toISOString(),
      };
      teamList.addTeam(newTeam);
      logOperation(
        'insert',
        `Inserted team "${newTeam.name}" at END of linked list (O(n) traversal)`,
        true
      );
    }

    refresh();
    resetForm();
  };

  const handleDelete = (team: Team) => {
    const removed = teamList.removeTeam(team.id);
    logOperation(
      'delete',
      `Deleted team "${team.name}" from linked list (traversed to find node, then re-linked previous.next)`,
      !!removed
    );
    refresh();
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      college_name: team.college_name,
      logo_url: team.logo_url || '',
    });
    setShowForm(true);
  };

  return (
    <div className="page-enter app-container py-10" key={version}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-primary-lighter" />
            </div>
            Team Management
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            {teams.length} team{teams.length !== 1 ? 's' : ''} stored in the tournament linked list
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm sm:text-base hover:bg-accent-dark transition-all duration-200 shadow-md shadow-accent/20 hover:shadow-accent/30 self-start md:self-auto min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          Add Team
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search teams by name or college..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter transition-all shadow-xs min-h-[44px]"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface-card rounded-3xl p-6 sm:p-8 shadow-md border border-border-light mb-8 ll-node-enter">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-text-primary">
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </h2>
            <button
              onClick={resetForm}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                Team Name *
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mumbai Strikers"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                College Name *
              </label>
              <input
                required
                type="text"
                value={formData.college_name}
                onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                placeholder="e.g. IIT Mumbai"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter min-h-[44px]"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 focus:border-primary-lighter min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm sm:text-base hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
              >
                <Check className="w-5 h-5" />
                {editingTeam ? 'Save' : 'Add'}
              </button>
            </div>
          </form>

          {/* Data structure explanation */}
          <div className="mt-5 p-4 rounded-xl bg-primary-50/60 border border-primary-100/60">
            <p className="text-xs sm:text-sm text-primary-lighter font-mono leading-relaxed">
              {editingTeam
                ? '⚙ UPDATE: Traversing linked list from HEAD → searching for node with matching ID → updating node.data in place'
                : '⚙ INSERT: Creating new Node(team) → traversing from HEAD to last node → setting lastNode.next = newNode → O(n)'}
            </p>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-surface-card rounded-3xl p-12 shadow-sm border border-border-light text-center">
          {teams.length === 0 ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-8 h-8 text-primary-lighter" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary mb-2">
                Linked List is Empty
              </h3>
              <p className="text-sm text-text-secondary mb-2 font-mono">
                HEAD → NULL
              </p>
              <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
                Add teams to populate the linked list. Each team becomes a Node with data and a next pointer.
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-text-primary mb-1">No Results</h3>
              <p className="text-sm text-text-secondary">
                No teams match "{searchQuery}". Searched through all {teams.length} nodes.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => (
            <div
              key={team.id}
              className="group bg-surface-card rounded-3xl p-6 sm:p-7 shadow-sm border border-border-light hover:shadow-md hover:border-primary-100 transition-all duration-300 flex flex-col justify-between min-h-[260px]"
            >
              <div>
                {/* Node index badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-lighter to-primary-light flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-text-primary">{team.name}</h3>
                      <p className="text-xs sm:text-sm text-text-muted font-medium">{team.college_name}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-lighter text-xs font-mono font-bold">
                    Node[{index}]
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2.5 mb-5">
                  {[
                    { label: 'Played', value: team.matches_played },
                    { label: 'Won', value: team.matches_won, color: 'text-accent' },
                    { label: 'Lost', value: team.matches_lost, color: 'text-live' },
                    { label: 'Points', value: team.points, color: 'text-primary-lighter font-bold' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2.5 rounded-xl bg-surface border border-border-light/60">
                      <p className={`font-mono font-bold text-base ${stat.color || 'text-text-primary'}`}>
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-text-muted font-medium mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Pointer visualization */}
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-4 bg-surface px-3 py-2 rounded-xl border border-border-light/60">
                  <Shield className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>NRR: {team.net_run_rate >= 0 ? '+' : ''}{team.net_run_rate.toFixed(3)}</span>
                  <span className="mx-1 text-text-muted/50">•</span>
                  <span>next →</span>
                  {index < filteredTeams.length - 1 ? (
                    <span className="text-primary-lighter font-semibold truncate">{filteredTeams[index + 1].name}</span>
                  ) : (
                    <span className="text-live font-bold">NULL</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border-light mt-2">
                <span className="text-xs font-mono text-text-muted">
                  ID: {team.id.slice(0, 8)}...
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(team)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-primary-lighter hover:bg-primary-50 transition-colors"
                    title="Edit team"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(team)}
                    className="px-3.5 py-2 rounded-xl text-live hover:bg-red-50 border border-red-200/60 font-semibold text-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
                    title="Delete team from linked list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Linked list structure visualization ribbon */}
      {teams.length > 0 && (
        <div className="mt-8 p-6 rounded-3xl bg-surface-card border border-border-light shadow-sm">
          <h3 className="font-display font-bold text-base text-text-primary mb-4 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-accent" />
            Tournament Team Linked List (HEAD to NULL)
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3">
            <span className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-mono font-bold shrink-0">
              HEAD
            </span>
            <span className="text-text-muted text-xs font-bold">→</span>
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-1.5 shrink-0">
                <span className="px-3.5 py-2 rounded-xl bg-primary-50 border border-primary-100 text-primary-lighter text-xs font-mono font-medium">
                  {team.name}
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
    </div>
  );
}
