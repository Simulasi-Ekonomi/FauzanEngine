package com.neoengine.core;

import android.app.NativeActivity;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.view.View;

/**
 * NeoEngine main activity - hosts the native engine rendering surface.
 */
public class NeoEngineActivity extends NativeActivity {

    private long lastFrameTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fullscreen immersive mode
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUI();

        // Initialize native engine
        int width = getResources().getDisplayMetrics().widthPixels;
        int height = getResources().getDisplayMetrics().heightPixels;
        NeoEngineBridge.nativeInit(this, getAssets(), width, height);

        lastFrameTime = System.nanoTime();
    }

    @Override
    protected void onDestroy() {
        NeoEngineBridge.nativeShutdown();
        super.onDestroy();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getActionMasked();
        float x = event.getX();
        float y = event.getY();
        int pointerId = event.getPointerId(event.getActionIndex());
        NeoEngineBridge.nativeTouchEvent(action, x, y, pointerId);
        return true;
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        NeoEngineBridge.nativeKeyEvent(keyCode, 0);
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        NeoEngineBridge.nativeKeyEvent(keyCode, 1);
        return super.onKeyUp(keyCode, event);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUI();
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }
}
