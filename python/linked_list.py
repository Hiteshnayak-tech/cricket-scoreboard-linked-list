"""
Custom Singly Linked List Implementation in Python.

Academic Data Structure implementation for Cricket Tournament Scoreboard.
This implementation builds the Linked List from scratch using Node objects
with explicit pointer manipulation (head and next).
"""

from node import Node

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def is_empty(self):
        """Check if the linked list is empty."""
        return self.head is None

    # ============================================================
    # INSERTION OPERATIONS
    # ============================================================

    def insert(self, data):
        """Insert at the tail of the linked list (default insert)."""
        return self.insert_at_tail(data)

    def insert_at_head(self, data):
        """
        Insert a new node at the beginning (HEAD) of the linked list.
        Time Complexity: O(1)
        """
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
        self.size += 1
        return new_node

    def insert_at_tail(self, data):
        """
        Insert a new node at the end (TAIL) of the linked list.
        Time Complexity: O(n)
        """
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

    def insert_at_index(self, index, data):
        """
        Insert a new node at a specific 0-based index.
        Time Complexity: O(n)
        """
        if index < 0 or index > self.size:
            raise IndexError(f"Index {index} out of bounds for LinkedList of size {self.size}")

        if index == 0:
            return self.insert_at_head(data)

        if index == self.size:
            return self.insert_at_tail(data)

        new_node = Node(data)
        current = self.head
        for _ in range(index - 1):
            current = current.next

        new_node.next = current.next
        current.next = new_node
        self.size += 1
        return new_node

    # ============================================================
    # DELETION OPERATIONS
    # ============================================================

    def delete_head(self):
        """
        Delete the head node of the linked list.
        Time Complexity: O(1)
        """
        if self.head is None:
            return None

        deleted_data = self.head.data
        self.head = self.head.next
        self.size -= 1
        return deleted_data

    def delete(self, value=None):
        """
        Delete by matching value or comparator.
        """
        return self.delete_by_value(value)

    def delete_by_value(self, value):
        """
        Delete the first node containing the matching value.
        Handles:
        1. Empty list
        2. Delete head / single node
        3. Delete middle node
        4. Delete tail node
        5. Value not found
        Time Complexity: O(n)
        """
        if self.head is None:
            return None

        # Case 1: Match is at the HEAD (including single-node list)
        if self._matches(self.head.data, value):
            deleted_data = self.head.data
            self.head = self.head.next
            self.size -= 1
            return deleted_data

        # Case 2: Traverse to find node in middle or tail
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

        # Case 3: Value not found
        return None

    def delete_at_index(self, index):
        """
        Delete node at a specific 0-based index.
        Time Complexity: O(n)
        """
        if index < 0 or index >= self.size or self.head is None:
            return None

        if index == 0:
            return self.delete_head()

        prev = self.head
        for _ in range(index - 1):
            prev = prev.next

        target = prev.next
        deleted_data = target.data
        prev.next = target.next
        self.size -= 1
        return deleted_data

    # ============================================================
    # SEARCH OPERATION
    # ============================================================

    def search(self, value):
        """
        Search for a node by value starting from HEAD.
        Returns the data if found, otherwise None.
        Time Complexity: O(n)
        """
        current = self.head
        while current is not None:
            if self._matches(current.data, value):
                return current.data
            current = current.next
        return None

    def search_node(self, value):
        """Returns the actual Node reference if found, else None."""
        current = self.head
        while current is not None:
            if self._matches(current.data, value):
                return current
            current = current.next
        return None

    # ============================================================
    # TRAVERSAL & DISPLAY
    # ============================================================

    def traverse(self, callback=None):
        """
        Traverse the linked list from HEAD to NULL.
        Calls callback(data, index) for each node if provided.
        Returns formatted representation: HEAD -> ... -> NULL
        """
        elements = []
        current = self.head
        index = 0

        while current is not None:
            if callback:
                callback(current.data, index)
            elements.append(str(current.data))
            current = current.next
            index += 1

        if not elements:
            return "HEAD -> NULL"

        return "HEAD -> " + " -> ".join(elements) + " -> NULL"

    def to_list(self):
        """Convert linked list elements to a standard Python list."""
        result = []
        current = self.head
        while current is not None:
            result.append(current.data)
            current = current.next
        return result

    def get_nodes(self):
        """Return list of node info objects for visualizer inspection."""
        nodes = []
        current = self.head
        index = 0
        while current is not None:
            nodes.append({
                "data": current.data,
                "has_next": current.next is not None,
                "index": index
            })
            current = current.next
            index += 1
        return nodes

    def clear(self):
        """Clear all nodes from the linked list."""
        self.head = None
        self.size = 0

    def _matches(self, data, value):
        """Helper to match primitive values, dictionaries, or custom objects."""
        if data == value:
            return True
        if isinstance(data, dict):
            if isinstance(value, str) and data.get("id") == value:
                return True
            if isinstance(value, str) and data.get("name") == value:
                return True
        if hasattr(data, "id") and getattr(data, "id") == value:
            return True
        if hasattr(data, "name") and getattr(data, "name") == value:
            return True
        return False

    def __len__(self):
        return self.size

    def __repr__(self):
        return self.traverse()
