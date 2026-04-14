#include "Log.h"
#include <string>

#if defined(__ANDROID__)
#include <android/log.h>
#else
#include <iostream>
#endif

void Log::Write(LogLevel level, LogChannel channel, const std::string& msg) {
    const char* channelStr = "Unknown";
    switch(channel) {
        case LogChannel::Core:      channelStr = "Core"; break;
        case LogChannel::Memory:    channelStr = "Memory"; break;
        case LogChannel::Platform:  channelStr = "Platform"; break;
        case LogChannel::ECS:       channelStr = "ECS"; break;
        case LogChannel::Rendering: channelStr = "Rendering"; break;
    }

#if defined(__ANDROID__)
    int prio = ANDROID_LOG_INFO;
    if (level == LogLevel::Warning) prio = ANDROID_LOG_WARN;
    else if (level == LogLevel::Error) prio = ANDROID_LOG_ERROR;
    else if (level == LogLevel::Fatal) prio = ANDROID_LOG_FATAL;

    __android_log_print(prio, "NeoEngine", "[%s] %s", channelStr, msg.c_str());
#else
    std::string levelStr = (level == LogLevel::Error) ? "[ERROR]" : "[INFO]";
    std::cout << levelStr << "[" << channelStr << "] " << msg << std::endl;
#endif
}
