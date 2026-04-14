#include "MemoryManager.h"
#include <cstdlib>
#include <atomic>
#include <new>

static std::atomic<size_t> GActiveAllocations{0};
static std::atomic<size_t> GTotalBytesAllocated{0};

void MemoryManager::Init() {
    GActiveAllocations.store(0, std::memory_order_relaxed);
    GTotalBytesAllocated.store(0, std::memory_order_relaxed);
}

void MemoryManager::Shutdown() {
    // Report any remaining allocations (potential leaks)
    size_t remaining = GActiveAllocations.load(std::memory_order_relaxed);
    if (remaining > 0) {
        // In production, log this as a warning
    }
}

void* MemoryManager::Allocate(size_t size) {
    if (size == 0) return nullptr;
    void* ptr = std::malloc(size);
    if (!ptr) throw std::bad_alloc();
    GActiveAllocations.fetch_add(1, std::memory_order_relaxed);
    GTotalBytesAllocated.fetch_add(size, std::memory_order_relaxed);
    return ptr;
}

void MemoryManager::Free(void* ptr) {
    if (!ptr) return;
    GActiveAllocations.fetch_sub(1, std::memory_order_relaxed);
    std::free(ptr);
}
