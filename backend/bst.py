class BSTNode:
    def __init__(self, key: str, student_id: str):
        self.key = key  # name or roll number (lowercased for comparison)
        self.student_id = student_id
        self.left = None
        self.right = None


class BST:
    def __init__(self):
        self.root = None

    def insert(self, key: str, student_id: str):
        key_lower = key.lower()
        if not self.root:
            self.root = BSTNode(key_lower, student_id)
        else:
            self._insert(self.root, key_lower, student_id)

    def _insert(self, node: BSTNode, key: str, student_id: str):
        if key < node.key:
            if node.left is None:
                node.left = BSTNode(key, student_id)
            else:
                self._insert(node.left, key, student_id)
        elif key > node.key:
            if node.right is None:
                node.right = BSTNode(key, student_id)
            else:
                self._insert(node.right, key, student_id)
        # Duplicate keys: do nothing (ID-based lookup handles uniqueness)

    def inorder(self) -> list:
        result = []
        self._inorder(self.root, result)
        return result

    def _inorder(self, node: BSTNode, result: list):
        if node:
            self._inorder(node.left, result)
            result.append(node.student_id)
            self._inorder(node.right, result)

    def delete(self, key: str, student_id: str):
        self.root = self._delete(self.root, key.lower(), student_id)

    def _delete(self, node: BSTNode, key: str, student_id: str):
        if node is None:
            return None
        if key < node.key:
            node.left = self._delete(node.left, key, student_id)
        elif key > node.key:
            node.right = self._delete(node.right, key, student_id)
        else:
            if node.student_id == student_id:
                if node.left is None:
                    return node.right
                if node.right is None:
                    return node.left
                # Find inorder successor
                successor = node.right
                while successor.left:
                    successor = successor.left
                node.key = successor.key
                node.student_id = successor.student_id
                node.right = self._delete(node.right, successor.key, successor.student_id)
            else:
                node.right = self._delete(node.right, key, student_id)
        return node
