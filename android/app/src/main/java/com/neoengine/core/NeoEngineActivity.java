package com.neoengine.core;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.view.WindowManager;
import android.os.Build;

public class NeoEngineActivity extends Activity {
    
    private WebView webView;
    private NeoEngineBridge bridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Fullscreen
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDatabaseEnabled(true);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(false);
        }

        webView.setWebChromeClient(new WebChromeClient());

        // Init C++ bridge
        bridge = new NeoEngineBridge();
        bridge.init(this);
        
        // Expose bridge to JS
        webView.addJavascriptInterface(bridge, "NeoEngineBridge");
        webView.addJavascriptInterface(this, "AndroidActivity");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Init engine after page loads
                view.evaluateJavascript(
                    "if(window.onNeoEngineReady) window.onNeoEngineReady()", null
                );
            }
        });

        // Load editor from assets
        webView.loadUrl("file:///android_asset/editor/index.html");
    }

    @JavascriptInterface
    public String getDeviceInfo() {
        return "{\"model\":\"" + Build.MODEL + "\",\"sdk\":" + Build.VERSION.SDK_INT + "}";
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (bridge != null) bridge.shutdown();
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
