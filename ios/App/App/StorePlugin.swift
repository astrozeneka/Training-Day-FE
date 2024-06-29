//
//  StorePlugin.swift
//  App
//
//  Created by Ryan Rasoarahona on 29/6/2567 BE.
//

import Foundation
import Capacitor
import StoreKit

@objc(StorePluhin)
public class StorePlugin: CAPPlugin, CAPBridgedPlugin {
    private var store: Store?
    
    public let identifier = "StorePlugin"
    public let jsName = "Store"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initStore", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise)
    ]
    
    override public func load() {
        self.store = Store()
        NotificationCenter.default.addObserver(self, selector: #selector(handleProductsLoaded(_:)), name: .productsLoaded, object: nil)
    }
    
    @objc func initStore(_ call: CAPPluginCall){
        // Coulnd't be used anymore
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
            "value": products
        ])
    }
    
    @objc func echo(_ call: CAPPluginCall){
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value
        ])
    }
    
    @objc func handleProductsLoaded(_ notification: Notification) {
        // A function for asynchronous loading (ok)
        print("handleProductsLoaded called")
        guard let products = notification.userInfo?["products"] as? [Product] else {
            return
        }
        let jsProducts = products.map { product in
            return [
                "id": product.id,
                "displayName": product.displayName,
                "description": product.description,
                "price": product.price
            ]
        }
        print("Notify the 'productsLoaded' listener")
        notifyListeners("productsLoaded", data: ["products": "Hello world"])
    }
}
