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
    var transactionListener: Task<Void, Error>?
    
    // The constructor
    override init(){
        super.init()
        // Should run the cancellable code
        transactionListener = listenForTransactions()
        Task{
            // TODO, add the listener loop here
            await requestProducts()
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
    
    @MainActor
    func purchase(_ product: Product) async throws {
        let result = try await product.purchase()
        switch result {
        case .success(let transactionVerification):
            await handle(transactionVerification: transactionVerification)
        default:
            print("Unsuccessful purchase")
        }
    }
    
    @MainActor
    private func handle(transactionVerification result: VerificationResult <Transaction> ) async {
        print("Handle transaction")
        switch result{
            case let.verified(transaction):
                guard
                let product = self.products.first(where: { $0.id == transaction.productID })
                else{
                    return
                }
                print("Continue to process the purchase")
                // Add more code here
            case .unverified:
                print("Transaction unverified")
        }
    }
    
    
    
    
}
