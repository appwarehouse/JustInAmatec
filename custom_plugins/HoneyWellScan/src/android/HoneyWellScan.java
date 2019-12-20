package com.honeywell.scan;

import android.widget.Toast;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.ListView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import com.hdhe.scantest.Barcode;
import com.hdhe.scantest.ScanUtil;
import com.hdhe.scantest.Tools;
import com.hdhe.scantest.Util;




/**
 * This class echoes a string called from JavaScript.
 */
public class HoneyWellScan extends CordovaPlugin {

    private Button btn;
    private Button btnClear;
    private ListView lv;
    private Context context;

    private HashSet<String> setBarcode = new HashSet<String>();
    private HashMap<String, Integer> mapBarcode = new HashMap<>();
    private List<Barcode> listBarcode;
    private String TAG = "MainActivity";
    private CheckBox checkBoxAuto;
    private Timer timer;

/*     private MAdapter adapter;
 */
    private ScanUtil scanUtil;

    public CallbackContext globalCallbackContext;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        globalCallbackContext = callbackContext;
        if (action.equals("scan")) {
            scanner();
        }
        if(action.equals("nativeToast")){
            nativeToast();
        }
        return false;
    }

    /* private void coolMethod(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    } */

    private void scanner(){
        Context context = this.cordova.getActivity().getApplicationContext(); 
        if(context != null){
            Log.e(TAG, "context found");
        }
        else{
            Log.e(TAG, "context not found");
        }


        IntentFilter filter = new IntentFilter();
        filter.addAction("com.rfid.SCAN");
        context.registerReceiver(receiver, filter);


        scanUtil = new ScanUtil(context);
        Toast.makeText(webView.getContext(), "Scanning Fired", Toast.LENGTH_SHORT).show();
        scanUtil.close();
        scanUtil.scan();
		Toast.makeText(webView.getContext(), "Scanning Fired 2", Toast.LENGTH_SHORT).show();

    }

    private BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.e(TAG, "Is It Here");
            byte[] data = intent.getByteArrayExtra("data");
            if (data != null) {
                String barcode = Tools.Bytes2HexString(data, data.length);
//                String barcode = new String(data);
                
                Log.e(TAG, barcode);
                nativeSendBack();
                //first add
                if (setBarcode.isEmpty()) {
                    setBarcode.add(barcode);
                    listBarcode = new ArrayList<>();
                    Barcode b = new Barcode();
                    b.sn = 1;
                    b.barcode = barcode;
                    b.count = 1;
                    listBarcode.add(b);
                    //list index
                    /* mapBarcode.put(barcode, 0);
                    adapter = new MAdapter();
                    lv.setAdapter(adapter); */
                } else {
                    if (setBarcode.contains(barcode)) {
                        Barcode b = listBarcode.get(mapBarcode.get(barcode));
                        b.count += 1;
                        listBarcode.set(mapBarcode.get(barcode), b);

                    } else {
                        Barcode b = new Barcode();
                        b.sn = listBarcode.size();
                        b.barcode = barcode;
                        b.count = 1;
                        listBarcode.add(b);
                        setBarcode.add(barcode);
                        //list index
                        mapBarcode.put(barcode, listBarcode.size() - 1);
                    }
                }
/*                 adapter.notifyDataSetChanged();
 *///                Util.play(1, 0);
            }

        }
    };

    public void nativeSendBack(){
        globalCallbackContext.success("sent back");
    }

    private void nativeToast(){
        globalCallbackContext.success("check toast");
        Toast.makeText(webView.getContext(), "Hello World Cordova Plugin", Toast.LENGTH_SHORT).show();
    }
}
