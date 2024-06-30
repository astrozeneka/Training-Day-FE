//
//  StorePlugin.swift
//  App
//
//  Created by Ryan Rasoarahona on 30/6/2567 BE.
//

import Foundation
import Capacitor

@objc(StorePlugin)
public class StorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StorePlugin"
    public let jsName = "Store"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise)
    ]
    
    private var store: Store?
    
    
    override public func load() {
        store = Store()
        // Init the notification listener
    }
    
    @objc func getProducts(_ call: CAPPluginCall){
        let products = self.store?.products.map { product in
            return [
                "id": product.id,
                "displayName": product.displayName,
                "description": product.description,
                "price": product.price
            ]
        } ?? []
        call.resolve([
            "products": products
        ])
    }
}
