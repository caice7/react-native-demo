package com.caicemusic; // replace your-apps-package-name with your app’s package name
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

import android.net.Uri;
import androidx.documentfile.provider.DocumentFile;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import android.content.Context;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MusicModule extends ReactContextBaseJavaModule {
   MusicModule(ReactApplicationContext context) {
       super(context);
   }
   
   // add to MusicModule.java
    @Override
    public String getName() {
      return "MusicModule";
    }

    @ReactMethod
    public void readFolder(String location, Promise promise) {
      try {
        Uri uri = Uri.parse(location); // 使用传入的URI
        DocumentFile documentFile = DocumentFile.fromTreeUri(getReactApplicationContext(), uri);

        WritableArray fileArray = Arguments.createArray();

        if (documentFile != null && documentFile.exists() && documentFile.isDirectory()) {
          for (DocumentFile file : documentFile.listFiles()) {
            WritableMap fileMap = Arguments.createMap();
            fileMap.putString("name", file.getName());
            // 添加更多文件信息到fileMap
            fileArray.pushMap(fileMap);
          }
        }

        promise.resolve(fileArray);
      } catch (Exception e) {
        promise.reject("ERROR", e);
      }
    }
    
}