#include "HermesIntegration.h"
#include <jni.h>
#include <android/log.h>
#include <string>
#include <thread>
#include <chrono>
#include <curl/curl.h>  // Memerlukan libcurl

#define LOG_TAG "HermesIntegration"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

extern JNIEnv* GetJNIEnv();

namespace NeoEngine {

// Callback untuk libcurl
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* output) {
    size_t totalSize = size * nmemb;
    output->append(static_cast<char*>(contents), totalSize);
    return totalSize;
}

HermesIntegration::HermesIntegration()
    : ready(false), currentModel(HermesModelType::Medium),
      modelHandle(nullptr), temperature(0.7f), maxTokens(2048) {}

HermesIntegration::~HermesIntegration() { Shutdown(); }

bool HermesIntegration::Initialize(HermesModelType modelType) {
    // Cek apakah Hermes Agent HTTP endpoint tersedia
    CURL* curl = curl_easy_init();
    if (!curl) {
        LOGE("Failed to initialize libcurl");
        return false;
    }

    // URL default Hermes Agent (dapat dikonfigurasi)
    std::string url = "http://localhost:8765/health";
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 2L); // timeout 2 detik
    curl_easy_setopt(curl, CURLOPT_NOBODY, 1L);  // HEAD request

    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        LOGI("Hermes Agent not reachable at %s", url.c_str());
        ready = false;
        return false;
    }

    // Tersimpan
    hermesEndpoint = "http://localhost:8765/v1/chat/completions";
    currentModel = modelType;
    ready = true;
    LOGI("Hermes Integration ready (HTTP mode)");
    return true;
}

void HermesIntegration::Shutdown() {
    ready = false;
}

HermesResponse HermesIntegration::GenerateText(const std::string& prompt, float temp) {
    if (!ready) return {"", 0.0f, 0, ""};

    CURL* curl = curl_easy_init();
    if (!curl) return {"", 0.0f, 0, ""};

    std::string responseStr;
    std::string postData = "{\"prompt\":\"" + prompt + "\",\"temperature\":" + std::to_string(temp) + "}";

    curl_easy_setopt(curl, CURLOPT_URL, hermesEndpoint.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &responseStr);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);

    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    CURLcode res = curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        return {"", 0.0f, 0, ""};
    }

    // Parsing sederhana (asumsikan respons JSON: {"text": "..."})
    // Anda bisa gunakan library JSON atau parsing manual
    size_t textPos = responseStr.find("\"text\":\"");
    if (textPos != std::string::npos) {
        textPos += 8;
        size_t endPos = responseStr.find("\"", textPos);
        std::string text = responseStr.substr(textPos, endPos - textPos);
        return {text, 0.9f, static_cast<int>(text.length() / 4), "hermes-http"};
    }

    return {responseStr, 0.8f, 128, "hermes-http"};
}

HermesResponse HermesIntegration::Chat(const std::string& msg, int ctx) {
    // Untuk chat, kita bisa gunakan endpoint yang sama dengan prompt berbeda
    return GenerateText(msg, temperature);
}

HermesResponse HermesIntegration::CodeGeneration(const std::string& desc) {
    return GenerateText("Generate code: " + desc, 0.2f);
}

void HermesIntegration::SetTemperature(float temp) { temperature = temp; }
void HermesIntegration::SetMaxTokens(int max) { maxTokens = max; }
bool HermesIntegration::IsReady() const { return ready; }

std::string HermesIntegration::GetModelInfo() const {
    return "Hermes Agent (HTTP)";
}

}
