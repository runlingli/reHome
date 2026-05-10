import Foundation
import FirebaseFirestore
import SwiftUI

@MainActor
final class FirestoreService: ObservableObject {
    static let shared = FirestoreService()

    private let db = Firestore.firestore()
    private var listingsListener: ListenerRegistration?

    @Published private(set) var listings: [Listing] = []
    @Published private(set) var isLoading: Bool = false
    @Published var lastError: String?

    // MARK: - Listings: live read (sorted by newest)
    func startListeningListings() {
        guard listingsListener == nil else { return }
        isLoading = true
        listingsListener = db.collection("listings")
            .order(by: "createdAt", descending: true)
            .limit(to: 50)
            .addSnapshotListener { [weak self] snap, err in
                Task { @MainActor in
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
        pickup: String,
        desc: String,
        location: String,
        sellerUid: String
    ) async throws -> String {
        let ref = db.collection("listings").document()
        try await ref.setData([
            "title":        title,
            "category":     category,
            "condition":    condition.rawValue,
            "estValue":     estValue,
            "pickup":       pickup,
            "desc":         desc,
            "location":     location,
            "sellerUid":    sellerUid,
            "savedCount":   0,
            "photoLabel":   title.split(separator: " ").first.map(String.init)?.lowercased() ?? "item",
            "photoColors":  ["#F4EFE6", "#A89876"],
            "createdAt":    FieldValue.serverTimestamp(),
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
        let posted       = Listing.relativeAge(from: data["createdAt"] as? Timestamp)

        self.id           = snapshot.documentID
        self.title        = data["title"] as? String ?? "Untitled"
        self.category     = data["category"] as? String ?? "household"
        self.condition    = ItemCondition(rawValue: conditionStr) ?? .good
        self.estValue     = data["estValue"] as? Int ?? 0
        self.age          = data["age"] as? String ?? ""
        self.pickup       = data["pickup"] as? String ?? "Flexible"
        self.desc         = data["desc"] as? String ?? ""
        self.sellerHandle = data["sellerUid"] as? String ?? ""
        self.location     = data["location"] as? String ?? ""
        self.photoColors  = colorStrs.map(Color.init(hex:))
        self.photoLabel   = data["photoLabel"] as? String ?? ""
        self.savedCount   = data["savedCount"] as? Int ?? 0
        self.posted       = posted
    }

    private static func relativeAge(from ts: Timestamp?) -> String {
        guard let ts else { return "just now" }
        let interval = Date().timeIntervalSince(ts.dateValue())
        switch interval {
        case ..<3600:    return "\(Int(interval / 60))m"
        case ..<86_400:  return "\(Int(interval / 3600))h"
        default:         return "\(Int(interval / 86_400))d"
        }
    }
}
