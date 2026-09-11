package com.trainingday.cli;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.trainingday.common.CliProtocol;

import org.json.JSONArray;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class GetProductsTest extends BaseTest {
    @Test
    public void getProducts_returnsProductList() throws Exception {
        try (AutoCloseable forwarder = dadb.tcpForward(CliProtocol.PORT, CliProtocol.PORT);
             Socket socket = new Socket("localhost", CliProtocol.PORT);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
            out.println(CliProtocol.CMD_GET_PRODUCTS);
            String response = in.readLine();
            System.out.println("Response: " + response);
            JSONArray products = new JSONArray(response);
            // Expect to have at least one product in the list
            assertFalse(products.isEmpty());
            // First product should have "product_id" attribute
            assertTrue(products.getJSONObject(0).has("productId"));
            // The id of that first product should be "training_day"
            assertEquals("training_day", products.getJSONObject(0).getString("productId"));
        }
    }
}
