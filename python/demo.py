"""
================================================================================
CRICKET TOURNAMENT SCOREBOARD AND MANAGEMENT SYSTEM USING LINKED LIST
ACADEMIC DATA STRUCTURE DEMONSTRATION & VIVA SCRIPT (PYTHON)
================================================================================

Demonstrates:
1. Custom Node creation (data, next)
2. Generic Singly Linked List operations:
   - Insert at Head: O(1)
   - Insert at Tail: O(n)
   - Insert at Index: O(n)
   - Search by value: O(n)
   - Delete Head: O(1)
   - Delete Middle node: O(n)
   - Delete Tail node: O(n)
   - Delete single/only node
   - Traversal from HEAD to NULL
3. Specialized Linked Lists:
   - TeamLinkedList
   - PlayerLinkedList
   - MatchLinkedList
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from node import Node
from linked_list import LinkedList
from team_linked_list import TeamLinkedList, Team
from player_linked_list import PlayerLinkedList, Player
from match_linked_list import MatchLinkedList, Match

def separator(title=""):
    print("\n" + "=" * 70)
    if title:
        print(f"  {title}")
        print("=" * 70)

def main():
    separator("1. GENERIC LINKED LIST DEMONSTRATION")

    # Step 1: Create an empty Linked List
    ll = LinkedList()
    print("Created empty Linked List:")
    print(f"State: {ll.traverse()} | Size: {ll.size}")

    # Step 2: Insert Nodes (Tail & Head)
    print("\n--- [INSERT OPERATIONS] ---")
    print("Inserting 'Pune' at Tail...")
    ll.insert_at_tail("Pune")
    print(f"State: {ll.traverse()} | Size: {ll.size}")

    print("\nInserting 'Mumbai' at Head (O(1))...")
    ll.insert_at_head("Mumbai")
    print(f"State: {ll.traverse()} | Size: {ll.size}")

    print("\nInserting 'Delhi' at Tail (O(n))...")
    ll.insert_at_tail("Delhi")
    print(f"State: {ll.traverse()} | Size: {ll.size}")

    print("\nInserting 'Bangalore' at Index 2...")
    ll.insert_at_index(2, "Bangalore")
    print(f"State: {ll.traverse()} | Size: {ll.size}")

    # Step 3: Search Node
    print("\n--- [SEARCH OPERATION - O(n)] ---")
    search_target = "Pune"
    print(f"Searching for '{search_target}' starting from HEAD...")
    found = ll.search(search_target)
    if found:
        print(f"Result: FOUND -> Node with data = '{found}'")
    else:
        print(f"Result: NOT FOUND")

    print("\nSearching for 'Chennai' (not in list)...")
    not_found = ll.search("Chennai")
    print(f"Result: {'FOUND' if not_found else 'NOT FOUND (Returned None)'}")

    # Step 4: Deletion Operations
    print("\n--- [DELETE OPERATIONS] ---")
    print(f"Current List: {ll.traverse()} | Size: {ll.size}")

    # Case A: Delete Middle Node (Bangalore)
    print("\n1. Delete Middle Node ('Bangalore'):")
    deleted = ll.delete_by_value("Bangalore")
    print(f"Deleted Node Data: '{deleted}'")
    print(f"After Deletion: {ll.traverse()} | Size: {ll.size}")

    # Case B: Delete Middle Node (Pune)
    print("\n2. Delete Middle Node ('Pune'):")
    deleted = ll.delete_by_value("Pune")
    print(f"Deleted Node Data: '{deleted}'")
    print(f"After Deletion: {ll.traverse()} | Size: {ll.size}")

    # Case C: Delete Head Node (Mumbai)
    print("\n3. Delete Head Node ('Mumbai'):")
    deleted = ll.delete_head()
    print(f"Deleted Node Data: '{deleted}'")
    print(f"After Deletion: {ll.traverse()} | Size: {ll.size}")

    # Case D: Delete Only / Last Remaining Node (Delhi)
    print("\n4. Delete Only Node ('Delhi'):")
    deleted = ll.delete_by_value("Delhi")
    print(f"Deleted Node Data: '{deleted}'")
    print(f"Final List: {ll.traverse()} | Size: {ll.size}")

    # Case E: Delete from Empty List
    print("\n5. Attempt Delete from Empty List:")
    deleted = ll.delete_by_value("NonExistent")
    print(f"Result: {deleted} (Safely handled empty list)")

    separator("2. TEAM LINKED LIST (TOURNAMENT DOMAIN)")
    team_list = TeamLinkedList()
    team_list.add_team(Team("t1", "Mumbai College", "IIT Bombay", points=8, nrr=1.25))
    team_list.add_team(Team("t2", "Pune College", "COEP Tech Pune", points=6, nrr=0.68))
    team_list.add_team(Team("t3", "Delhi College", "DTU Delhi", points=6, nrr=0.42))
    team_list.add_team(Team("t4", "Bangalore College", "IISc Bangalore", points=4, nrr=-0.15))

    print("Initial Teams Linked List:")
    print(team_list.display_teams())
    print(f"Total Teams: {team_list.get_size()}")

    print("\nDeleting Team 'Pune College' from Linked List...")
    team_list.delete_team("Pune College")
    print(f"Updated Teams List: {team_list.display_teams()}")
    print(f"Total Teams: {team_list.get_size()}")

    separator("3. PLAYER LINKED LIST (SQUAD DOMAIN)")
    player_list = PlayerLinkedList(team_id="t1")
    player_list.add_player(Player("p1", "Rahul Sharma", "batsman", "t1", jersey_number=7, runs=342))
    player_list.add_player(Player("p2", "Aarav Patel", "allrounder", "t1", jersey_number=18, runs=185, wickets=8))
    player_list.add_player(Player("p3", "Rohit Deshmukh", "batsman", "t1", jersey_number=45, runs=210))
    player_list.add_player(Player("p4", "Amit Verma", "wicketkeeper", "t1", jersey_number=1, runs=145))

    print("Initial Squad Linked List (Mumbai College):")
    print(player_list.display_players())
    print(f"Total Players: {player_list.get_size()}")

    print("\nSearching player with jersey #18 ('Aarav Patel')...")
    found_p = player_list.search_player("Aarav Patel")
    print(f"Found: {found_p}")

    print("\nDeleting Player 'Rohit Deshmukh' from Linked List...")
    player_list.delete_player("Rohit Deshmukh")
    print(f"Updated Squad List: {player_list.display_players()}")
    print(f"Total Players: {player_list.get_size()}")

    separator("4. MATCH LINKED LIST (FIXTURES / RESULTS DOMAIN)")
    match_list = MatchLinkedList()
    match_list.add_match(Match("m1", "Mumbai College", "Pune College", "Wankhede Stadium", "completed", "Mumbai won by 7 runs"))
    match_list.add_match(Match("m2", "Bangalore College", "Delhi College", "Chinnaswamy Stadium", "completed", "Bangalore won by 5 wickets"))
    match_list.add_match(Match("m3", "Chennai College", "Hyderabad College", "Chepauk Stadium", "upcoming"))

    print("Match History Linked List:")
    print(match_list.display_matches())
    print(f"Total Matches: {match_list.get_size()}")

    separator("VIVA SUMMARY")
    print("[OK] All Linked List operations (Insert, Delete, Search, Traverse) implemented in Python.")
    print("[OK] Explicit Node pointer manipulation: head, next, size.")
    print("[OK] O(1) Head insertion/deletion and O(n) Tail/Middle operations.")
    print("[OK] Clean separation: Python Data Structures for academic viva + React/Node for Full-Stack App.")
    separator()

if __name__ == "__main__":
    main()
