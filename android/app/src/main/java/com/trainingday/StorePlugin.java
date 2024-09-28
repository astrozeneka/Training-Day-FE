package com.trainingday;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name="Store")
public class StorePlugin extends Plugin {
  @PluginMethod()
  public void getProducts(PluginCall call) {
    // Print ("Hello world") to the console
    System.out.println("Hello world from android");
    JSObject output = new JSObject();
    output.put("products", "Hello world from android");
    call.resolve(output);
  }
}
