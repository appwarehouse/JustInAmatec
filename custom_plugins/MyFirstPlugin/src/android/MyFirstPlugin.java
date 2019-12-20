package com.joangape.myfirstplugin;

import com.zebra.adc.decoder.Barcode2DWithSoft;
import android.widget.Toast;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import java.io.UnsupportedEncodingException;

public class MyFirstPlugin extends CordovaPlugin {
    String TAG="MainActivity";
    String barCode="";
    String stringer;
    EditText data1;
    Button btn;
    Barcode2DWithSoft barcode2DWithSoft=null;
    String seldata="ASCII";
    private ArrayAdapter adapterTagType;
    private Spinner spTagType;
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if(action.equals("nativeToast")){
            nativeToast();
        }
		if(action.equals("scan")){
			barcode2DWithSoft=Barcode2DWithSoft.getInstance();
			ScanBarcode(callbackContext);
		}
        return false;
    }

    private void ScanBarcode(CallbackContext callbackContext){
        if(barcode2DWithSoft!=null) {
            Log.i(TAG,"ScanBarcode");

            barcode2DWithSoft.scan();
            barcode2DWithSoft.setScanCallback(ScanBack);
        }
    }

    public Barcode2DWithSoft.ScanCallback  ScanBack= new Barcode2DWithSoft.ScanCallback(){
        @Override
        public void onScanComplete(int i, int length, byte[] bytes) {
/*             stringer = Arrays.toString(bytes);
 */            Toast.makeText(webView.getContext(), "Scan was fired", Toast.LENGTH_SHORT).show();
            if (length < 1) {
                if (length == -1) {
                    data1.setText("Scan cancel");
                } else if (length == 0) {
                    data1.setText("Scan TimeOut");
                } else {
                    Log.i(TAG,"Scan fail");
                }
            }else{
/*                 SoundManage.PlaySound(MainActivity.this, SoundManage.SoundType.SUCCESS);
 */                barCode="";



              //  String res = new String(dd,"gb2312");
                try {
                    Log.i("Ascii",seldata);
                    barCode = new String(bytes, 0, length, seldata);
                      zt();
                }
                catch (UnsupportedEncodingException ex)   {}
                data1.setText(barCode);
            }

        }
    };
	
	private void scanner(CallbackContext callbackContext) {
            callbackContext.success("Hi there im a dev");
    }

    void zt() {
        /* Vibrator vibrator = (Vibrator)this.getSystemService(this.VIBRATOR_SERVICE);
        vibrator.vibrate(100); */
    }

    public void nativeToast(){
        Toast.makeText(webView.getContext(), "Hello World Cordova Plugin", Toast.LENGTH_SHORT).show();
    }
}