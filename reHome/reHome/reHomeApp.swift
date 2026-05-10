import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

@main
struct reHomeApp: App {
    init() {
        FirebaseApp.configure()

        #if DEBUG
        // Opt in to local emulators by setting USE_FIREBASE_EMULATORS=1 in the scheme env.
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
