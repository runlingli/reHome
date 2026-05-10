import Foundation
import FirebaseAuth
import FirebaseFirestore

/// Helpers for the "click the email link → app refreshes → eduVerified flips" flow.
enum EmailVerification {

    /// Re-fetch the Firebase user (so `isEmailVerified` is current) and, if the
    /// email is now verified AND ends in `.edu`, force-refresh the ID token (so
    /// `email_verified=true` reaches Firestore rules) and promote the user doc.
    @MainActor
    static func promoteIfReady() async {
        guard let user = Auth.auth().currentUser else { return }
        try? await user.reload()
        guard
            user.isEmailVerified,
            let email = user.email?.lowercased(),
            email.hasSuffix(".edu")
        else { return }

        // Force a fresh token so the rules see email_verified=true.
        _ = try? await user.getIDTokenResult(forcingRefresh: true)

        let ref = Firestore.firestore().collection("users").document(user.uid)
        do {
            let snap = try await ref.getDocument()
            let already = (snap.data()?["eduVerified"] as? Bool) ?? false
            if !already {
                try await ref.updateData(["eduVerified": true])
            }
        } catch {
            print("[EmailVerification] promote failed:", error)
        }
    }

    /// Resend the verification email for the current user.
    @MainActor
    static func resend() async throws {
        guard let user = Auth.auth().currentUser else { return }
        try await user.sendEmailVerification()
    }

    /// Convenience for UI: should we show the "verify your email" banner?
    @MainActor
    static var needsVerification: Bool {
        guard let user = Auth.auth().currentUser else { return false }
        return !user.isEmailVerified
    }
}
