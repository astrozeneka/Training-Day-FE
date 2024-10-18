package com.trainingday;

import android.content.Context;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name="Store")
public class StorePlugin extends Plugin {
  private BillingClient billingClient;

  @Override
  public void load() {
    // Here doesn't work
    System.out.println("Loading Store Plugin"); // It works fine
    System.out.println("Hello world from android ==");
    Context context = getContext();
    billingClient = BillingClient.newBuilder(context)
      .setListener((billingResult, purchases) -> {
        // Handle purchase here
      })
      .enablePendingPurchases()
      .build();
  }
  @PluginMethod()
  public void getProducts(PluginCall call) {
    if (!billingClient.isReady()) {
      billingClient.startConnection(new BillingClientStateListener() {
        @Override
        public void onBillingSetupFinished(BillingResult billingResult) {
          if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            System.out.println("StorePlugin: Billing client is ready");
            loadProductList(call);
          } else {
            System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
            // Error 3:
            // The Billing API version is not supported for the type requested”
            // The next step will be to downgrade 4.0 or 5.0
          }
        }

        @Override
        public void onBillingServiceDisconnected() {
          // Try to restart the connection on the next request to
          // Google Play by calling the startConnection() method.
        }
      });
    } else {
      loadProductList(call);
    }
  }

  public void loadProductList(PluginCall call) {
    System.out.println("StorePlugin: Loading product list"); // Ok, here is fine
    List<String> skuList = new ArrayList<>();
    skuList.add("foodcoach__7d");
    SkuDetailsParams params = SkuDetailsParams.newBuilder()
      .setSkusList(skuList)
      .setType(BillingClient.SkuType.INAPP)
      .build();
    billingClient.querySkuDetailsAsync(params, (billingResult, skuDetailsList) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        System.out.println("StorePlugin: Query successful");
        // Return a sample success message
        JSArray products = new JSArray();
        for (SkuDetails skuDetails : skuDetailsList) {
          try {
            products.put(new JSObject(skuDetails.toString()));
          } catch (JSONException e) {
            throw new RuntimeException(e);
          }
        }
        call.resolve(new JSObject().put("products", products));
      } else {
        System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
        // Return the error using the plugin call
        call.reject("Error code: " + billingResult.getResponseCode());
      }
    });
  }
}
