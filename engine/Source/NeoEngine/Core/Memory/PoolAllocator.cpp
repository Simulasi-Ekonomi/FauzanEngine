#include "PoolAllocator.h"
#include <cstdlib>

PoolAllocator::PoolAllocator(size_t blockSize, size_t blockCount) : BlockSize(blockSize) {
    for (size_t i = 0; i < blockCount; ++i) {
        void* ptr = std::malloc(blockSize);
        FreeList.push_back(ptr);
        RawBlocks.push_back(ptr);
    }
}

PoolAllocator::~PoolAllocator() {
    for (void* ptr : RawBlocks) {
        if (ptr) std::free(ptr);
    }
}

void* PoolAllocator::Allocate() {
    if (FreeList.empty()) return nullptr;
    void* ptr = FreeList.back();
    FreeList.pop_back();
    return ptr;
}

void PoolAllocator::Free(void* ptr) {
    if (ptr) FreeList.push_back(ptr);
}
