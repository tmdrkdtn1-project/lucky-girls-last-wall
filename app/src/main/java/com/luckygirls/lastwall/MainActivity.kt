package com.luckygirls.lastwall

import android.app.Activity
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private val stageUrl = "file:///android_asset/stage1_playable.html"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        webView = createWebView()
        webView.loadUrl(stageUrl)
        setContentView(webView)
    }

    private fun createWebView(): WebView {
        return WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            settings.builtInZoomControls = false
            settings.displayZoomControls = false
            webChromeClient = object : android.webkit.WebChromeClient() {
                override fun onConsoleMessage(message: ConsoleMessage?): Boolean {
                    message?.let {
                        Log.d("LG_WEBVIEW", "${it.messageLevel()} ${it.message()} @${it.sourceId()}:${it.lineNumber()}")
                    }
                    return true
                }
            }
            webViewClient = object : WebViewClient() {
                override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
                    Log.e("LG_WEBVIEW", "RenderProcessGone crash=${detail?.didCrash()} priority=${detail?.rendererPriorityAtExit()}")
                    try { view?.destroy() } catch (_: Exception) {}
                    webView = createWebView()
                    webView.loadUrl(stageUrl)
                    setContentView(webView)
                    return true
                }
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        webView.evaluateJavascript(
            "document.getElementById('bottomUI')?.classList.contains('on') ? (document.getElementById('closeBottom').click(), true) : false"
        ) { handled ->
            if (handled != "true") super.onBackPressed()
        }
    }
}
