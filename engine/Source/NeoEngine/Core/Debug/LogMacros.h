#pragma once

#include "Logger.h"

#define LOG_TRACE(cat,msg) NeoEngine::Logger::Log(NeoEngine::LogLevel::Trace,cat,msg)
#define LOG_INFO(cat,msg) NeoEngine::Logger::Log(NeoEngine::LogLevel::Info,cat,msg)
#define LOG_WARNING(cat,msg) NeoEngine::Logger::Log(NeoEngine::LogLevel::Warning,cat,msg)
#define LOG_ERROR(cat,msg) NeoEngine::Logger::Log(NeoEngine::LogLevel::Error,cat,msg)
#define LOG_FATAL(cat,msg) NeoEngine::Logger::Log(NeoEngine::LogLevel::Fatal,cat,msg)
