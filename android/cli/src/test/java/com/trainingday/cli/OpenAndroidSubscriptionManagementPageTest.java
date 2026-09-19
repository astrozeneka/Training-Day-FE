package com.trainingday.cli;

import static org.junit.Assert.assertTrue;

import com.trainingday.common.CliProtocol;
import com.trainingday.common.CliRequest;

import org.json.JSONObject;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class OpenAndroidSubscriptionManagementPageTest extends BaseTest {
  /**
   * This test is supposed to open the Play Store subscription management page
   */
  @Test
  public void openAndroidSubscriptionManagementPage_opensPage() throws Exception {
    // Warning, this test is not automatable and will possibly removed later
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_OPEN_ANDROID_SUBSCRIPTION_MANAGEMENT_PAGE,
        new JSONObject()
          .put("productId", "training_day")
      ).encode());
      String response = in.readLine();
      System.out.println("Response: " + response);
      assertTrue(response.toLowerCase().contains("browser opened"));
    }
  }

  /*@Test
  public void openAndroidSubscriptionManagementPage_missingProductId_returnsError() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT);
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
         BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
      out.println(new CliRequest(CliProtocol.CMD_OPEN_ANDROID_SUBSCRIPTION_MANAGEMENT_PAGE,
        new JSONObject()
      ).encode());
      String response = in.readLine();
      assertTrue(response.toLowerCase().contains("product id is required"));
    }
  }*/
}
