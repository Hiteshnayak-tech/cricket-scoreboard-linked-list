"""
Node implementation for the Cricket Tournament Scoreboard Linked List.

Each Node contains:
- data: The stored element (Team, Player, Match, or generic value)
- next: Reference (pointer) to the next Node in the list (or None for tail)
"""

class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

    def __repr__(self):
        return f"Node({self.data})"
