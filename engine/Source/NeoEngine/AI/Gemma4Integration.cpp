#include "Gemma4Integration.h"
#include <jni.h>
#include <android/log.h>

#define LOG_TAG "Gemma4Integration"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

// Deklarasi fungsi helper dari Platform/Android
extern JNIEnv* GetJNIEnv();

namespace NeoEngine {

Gemma4Integration::Gemma4Integration() : ready(false) {}
Gemma4Integration::~Gemma4Integration() { Shutdown(); }

bool Gemma4Integration::Initialize(Gemma4ModelSize size) {
    // Path model (sesuaikan dengan package name)
    const char* modelPath = "/data/data/com.neoengine.editor/files/gemma4.litertlm";

    JNIEnv* env = GetJNIEnv();
    if (!env) {
        LOGI("GetJNIEnv failed");
        return false;
    }

    jclass bridgeClass = env->FindClass("com/neoengine/core/NeoEngineBridge");
    if (!bridgeClass) {
        LOGI("NeoEngineBridge class not found");
        return false;
    }

    jmethodID initMethod = env->GetStaticMethodID(bridgeClass, "initLiteRT", "(Ljava/lang/String;)V");
    if (!initMethod) {
        LOGI("initLiteRT method not found");
        return false;
    }

    jstring jPath = env->NewStringUTF(modelPath);
    env->CallStaticVoidMethod(bridgeClass, initMethod, jPath);
    env->DeleteLocalRef(jPath);

    // Untuk saat ini, anggap inisialisasi asynchronous akan berhasil
    ready = true;
    return true;
}

void Gemma4Integration::Shutdown() {
    if (!ready) return;
    JNIEnv* env = GetJNIEnv();
    if (env) {
        jclass bridgeClass = env->FindClass("com/neoengine/core/NeoEngineBridge");
        if (bridgeClass) {
            jmethodID shutdownMethod = env->GetStaticMethodID(bridgeClass, "shutdownLiteRT", "()V");
            if (shutdownMethod) env->CallStaticVoidMethod(bridgeClass, shutdownMethod);
        }
    }
    ready = false;
}

Gemma4Response Gemma4Integration::GenerateText(const std::string& prompt, int maxLength) {
    if (!ready) return {"", 0.0f, {}, 0};

    JNIEnv* env = GetJNIEnv();
    if (!env) return {"", 0.0f, {}, 0};

    jclass bridgeClass = env->FindClass("com/neoengine/core/NeoEngineBridge");
    if (!bridgeClass) return {"", 0.0f, {}, 0};

    jmethodID sendMethod = env->GetStaticMethodID(bridgeClass, "sendPrompt", "(Ljava/lang/String;)Ljava/lang/String;");
    if (!sendMethod) return {"", 0.0f, {}, 0};

    jstring jPrompt = env->NewStringUTF(prompt.c_str());
    jstring jResult = (jstring)env->CallStaticObjectMethod(bridgeClass, sendMethod, jPrompt);

    const char* result = env->GetStringUTFChars(jResult, nullptr);
    std::string response(result);
    env->ReleaseStringUTFChars(jResult, result);
    env->DeleteLocalRef(jPrompt);
    env->DeleteLocalRef(jResult);

    return {response, 0.9f, {}, (int)response.length() / 4};
}

Gemma4Response Gemma4Integration::Summarize(const std::string& text) {
    // Belum diimplementasikan
    return {"", 0.0f, {}, 0};
}

std::vector<float> Gemma4Integration::GetEmbeddings(const std::string& text) {
    // Belum diimplementasikan
    return {};
}

bool Gemma4Integration::IsReady() const { return ready; }

std::string Gemma4Integration::GetModelInfo() const {
    return "Gemma4 via LiteRT-LM";
}

void Gemma4Integration::SetModelSize(Gemma4ModelSize size) {
    // Ukuran model ditentukan saat inisialisasi, untuk saat ini diabaikan
}

} // namespace NeoEngine
