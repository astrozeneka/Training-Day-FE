package com.trainingday;

import android.content.Context;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

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
    List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
    productList.add(QueryProductDetailsParams.Product.newBuilder()
      .setProductId("foodcoach__7d")
      .setProductType(BillingClient.ProductType.INAPP)
      .build()
    );
    QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
      .setProductList(productList)
      .build();
    billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        System.out.println("StorePlugin: Query successful");
        JSArray productsJson = new JSArray();
        for (ProductDetails details : productDetailsList) {
          JSObject productJson = new JSObject();
          productJson.put("productId", details.getProductId());
          productJson.put("type", details.getProductType());
          productJson.put("title", details.getTitle());
          productJson.put("name", details.getName());
          productJson.put("description", details.getDescription());

          JSObject oneTimePurchaseOfferDetails = new JSObject();
          oneTimePurchaseOfferDetails.put("priceAmountMicros", details.getOneTimePurchaseOfferDetails().getPriceAmountMicros());
          oneTimePurchaseOfferDetails.put("priceCurrencyCode", details.getOneTimePurchaseOfferDetails().getPriceCurrencyCode());
          oneTimePurchaseOfferDetails.put("formattedPrice", details.getOneTimePurchaseOfferDetails().getFormattedPrice());
          productJson.put("oneTimePurchaseOfferDetails", oneTimePurchaseOfferDetails);

          productsJson.put(productJson);
        }

        JSObject result = new JSObject();
        result.put("products", productsJson);
        call.resolve(result);

      } else {
        System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
        call.reject("Unable to query product details. Error code: " + billingResult.getResponseCode());
      }
    });
  }
}
