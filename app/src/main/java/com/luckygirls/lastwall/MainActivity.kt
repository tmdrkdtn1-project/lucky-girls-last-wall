package com.luckygirls.lastwall
import android.app.Activity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.RenderProcessGoneDetail
import android.util.Log
import android.webkit.ConsoleMessage
class MainActivity : Activity() {
 private lateinit var webView: WebView
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  webView=WebView(this)
  webView.webChromeClient=object: android.webkit.WebChromeClient() {
   override fun onConsoleMessage(message: ConsoleMessage?): Boolean {
    message?.let { Log.d("LG_WEBVIEW", "${it.messageLevel()} ${it.message()} @${it.sourceId()}:${it.lineNumber()}") }
    return true
   }
  }
  webView.webViewClient=object: WebViewClient() {
   override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
    Log.e("LG_WEBVIEW", "RenderProcessGone crash=${detail?.didCrash()} priority=${detail?.rendererPriorityAtExit()}")
    try { view?.destroy() } catch (_: Exception) {}
    webView=WebView(this@MainActivity)
    webView.webViewClient=this
    webView.webChromeClient=object: android.webkit.WebChromeClient() {
     override fun onConsoleMessage(message: ConsoleMessage?): Boolean { message?.let { Log.d("LG_WEBVIEW", "${it.messageLevel()} ${it.message()} @${it.sourceId()}:${it.lineNumber()}") }; return true }
    }
    webView.settings.javaScriptEnabled=true
    webView.settings.domStorageEnabled=true
    webView.loadUrl("file:///android_asset/index.html")
    setContentView(webView)
    return true
   }
  }
  webView.settings.javaScriptEnabled=true
  webView.settings.domStorageEnabled=true
  webView.loadUrl("file:///android_asset/index.html")
  setContentView(webView)
 }
 override fun onBackPressed() {
  webView.evaluateJavascript("typeof handleNativeBack==='function' ? handleNativeBack() : false") { handled ->
   if (handled != "true") super.onBackPressed()
  }
 }
}
