"""
Team Linked List implementation for Cricket Tournament Management.

Manages college cricket teams using a custom Singly Linked List:
HEAD → [Mumbai College] → [Pune College] → [Delhi College] → NULL
"""

from linked_list import LinkedList

class Team:
    def __init__(self, team_id, name, college_name, points=0, nrr=0.0):
        self.id = team_id
        self.name = name
        self.college_name = college_name
        self.points = points
        self.net_run_rate = nrr
        self.matches_played = 0
        self.matches_won = 0
        self.matches_lost = 0

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Team({self.name}, {self.college_name}, Pts: {self.points})"


class TeamLinkedList:
    def __init__(self):
        self.list = LinkedList()

    def add_team(self, team):
        """Add a team node to the linked list."""
        if isinstance(team, dict):
            team_obj = Team(
                team_id=team.get("id", ""),
                name=team.get("name", ""),
                college_name=team.get("college_name", ""),
                points=team.get("points", 0),
                nrr=team.get("net_run_rate", 0.0)
            )
            return self.list.insert_at_tail(team_obj)
        return self.list.insert_at_tail(team)

    def delete_team(self, team_identifier):
        """Delete a team by ID or Name."""
        # Find matching team in linked list
        current = self.list.head
        target = None
        while current is not None:
            team = current.data
            if team.id == team_identifier or team.name.lower() == team_identifier.lower():
                target = team
                break
            current = current.next

        if target:
            return self.list.delete_by_value(target)
        return None

    def search_team(self, team_identifier):
        """Search for a team by ID or Name."""
        current = self.list.head
        while current is not None:
            team = current.data
            if team.id == team_identifier or team.name.lower() == team_identifier.lower():
                return team
            current = current.next
        return None

    def display_teams(self):
        """Display the linked list structure."""
        return self.list.traverse()

    def get_all_teams(self):
        """Get all teams as a Python list."""
        return self.list.to_list()

    def get_size(self):
        return self.list.size

    def __len__(self):
        return self.list.size

    def __repr__(self):
        return self.display_teams()
