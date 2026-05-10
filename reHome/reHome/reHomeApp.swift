import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import GoogleSignIn

@main
struct reHomeApp: App {
    init() {
        FirebaseApp.configure()

        // GoogleSignIn — pull the iOS OAuth client ID from FirebaseApp.options
        // (mirrors GoogleService-Info.plist's CLIENT_ID).
        if let clientId = FirebaseApp.app()?.options.clientID {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientId)
        }

        #if DEBUG
        if ProcessInfo.processInfo.environment["USE_FIREBASE_EMULATORS"] == "1" {
            Auth.auth().useEmulator(withHost: "localhost", port: 9099)
            let s = Firestore.firestore().settings
            s.host = "localhost:8080"
            s.isSSLEnabled = false
            s.cacheSettings = MemoryCacheSettings()
            Firestore.firestore().settings = s
        }
        #endif
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                // Required for GIDSignIn to receive the OAuth callback URL.
                .onOpenURL { url in
                    _ = GIDSignIn.sharedInstance.handle(url)
                }
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
