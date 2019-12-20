package com.hdhe.scantest;

import android.content.Context;
import android.content.Intent;

/**
 * @author Administrator
 * @date 2018/4/19
 */

public class ScanUtil {

    /**
     * ACTION_SCAN_CMD
     */
    private static final String ACTION_SCAN = "com.rfid.SCAN_CMD";
    /**
     * ACTION_SCAN_INIT
     */
    private static final String ACTION_SCAN_INIT = "com.rfid.SCAN_INIT";
    /**
     * ACTION_CLOSE_SCAN
     */
    private static final String ACTION_CLOSE_SCAN = "com.rfid.CLOSE_SCAN";
    /**
     * ACTION_SET_SCAN_MODE
     */
    private static final String ACTION_SET_SCAN_MODE = "com.rfid.SET_SCAN_MODE";
    private Context context ;
    public ScanUtil(Context context) {
        this.context = context ;
        Intent intent = new Intent();
        intent.setAction(ACTION_SCAN_INIT);
        context.sendBroadcast(intent);
    }

    public void scan() {
        Intent intent = new Intent();
        intent.setAction(ACTION_SCAN);
        context.sendBroadcast(intent);
    }

    public void setScanMode(int mode) {
        Intent intent = new Intent();
        intent.setAction(ACTION_SET_SCAN_MODE);
        intent.putExtra("mode", mode);
        context.sendBroadcast(intent);
    }

    public void close() {
        Intent toKillService = new Intent();
        toKillService.setAction(ACTION_CLOSE_SCAN);
        context.sendBroadcast(toKillService);
    }
}
