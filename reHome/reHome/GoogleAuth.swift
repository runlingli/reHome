import UIKit
import FirebaseAuth
import FirebaseFirestore
import GoogleSignIn

/// Shared Google → Firebase sign-in helper, used by Login + Register screens.
enum GoogleAuth {
    enum AuthError: LocalizedError {
        case noPresentingVC
        case noIDToken
        var errorDescription: String? {
            switch self {
            case .noPresentingVC: return "Couldn't find a window to present sign-in."
            case .noIDToken:      return "Google didn't return an ID token."
            }
        }
    }

    @MainActor
    static func signIn() async throws -> User {
        guard let presenter = topViewController() else { throw AuthError.noPresentingVC }

        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: presenter)
        guard let idToken = result.user.idToken?.tokenString else { throw AuthError.noIDToken }

        let credential = GoogleAuthProvider.credential(
            withIDToken: idToken,
            accessToken: result.user.accessToken.tokenString
        )
        let authResult = try await Auth.auth().signIn(with: credential)
        try await ensureUserDoc(for: authResult.user, googleProfile: result.user.profile)
        return authResult.user
    }

    /// Create a `users/{uid}` doc on first sign-in (merge=true so existing users aren't clobbered).
    private static func ensureUserDoc(for user: User, googleProfile: GIDProfileData?) async throws {
        let email = user.email ?? googleProfile?.email ?? ""
        let isEdu = email.lowercased().hasSuffix(".edu")
        let displayName = user.displayName
            ?? googleProfile?.name
            ?? email.split(separator: "@").first.map(String.init)
            ?? "Member"
        let initials = displayName.split(separator: " ").prefix(2)
            .compactMap { $0.first }.map(String.init).joined().uppercased()
        let school = isEdu
            ? (email.split(separator: "@").last.map(String.init) ?? "")
                .replacingOccurrences(of: ".edu", with: "").uppercased()
            : ""

        try await Firestore.firestore().collection("users").document(user.uid).setData([
            "name":           displayName,
            "handle":         "@" + (email.split(separator: "@").first.map(String.init) ?? "user"),
            "school":         school,
            "bio":            "",
            "avatarColor":    "#C8553D",
            "avatarInitials": initials.isEmpty ? "U" : initials,
            "rating":         5.0,
            "deals":          0,
            "eduVerified":    isEdu,
            "localVerified":  false,
            "createdAt":      FieldValue.serverTimestamp(),
        ], merge: true)
    }

    @MainActor
    private static func topViewController() -> UIViewController? {
        let scene = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first { $0.activationState == .foregroundActive }
            ?? UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first
        var vc = scene?.keyWindow?.rootViewController
        while let presented = vc?.presentedViewController { vc = presented }
        return vc
    }
}
