#include "RufloIntegration.h"

namespace NeoEngine {

RufloIntegration::RufloIntegration() : ready(false), contextType(ExecutionContextType::Sandbox), runtimeHandle(nullptr), timeoutMs(5000) {}
RufloIntegration::~RufloIntegration() { Shutdown(); }

bool RufloIntegration::Initialize(ExecutionContextType ctx) {
    // Untuk sekarang, anggap selalu siap (stub)
    contextType = ctx;
    ready = true;
    return true;
}

void RufloIntegration::Shutdown() { ready = false; }

ExecutionResult RufloIntegration::ExecuteCode(const std::string& code, const std::string& lang) {
    if (!ready) return {1, "", "Not initialized", 0.0f, false};
    return ExecutionResult{0, "Code executed (stub)", "", 0.1f, true};
}

ExecutionResult RufloIntegration::ExecuteWithEnvironment(const std::string& code, const std::string& lang,
                                                         const std::map<std::string, std::string>& env) {
    return ExecuteCode(code, lang);
}

bool RufloIntegration::ValidateCode(const std::string& code, const std::string& lang) {
    return ready && !code.empty();
}

std::vector<std::string> RufloIntegration::GetSupportedLanguages() const {
    return {"cpp", "python", "javascript"};
}

bool RufloIntegration::IsReady() const { return ready; }
void RufloIntegration::SetTimeout(int ms) { timeoutMs = ms; }

}
