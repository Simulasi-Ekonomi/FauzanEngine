#include "OpenCodeIntegration.h"
#include <filesystem>

namespace NeoEngine {

OpenCodeIntegration::OpenCodeIntegration() : ready(false), generatorHandle(nullptr) {}
OpenCodeIntegration::~OpenCodeIntegration() { Shutdown(); }

bool OpenCodeIntegration::Initialize() {
    if (ready) return true;
    std::string path = "/data/data/com.termux/files/home/.opencode/bin/opencode";
    if (!std::filesystem::exists(path)) { ready = false; return false; }
    opencodeExecutablePath = path;
    ready = true;
    return true;
}

void OpenCodeIntegration::Shutdown() { ready = false; }

GeneratedCode OpenCodeIntegration::GenerateFromDescription(const std::string& desc) {
    if (!ready) return {};
    GeneratedCode gc;
    gc.language = "cpp";
    gc.code = "// Generated for: " + desc + "\nvoid Generated() {}";
    gc.description = desc;
    gc.complexity = 5;
    return gc;
}

GeneratedCode OpenCodeIntegration::GenerateFromTemplate(const std::string& tmpl,
                                                        const std::map<std::string, std::string>& params) {
    if (!ready) return {};
    GeneratedCode gc;
    gc.language = "cpp";
    gc.code = "// Template: " + tmpl;
    gc.description = "From template " + tmpl;
    gc.complexity = 3;
    return gc;
}

std::vector<std::string> OpenCodeIntegration::GetSupportedLanguages() const {
    return {"cpp", "py", "ts"};
}

bool OpenCodeIntegration::ValidateCode(const GeneratedCode& code) {
    return ready && !code.code.empty();
}

bool OpenCodeIntegration::IsReady() const { return ready; }

}
