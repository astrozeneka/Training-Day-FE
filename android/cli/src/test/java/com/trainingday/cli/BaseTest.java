package com.trainingday.cli;

import dadb.Dadb;
import org.junit.AfterClass;
import org.junit.Assume;
import org.junit.BeforeClass;

public class BaseTest {
    private static final String TARGET_DEVICE = "sdk_gphone64_arm64";

    protected static Dadb dadb;

    @BeforeClass
    public static void findDevice() throws Exception {
        for (Dadb candidate : Dadb.list()) {
            if (TARGET_DEVICE.equals(candidate.shell("getprop ro.product.model").getOutput().trim())) {
                dadb = candidate;
                break;
            }
        }
        Assume.assumeNotNull("Device not found: " + TARGET_DEVICE, dadb);
    }

    @AfterClass
    public static void closeDevice() throws Exception {
        if (dadb != null) {
            dadb.close();
        }
    }
}