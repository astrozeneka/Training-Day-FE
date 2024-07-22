//
//  ManageSubscriptionsSheedModifier.swift
//  App
//
//  Created by Ryan Rasoarahona on 22/7/2567 BE.
//

import Foundation
import StoreKit
import SwiftUI
import Capacitor

struct ManageSubscriptionsSheetModifier: View {
    @Environment(\.presentationMode) var presentationMode // Will be deprecated in the future version of iOS
    @State var isManagedSubscriptionsSheetPresented: Bool = false
    func showManageSubscriptionsSheet(){
        self.isManagedSubscriptionsSheetPresented = true
    }
    var body: some View {
        VStack{
            // Add a small topmenu with a title and button "Fermer" to allow to close
            HStack{
                Spacer()
                Button("Fermer"){
                    // TODO
                    // Close this current view, not the manageSubscriptionsSheet
                    self.presentationMode.wrappedValue.dismiss()
                }
                .padding()
            }
            // Add A title
            Text("Gérer mes abonnements")
                .font(.title)
                .padding()
            // Add a subtitle
            Text("Ici, vous pouvez gérer votre abonnement Training-Day")
                .font(.subheadline)
                .padding()
            
            // List with title "Mes abonnements"
            List {
                Section(header: Text("Mes abonnements")) {
                    // Item
                    // Clickable item
                    HStack {
                        // Icon
                        Image(systemName: "person.crop.circle")
                            .resizable()
                            .frame(width: 50, height: 50)
                        // Text
                        VStack(alignment: .leading) {
                            Text("Abonnement Training-Day")
                                .font(.headline)
                            Text("Abonnement à renouvellement automatique")
                                .font(.subheadline)
                        }
                        Spacer()
                        // Button
                        Button("Gérer") {
                            showManageSubscriptionsSheet()
                        }
                    }
                    .manageSubscriptionsSheet(isPresented: $isManagedSubscriptionsSheetPresented)
                }
            }
        }
    }
}
