package com.trainingday;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    System.out.println("Hello world");
    registerPlugin(StorePlugin.class);
    FirebaseApp.initializeApp(this);
    super.onCreate(savedInstanceState);
  }
}
