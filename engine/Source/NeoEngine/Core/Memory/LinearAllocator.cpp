#include "LinearAllocator.h"

LinearAllocator::LinearAllocator(size_t size) : Capacity(size), Offset(0) {
    Buffer = std::make_unique<char[]>(size);
}

void* LinearAllocator::Allocate(size_t size) {
    // Alignment for CPU stability
    size_t alignedSize = (size + 7) & ~7;
    if (Offset + alignedSize > Capacity) return nullptr;
    
    void* ptr = Buffer.get() + Offset;
    Offset += alignedSize;
    return ptr;
}

void LinearAllocator::Reset() {
    Offset = 0;
}
