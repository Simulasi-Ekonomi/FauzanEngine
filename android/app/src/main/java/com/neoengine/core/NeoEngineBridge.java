package com.neoengine.core;

/**
 * NeoEngine JNI Bridge - Java side
 * Provides native method declarations for C++ engine communication
 */
public class NeoEngineBridge {

    static {
        System.loadLibrary("neo_core");
    }

    // Engine lifecycle
    public static native boolean nativeInit(Object activity, Object assetManager,
                                            int screenWidth, int screenHeight);
    public static native void nativeShutdown();
    public static native void nativeTick(float deltaTime);
    public static native void nativeRender();

    // Input
    public static native void nativeTouchEvent(int action, float x, float y, int pointerId);
    public static native void nativeKeyEvent(int keyCode, int action);
    public static native void nativeSensorEvent(int sensorType, float x, float y, float z);

    // Telemetry (for Aries AI)
    public static native float nativeGetFPS();
    public static native float nativeGetCPUTemp();
    public static native void nativeSetThrottleLevel(int level);
    public static native String nativeGetTelemetryJSON();

    // Scene management
    public static native int nativeGetActorCount();
    public static native boolean nativeLoadScene(String scenePath);
    public static native boolean nativeSaveScene(String scenePath);
}
