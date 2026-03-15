class HashMap:
    def __init__(self, initial_capacity=16):
        self.capacity = initial_capacity
        self.size = 0
        self.load_factor = 0.75
        self.buckets = [[] for _ in range(self.capacity)]

    def _hash(self, key: str) -> int:
        hash_val = 0
        for char in key:
            hash_val = (hash_val * 31 + ord(char)) % self.capacity
        return hash_val

    def _resize(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        for bucket in old_buckets:
            for key, value in bucket:
                self.put(key, value)

    def put(self, key: str, value: dict):
        if self.size / self.capacity >= self.load_factor:
            self._resize()
        index = self._hash(key)
        bucket = self.buckets[index]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1

    def get(self, key: str):
        index = self._hash(key)
        bucket = self.buckets[index]
        for k, v in bucket:
            if k == key:
                return v
        return None

    def delete(self, key: str) -> bool:
        index = self._hash(key)
        bucket = self.buckets[index]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        return False

    def get_all(self) -> list:
        all_records = []
        for bucket in self.buckets:
            for key, value in bucket:
                all_records.append(value)
        return all_records

    def exists(self, key: str) -> bool:
        return self.get(key) is not None
