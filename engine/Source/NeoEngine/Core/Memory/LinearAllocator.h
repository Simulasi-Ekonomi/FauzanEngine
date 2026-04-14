#pragma once
#include <cstddef>
#include <memory>

class LinearAllocator {
public:
    LinearAllocator(size_t size);
    ~LinearAllocator() = default;
    
    void* Allocate(size_t size);
    void Reset();

private:
    std::unique_ptr<char[]> Buffer;
    size_t Capacity;
    size_t Offset;
};
