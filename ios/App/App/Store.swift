//
//  Store.swift
//  App
//
//  Created by Ryan Rasoarahona on 30/6/2567 BE.
//

import Foundation
import StoreKit

class Store:NSObject {
    private var productIDs = [
        "trainer1", "trainer5", "trainer10", "trainermax",
        "foodcoach_1w", "foodcoach_4w", "foodcoach_6w",
        "sportcoach_1w", "sportcoach_4w", "sportcoach_6w",
        "hoylt", "gursky", "moreno", "smiley", "alonzo"
    ]
    @Published var products = [Product]()
    
    @Published var purchasedConsumables = [Product]()
    @Published var purchasedNonRenewables = Set<Product>()
    @Published var purchasedSubscriptions = Set<Product>()
    
    // Experimental features (to be confirmed later)
    var purchasedNonRenewablesEntitlements = [Transaction]()
    var purchasedAutoRenewablesEntitlements = [Transaction]()
    
    var transactionListener: Task<Void, Error>?
    var plugin: StorePlugin
    
    // The constructor
    init(_ plugin: StorePlugin){
        // Patch properties
        self.plugin = plugin
        super.init()
        // Should run the cancellable code
        transactionListener = listenForTransactions()
        Task{
            // TODO, add the listener loop here
            await requestProducts()
            await updateCurrentEntitlements()
        }
    }
    
