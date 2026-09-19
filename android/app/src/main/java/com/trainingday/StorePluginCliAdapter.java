package com.trainingday;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.MessageHandler;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

public class StorePluginCliAdapter {
  public static final StorePluginCliAdapter INSTANCE = new StorePluginCliAdapter();

  private final Map<String, PluginCall> activeListeners = new ConcurrentHashMap<>();

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

  public String addListener(String eventName, Consumer<JSObject> onEvent) {
    String callbackId = UUID.randomUUID().toString();
    JSObject data = new JSObject();
    data.put("eventName", eventName);

    PluginCall call = new PluginCall(null, "Store", callbackId, "addListener", data) {
      @Override
      public void resolve() {
        this.resolve(new JSObject());
      }

      @Override
      public void resolve(JSObject result) {
        onEvent.accept(result);
      }

      @Override
      public void reject(String message) {
        this.reject(message, new Exception(message));
      }

      @Override
      public void reject(String message, Exception e) {
        // Handle error if needed (TODO LATER) — add an onError callback
      }
    };
    activeListeners.put(callbackId, call);
    bridge.saveCall(call); // keep removeListener()'s bridge.getSavedCall(callbackId) lookup working
    storePlugin.addListener(call);
    return callbackId;
  }

  public void removeEventListener(String eventName, String callbackId) {
    PluginCall savedCall = activeListeners.remove(callbackId);
    if (savedCall == null) return;

    JSObject data = new JSObject();
    data.put("eventName", eventName);
    data.put("callbackId", callbackId);

    PluginCall unsubscribeCall = new PluginCall(null, "Store", null, "removeListener", data) {
      @Override public void resolve() {}
      @Override public void resolve(JSObject result) {}
    };
    storePlugin.removeListener(unsubscribeCall);
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

  public void purchaseProductByIdAsync(JSONObject params, Consumer<JSObject> onSuccess, Consumer<String> onError){
    JSObject data;
    try {
      data = JSObject.fromJSONObject(params);
    } catch (JSONException e) {
      onError.accept("Invalid params: " + e.getMessage());
      return;
    }

    // TODO: Make the following portion reusable
    PluginCall call = new PluginCall(null, "Store", "cli-callback", "purchaseProductById", data) {
      @Override
      public void resolve() {
        this.resolve(new JSObject());
      }
      @Override
      public void resolve(JSObject result) {
        onSuccess.accept(result);
      }
      @Override
      public void reject(String message) {
        this.reject(message, new Exception(message));
      }
      @Override
      public void reject(String message, Exception e) {
        onError.accept(message + ": " + e.getMessage());
      }
    };
    storePlugin.purchaseProductById(call);
  }
}
