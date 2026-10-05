import { useState, useEffect, useRef } from 'react';
import {
  GitBranch,
  Plus,
  Trash2,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Code,
  Terminal,
  Play,
  X,
} from 'lucide-react';
import { useLinkedList } from '../../context/LinkedListContext';
import type { VisualizerDataSource, Team, Player, Match } from '../../types';

type NodeInfo = {
  id: string;
  label: string;
  sublabel: string;
  hasNext: boolean;
  index: number;
  isHighlighted: boolean;
};

export default function LinkedListVisualizer() {
  const {
    teams,
    addTeam,
    deleteTeam,
    playersMap,
    addPlayer,
    deletePlayer,
    matches,
    addMatch,
    deleteMatch,
    operationLog,
    logOperation,
    clearLog,
    version,
  } = useLinkedList();

  const [dataSource, setDataSource] = useState<VisualizerDataSource>('teams');
  const [selectedTeamForPlayers, setSelectedTeamForPlayers] = useState(teams[0]?.id || 'team-1');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traverseIndex, setTraverseIndex] = useState(-1);
  const [searchInput, setSearchInput] = useState('');
  const [insertInput, setInsertInput] = useState('');
  const [insertPosition, setInsertPosition] = useState<'head' | 'tail'>('tail');
  const [activeCodeTab, setActiveCodeTab] = useState<'insert' | 'delete' | 'search' | 'traverse'>('insert');
  const [showTraverseOverlay, setShowTraverseOverlay] = useState(false);
  const [traverseComplete, setTraverseComplete] = useState(false);
  const traverseStripRef = useRef<HTMLDivElement | null>(null);

  // Build nodes from selected data source
  const getNodes = (): NodeInfo[] => {
    switch (dataSource) {
      case 'teams':
        return teams.map((t, idx) => ({
          id: t.id,
          label: t.name,
          sublabel: t.college_name,
          hasNext: idx < teams.length - 1,
          index: idx,
          isHighlighted: idx === highlightedIndex || idx === traverseIndex,
        }));
      case 'players': {
        const pl = playersMap[selectedTeamForPlayers] || [];
        return pl.map((p, idx) => ({
          id: p.id,
          label: p.name,
          sublabel: `#${p.jersey_number} • ${p.role}`,
          hasNext: idx < pl.length - 1,
          index: idx,
          isHighlighted: idx === highlightedIndex || idx === traverseIndex,
        }));
      }
      case 'matches':
        return matches.map((m, idx) => ({
          id: m.id,
          label: `${m.team1?.name || 'Team 1'} vs ${m.team2?.name || 'Team 2'}`,
          sublabel: `${m.status.toUpperCase()} • ${m.venue}`,
          hasNext: idx < matches.length - 1,
          index: idx,
          isHighlighted: idx === highlightedIndex || idx === traverseIndex,
        }));
    }
  };

  const nodes = getNodes();

  // Traverse animation
  const startTraversal = () => {
    if (nodes.length === 0 || isTraversing) return;
    setTraverseComplete(false);
    setShowTraverseOverlay(true);
    setIsTraversing(true);
    setTraverseIndex(0);
    setActiveCodeTab('traverse');
    logOperation(
      'traverse',
      `[Python traverse()] Starting traversal from HEAD (index 0) visiting ${nodes.length} nodes -> NULL`,
      true
    );
  };


  useEffect(() => {
    if (!isTraversing) return;
    if (traverseIndex >= nodes.length) {
      setIsTraversing(false);
      setTraverseIndex(-1);
      setTraverseComplete(true);
      logOperation(
        'traverse',
        `[Python traverse()] Traversal complete — reached NULL after visiting all ${nodes.length} nodes`,
        true
      );
      return;
    }

    const timer = setTimeout(() => {
      setTraverseIndex((i) => i + 1);
    }, 600);

    return () => clearTimeout(timer);
  }, [isTraversing, traverseIndex, nodes.length, logOperation]);

  // Close the full-screen traversal overlay and reset animation state.
  // This never modifies the underlying linked list data.
  const exitTraversalOverlay = () => {
    setShowTraverseOverlay(false);
    setTraverseComplete(false);
    setIsTraversing(false);
    setTraverseIndex(-1);
  };

  // Keep the currently active node horizontally centered inside the
  // full-screen strip (smoothly scrolls instead of letting nodes drift off).
  useEffect(() => {
    if (!showTraverseOverlay) return;
    const strip = traverseStripRef.current;
    if (!strip) return;
    if (traverseComplete || traverseIndex >= nodes.length) {
      strip.scrollTo({ left: strip.scrollWidth, behavior: 'smooth' });
      return;
    }
    const active = strip.querySelector<HTMLElement>('[data-traverse-active="true"]');
    if (active) {
      const left = active.offsetLeft + active.offsetWidth / 2 - strip.clientWidth / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  }, [showTraverseOverlay, traverseComplete, traverseIndex, nodes.length]);

  // While the overlay is open: lock background scroll and allow Escape to exit.
  useEffect(() => {
    if (!showTraverseOverlay) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exitTraversalOverlay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTraverseOverlay]);

  // Search operation
  const handleSearch = () => {
    if (!searchInput.trim()) return;
    const query = searchInput.toLowerCase();
    setActiveCodeTab('search');

    let foundIndex = -1;
    if (dataSource === 'teams') {
      foundIndex = nodes.findIndex(
        (n) => n.label.toLowerCase().includes(query) || n.sublabel.toLowerCase().includes(query)
      );
    } else if (dataSource === 'players') {
      foundIndex = nodes.findIndex((n) => n.label.toLowerCase().includes(query));
    } else {
      foundIndex = nodes.findIndex((n) => n.label.toLowerCase().includes(query));
    }

    if (foundIndex >= 0) {
      setHighlightedIndex(foundIndex);
      logOperation(
        'search',
        `[Python search('${searchInput}')] MATCH FOUND at index ${foundIndex} (traversed ${foundIndex + 1} nodes from HEAD) — O(n)`,
        true
      );
      setTimeout(() => setHighlightedIndex(null), 3500);
    } else {
      logOperation(
        'search',
        `[Python search('${searchInput}')] NOT FOUND — traversed all ${nodes.length} nodes to NULL, returned None — O(n)`,
        false
      );
    }
    setSearchInput('');
  };

  // Insert operation
  const handleInsert = () => {
    if (!insertInput.trim()) return;
    setActiveCodeTab('insert');

    if (dataSource === 'teams') {
      const newTeam: Team = {
        id: crypto.randomUUID(),
        name: insertInput,
        college_name: 'Affiliated College',
        tournament_id: 'champ-2026',
        captain_id: null,
        matches_played: 0,
        matches_won: 0,
        matches_lost: 0,
        net_run_rate: 0,
        points: 0,
        created_at: new Date().toISOString(),
      };

      if (insertPosition === 'head') {
        addTeam(newTeam, 'head');
        logOperation(
          'insert',
          `[Python insert_at_head('${insertInput}')] new_node.next = self.head; self.head = new_node — O(1)`,
          true
        );
      } else {
        addTeam(newTeam);
        logOperation(
          'insert',
          `[Python insert_at_tail('${insertInput}')] Traversed to last node, set current.next = new_node — O(n)`,
          true
        );
      }
    } else if (dataSource === 'players') {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: insertInput,
        role: 'batsman',
        team_id: selectedTeamForPlayers,
        jersey_number: Math.floor(Math.random() * 99) + 1,
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
      addPlayer(newPlayer);
      logOperation(
        'insert',
        `[Python PlayerLinkedList.add_player('${insertInput}')] Created Node(player), appended at tail — O(n)`,
        true
      );
    } else if (dataSource === 'matches') {
      const newMatch: Match = {
        id: crypto.randomUUID(),
        tournament_id: 'champ-2026',
        team1_id: teams[0]?.id || 'team-1',
        team2_id: teams[1]?.id || 'team-2',
        team1: teams[0],
        team2: teams[1],
        venue: insertInput,
        status: 'upcoming',
        current_innings: 1,
        match_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      addMatch(newMatch);
      logOperation(
        'insert',
        `[Python MatchLinkedList.add_match('${insertInput}')] Appended match node at tail — O(n)`,
        true
      );
    }

    setInsertInput('');
  };

  // Delete operation
  const handleDelete = (index: number, label: string) => {
    setActiveCodeTab('delete');
    if (dataSource === 'teams') {
      const team = teams[index];
      if (team) {
        deleteTeam(team.id);
        const positionLabel = index === 0 ? 'HEAD' : index === teams.length - 1 ? 'TAIL' : 'MIDDLE';
        logOperation(
          'delete',
          `[Python delete_by_value('${label}')] Deleted ${positionLabel} node at index ${index} — re-linked prev.next — O(n)`,
          true
        );
      }
    } else if (dataSource === 'players') {
      const pl = playersMap[selectedTeamForPlayers] || [];
      const player = pl[index];
      if (player) {
        deletePlayer(player.id, selectedTeamForPlayers);
        logOperation(
          'delete',
          `[Python PlayerLinkedList.delete_player('${label}')] Removed player node from squad linked list`,
          true
        );
      }
    } else if (dataSource === 'matches') {
      const match = matches[index];
      if (match) {
        deleteMatch(match.id);
        logOperation('delete', `[Python MatchLinkedList.delete_match()] Removed match node from list`, true);
      }
    }
  };

  // Quick action deletions
  const handleDeleteHead = () => {
    if (nodes.length === 0) return;
    handleDelete(0, nodes[0].label);
  };

  const handleDeleteTail = () => {
    if (nodes.length === 0) return;
    handleDelete(nodes.length - 1, nodes[nodes.length - 1].label);
  };

  const pythonCodeSnippets = {
    insert: `# python/linked_list.py
def insert_at_tail(self, data):
    new_node = Node(data)
    if self.head is None:
        self.head = new_node
    else:
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node
    self.size += 1
    return new_node

def insert_at_head(self, data):
    new_node = Node(data)
    new_node.next = self.head
    self.head = new_node
    self.size += 1
    return new_node`,
    delete: `# python/linked_list.py
def delete_by_value(self, value):
    if self.head is None:
        return None
    # Case 1: Match at HEAD
    if self._matches(self.head.data, value):
        deleted_data = self.head.data
        self.head = self.head.next
        self.size -= 1
        return deleted_data
    # Case 2: Middle or Tail
    prev = self.head
    current = self.head.next
    while current is not None:
        if self._matches(current.data, value):
            deleted_data = current.data
            prev.next = current.next
            self.size -= 1
            return deleted_data
        prev = current
        current = current.next
    return None`,
    search: `# python/linked_list.py
def search(self, value):
    current = self.head
    while current is not None:
        if self._matches(current.data, value):
            return current.data  # FOUND
        current = current.next
    return None  # NOT FOUND (O(n))`,
    traverse: `# python/linked_list.py
def traverse(self):
    elements = []
    current = self.head
    while current is not None:
        elements.append(str(current.data))
        current = current.next
    if not elements:
        return "HEAD -> NULL"
    return "HEAD -> " + " -> ".join(elements) + " -> NULL"`,
  };

  return (
    <div className="page-enter app-container py-10" key={version}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-lighter text-xs font-semibold uppercase tracking-wider mb-3">
              <Terminal className="w-3.5 h-3.5" />
              PYTHON DATA STRUCTURE ARCHITECTURE
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-lighter to-accent flex items-center justify-center shadow-md shadow-accent/20">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              Linked List Visualizer
            </h1>
            <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-2xl">
              Interactive visualizer demonstrating the academic Python Linked List implementation (
              <code className="font-mono text-xs bg-surface px-2 py-0.5 rounded border border-border">
                python/linked_list.py
              </code>
              ).
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-accent text-sm font-semibold flex items-center gap-2 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              Active Nodes: {nodes.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-8 items-start">
        {/* ============================================================
            LEFT COLUMN: Visual Chain Canvas & Controls
            ============================================================ */}
        <div className="space-y-8 min-w-0">
          {/* Data Source Selector */}
          <div className="bg-surface-card rounded-3xl p-6 border border-border-light shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-text-muted" />
                  <span className="text-sm font-bold text-text-primary">Data Source:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'teams', label: 'Teams List' },
                      { id: 'players', label: 'Squad Players' },
                      { id: 'matches', label: 'Match History' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setDataSource(tab.id);
                        setHighlightedIndex(null);
                        setTraverseIndex(-1);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
                        dataSource === tab.id
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-border-light'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {dataSource === 'players' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-medium">Team:</span>
                  <select
                    value={selectedTeamForPlayers}
                    onChange={(e) => setSelectedTeamForPlayers(e.target.value)}
                    className="text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-surface border border-border text-text-primary focus:outline-none min-h-[40px]"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Node Linked List Visual Canvas */}
          <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-border-light shadow-sm min-h-[280px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-lighter text-xs font-mono font-bold">
                  HEAD pointer
                </span>
                <span className="text-xs sm:text-sm text-text-muted font-mono font-semibold">self.size = {nodes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startTraversal}
                  disabled={isTraversing || nodes.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-lighter text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  <Play className="w-4 h-4" />
                  {isTraversing ? 'Traversing...' : 'Animate Traverse'}
                </button>
              </div>
            </div>

            {/* Visual Linked Chain */}
            {nodes.length === 0 ? (
              <div className="py-14 text-center text-text-muted font-mono">
                <span className="px-4 py-2 rounded-xl bg-red-50 text-live text-sm font-bold inline-block">
                  HEAD → NULL (Empty List)
                </span>
                <p className="text-xs sm:text-sm text-text-muted mt-3">Use the controls below to insert nodes.</p>
              </div>
            ) : (
              <div className="py-6 overflow-x-auto pb-4 w-full">
                <div className="flex items-center gap-3 min-w-max">
                  {/* HEAD marker */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-4 py-2.5 rounded-2xl bg-primary text-white font-mono text-xs font-bold shadow-sm">
                      HEAD
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted shrink-0" />
                  </div>

                  {/* Nodes */}
                  {nodes.map((node) => (
                    <div key={node.id} className="flex items-center gap-3 shrink-0 group">
                      {/* Node Box */}
                      <div
                        className={`relative rounded-2xl p-5 border transition-all duration-300 min-w-[190px] ${
                          node.isHighlighted
                            ? 'bg-amber-50 border-warm shadow-lg scale-105 ring-2 ring-warm/50'
                            : 'bg-surface border-border-light hover:border-accent/40 shadow-sm'
                        }`}
                      >
                        {/* Node header */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-text-secondary border border-border-light font-semibold">
                            Node[{node.index}]
                          </span>
                          <button
                            onClick={() => handleDelete(node.index, node.label)}
                            title="Delete Node"
                            className="text-text-muted hover:text-live transition-colors p-1 rounded-lg hover:bg-red-50 w-7 h-7 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Node Data */}
                        <p className="font-display font-bold text-base text-text-primary truncate">
                          {node.label}
                        </p>
                        <p className="text-xs text-text-muted truncate mt-1 font-medium">{node.sublabel}</p>

                        {/* Pointer indicator */}
                        <div className="mt-4 pt-2.5 border-t border-border-light/60 flex items-center justify-between text-xs font-mono text-text-muted">
                          <span>next:</span>
                          <span className={node.hasNext ? 'text-primary-lighter font-bold' : 'text-live font-bold'}>
                            {node.hasNext ? `&Node[${node.index + 1}]` : 'NULL'}
                          </span>
                        </div>
                      </div>

                      {/* Next Pointer Arrow */}
                      <div className="flex items-center shrink-0">
                        <ArrowRight className={`w-5 h-5 ${node.isHighlighted ? 'text-warm font-bold' : 'text-text-muted'}`} />
                      </div>
                    </div>
                  ))}

                  {/* NULL terminator */}
                  <div className="px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-live font-mono text-xs font-bold shrink-0">
                    NULL
                  </div>
                </div>
              </div>
            )}

            {/* Visualizer Quick Deletion Bar */}
            <div className="pt-5 mt-4 border-t border-border-light flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs sm:text-sm text-text-secondary font-semibold">Quick Node Deletions:</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDeleteHead}
                  disabled={nodes.length === 0}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-live text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 min-h-[36px]"
                >
                  Delete Head (O(1))
                </button>
                <button
                  onClick={handleDeleteTail}
                  disabled={nodes.length === 0}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-live text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 min-h-[36px]"
                >
                  Delete Tail (O(n))
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Controls (Insert & Search) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Insert Box */}
            <div className="bg-surface-card rounded-3xl p-6 border border-border-light shadow-sm">
              <h3 className="font-display font-bold text-base text-text-primary mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Insert Node
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter name (e.g. Pune Strikers)..."
                  value={insertInput}
                  onChange={(e) => setInsertInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[44px]"
                />
                <div className="flex items-center gap-2.5">
                  <select
                    value={insertPosition}
                    onChange={(e) => setInsertPosition(e.target.value as any)}
                    className="text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl bg-surface border border-border text-text-primary focus:outline-none min-h-[42px]"
                  >
                    <option value="tail">Insert at Tail - O(n)</option>
                    <option value="head">Insert at Head - O(1)</option>
                  </select>
                  <button
                    onClick={handleInsert}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[42px]"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Node
                  </button>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="bg-surface-card rounded-3xl p-6 border border-border-light shadow-sm">
              <h3 className="font-display font-bold text-base text-text-primary mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-lighter" />
                Search Node (O(n))
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search node by name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-lighter/30 min-h-[44px]"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[42px]"
                >
                  <Search className="w-4 h-4" />
                  Search from HEAD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN: Academic Python Code & Operation Logs
            ============================================================ */}
        <div className="space-y-8 min-w-0">
          {/* Python Code Reference for Viva */}
          <div className="bg-surface-card rounded-3xl p-6 border border-border-light shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-text-primary flex items-center gap-2">
                <Code className="w-5 h-5 text-accent" />
                Python Implementation
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-surface text-text-muted border border-border truncate">
                python/linked_list.py
              </span>
            </div>

            {/* Code Tabs */}
            <div className="flex gap-2 mb-4 border-b border-border-light pb-3 overflow-x-auto">
              {(['insert', 'delete', 'search', 'traverse'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold capitalize transition-all shrink-0 min-h-[36px] ${
                    activeCodeTab === tab
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Python Code Snippet View */}
            <pre className="p-4 rounded-2xl bg-surface-dark text-text-inverse font-mono text-xs leading-relaxed overflow-x-auto max-h-60 shadow-inner">
              <code>{pythonCodeSnippets[activeCodeTab]}</code>
            </pre>
            <p className="text-xs text-text-muted mt-3">
              Academic Linked List code in <code className="font-mono text-accent">python/linked_list.py</code>.
            </p>
          </div>

          {/* Operation History / Trace Log */}
          <div className="bg-surface-card rounded-3xl p-6 border border-border-light shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-text-primary flex items-center gap-2">
                <Clock className="w-5 h-5 text-text-secondary" />
                Operation Trace Log
              </h3>
              {operationLog.length > 0 && (
                <button
                  onClick={clearLog}
                  className="text-xs font-semibold text-text-muted hover:text-live px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors min-h-[32px] inline-flex items-center"
                >
                  Clear Log
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {operationLog.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">No operations recorded yet.</p>
              ) : (
                operationLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-surface border border-border-light text-xs font-mono flex items-start gap-2.5"
                  >
                    {log.success ? (
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary break-words leading-relaxed">{log.detail}</p>
                      <span className="text-[10px] text-text-muted font-medium mt-0.5 block">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          FULL-SCREEN ANIMATE TRAVERSE MODE
          A dedicated visualization mode — the underlying list is untouched.
          ============================================================ */}
      {showTraverseOverlay && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#0b1224]/95 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen linked list traversal"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_55%)]" />

          {/* Overlay header */}
          <header className="relative z-10 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-white/10">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <Play className="w-5 h-5 text-accent shrink-0" />
                <h2 className="font-display font-bold text-lg sm:text-xl text-white truncate">
                  Animate Traverse
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest bg-accent/15 text-accent border border-accent/30 shrink-0">
                  {dataSource} list
                </span>
              </div>
              <p className="text-[11px] text-white/45 font-mono mt-1 truncate">
                python/linked_list.py &rarr; traverse() &mdash; visualization mode only
              </p>
            </div>
            <button
              onClick={exitTraversalOverlay}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-semibold transition-colors min-h-[40px] shrink-0"
            >
              <X className="w-4 h-4" />
              {traverseComplete ? 'Close' : 'Exit Traversal'}
            </button>
          </header>

          {/* Live traversal info + progress */}
          <div className="relative z-10 px-5 sm:px-8 pt-5">
            <div
              className={`mx-auto max-w-4xl rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors duration-500 ${
                traverseComplete ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex-1 min-w-0">
                {traverseComplete ? (
                  <>
                    <p className="flex items-center gap-2 text-accent font-display font-bold text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      Traversal complete
                    </p>
                    <p className="text-xs text-white/60 font-mono mt-1">
                      Visited all {nodes.length} nodes from HEAD &rarr; NULL &middot; linked list
                      state preserved
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
                      Step {Math.min(traverseIndex + 1, nodes.length)} of {nodes.length}
                    </p>
                    <p className="text-white font-semibold text-sm sm:text-base truncate mt-0.5">
                      Visiting{' '}
                      <span className="font-mono text-accent">
                        Node[{Math.max(traverseIndex, 0)}]
                      </span>
                      {nodes[traverseIndex] && (
                        <span className="text-white/70"> &mdash; "{nodes[traverseIndex].label}"</span>
                      )}
                    </p>
                    <p className="text-xs text-white/50 font-mono truncate mt-0.5">
                      {nodes[traverseIndex]?.hasNext
                        ? `next → ${nodes[traverseIndex + 1]?.label ?? 'NULL'}`
                        : 'next → NULL (end of list)'}
                    </p>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-56 shrink-0">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1.5">
                  <span>{traverseComplete ? 'DONE' : 'TRAVERSING'}</span>
                  <span>
                    {Math.min(traverseComplete ? nodes.length : traverseIndex + 1, nodes.length)}/
                    {nodes.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        ((traverseComplete
                          ? nodes.length
                          : Math.min(traverseIndex + 1, nodes.length)) /
                          Math.max(nodes.length, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full-width centered linked list strip */}
          <main className="relative z-10 flex-1 min-h-0 flex items-center">
            <div
              ref={traverseStripRef}
              className="traverse-strip relative w-full overflow-x-auto overflow-y-hidden scroll-smooth"
            >
              <div className="flex items-center w-max px-[50vw] py-6">
                {nodes.map((node, idx) => {
                  const isActive = !traverseComplete && idx === traverseIndex;
                  const isVisited = traverseComplete || idx < traverseIndex;
                  const linkTraversed = traverseComplete || idx <= traverseIndex;
                  return (
                    <div
                      key={node.id}
                      className={`flex items-center shrink-0 ${idx > 0 ? 'ml-4 sm:ml-6' : ''}`}
                    >
                      {/* Incoming pointer from previous node */}
                      {idx > 0 && (
                        <div className="flex items-center mr-4 sm:mr-6 shrink-0">
                          <span
                            className={`h-[3px] w-6 sm:w-10 rounded-full transition-colors duration-300 ${
                              linkTraversed ? 'bg-accent' : 'bg-white/20'
                            }`}
                          />
                          <ArrowRight
                            className={`w-4 h-4 -ml-1.5 transition-colors duration-300 ${
                              linkTraversed ? 'text-accent' : 'text-white/35'
                            }`}
                          />
                        </div>
                      )}

                      {/* Node card */}
                      <div
                        data-traverse-active={isActive ? 'true' : undefined}
                        className={`relative w-[180px] sm:w-[210px] rounded-2xl border-2 px-4 py-4 text-center backdrop-blur-sm transition-all duration-500 ease-out ${
                          isActive
                            ? 'border-accent bg-accent/15 scale-110 z-10 traverse-node-active'
                            : isVisited
                              ? 'border-accent/50 bg-accent/10'
                              : 'border-white/15 bg-white/5 opacity-70'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-accent text-white text-[9px] font-mono font-bold uppercase tracking-widest shadow-lg shadow-accent/40 whitespace-nowrap">
                            Visiting
                          </span>
                        )}
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                              isVisited && !isActive
                                ? 'bg-white/10 border-accent/40 text-accent'
                                : 'bg-white/10 border-white/20 text-white/70'
                            }`}
                          >
                            Node[{idx}]
                          </span>
                          {isVisited && !isActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                          )}
                        </div>
                        <p
                          className={`font-display font-bold text-sm sm:text-base truncate ${
                            isActive ? 'text-white' : 'text-white/90'
                          }`}
                        >
                          {node.label}
                        </p>
                        <p className="text-[11px] text-white/50 truncate mt-1">{node.sublabel}</p>
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-center text-[11px] font-mono">
                          {node.hasNext ? (
                            <span
                              className={linkTraversed ? 'text-accent font-bold' : 'text-white/45'}
                            >
                              &rarr; next
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold">&rarr; NULL</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Trailing pointer + NULL terminator */}
                <div className="flex items-center shrink-0 ml-4 sm:ml-6">
                  <div className="flex items-center mr-4 sm:mr-6">
                    <span
                      className={`h-[3px] w-6 sm:w-10 rounded-full transition-colors duration-300 ${
                        traverseComplete ? 'bg-accent' : 'bg-white/20'
                      }`}
                    />
                    <ArrowRight
                      className={`w-4 h-4 -ml-1.5 ${
                        traverseComplete ? 'text-accent' : 'text-white/35'
                      }`}
                    />
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl border font-mono text-xs font-bold shrink-0 transition-colors duration-500 ${
                      traverseComplete
                        ? 'bg-red-500/15 border-red-400/50 text-red-300'
                        : 'bg-white/5 border-white/15 text-white/50'
                    }`}
                  >
                    NULL
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer with clear exit action */}
          <footer className="relative z-10 px-5 sm:px-8 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] font-mono text-white/40 text-center sm:text-left">
              {traverseComplete
                ? 'Traversal finished — closing returns to the Visualizer with the list unchanged.'
                : 'Animation only — Python traverse() logic and list data are untouched. Press Esc to exit.'}
            </p>
            <button
              onClick={exitTraversalOverlay}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-bold transition-colors min-h-[42px] shadow-lg shadow-accent/30"
            >
              <X className="w-4 h-4" />
              {traverseComplete ? 'Close & Return to Visualizer' : 'Exit Traversal'}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
