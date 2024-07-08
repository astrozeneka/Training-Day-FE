//
//  Store.swift
//  App
//
//  Created by Ryan Rasoarahona on 30/6/2567 BE.
//

import Foundation
import StoreKit

class Store:NSObject {
    private var productIDs = ["trainer1", "trainer5"]
    @Published var products = [Product]()
    @Published var purchasedConsumables = [Product]()
    
    var transactionListener: Task<Void, Error>?
    
    // The constructor
    override init(){
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
    
    private func addPurchased(_ product: Product){
        switch product.type {
        case .consumable:
            print("addPurchased: consumable")
            purchasedConsumables.append(product)
            // TODO: persistence
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
                self.addPurchased(product)
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
                case .unverified:
                    print("Unverified transaction found")
                }
            }
        } catch {
            print("Error:updateCurrentEntitlements: \(error)")
        }
    }
    
    
    
    
}
