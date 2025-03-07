package com.trainingday;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
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
import java.util.concurrent.CompletableFuture;

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
      .setListener((billingResult, purchases) -> { // purchases is nullable
        if (purchases != null) {
          // Handle purchase here
          System.out.println("StorePlugin: Purchase listener: " + purchases);
          JSObject output = new JSObject();
          JSArray jsPuchases = new JSArray();
          for (Purchase purchase : purchases) {
            JSObject jsPurchase = new JSObject();
            // The code below is redundant
            String orderId = purchase.getOrderId();
            if (orderId == null || orderId.isEmpty()) {
              String purchaseToken = purchase.getPurchaseToken();
              orderId = "GENERATED_" + (purchaseToken != null && purchaseToken.length() >= 10
                ? purchaseToken.substring(0, 10)
                : "DEFAULT");
            }
            jsPurchase.put("orderId", orderId);
            jsPurchase.put("packageName", purchase.getPackageName());
            jsPurchase.put("purchaseTime", purchase.getPurchaseTime());
            jsPurchase.put("purchaseState", purchase.getPurchaseState());
            jsPurchase.put("purchaseToken", purchase.getPurchaseToken());
            jsPurchase.put("quantity", purchase.getQuantity());
            jsPurchase.put("acknowledged", purchase.isAcknowledged());
            jsPuchases.put(jsPurchase);
          }
          output.put("purchases", jsPuchases);
          notifyListeners("onPurchase", output);
        } else {
          JSObject output = new JSObject();
          output.put("message", "No purchases found"); // Can also mean that the purchase has been aborted by the user
          notifyListeners("onPurchaseAborted", new JSObject());
        }
      })
      .enablePendingPurchases()
      .build();

    // Handle promo code sheet (Play Store) broadcast receiver
    System.out.println("StorePlugin: Registering promo receiver");
    IntentFilter filter = new IntentFilter(Intent.ACTION_VIEW);
    getContext().registerReceiver(promoReceiver, filter, Context.RECEIVER_NOT_EXPORTED);

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
            // Error 3: It generally show if the billing client is not available (due to geographical location or device restrictions)
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

  private CompletableFuture<List<ProductDetails>> _getProductDetails(PluginCall call){
    List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
    String productType = call.getString("type");
    if (productType.equals("inapp")) {
      List<String> inappList = new ArrayList<>();
      inappList.add("foodcoach__7d");
      inappList.add("foodcoach__30d");
      inappList.add("foodcoach__45d");
      inappList.add("sportcoach__7d");
      inappList.add("sportcoach__30d");
      inappList.add("sportcoach__45d");
      for (String sku : inappList) {
        productList.add(QueryProductDetailsParams.Product.newBuilder()
          .setProductId(sku)
          .setProductType(BillingClient.ProductType.INAPP)
          .build()
        );
      }
    } else if (productType.equals("subs")) {
      List<String> subsList = new ArrayList<>();
      // subsList.add("hoylt"); // Old naming (should be removed)
      // subsList.add("moreno"); // Old naming (should be removed)
      // subsList.add("alonzo"); // Old naming (should be removed)
      subsList.add("training_day");
      for (String sku : subsList) {
        productList.add(QueryProductDetailsParams.Product.newBuilder()
          .setProductId(sku)
          .setProductType(BillingClient.ProductType.SUBS)
          .build()
        );
      }
    } else {
      // Error 5: It generally show if the product type is not recognized
      call.reject("Product type must be either 'inapp' or 'subs', '" + productType + "' given");
    }


    // ===============================================
    QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
      .setProductList(productList)
      .build();
    CompletableFuture<List<ProductDetails>> future = new CompletableFuture<>();
    billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        future.complete(productDetailsList);
      } else {
        future.completeExceptionally(new RuntimeException("Unable to query product details. Error code: " + billingResult.getResponseCode()));
      }
    });
    return future;
  }

  public void loadProductList(PluginCall call) {
    try {
      List<ProductDetails> productDetailsList = _getProductDetails(call).get();
      System.out.println("StorePlugin: Query successful");
      // Print products as json
      System.out.println("StorePlugin: Products: " + productDetailsList.size() + " items");
      System.out.println(productDetailsList);
      JSArray productsJson = new JSArray();
      for (ProductDetails details : productDetailsList) {
        JSObject productJson = new JSObject();
        productJson.put("productId", details.getProductId());
        productJson.put("type", details.getProductType());
        productJson.put("title", details.getTitle());
        productJson.put("name", details.getName());
        productJson.put("description", details.getDescription());

        if (call.getString("type").equals("inapp")) {
          JSObject oneTimePurchaseOfferDetails = new JSObject();
          oneTimePurchaseOfferDetails.put("priceAmountMicros", details.getOneTimePurchaseOfferDetails().getPriceAmountMicros());
          oneTimePurchaseOfferDetails.put("priceCurrencyCode", details.getOneTimePurchaseOfferDetails().getPriceCurrencyCode());
          oneTimePurchaseOfferDetails.put("formattedPrice", details.getOneTimePurchaseOfferDetails().getFormattedPrice());
          productJson.put("oneTimePurchaseOfferDetails", oneTimePurchaseOfferDetails);
          productsJson.put(productJson);
        } else if (call.getString("type").equals("subs")) {
          JSArray subscriptionListJson = new JSArray();
          for (ProductDetails.SubscriptionOfferDetails subscription: details.getSubscriptionOfferDetails()){
            JSObject subscriptionJson = new JSObject();
            subscriptionJson.put("offerId", subscription.getOfferId()); // Optional
            subscriptionJson.put("basePlanId", subscription.getBasePlanId());
            subscriptionJson.put("offerIdToken", subscription.getOfferToken());


            JSArray offerTags = new JSArray();
            for (String tag: subscription.getOfferTags()){
              offerTags.put(tag);
            }
            subscriptionJson.put("offerTags", offerTags);
            JSArray pricePhasingListJson = new JSArray();
            for (ProductDetails.PricingPhase pricePhase: subscription.getPricingPhases().getPricingPhaseList()){
              JSObject pricePhasingJson = new JSObject();
              pricePhasingJson.put("priceAmountMicros", pricePhase.getPriceAmountMicros());
              pricePhasingJson.put("priceCurrencyCode", pricePhase.getPriceCurrencyCode());
              pricePhasingJson.put("formattedPrice", pricePhase.getFormattedPrice());
              pricePhasingJson.put("billingPeriod", pricePhase.getBillingPeriod());
              pricePhasingJson.put("recurrenceMode", pricePhase.getRecurrenceMode());
              pricePhasingJson.put("billingCycleCount", pricePhase.getBillingCycleCount()); // Optional
              pricePhasingListJson.put(pricePhasingJson);
            }
            subscriptionJson.put("pricingPhases", pricePhasingListJson);
            subscriptionListJson.put(subscriptionJson);
          }
          productJson.put("subscriptionOfferDetails", subscriptionListJson);
          productsJson.put(productJson);
        }
      }
      JSObject result = new JSObject();
      result.put("products", productsJson);
      call.resolve(result);
    } catch (Exception e) {
      System.out.println("StorePlugin: Error code: " + e.getMessage());
      call.reject("Unable to query product details. Error code: " + e.getMessage());
    }
    /*

    return;
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
     */
  }

  @PluginMethod()
  public void purchaseProductById(PluginCall call) {
    System.out.println("StorePlugin: Purchasing product by ID"); // ok
    String productId = call.getString("productId");
    if (!billingClient.isReady()){
      // The code below is redundant
      // TODO: should consider to refactor in the future
      billingClient.startConnection(new BillingClientStateListener() {
        @Override
        public void onBillingSetupFinished(BillingResult billingResult) {
          if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            System.out.println("StorePlugin: Billing client is ready");
            processPurchase(productId, call); // Very carefull of the redundant code
            call.resolve(); // TODO, should be refactored if possible
          } else {
            System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
            // Error 3: It generally show if the billing client is not available (due to geographical location or device restrictions)
            call.reject("Unable to purchase product. Error code: " + billingResult.getResponseCode());
          }
        }
        @Override
        public void onBillingServiceDisconnected() {
          // Try to restart the connection on the next request to
          // Google Play by calling the startConnection() method.
          call.reject("Unable to purchase product. Error code: Billing service disconnected");
        }
      });
    } else {
      processPurchase(productId, call); // Very carefull of the redundant code
      call.resolve(); // TODO, should be refactored if possible
    }
  }

  public void processPurchase(String productId, PluginCall call){
    System.out.println("StorePlugin: Processing purchase for product: " + productId + ", type is " + call.getString("type")); // ok
    String productType = call.getString("type");
    try {
      // Step 1. fetch the product details
      List<ProductDetails> productDetailsList = _getProductDetails(call).get();
      ProductDetails productDetails = productDetailsList.stream()
        .filter(details -> details.getProductId().equals(productId))
        .findFirst()
        .orElse(null);

      // Step 2. Set product details params list
      List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
      if (productType.equals("inapp")) {
        productDetailsParamsList.add(
          BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)
            .build()
        );
      } else if (productType.equals("subs")) {
        String offerToken = call.getString("offerToken");
        productDetailsParamsList.add(
          BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)
            .setOfferToken(offerToken)
            .build()
        );
      } else {
        // Error 5: It generally show if the product type is not recognized
        call.reject("Product type must be either 'inapp' or 'subs', '" + productType + "' given");
      }

      // Step 3. Set the flow params
      BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
        .setProductDetailsParamsList(productDetailsParamsList)
        .build();

      // Step 4. Launch
      System.out.println("Launching billing flow...");
      BillingResult billingResult = billingClient.launchBillingFlow(getActivity(), billingFlowParams);
      System.out.println("Billing flow done " + billingResult);
      System.out.println(billingResult); // Response Code: OK, Debug Message: null

    } catch (Exception e) {
      System.out.println("StorePlugin: Error code: " + e.getMessage());
    }
  }

  @PluginMethod()
  public void getAndroidEntitlements(PluginCall call) {
    // This is to manage the store registered products but not early handled
    System.out.println("getAndroidEntitlements");
    if (!billingClient.isReady()){
      billingClient.startConnection(new BillingClientStateListener() {
        @Override
        public void onBillingSetupFinished(BillingResult billingResult) {
          if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            System.out.println("StorePlugin: Billing client is ready");
            loadEntitlements(call);
          } else {
            System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
            // Error 3: It generally show if the billing client is not available (due to geographical location or device restrictions)
          }
        }
        @Override
        public void onBillingServiceDisconnected() {
          // Try to restart the connection on the next request to
          // Google Play by calling the startConnection() method.
        }
      });
    } else {
      loadEntitlements(call);
    }
  }

  private void loadEntitlements(PluginCall call) {
    // This is to manage the store registered products but not early handled
    System.out.println("StorePlugin: Loading entitlements");
    QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
      .setProductType(BillingClient.ProductType.INAPP)
      .build();
    billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        System.out.println("StorePlugin: Entitlements loaded");
        // Print purchases as json
        System.out.println("StorePlugin: Purchases: " + purchases.size() + " items");

        JSArray entitlementsJson = new JSArray();
        for (Purchase purchase : purchases) {
          JSObject entitlementJson = new JSObject();
          String orderId = purchase.getOrderId();
          if (orderId == null || orderId.isEmpty()) {
            String purchaseToken = purchase.getPurchaseToken();
            orderId = "GENERATED_" + (purchaseToken != null && purchaseToken.length() >= 10
              ? purchaseToken.substring(0, 10)
              : "DEFAULT");
          }
          System.out.print("Order Id is: " + orderId);
          entitlementJson.put("orderId", orderId);
          entitlementJson.put("packageName", purchase.getPackageName());
          entitlementJson.put("purchaseTime", purchase.getPurchaseTime());
          entitlementJson.put("purchaseState", purchase.getPurchaseState());
          entitlementJson.put("purchaseToken", purchase.getPurchaseToken());
          entitlementJson.put("quantity", purchase.getQuantity());
          entitlementJson.put("acknowledged", purchase.isAcknowledged());

          JSArray entitlementProducts = new JSArray();
          for (String product: purchase.getProducts()) {
            entitlementProducts.put(product);
          }
          entitlementJson.put("products", entitlementProducts);

          entitlementsJson.put(entitlementJson);
        }

        JSObject result = new JSObject();
        result.put("entitlements", entitlementsJson);
        call.resolve(result);
      } else {
        System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
        // Error 3: It generally show if the billing client is not available (due to geographical location or device restrictions)
      }
    });
  }

  private BroadcastReceiver promoReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (intent != null && intent.getAction() != null && intent.getAction().equals(Intent.ACTION_VIEW)){
        System.out.println("StorePlugin: Promo deep link opened");
      }
    }
  };

  @PluginMethod()
  public void openAndroidPromoDeepLink(PluginCall call){
    System.out.println("StorePlugin: Opening promo deep link");
    String promolink = call.getString("url");

    // Creating intent
    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(promolink));
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getContext().startActivity(intent);

    JSObject output = new JSObject();
    output.put("message", "Promo deep link opened");
    call.resolve(output);
  }

  @PluginMethod()
  public void forceAndroidConsumeProduct(PluginCall call){
    String purchaseToken = call.getString("purchaseToken");
    System.out.println("StorePlugin: Consuming product with purchase token: " + purchaseToken);
    if (!billingClient.isReady()){
      billingClient.startConnection(new BillingClientStateListener() {
        @Override
        public void onBillingSetupFinished(BillingResult billingResult) {
          if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            System.out.println("StorePlugin: Billing client is ready");
            _forceAndroidConsumeProduct(call);
          } else {
            System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
            // Error 3: It generally show if the billing client is not available (due to geographical location or device restrictions)
          }
        }
        @Override
        public void onBillingServiceDisconnected() {
          // Try to restart the connection on the next request to
          // Google Play by calling the startConnection() method.
        }
      });
    } else {
      _forceAndroidConsumeProduct(call);
    }
  }

  private void _forceAndroidConsumeProduct(PluginCall call){
    String purchaseToken = call.getString("purchaseToken");

    if (purchaseToken == null || purchaseToken.isEmpty()) {
      call.reject("Purchase token is required.");
      return;
    }

    ConsumeParams consumeParams = ConsumeParams.newBuilder()
      .setPurchaseToken(purchaseToken)
      .build();
    billingClient.consumeAsync(consumeParams, (result, outToken) -> {
      if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        JSObject output = new JSObject();
        output.put("message", "Product consumed");
        call.resolve(output);
      } else {
        call.reject("Failed to consume product: " + result.getDebugMessage());
      }
    });
  }

  @PluginMethod()
  public void acknowledgeAndroidPurchase(PluginCall call){
    String purchaseToken = call.getString("purchaseToken");
    System.out.println("StorePlugin: Acknowledging purchase with purchase token: " + purchaseToken);
    if (!billingClient.isReady()){
      billingClient.startConnection(new BillingClientStateListener() {
        @Override
        public void onBillingSetupFinished(BillingResult billingResult) {
          if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            System.out.println("StorePlugin: Billing client is ready");
            _acknowledgeAndroidPurchase(call);
          } else {
            System.out.println("StorePlugin: Error code: " + billingResult.getResponseCode());
            // Error 3: It generally show if the billing client is not available (due to geographical location or device restrictions)
          }
        }
        @Override
        public void onBillingServiceDisconnected() {
          // Try to restart the connection on the next request to
          // Google Play by calling the startConnection() method.
        }
      });
    } else {
      _acknowledgeAndroidPurchase(call);
    }
  }

  private void _acknowledgeAndroidPurchase(PluginCall call){
    String purchaseToken = call.getString("purchaseToken");

    if (purchaseToken == null || purchaseToken.isEmpty()) {
      call.reject("Purchase token is required.");
      return;
    }

    AcknowledgePurchaseParams acknowledgeParams = AcknowledgePurchaseParams.newBuilder()
      .setPurchaseToken(purchaseToken)
      .build();
    billingClient.acknowledgePurchase(acknowledgeParams, result -> {
      if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        JSObject output = new JSObject();
        output.put("message", "Purchase acknowledged");
        call.resolve(output);
      } else {
        call.reject("Failed to acknowledge purchase: " + result.getDebugMessage());
      }
    });
  }

  @PluginMethod()
  public void openAndroidSubscriptionManagementPage(PluginCall call){
    String packageName = getContext().getPackageName();
    String subscriptionProductId = call.getString("productId");

    if (subscriptionProductId == null || subscriptionProductId.isEmpty()) {
      call.reject("Product ID is required.");
      return;
    }

    Uri uri = Uri.parse("https://play.google.com/store/account/subscriptions?package=" + packageName + "&sku=" + subscriptionProductId);
    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
    intent.addFlags((Intent.FLAG_ACTIVITY_NEW_TASK));

    getContext().startActivity(intent);

    JSObject output = new JSObject();
    output.put("message", "Browser opened");
    call.resolve(output);
  }
}
