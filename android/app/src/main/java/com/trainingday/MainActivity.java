package com.trainingday;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.perf.metrics.AddTrace;

public class MainActivity extends BridgeActivity {
  @AddTrace(name = "onCreateTrace", enabled = true /* optional */)
  @Override
  public void onCreate(Bundle savedInstanceState) {
    System.out.println("Hello world");
    FirebaseApp.initializeApp(this);
    super.onCreate(savedInstanceState);
  }
}
