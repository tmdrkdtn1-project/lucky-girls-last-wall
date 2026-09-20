package com.luckygirls.lastwall
import android.app.Activity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
class MainActivity : Activity() {
 private lateinit var webView: WebView
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  webView=WebView(this)
  webView.webViewClient=WebViewClient()
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
