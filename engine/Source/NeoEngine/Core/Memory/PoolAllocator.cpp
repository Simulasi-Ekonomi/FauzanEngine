#include "PoolAllocator.h"

PoolAllocator::PoolAllocator(size_t blockSize, size_t blockCount) : BlockSize(blockSize) {
    OwnedBlocks.reserve(blockCount);
    FreeList.reserve(blockCount);
    for (size_t i = 0; i < blockCount; ++i) {
        auto block = std::make_unique<char[]>(blockSize);
        FreeList.push_back(block.get());
        OwnedBlocks.push_back(std::move(block));
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
