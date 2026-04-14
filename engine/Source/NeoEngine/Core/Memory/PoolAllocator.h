#pragma once
#include <vector>
#include <cstddef>

class PoolAllocator {
public:
    PoolAllocator(size_t blockSize, size_t blockCount);
    ~PoolAllocator();
    
    void* Allocate();
    void Free(void* ptr);

private:
    size_t BlockSize;
    std::vector<void*> FreeList;
    std::vector<void*> RawBlocks; // Untuk tracking pembersihan
};
