#include "HermesIntegration.h"
#include <filesystem>

namespace NeoEngine {

HermesIntegration::HermesIntegration()
    : ready(false), currentModel(HermesModelType::Medium), 
      modelHandle(nullptr), temperature(0.7f), maxTokens(2048) {}

HermesIntegration::~HermesIntegration() { Shutdown(); }

bool HermesIntegration::Initialize(HermesModelType modelType) {
#ifdef __ANDROID__
    // Hermes agent tidak tersedia di Android APK
    ready = false;
    return false;
#else
    if (ready) return true;
    std::string hermesPath = "/data/data/com.termux/files/usr/bin/hermes";
    if (!std::filesystem::exists(hermesPath)) {
        ready = false;
        return false;
    }
    hermesExecutablePath = hermesPath;
    currentModel = modelType;
    ready = true;
    return true;
#endif
}

void HermesIntegration::Shutdown() {
    if (ready) { ready = false; modelHandle = nullptr; }
}

HermesResponse HermesIntegration::GenerateText(const std::string& prompt, float temp) {
    if (!ready) return {"", 0.0f, 0, ""};
    return HermesResponse{"Generated: " + prompt, 0.85f, 128, "hermes-medium"};
}

HermesResponse HermesIntegration::Chat(const std::string& msg, int ctx) {
    if (!ready) return {"", 0.0f, 0, ""};
    return HermesResponse{"Chat: " + msg, 0.9f, 256, "hermes-chat"};
}

HermesResponse HermesIntegration::CodeGeneration(const std::string& desc) {
    if (!ready) return {"", 0.0f, 0, ""};
    return HermesResponse{"// Code for: " + desc, 0.8f, 512, "hermes-code"};
}

void HermesIntegration::SetTemperature(float temp) { temperature = temp; }
void HermesIntegration::SetMaxTokens(int max) { maxTokens = max; }
bool HermesIntegration::IsReady() const { return ready; }

std::string HermesIntegration::GetModelInfo() const {
    std::string name;
    switch (currentModel) {
        case HermesModelType::Small: name = "Small"; break;
        case HermesModelType::Medium: name = "Medium"; break;
        case HermesModelType::Large: name = "Large"; break;
    }
    return "Hermes LLM - " + name + " Model";
}

}
