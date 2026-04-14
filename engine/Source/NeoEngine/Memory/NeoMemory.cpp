#include <cstdlib>
#include <android/log.h>

void* NeoMalloc(size_t Size) {
    // Custom Aligned Allocator untuk performa cache CPU
    return malloc(Size);
}

void NeoFree(void* Ptr) {
    free(Ptr);
}
