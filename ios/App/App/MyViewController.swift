//
//  MyViewController.swift
//  App
//
//  Created by Ryan Rasoarahona on 29/6/2567 BE.
//

import Foundation
import Capacitor

class MyViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        print("Register StorePlugin")
        bridge?.registerPluginInstance(StorePlugin())
    }
}
