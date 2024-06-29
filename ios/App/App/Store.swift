//
//  Store.swift
//  App
//
//  Created by Ryan Rasoarahona on 29/6/2567 BE.
//

import Foundation
import StoreKit
import Combine

class Store: NSObject {
    private var productIDs = ["trainer"]
    @Published var products = [Product]()
    private  var cancellable: AnyCancellable?
    
    // var productsLoaded = PassthroughSubject<[Product], Never>()
    
    override init(){
        super.init()
        cancellable = $products.sink { [weak self] products in
            self?.productsLoaded(products)
        }
        Task {
            await requestProducts()
        }
    }
    
    @MainActor
    func requestProducts() async {
        do {
            print("Loading products from Store")
            products = try await Product.products(for: productIDs)
            print(products)
        } catch {
            print("Error on the Line 27")
            print(error)
        }
    }
    
    private func productsLoaded(_ products: [Product]){
        print("Fire productsLoaded")
        NotificationCenter.default.post(name: .productsLoaded, object: nil, userInfo: ["products": products])
    }
}

extension Notification.Name {
    static let productsLoaded = Notification.Name("productsLoaded")
}
