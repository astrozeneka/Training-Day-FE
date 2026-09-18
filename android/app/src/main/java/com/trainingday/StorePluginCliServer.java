package com.trainingday;


import com.trainingday.common.CliProtocol;
import com.trainingday.common.CliRequest;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class StorePluginCliServer {
  private static final StorePluginCliServer INSTANCE = new StorePluginCliServer();
  private boolean started = false;

  private StorePluginCliServer() {}

  public static StorePluginCliServer getInstance() {
    return INSTANCE;
  }

  public void listen() {
    if (started) return;
    started = true;
    new Thread(() -> {
      try (ServerSocket serverSocket = new ServerSocket(CliProtocol.PORT)) {
        while (true) {
          try (Socket socket = serverSocket.accept();
               BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
               PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {
            String request = in.readLine();
            CliRequest cliRequest = CliRequest.decode(request);
            switch (cliRequest.command) {
              case CliProtocol.CMD_PING:
                out.println("pong");
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
                  error -> out.println("Error: " + error)
                );
                break;
              default:
                out.println("Unknown command: " + request);
            }
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }).start();
  }
}
