package com.trainingday.cli;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import com.trainingday.common.CliProtocol;
import com.trainingday.common.CliRequest;

import org.json.JSONObject;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;


public class PurchaseProductByIdTest extends BaseTest {
  /**
   * This test is supposed to open the purchase flow for a product
   */
  @Test
  public void purchaseProductById_opensPurchaseFlow() throws Exception {
    // Warning, this test is not automatable and will possibly removed later
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID,
        new JSONObject()
          .put("productId", "training_day")
          .put("type", "subs")
          .put("offerToken", "AcE6+HKaoixIHmeIPrB8b+qNpiL5UqPFtMsJnOmo1qiGHbCTtbJ7PcIQgHP0r9ia+ZTScLmzq7Z2VV4=")
      ).encode());
      String response = in.readLine();
      System.out.println("Response: " + response);
      assertEquals("{}", response);
    }
  }

  @Test
  public void purchaseProductById_invalidProductId_returnsError() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID,
        new JSONObject()
          .put("productId", "invalid_product_id")
          .put("type", "subs")
          .put("offerToken", "AcE6+HKaoixIHmeIPrB8b+qNpiL5UqPFtMsJnOmo1qiGHbCTtbJ7PcIQgHP0r9ia+ZTScLmzq7Z2VV4=")
      ).encode());
      String response = in.readLine();
      // ASSERT that product not found is in the response
      assertTrue(response.toLowerCase().contains("product not found"));
    }
  }

  @Test
  public void purchaseProductById_invalidType_returnsError() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID,
        new JSONObject()
          .put("productId", "training_day")
          .put("type", "invalid_type")
          .put("offerToken", "AcE6+HKaoixIHmeIPrB8b+qNpiL5UqPFtMsJnOmo1qiGHbCTtbJ7PcIQgHP0r9ia+ZTScLmzq7Z2VV4=")
      ).encode());
      String response = in.readLine();
      assertTrue(response.toLowerCase().contains("product type must be"));
    }
  }

  @Test
  public void purchaseProductById_missingOfferToken_returnsError() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID,
        new JSONObject()
          .put("productId", "training_day")
          .put("type", "subs")
      ).encode());
      String response = in.readLine();
      // In a new version, the text messages need to be standardized;
      // This exception is from the API, not coded in the plugin, so it may change in the future
      assertTrue(response.toLowerCase().contains("offerToken can not be empty"));
    }
  }

  @Test
  public void purchaseProductById_invalidOfferToken_returnsError() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID,
        new JSONObject()
          .put("productId", "training_day")
          .put("type", "subs")
          .put("offerToken", "invalid_offer_token")
      ).encode());

      // 1. purchaseProductById resolves as soon as launchBillingFlow is called,
      // before the Play sheet is shown or closed.
      String response = in.readLine();
      assertEquals("{}", response);

      // 2. The sheet then displays its own error and, once the user closes it,
      // StorePlugin's listener fires exactly one onPurchase/onPurchaseAborted event.
      String eventPrefix = CliProtocol.EVENT_PREFIX + "onPurchaseAborted ";
      String event = in.readLine();
      assertTrue(event.startsWith(eventPrefix));

      JSONObject eventData = new JSONObject(event.substring(eventPrefix.length()));
      assertEquals(6, eventData.getInt("code")); // BillingResponseCode.ERROR
    }
  }
}
