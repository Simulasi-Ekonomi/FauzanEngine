#include "Assert.h"
#include "../Math/Vector3.h"
#include "../Memory/LinearAllocator.h"

void ValidateMath() {
    Vector3 v1(1, 0, 0);
    Vector3 v2(0, 1, 0);
    // Simple check
    NEO_ASSERT(v1.x == 1.0f, "Math Validation Failed");
}

void ValidateMemory() {
    LinearAllocator alloc(1024);
    void* ptr = alloc.Allocate(128);
    NEO_ASSERT(ptr != nullptr, "Memory Allocator Validation Failed");
}
