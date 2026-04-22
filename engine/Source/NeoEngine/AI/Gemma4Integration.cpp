#include "Gemma4Integration.h"
#include <filesystem>

namespace NeoEngine {

Gemma4Integration::Gemma4Integration() : ready(false), modelSize(Gemma4ModelSize::Base), modelHandle(nullptr) {}
Gemma4Integration::~Gemma4Integration() { Shutdown(); }

std::string Gemma4Integration::GetDefaultModelPath() const {
    std::string primary = "/sdcard/gemma4/gemma4_2b_v09_obfus_fix_all_modalities_thinking.litertlm";
    if (std::filesystem::exists(primary)) return primary;
    return "";
}

bool Gemma4Integration::Initialize(Gemma4ModelSize size) {
    if (ready) return true;
    modelSize = size;
    std::string path = GetDefaultModelPath();
    if (path.empty()) { ready = false; return false; }
    modelFilePath = path;
    ready = true;
    return true;
}

void Gemma4Integration::Shutdown() { ready = false; }

Gemma4Response Gemma4Integration::GenerateText(const std::string& prompt, int maxLen) {
    if (!ready) return {"", 0.0f, {}, 0};
    return Gemma4Response{"Gemma4: " + prompt, 0.92f, {}, maxLen/4};
}

std::vector<float> Gemma4Integration::GetEmbeddings(const std::string& text) {
    if (!ready) return {};
    return std::vector<float>(768, 0.5f);
}

Gemma4Response Gemma4Integration::Summarize(const std::string& text) {
    if (!ready) return {"", 0.0f, {}, 0};
    return Gemma4Response{"Summary of text", 0.88f, {}, 64};
}

bool Gemma4Integration::IsReady() const { return ready; }
std::string Gemma4Integration::GetModelInfo() const { return "Gemma4 2B LiteRT-LM"; }
void Gemma4Integration::SetModelSize(Gemma4ModelSize size) { modelSize = size; }

}
