package com.trainingday;

import com.trainingday.common.CliProtocol;

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
            switch (request) {
              case CliProtocol.CMD_PING:
                out.println("pong");
                break;
              case CliProtocol.CMD_GET_PRODUCTS:
                StorePluginCliAdapter.getInstance().getProducts();
                out.println("getProducts: request sent to StorePlugin");
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
