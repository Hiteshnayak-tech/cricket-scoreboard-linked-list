"""
Player Linked List implementation for Cricket Tournament Management.

Manages players belonging to a team using a custom Singly Linked List:
HEAD → [Rahul Sharma] → [Aarav Patel] → [Rohit Deshmukh] → [Amit Verma] → NULL
"""

from linked_list import LinkedList

class Player:
    def __init__(self, player_id, name, role, team_id, jersey_number=0, runs=0, wickets=0):
        self.id = player_id
        self.name = name
        self.role = role  # batsman, bowler, allrounder, wicketkeeper
        self.team_id = team_id
        self.jersey_number = jersey_number
        self.total_runs = runs
        self.total_wickets = wickets

    def __str__(self):
        return f"{self.name} (#{self.jersey_number})"

    def __repr__(self):
        return f"Player({self.name}, #{self.jersey_number}, {self.role})"


class PlayerLinkedList:
    def __init__(self, team_id=""):
        self.team_id = team_id
        self.list = LinkedList()

    def add_player(self, player):
        """Add a player node to the linked list."""
        if isinstance(player, dict):
            player_obj = Player(
                player_id=player.get("id", ""),
                name=player.get("name", ""),
                role=player.get("role", "batsman"),
                team_id=player.get("team_id", self.team_id),
                jersey_number=player.get("jersey_number", 0),
                runs=player.get("total_runs", 0),
                wickets=player.get("total_wickets", 0)
            )
            return self.list.insert_at_tail(player_obj)
        return self.list.insert_at_tail(player)

    def delete_player(self, player_identifier):
        """Delete a player by ID or Name."""
        current = self.list.head
        target = None
        while current is not None:
            p = current.data
            if p.id == player_identifier or p.name.lower() == str(player_identifier).lower():
                target = p
                break
            current = current.next

        if target:
            return self.list.delete_by_value(target)
        return None

    def search_player(self, player_identifier):
        """Search for a player by ID or Name."""
        current = self.list.head
        while current is not None:
            p = current.data
            if p.id == player_identifier or p.name.lower() == str(player_identifier).lower():
                return p
            current = current.next
        return None

    def display_players(self):
        """Display the linked list structure."""
        return self.list.traverse()

    def get_all_players(self):
        """Get all players as a Python list."""
        return self.list.to_list()

    def get_size(self):
        return self.list.size

    def __len__(self):
        return self.list.size

    def __repr__(self):
        return self.display_players()
