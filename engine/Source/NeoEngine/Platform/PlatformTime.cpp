#include "PlatformTime.h"
#include "Platform.h"

extern Platform* GPlatform;

uint64 PlatformTime::NowNano() {
    return GPlatform->GetTimeNano();
}

double PlatformTime::NowSeconds() {
    return (double)GPlatform->GetTimeNano() * 1e-9;
}
