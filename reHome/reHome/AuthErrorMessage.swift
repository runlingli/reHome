import Foundation
import FirebaseAuth

/// Maps Firebase Auth errors to short, user-friendly messages.
///
/// Firebase 11+ collapses several real failure modes (wrong password, user
/// missing, malformed credential) into a single `invalidCredential` code by
/// default — the SDK calls this "email enumeration protection". A literal
/// translation of `error.localizedDescription` yields *"The supplied auth
/// credential is malformed or has expired"*, which sends users hunting for
/// non-existent token bugs. Almost always it just means the password is
/// wrong, so we lead with that.
enum AuthErrorMessage {
    static func friendly(_ error: Error) -> String {
        let ns = error as NSError
        guard ns.domain == AuthErrorDomain,
              let code = AuthErrorCode(rawValue: ns.code) else {
            return ns.localizedDescription
        }
        switch code {
        case .invalidCredential,
             .wrongPassword,
             .userNotFound,
             .invalidEmail:
            return "Wrong email or password. Please check and try again."
        case .userDisabled:
            return "This account has been disabled."
        case .emailAlreadyInUse:
            return "An account with this email already exists. Try logging in instead."
        case .weakPassword:
            return "Password is too weak — please use at least 6 characters."
        case .tooManyRequests:
            return "Too many sign-in attempts. Please wait a minute and try again."
        case .networkError:
            return "Network error. Check your connection and try again."
        case .operationNotAllowed:
            return "Email/password sign-in is currently disabled. Please try Google instead."
        case .requiresRecentLogin:
            return "Please sign in again before changing this."
        case .webContextCancelled, .webContextAlreadyPresented:
            return "Sign-in was cancelled."
        default:
            return ns.localizedDescription
        }
    }
}