    func listenForTransactions() -> Task <Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                // For now the program doesn't execute this portion of code
                print("listenForTransactions: a transaction has been intercepted")
                // Capacitor Event should be fired at this step
                let handledTransaction = await self.handle(transactionVerification: result)
                // Fire event to capacitor (same code as in StorePlugin::getAutoRenewableEntitlements and more)
                let transaction = [
                  "bundleId": handledTransaction?.appBundleID,
                  "deviceVerification": handledTransaction?.deviceVerification.base64EncodedString(),
                  "deviceVerificationNonce": handledTransaction?.deviceVerificationNonce.uuidString,
                  // "environment": handledTransaction?.environment,
                  "inAppOwnershipType": handledTransaction?.ownershipType.rawValue,
                  //"originalPurchaseDate": handledTransaction?.originalPurchaseDate.formatted() ?? "", // Still have errors
                  //"originalTransactionId": handledTransaction?.originalID ?? 0,
                  //"productId": handledTransaction?.productID ?? "",
                  //"purchaseDate": handledTransaction?.purchaseDate.formatted() ?? "", // Still have errors
                  "quantity": handledTransaction?.purchasedQuantity,
                  "signedDate": handledTransaction?.signedDate,
                  "transactionId": handledTransaction?.id,
                  //"currency": handledTransaction?.currency ?? ""
                ]
                // Same output format as for the android listener
                self.plugin.notifyListeners("onIOSPurchase", data:[
                    "purchases": [transaction]
                  ])
            }
        }
    }
    
    @MainActor
    func requestProducts() async {
        do {
            products = try await Product.products(for: productIDs)
        } catch {
            print("Error: \(error)")
        }
    }
    
    @MainActor
    func fetchPromotionalOffers(for productId: String) async -> [Product.SubscriptionOffer]? {
      do {
        // 1. Fetch the product
        let products = try await Product.products(for: [productId])
        guard let product = products.first else {
          print("Product '\(productId)' not found")
          return nil
        }
        
        // 2. Check if the product has a subscription
        guard let subscription = product.subscription else {
          print("Product '\(productId)'  is not a subscription or has no promotional offers")
          return nil
        }
        
        // 3. Get the promotional offers
        let promoOffers = subscription.promotionalOffers
        return promoOffers
      } catch {
        print("Failed to fetch product \(error)")
        return nil
      }
    }
    
    private func addPurchased(_ product: Product, _ transaction: Transaction? = nil){
        switch product.type {
        case .consumable:
            print("addPurchased: consumable")
            purchasedConsumables.append(product) // Persistency is managed the backend server
        case .nonRenewable:
            print("addPurchashed: non-renewable")
            purchasedNonRenewables.insert(product) // Persistency is managed by device entitlements
            (transaction != nil) ? purchasedNonRenewablesEntitlements.append(transaction!) : nil
        case .autoRenewable:
            print("addPurchased: auto-renewable")
            purchasedSubscriptions.insert(product) // Persistency is manage by device entitlements
            (transaction != nil) ? purchasedAutoRenewablesEntitlements.append(transaction!) : nil
        default:
            return
        }
    }
    
    @MainActor
    func purchase(_ product: Product) async throws -> Transaction? {
        let result = try await product.purchase()
        switch result {
        case .success(let transactionVerification):
            let handledTransaction = await handle(transactionVerification: transactionVerification)
            return handledTransaction
        default:
            print("Unsuccessful purchase")
            return nil
        }
    }
  
    @MainActor
    func purchaseWithDiscount(_ product: Product, offerId: String, signatureInfo: [String: Any]) async throws -> Transaction? {
      guard let keyIdentifier = signatureInfo["keyIdentifier"] as? String else {
        throw NSError(domain: "Invalid KeyIndentifier Data", code: 0, userInfo: nil)
      }
      guard let nonceString = signatureInfo["nonce"] as? String else {
        throw NSError(domain: "Invalid nonce Data", code: 0, userInfo: nil)
      }
      guard let timestamp = signatureInfo["timestamp"] as? Int else {
        throw NSError(domain: "Invalid timestamp data", code: 0, userInfo: nil)
      }
      guard let signatureString = signatureInfo["signature"] as? String else {
        throw NSError(domain: "Invalid signature data", code: 0, userInfo: nil)
      }
      guard let signatureData = Data(base64Encoded: signatureString) else {
        throw NSError(domain: "Error converting signature string to data", code: 0, userInfo: nil)
      }
      guard let nonce = UUID(uuidString: nonceString) else {
        throw NSError(domain: "Invalid converting nonce data", code: 0, userInfo: nil)
      }
      
      
      let result = try await product.purchase(options: [.promotionalOffer(offerID: offerId, keyID: keyIdentifier, nonce: nonce, signature: signatureData, timestamp: timestamp)])
      
      switch result {
      case .success(let verification):
        let transaction = try verification.payloadValue
        await transaction.finish()
        return transaction
      case .userCancelled:
        return nil
      case .pending:
        return nil
      @unknown default:
        throw NSError(domain: "Unknown purchase state", code: 1, userInfo: nil)
      }
    }
    
    @MainActor
    private func handle(transactionVerification result: VerificationResult <Transaction> ) async -> Transaction? {
        switch result{
            case let.verified(transaction):
                guard
                let product = self.products.first(where: { $0.id == transaction.productID })
                else{
                    return nil
                }
                self.addPurchased(product, transaction)
                await transaction.finish()
                return transaction
            case .unverified:
                print("Transaction unverified")
                return nil
        }
    }
    
    @MainActor
    private func updateCurrentEntitlements() async {
        // ONLY INTERCEPT THE non-consumables, the non-renewing subscription and auto-renewing subscription
        // But not the consumables
        do {
            for await result in Transaction.currentEntitlements {
                switch result {
                case let.verified(transaction):
                    guard let product = self.products.first(where: {$0.id == transaction.productID }) else {
                        continue
                    }
                    await handle(transactionVerification: .verified(transaction))
                    
                    // TODO, here, should fire event to the iOS capacitor to notify about the currentEntitlements
                    // TODO: the following code should be removed
                    /*print("currentEntitlements")
                    print("product registered: \(product.id)")
                    print(transaction);
                    print("bounded transaction: \(transaction.id)")*/
                    /*self.plugin.notifyListeners("onEntitlements", data: [
                        "Haha": "Hello world",
                    ])*/
                    
                case .unverified:
                    print("Unverified transaction found")
                }
            }
        } catch {
            print("Error:updateCurrentEntitlements: \(error)")
        }
    }
    
    
    
    
}
