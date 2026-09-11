package com.trainingday.cli;

import com.trainingday.common.CliProtocol;

import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

import static org.junit.Assert.assertEquals;

public class CliPingTest extends BaseTest {
    @Test
    public void ping_respondsWithPong() throws Exception {
        try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
             Socket socket = new Socket("localhost", CliProtocol.PORT);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
            out.println(CliProtocol.CMD_PING);
            assertEquals("pong", in.readLine());
        }
    }
}