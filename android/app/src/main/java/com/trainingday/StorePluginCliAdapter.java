package com.trainingday;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.MessageHandler;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginResult;

public class StorePluginCliAdapter {
  public static final StorePluginCliAdapter INSTANCE = new StorePluginCliAdapter();

  private StorePluginCliAdapter() {}

  private Bridge bridge;

  public static StorePluginCliAdapter getInstance() {
    return INSTANCE;
  }

  public void setBridge(Bridge Bridge) {
    this.bridge = Bridge;
  }

  public void getProducts(){
    StorePlugin storePlugin = (StorePlugin) bridge.getPlugin("Store").getInstance();

    JSObject data = new JSObject();
    data.put("type", "subs");

    PluginCall call = new PluginCall(null, "Store", "cli-callback", "getProducts", data) {
      @Override
      public void resolve(JSObject result) {
        // Interpret
        JSObject resultData = result.getJSObject("products");
        System.out.println("Received result from StorePlugin: " + resultData.toString());
      }
      @Override
      public void reject(String message) {
        System.err.println("Error from StorePlugin: " + message);
      }
    };
    storePlugin.getProducts(call);
  }
}
