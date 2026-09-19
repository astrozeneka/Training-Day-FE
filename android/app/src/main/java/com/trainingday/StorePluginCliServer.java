package com.trainingday;


import com.trainingday.common.CliProtocol;
import com.trainingday.common.CliRequest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class StorePluginCliServer {
  private static final StorePluginCliServer INSTANCE = new StorePluginCliServer();
  private static final List<String> LISTENED_EVENTS = Arrays.asList("onPurchase", "onPurchaseAborted");
  private boolean started = false;

  private StorePluginCliServer() {}

  public static StorePluginCliServer getInstance() {
    return INSTANCE;
  }

  public void listen() {
    new Thread(() -> {
      try (ServerSocket serverSocket = new ServerSocket(CliProtocol.PORT)) {
        while (true) { // bidirectional socket architecture
          Socket socket = serverSocket.accept();
          new Thread(() -> handleClient(socket)).start();
        }
      } catch (IOException e) {
        e.printStackTrace();
      }
    }).start();
  }

  private void handleClient(Socket socket){
    BlockingQueue<String> eventQueue = new LinkedBlockingQueue<>();
    Map<String, String> listenerCallbackIds = new HashMap<>();
    Thread eventWriter = null;

    try ( socket; // ?
          BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
          PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

      for (String eventName : LISTENED_EVENTS) {
        String callbackId = StorePluginCliAdapter.getInstance().addListener(
          eventName,
          data -> eventQueue.add(CliProtocol.EVENT_PREFIX + eventName + " " + data.toString())
        );
        listenerCallbackIds.put(eventName, callbackId);
      }

      eventWriter = new Thread(() -> {
        try {
          while (!Thread.currentThread().isInterrupted()) {
            out.println(eventQueue.take());
          }
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
        }
      });
      eventWriter.start();

      String request;
      while ((request = in.readLine()) != null) {
        CliRequest cliRequest = CliRequest.decode(request);
        switch (cliRequest.command) {
          case CliProtocol.CMD_PING:
            out.println("pong");
            break;
          case CliProtocol.CMD_PING_ASYNC:
            Thread.sleep(1000);
            out.println(CliProtocol.EVENT_PREFIX + "pong");
            break;
          case CliProtocol.CMD_GET_PRODUCTS:
            StorePluginCliAdapter.getInstance().getProductsAsync(
              (result) -> {
                out.println(result.toString());
              },
              error -> out.println("Error: " + error)
            );
            break;
          case CliProtocol.CMD_PURCHASE_PRODUCT_BY_ID:
            StorePluginCliAdapter.getInstance().purchaseProductByIdAsync(
              cliRequest.params,
              (result) -> out.println(result.toString()),
              error -> out.println(CliProtocol.ERROR_PREFIX + error)
            );
            break;
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      if (eventWriter != null) {
        eventWriter.interrupt();
      }
      for (Map.Entry<String, String> entry : listenerCallbackIds.entrySet()) {
        StorePluginCliAdapter.getInstance().removeEventListener(entry.getKey(), entry.getValue());
      }
    }
  }
}
