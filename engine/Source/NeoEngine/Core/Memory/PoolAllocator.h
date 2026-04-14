#pragma once
#include <cstddef>
#include <memory>
#include <vector>

class PoolAllocator {
public:
    PoolAllocator(size_t blockSize, size_t blockCount);
    ~PoolAllocator() = default;
    
    void* Allocate();
    void Free(void* ptr);

private:
    size_t BlockSize;
    std::vector<void*> FreeList;
    // Smart pointer manages the raw memory blocks
    std::vector<std::unique_ptr<char[]>> OwnedBlocks;
};
