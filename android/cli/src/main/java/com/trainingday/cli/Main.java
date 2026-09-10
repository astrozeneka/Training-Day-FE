package com.trainingday.cli;

import com.trainingday.common.CliProtocol;
import dadb.Dadb;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class Main {
    private static final String TARGET_DEVICE = "sdk_gphone64_arm64";

    public static void main(String[] args) throws Exception {
        Dadb dadb = null;
        for (Dadb candidate : Dadb.list()) {
            if (TARGET_DEVICE.equals(candidate.shell("getprop ro.product.model").getOutput().trim())) {
                dadb = candidate;
                break;
            }
        }

        if (dadb == null) {
            System.out.println("Device not found: " + TARGET_DEVICE);
            return;
        }

        // Test 1. Ping
        /*try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
             Socket socket = new Socket("localhost", CliProtocol.PORT);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
            out.println(CliProtocol.CMD_PING);
            System.out.println(in.readLine());
        }*/

        // Test 2. Get Products
        try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
             Socket socket = new Socket("localhost", CliProtocol.PORT);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
          out.println(CliProtocol.CMD_GET_PRODUCTS);
          System.out.println(in.readLine());
        }
    }
}
