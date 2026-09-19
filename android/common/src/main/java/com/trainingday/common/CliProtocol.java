package com.trainingday.common;

public final class CliProtocol {
  public static final int PORT = 8765;

  public static final String EVENT_PREFIX = "EVENT ";
  public static final String ERROR_PREFIX = "ERROR ";
  public static final String CMD_PING = "ping";
  public static final String CMD_PING_ASYNC = "pingAsync";
  public static final String CMD_GET_PRODUCTS = "getProducts";
  public static final String CMD_PURCHASE_PRODUCT_BY_ID = "purchaseProductById";

  private CliProtocol() {}
}
