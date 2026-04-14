#pragma once
#include <string>
#include "LogChannel.h"

class Log {
public:
    static void Write(LogLevel level, LogChannel channel, const std::string& msg);
};
