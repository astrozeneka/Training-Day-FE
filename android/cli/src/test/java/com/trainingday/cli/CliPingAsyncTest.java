package com.trainingday.cli;

import static org.junit.Assert.assertEquals;

import com.trainingday.common.CliProtocol;

import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class CliPingAsyncTest extends BaseTest {
  @Test
  public void pingAsync_respondsWithPongEvent() throws Exception {
    try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
         Socket socket = new Socket("localhost", CliProtocol.PORT)) {
      PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
      BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

      LinkedBlockingQueue<String> incoming = new LinkedBlockingQueue<>();
      Thread reader = new Thread(() -> {
        try {
          String line;
          while ((line = in.readLine()) != null) {
            incoming.put(line);
          }
        } catch (Exception e) {
          // socket.close() below unblocks this pending readLine(); expected at shutdown
        }
      });
      reader.setDaemon(true);
      reader.start();

      out.println(CliProtocol.CMD_PING_ASYNC);

      String event = incoming.poll(5, TimeUnit.SECONDS);
      assertEquals(CliProtocol.EVENT_PREFIX + "pong", event);
    }
  }
}
