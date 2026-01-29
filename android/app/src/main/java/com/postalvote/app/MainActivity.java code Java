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

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeDataPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

// প্লাগিনে পারমিশন যোগ করা হলো যাতে React থেকে রিকোয়েস্ট করা যায়
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
        // পারমিশন চেক
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            requestPermissionForAlias("sms", call, "permissionCallback");
            return; // এখানেই থামুন, পারমিশন পাওয়ার পর আবার চেষ্টা করতে হবে না হলে ক্র্যাশ করবে
        }
        readSMS(call);
    }

    @PluginMethod
    public void getCalls(PluginCall call) {
        // পারমিশন চেক
        if (getPermissionState("calls") != PermissionState.GRANTED) {
            requestPermissionForAlias("calls", call, "permissionCallback");
            return;
        }
        readCalls(call);
    }

    // পারমিশন কলব্যাক হ্যান্ডলার
    @PluginMethod
    public void permissionCallback(PluginCall call) {
        // পারমিশন পাওয়ার পর পুনরায় ফাংশন কল করা হবে না, ইউজারকে আবার কমান্ড দিতে হবে অথবা হ্যান্ডেল করতে হবে
        // সহজ করার জন্য আমরা এখানে শুধু স্টেটাস জানাচ্ছি
        call.resolve(); 
    }

    private void readSMS(PluginCall call) {
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
            call.reject("Error reading SMS: " + e.getMessage());
        }
    }

    private void readCalls(PluginCall call) {
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
            call.reject("Error reading Calls: " + e.getMessage());
        }
    }
}
