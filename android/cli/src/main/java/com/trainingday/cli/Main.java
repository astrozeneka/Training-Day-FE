package com.trainingday.cli;

import dadb.AdbShellResponse;
import dadb.Dadb;

import java.util.List;

public class Main {
    public static void main(String[] args) throws Exception {
        List<Dadb> devices = Dadb.list();
        if (devices.isEmpty()) {
            System.out.println("No connected device found");
            return;
        }

        for (Dadb dadb : devices) {
            try (dadb) {
                AdbShellResponse response = dadb.shell("getprop ro.product.model");
                System.out.println(response.getOutput().trim());
            }
        }
    }
}
