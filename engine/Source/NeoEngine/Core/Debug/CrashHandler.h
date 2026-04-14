#pragma once

class CrashHandler {
public:
    static void Install();
    static void HandleFatal(const char* reason);
};
