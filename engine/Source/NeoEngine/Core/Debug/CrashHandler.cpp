#include "CrashHandler.h"
#include "Log.h"
#include <signal.h>
#include <string>

static void SignalHandler(int sig) {
    const char* name = "Unknown Signal";
    switch(sig) {
        case SIGSEGV: name = "SIGSEGV (Segmentation Fault)"; break;
        case SIGABRT: name = "SIGABRT (Abort)"; break;
        case SIGFPE:  name = "SIGFPE (Floating Point Exception)"; break;
        case SIGILL:  name = "SIGILL (Illegal Instruction)"; break;
    }
    CrashHandler::HandleFatal(name);
}

void CrashHandler::Install() {
    signal(SIGSEGV, SignalHandler);
    signal(SIGABRT, SignalHandler);
    signal(SIGFPE,  SignalHandler);
    signal(SIGILL,  SignalHandler);
}

void CrashHandler::HandleFatal(const char* reason) {
    Log::Write(LogLevel::Fatal, LogChannel::Core, std::string("CRASH DETECTED: ") + reason);
    __builtin_trap();
}
