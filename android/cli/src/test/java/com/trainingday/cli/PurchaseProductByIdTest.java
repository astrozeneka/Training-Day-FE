package com.trainingday.cli;

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

      // TODO, next step, handle the onPurchase callback
    }
  }
}
