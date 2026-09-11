package com.trainingday;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.MessageHandler;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.function.Consumer;

public class StorePluginCliAdapter {
  public static final StorePluginCliAdapter INSTANCE = new StorePluginCliAdapter();

  private StorePluginCliAdapter() {}

  private Bridge bridge;
  private StorePlugin storePlugin;

  public static StorePluginCliAdapter getInstance() {
    return INSTANCE;
  }

  public void setBridge(Bridge Bridge) {
    this.bridge = Bridge;
    this.storePlugin = (StorePlugin) bridge.getPlugin("Store").getInstance();
  }

  public void getProductsAsync(Consumer<JSONArray> onSuccess, Consumer<String> onError){
    JSObject data = new JSObject();
    data.put("type", "subs");

    PluginCall call = new PluginCall(null, "Store", "cli-callback", "getProducts", data) {
      @Override
      public void resolve(JSObject result) {
        try {
          onSuccess.accept(result.getJSONArray("products"));
        } catch (JSONException e) {
          onError.accept("Failed to parse products: " + e.getMessage());
        }
      }
      @Override
      public void reject(String message) {
        onError.accept(message);
      }
    };
    storePlugin.getProducts(call);
  }

  public void purchaseProductByIdAsync(String productId, Consumer<JSObject> onSuccess, Consumer<String> onError){
    JSObject data = new JSObject();
    data.put("productId", productId);

    PluginCall call = new PluginCall(null, "Store", "cli-callback", "purchaseProductById", data) {
      @Override
      public void resolve(JSObject result) {
        onSuccess.accept(result);
      }
      @Override
      public void reject(String message) {
        onError.accept(message);
      }
    };
    storePlugin.purchaseProductById(call);
  }
}
