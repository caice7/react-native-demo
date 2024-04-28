package com.caicemusic; // replace your-apps-package-name with your app’s package name
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class CalendarModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  // add to CalendarModule.kt
  override fun getName() = "CalendarModule"
  @ReactMethod
  fun createCalendarEvent(name: String, location: String) {
      Log.d("CalendarModule", "Create event called with name: $name and location: $location")
  }
}

