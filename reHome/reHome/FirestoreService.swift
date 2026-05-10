import Foundation
import Combine
import FirebaseFirestore
import SwiftUI

/// Singleton Firestore facade.
///
/// Note on concurrency: the class itself is **not** `@MainActor` because that
/// would force `static let shared = FirestoreService()` to be initialised on
/// the main actor — but `static let` runs lazily on whichever thread first
/// touches it, so Swift 6 rejects that pattern. Instead all `@Published`
/// mutations are wrapped in `Task { @MainActor in … }`, satisfying SwiftUI's
/// expectation that observed state changes on the main actor.
final class FirestoreService: ObservableObject {
    static let shared = FirestoreService()

    private let db = Firestore.firestore()
    private var listingsListener: ListenerRegistration?

    @Published private(set) var listings: [Listing] = []
    @Published private(set) var isLoading: Bool = false
    @Published var lastError: String?

    private init() {}

    // MARK: - Listings: live read (sorted by newest)

    func startListeningListings() {
        guard listingsListener == nil else { return }
        Task { @MainActor in self.isLoading = true }

        listingsListener = db.collection("listings")
            .order(by: "createdAt", descending: true)
            .limit(to: 50)
            .addSnapshotListener { [weak self] snap, err in
                Task { @MainActor [weak self] in
                    guard let self else { return }
                    self.isLoading = false
                    if let err {
                        self.lastError = err.localizedDescription
                        return
                    }
                    self.listings = snap?.documents.compactMap(Listing.init(snapshot:)) ?? []
                }
            }
    }

    func stopListeningListings() {
        listingsListener?.remove()
        listingsListener = nil
    }

    // MARK: - Create a new listing (eduVerified gate enforced by rules)

    func createListing(
        title: String,
        category: String,
        condition: ItemCondition,
        estValue: Int,
        age: String,
        pickup: String,
        desc: String,
        location: String,
        sellerUid: String,
        handoffKind: HandoffKind = .meetIndoor,
        doorsideWindow: String = ""
    ) async throws -> String {
        let ref = db.collection("listings").document()
        try await ref.setData([
            "title":          title,
            "category":       category,
            "condition":      condition.rawValue,
            "estValue":       estValue,
            "age":            age,
            "pickup":         pickup,
            "desc":           desc,
            "location":       location,
            "sellerUid":      sellerUid,
            "savedCount":     0,
            "handoffKind":    handoffKind.rawValue,
            "doorsideWindow": doorsideWindow,
            "photoLabel":     title.split(separator: " ").first.map(String.init)?.lowercased() ?? "item",
            "photoColors":    ["#F4EFE6", "#A89876"],
            "createdAt":      FieldValue.serverTimestamp(),
        ])
        return ref.documentID
    }
}

// MARK: - Listing decoding from Firestore

extension Listing {
    init?(snapshot: DocumentSnapshot) {
        guard let data = snapshot.data() else { return nil }

        let conditionStr = data["condition"] as? String ?? "good"
        let colorStrs    = (data["photoColors"] as? [String]) ?? ["#F4EFE6", "#A89876"]
        let handoffStr   = data["handoffKind"] as? String ?? HandoffKind.meetIndoor.rawValue
        let posted       = Listing.relativeAge(from: data["createdAt"] as? Timestamp)

        self.id             = snapshot.documentID
        self.title          = data["title"]        as? String ?? "Untitled"
        self.category       = data["category"]     as? String ?? "household"
        self.condition      = ItemCondition(rawValue: conditionStr) ?? .good
        self.estValue       = data["estValue"]     as? Int    ?? 0
        self.age            = data["age"]          as? String ?? ""
        self.pickup         = data["pickup"]       as? String ?? "Flexible"
        self.desc           = data["desc"]         as? String ?? ""
        self.sellerHandle   = data["sellerUid"]    as? String ?? ""
        self.location       = data["location"]     as? String ?? ""
        self.photoColors    = colorStrs.map(Color.init(hex:))
        self.photoLabel     = data["photoLabel"]   as? String ?? ""
        self.savedCount     = data["savedCount"]   as? Int    ?? 0
        self.posted         = posted
        self.handoffKind    = HandoffKind(rawValue: handoffStr) ?? .meetIndoor
        self.doorsideWindow = data["doorsideWindow"] as? String ?? ""
    }

    private static func relativeAge(from ts: Timestamp?) -> String {
        guard let ts else { return "just now" }
        let interval = Date().timeIntervalSince(ts.dateValue())
        switch interval {
        case ..<3600:   return "\(Int(interval / 60))m"
        case ..<86_400: return "\(Int(interval / 3600))h"
        default:        return "\(Int(interval / 86_400))d"
        }
    }
}
