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
        "trainer1", "trainer5",
        "foodcoach_1w",
        "sportcoach_1w"
    ]
    @Published var products = [Product]()
    
    @Published var purchasedConsumables = [Product]()
    @Published var purchasedNonRenewables = Set<Product>()
    @Published var purchasedSubscriptions = Set<Product>() // TODO, unimplemented yet
    
    // Experimental features (to be confirmed later)
    var purchasedNonRenewablesEntitlements = [Transaction]()
    
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
                await self.handle(transactionVerification: result)
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
            // TODO: for autorenewable
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
