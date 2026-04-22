#include "AndroidPlatform.h"
#include <jni.h>
#include <android/log.h>
#include <iostream>

static JavaVM* g_jvm = nullptr;

// Fungsi untuk mendapatkan JNIEnv yang aman dari thread mana pun
JNIEnv* GetJNIEnv() {
    if (!g_jvm) return nullptr;
    JNIEnv* env = nullptr;
    jint result = g_jvm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6);
    if (result == JNI_EDETACHED) {
        result = g_jvm->AttachCurrentThread(&env, nullptr);
        if (result != JNI_OK) return nullptr;
    }
    return env;
}

// JNI_OnLoad dipanggil saat library native dimuat
extern "C" JNIEXPORT jint JNICALL
JNI_OnLoad(JavaVM* vm, void* /*reserved*/) {
    g_jvm = vm;
    return JNI_VERSION_1_6;
}

// Implementasi kelas AndroidPlatform (sudah ada)
void AndroidPlatform::Init() {
    std::cout << "[Platform] Android Init" << std::endl;
}

void AndroidPlatform::PumpEvents() {
    // Placeholder
}

void AndroidPlatform::Shutdown() {
    std::cout << "[Platform] Android Shutdown" << std::endl;
}
