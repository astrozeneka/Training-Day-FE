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
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchaseProductById", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPurchasedNonRenewable", returnType: CAPPluginReturnPromise), // deprecated, will not be used anymore
        
        CAPPluginMethod(name: "getNonRenewableEntitlements", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAutoRenewableEntitlements", returnType: CAPPluginReturnPromise)
    ]
    
    private var store: Store?
    
    
    override public func load() {
        store = Store(self)
        // Init the notification listener
    }
    
    @objc func getProducts(_ call: CAPPluginCall){
        let products = self.store?.products.map { product in
            return [
                "id": product.id,
                "displayName": product.displayName,
                "description": product.description,
                "price": product.price,
                "displayPrice": product.displayPrice
            ]
        } ?? []
        call.resolve([
            "products": products
        ])
    }
    
    @objc func purchaseProductById(_ call: CAPPluginCall){
        guard let productID = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        guard let product = self.store?.products.first(where: {$0.id == productID}) else {
            call.reject("Product not found")
            return
        }
        Task <Void, Never> { // Type of expression is ambiguous without a type annotation
            do { // Sometimes throw, the compiler is unable to type-check the expression ina reasonable amount of time
                let handledTransaction = try await self.store?.purchase(product)
                call.resolve([
                    "success": true,
                    "transaction": [
                        "bundleId": handledTransaction?.appBundleID ?? "",
                        "deviceVerification": handledTransaction?.deviceVerification.base64EncodedString() ?? "",
                        "deviceVerificationNonce": handledTransaction?.deviceVerificationNonce.uuidString ?? "",
                        // "environment": handledTransaction?.environment,
                        "inAppOwnershipType": handledTransaction?.ownershipType.rawValue ?? "",
                        //"originalPurchaseDate": handledTransaction?.originalPurchaseDate.formatted() ?? "", // Still have errors
                        //"originalTransactionId": handledTransaction?.originalID ?? 0,
                        //"productId": handledTransaction?.productID ?? "",
                        //"purchaseDate": handledTransaction?.purchaseDate.formatted() ?? "", // Still have errors
                        "quantity": handledTransaction?.purchasedQuantity ?? 0,
                        "signedDate": handledTransaction?.signedDate ?? "",
                        "transactionId": handledTransaction?.id ?? "",
                        //"currency": handledTransaction?.currency ?? ""
                    ]
                ])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }
    
    @objc func getPurchasedNonRenewable(_ call: CAPPluginCall) {
        // Deprecated function
        let purchasedNonRenewables = self.store?.purchasedNonRenewables.map { product in
            return [
                // "itemID": product.itemID,
                "id": product.id,
                "type": product.type.rawValue,
                "displayName": product.displayName,
                "description": product.description,
                "price": product.price,
                "displayPrice": product.displayPrice,
                "isFamilyShareable": product.isFamilyShareable,
                "subscription": product.subscription,
                "json": product.jsonRepresentation
            ]
        }
    }
    
    @objc func getNonRenewableEntitlements(_ call: CAPPluginCall) {
        let nonRenewableEntitlements = self.store?.purchasedNonRenewablesEntitlements.map { handledTransaction in
            return [
                "bundleId": handledTransaction.appBundleID,
                "deviceVerification": handledTransaction.deviceVerification.base64EncodedString(),
                "deviceVerificationNonce": handledTransaction.deviceVerificationNonce.uuidString,
                // "environment": handledTransaction?.environment,
                "inAppOwnershipType": handledTransaction.ownershipType.rawValue,
                //"originalPurchaseDate": handledTransaction?.originalPurchaseDate.formatted() ?? "", // Still have errors
                //"originalTransactionId": handledTransaction?.originalID ?? 0,
                //"productId": handledTransaction?.productID ?? "",
                //"purchaseDate": handledTransaction?.purchaseDate.formatted() ?? "", // Still have errors
                "quantity": handledTransaction.purchasedQuantity,
                "signedDate": handledTransaction.signedDate,
                "transactionId": handledTransaction.id,
                //"currency": handledTransaction?.currency ?? ""
            ]
        }
        let purchasedSubscriptions = self.store?.purchasedSubscriptions.map { product in
            return [
                "id": product.id,
                "displayName": product.displayName,
                "description": product.description,
                "price": product.price,
                "displayPrice": product.displayPrice
            ]
        }
        call.resolve([
            "entitlements": nonRenewableEntitlements,
            "subscriptions": purchasedSubscriptions // TODO, Fix this, but should not be purchased Subscriptions
        ])
    }
    
    @objc func getAutoRenewableEntitlements(_ call: CAPPluginCall) {
        let autoRenewableEntitlements = self.store?.purchasedAutoRenewablesEntitlements.map { handledTransaction in
            return [
                "bundleId": handledTransaction.appBundleID,
                "deviceVerification": handledTransaction.deviceVerification.base64EncodedString(),
                "deviceVerificationNonce": handledTransaction.deviceVerificationNonce.uuidString,
                // "environment": handledTransaction?.environment,
                "inAppOwnershipType": handledTransaction.ownershipType.rawValue,
                //"originalPurchaseDate": handledTransaction?.originalPurchaseDate.formatted() ?? "", // Still have errors
                //"originalTransactionId": handledTransaction?.originalID ?? 0,
                //"productId": handledTransaction?.productID ?? "",
                //"purchaseDate": handledTransaction?.purchaseDate.formatted() ?? "", // Still have errors
                "quantity": handledTransaction.purchasedQuantity,
                "signedDate": handledTransaction.signedDate,
                "transactionId": handledTransaction.id,
                //"currency": handledTransaction?.currency ?? ""
            ]
        }
        let purchasedSubscriptions = self.store?.purchasedSubscriptions.map { product in
            return [
                "id": product.id,
                "displayName": product.displayName,
                "description": product.description,
                "price": product.price,
                "displayPrice": product.displayPrice
            ]
        }
        call.resolve([
            "entitlements": autoRenewableEntitlements,
            "subscriptions": purchasedSubscriptions
        ])
    }
}
