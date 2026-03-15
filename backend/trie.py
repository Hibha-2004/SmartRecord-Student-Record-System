class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
        self.student_ids = []  # Store IDs of students whose names pass through this node


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, name: str, student_id: str):
        name_lower = name.lower()
        node = self.root
        for char in name_lower:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
            if student_id not in node.student_ids:
                node.student_ids.append(student_id)
        node.is_end = True

    def search_prefix(self, prefix: str) -> list:
        prefix_lower = prefix.lower()
        node = self.root
        for char in prefix_lower:
            if char not in node.children:
                return []
            node = node.children[char]
        return node.student_ids

    def delete(self, name: str, student_id: str):
        name_lower = name.lower()
        node = self.root

        def _delete(node, name, student_id, depth):
            if depth == len(name):
                if student_id in node.student_ids:
                    node.student_ids.remove(student_id)
                node.is_end = False
                return len(node.children) == 0 and not node.student_ids

            char = name[depth]
            if char not in node.children:
                return False

            should_delete_child = _delete(node.children[char], name, student_id, depth + 1)

            if should_delete_child:
                del node.children[char]
                if student_id in node.student_ids:
                    node.student_ids.remove(student_id)
                return len(node.children) == 0 and not node.student_ids

            if student_id in node.student_ids:
                node.student_ids.remove(student_id)
            return False

        _delete(node, name_lower, student_id, 0)
