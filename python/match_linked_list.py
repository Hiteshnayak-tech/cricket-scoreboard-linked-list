"""
Match Linked List implementation for Cricket Tournament Management.

Stores and manages match records and history using a custom Singly Linked List:
HEAD → [Match 1] → [Match 2] → [Match 3] → NULL
"""

from linked_list import LinkedList

class Match:
    def __init__(self, match_id, team1_name, team2_name, venue, status="upcoming", result=None):
        self.id = match_id
        self.team1_name = team1_name
        self.team2_name = team2_name
        self.venue = venue
        self.status = status  # upcoming, live, completed
        self.result = result

    def __str__(self):
        return f"{self.team1_name} vs {self.team2_name} ({self.status.upper()})"

    def __repr__(self):
        return f"Match({self.team1_name} vs {self.team2_name}, Status: {self.status})"


class MatchLinkedList:
    def __init__(self):
        self.list = LinkedList()

    def add_match(self, match):
        """Add a match node to the linked list (inserted at head for recent-first order)."""
        if isinstance(match, dict):
            match_obj = Match(
                match_id=match.get("id", ""),
                team1_name=match.get("team1", {}).get("name", "Team 1") if isinstance(match.get("team1"), dict) else str(match.get("team1", "Team 1")),
                team2_name=match.get("team2", {}).get("name", "Team 2") if isinstance(match.get("team2"), dict) else str(match.get("team2", "Team 2")),
                venue=match.get("venue", "Ground"),
                status=match.get("status", "upcoming"),
                result=match.get("result_summary", None)
            )
            return self.list.insert_at_tail(match_obj)
        return self.list.insert_at_tail(match)

    def delete_match(self, match_id):
        """Delete a match record by ID."""
        current = self.list.head
        target = None
        while current is not None:
            m = current.data
            if m.id == match_id:
                target = m
                break
            current = current.next

        if target:
            return self.list.delete_by_value(target)
        return None

    def search_match(self, match_id):
        """Search for a match by ID."""
        current = self.list.head
        while current is not None:
            m = current.data
            if m.id == match_id:
                return m
            current = current.next
        return None

    def display_matches(self):
        """Display the linked list structure."""
        return self.list.traverse()

    def get_all_matches(self):
        """Get all matches as a Python list."""
        return self.list.to_list()

    def get_size(self):
        return self.list.size

    def __len__(self):
        return self.list.size

    def __repr__(self):
        return self.display_matches()
