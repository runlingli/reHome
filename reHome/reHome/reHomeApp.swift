//
//  reHomeApp.swift
//  reHome
//
//  Created by runling on 5/9/26.
//

import SwiftUI

@main
struct reHomeApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

struct RootView: View {
    @AppStorage("isLoggedIn") private var isLoggedIn = false

    var body: some View {
        if isLoggedIn {
            ContentView()
        } else {
            LoginScreen(isLoggedIn: $isLoggedIn)
        }
    }
}
