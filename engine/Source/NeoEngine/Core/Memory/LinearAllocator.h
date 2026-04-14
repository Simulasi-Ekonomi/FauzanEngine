#pragma once
#include <cstddef>

class LinearAllocator {
public:
    LinearAllocator(size_t size);
    ~LinearAllocator();
    
    void* Allocate(size_t size);
    void Reset();

private:
    char* Buffer;
    size_t Capacity;
    size_t Offset;
};
