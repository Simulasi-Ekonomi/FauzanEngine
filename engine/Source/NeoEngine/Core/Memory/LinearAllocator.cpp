#include "LinearAllocator.h"
#include <cstdlib>

LinearAllocator::LinearAllocator(size_t size) : Capacity(size), Offset(0) {
    Buffer = (char*)std::malloc(size);
}

LinearAllocator::~LinearAllocator() {
    if (Buffer) std::free(Buffer);
}

void* LinearAllocator::Allocate(size_t size) {
    // Alignment sederhana untuk stabilitas CPU
    size_t alignedSize = (size + 7) & ~7;
    if (Offset + alignedSize > Capacity) return nullptr;
    
    void* ptr = Buffer + Offset;
    Offset += alignedSize;
    return ptr;
}

void LinearAllocator::Reset() {
    Offset = 0;
}
