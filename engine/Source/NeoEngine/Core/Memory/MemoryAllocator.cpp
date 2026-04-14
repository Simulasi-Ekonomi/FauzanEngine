#include "MemoryAllocator.h"
#include <cstdlib>
#include <new>

void* MemoryAllocator::Allocate(size_t size) {
    if (size == 0) return nullptr;
    void* ptr = std::malloc(size);
    if (!ptr) throw std::bad_alloc();
    return ptr;
}

void MemoryAllocator::Free(void* ptr) {
    if (ptr) std::free(ptr);
}
