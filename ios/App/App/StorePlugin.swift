//
//  StorePlugin.swift
//  App
//
//  Created by Ryan Rasoarahona on 30/6/2567 BE.
//

import Foundation
import Capacitor
import SwiftUI
import StoreKit

@objc(StorePlugin)
public class StorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StorePlugin"
    public let jsName = "Store"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchaseProductById", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPurchasedNonRenewable", returnType: CAPPluginReturnPromise), // deprecated, will not be used anymore
        
        CAPPluginMethod(name: "getNonRenewableEntitlements", returnType: CAPPluginReturnPromise), // deprecated
        CAPPluginMethod(name: "getAutoRenewableEntitlements", returnType: CAPPluginReturnPromise),
        
        // Experimental features
        CAPPluginMethod(name: "present", returnType: CAPPluginReturnPromise),
        
        // The redeem code sheet
        CAPPluginMethod(name: "presentRedeemCodeSheet", returnType: CAPPluginReturnPromise)
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
        print("ProductId is \(productID)")
        guard let product = self.store?.products.first(where: {$0.id == productID}) else {
            call.reject("Product not found")
            return
        }
        Task <Void, Never> { // Type of expression is ambiguous without a type annotation
            do { // Sometimes throw, the compiler is unable to type-check the expression ina reasonable amount of time
              if let handledTransaction = try await self.store?.purchase(product){
                let transactionDetails: [String: Any] = [
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
                  "id": handledTransaction.id, // This is what we want to experiment
                  "environment": handledTransaction.environment.rawValue
                ]
                call.resolve([
                  "success": true,
                  "transaction": transactionDetails
                ])
              } else {
                call.reject("Transaction annulée par l'utiliateur")
              }
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
      // Same code as in Store::listenForTransactions and more
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
    
    @objc func present(_ call: CAPPluginCall){
        let message = call.getString("message") ?? ""
        let alertController = UIAlertController(title: "Alert", message: message, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: "Ok", style: .default))
        
        DispatchQueue.main.async {
            print("Presenting alert controller")
            print(self.bridge)
            print(self.bridge?.viewController)
            // self.bridge?.viewController?.present(alertController, animated: true, completion: nil)
            
            // Show ManageSubscriptionsSheetModifier View
            let manageSubscriptionsSheetModifier = ManageSubscriptionsSheetModifier()
            let hostingController = UIHostingController(rootView: manageSubscriptionsSheetModifier)
            
            self.bridge?.viewController?.present(hostingController, animated: true, completion: nil)
        }
    }
  
  @objc func presentRedeemCodeSheet(_ call: CAPPluginCall){
    
    
    print("Presenting redeem code sheet")
    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene else {
      call.reject("No active UIWindowScene found")
      return
    }
    Task {
      do {
        try await AppStore.presentOfferCodeRedeemSheet(in: scene)
        print("Redeem code sheet presented")
        call.resolve()
      } catch {
        call.reject("Failed to present redeem code sheet")
      }
    }
    
    
    call.resolve()
  }
}
