package com.trainingday.cli;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.trainingday.common.CliProtocol;
import com.trainingday.common.CliRequest;

import org.json.JSONObject;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class AcknowledgeAndroidPurchaseTest extends BaseTest {

  @Test
  public void acknowledgeAndroidPurchase_withoutPending() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_ACKNOWLEDGE_ANDROID_PURCHASE,
        new JSONObject()
          .put("purchaseToken", "invalid_purchase_token")
        ).encode());

      // 1. As usual, acknowledgeAndroidPurchase will return an empty JSONObject "{}"
      String response = in.readLine();
      assertTrue(response.toLowerCase().contains("error"));
      assertTrue(response.toLowerCase().contains("invalid token"));
    }
  }

  @Test
  public void acknowledgeAndroidPurchase_withValidToken() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      // 1. Trigger the purchase 'hoylt'
      out.println(new CliRequest(CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID,
        new JSONObject()
          .put("productId", "training_day")
          .put("type", "subs")
          .put("offerToken", "AcE6+HKaoixIHmeIPrB8b+qNpiL5UqPFtMsJnOmo1qiGHbCTtbJ7PcIQgHP0r9ia+ZTScLmzq7Z2VV4=")
      ).encode());
      String response = in.readLine();
      System.out.println("Response: " + response);
      assertEquals("{}", response);

      // 2. Wait for a second notification for
      // onPurchase event
      String eventPrefix = CliProtocol.EVENT_PREFIX + "onPurchase ";
      String event = in.readLine();
      assertTrue(event.startsWith(eventPrefix));

      // Then extract the purchase token
      JSONObject purchaseResult = new JSONObject(event.substring(eventPrefix.length()));
      String purchaseToken = purchaseResult
        .getJSONArray("purchases").getJSONObject(0).getString("purchaseToken");
      assertNotNull(purchaseToken);

      // 3. Acknowledge the purchase using the extracted token
      out.println(new CliRequest(CliProtocol.CMD_ACKNOWLEDGE_ANDROID_PURCHASE,
        new JSONObject()
          .put("purchaseToken", purchaseToken)
      ).encode());
      String ackResponse = in.readLine();
      assertTrue(ackResponse.toLowerCase().contains("purchase acknowledged"));
    }

  }
}
