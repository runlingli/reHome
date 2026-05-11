import Foundation
import Combine
import FirebaseFirestore
import SwiftUI

/// Singleton Firestore facade.
final class FirestoreService: ObservableObject {
    static let shared = FirestoreService()

    private let db = Firestore.firestore()
    private var listingsListener: ListenerRegistration?
    private var conversationsListener: ListenerRegistration?
    private var messagesListener: ListenerRegistration?

    @Published private(set) var listings: [Listing] = []
    @Published private(set) var firestoreConversations: [FirestoreConversation] = []
    @Published private(set) var activeMessages: [FirestoreMessage] = []
    @Published private(set) var isLoading: Bool = false
    @Published var lastError: String?

    private init() {}

    // MARK: - Listings: live read (sorted by newest, excludes completed)

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
                    if let err { self.lastError = err.localizedDescription; return }
                    self.listings = snap?.documents
                        .compactMap(Listing.init(snapshot:))
                        .filter { $0.status != "completed" }
                        ?? []
                }
            }
    }

    func stopListeningListings() {
        listingsListener?.remove()
        listingsListener = nil
    }

    // MARK: - Conversations: live read for current user

    func startListeningConversations(uid: String) {
        guard conversationsListener == nil else { return }
        conversationsListener = db.collection("conversations")
            .whereField("participants", arrayContains: uid)
            .order(by: "lastMessageAt", descending: true)
            .limit(to: 30)
            .addSnapshotListener { [weak self] snap, err in
                Task { @MainActor [weak self] in
                    guard let self else { return }
                    if let err { self.lastError = err.localizedDescription; return }
                    self.firestoreConversations = snap?.documents.compactMap { doc in
                        let d = doc.data()
                        let ts = d["lastMessageAt"] as? Timestamp
                        return FirestoreConversation(
                            id: doc.documentID,
                            participants: d["participants"] as? [String] ?? [],
                            listingId: d["listingId"] as? String ?? "",
                            sellerUid: d["sellerUid"] as? String ?? "",
                            lastMessage: d["lastMessage"] as? String ?? "",
                            sellerConfirmed: d["sellerConfirmed"] as? Bool ?? false,
                            receiverConfirmed: d["receiverConfirmed"] as? Bool ?? false,
                            lastMessageAt: ts?.dateValue()
                        )
                    } ?? []
                }
            }
    }

    func stopListeningConversations() {
        conversationsListener?.remove()
        conversationsListener = nil
        Task { @MainActor in self.firestoreConversations = [] }
    }

    // MARK: - Messages: live read for active conversation

    func startListeningMessages(convId: String) {
        messagesListener?.remove()
        messagesListener = db.collection("conversations").document(convId)
            .collection("messages")
            .order(by: "createdAt", descending: false)
            .addSnapshotListener { [weak self] snap, err in
                Task { @MainActor [weak self] in
                    guard let self else { return }
                    if let err { self.lastError = err.localizedDescription; return }
                    self.activeMessages = snap?.documents.compactMap { doc in
                        let d = doc.data()
                        let ts = d["createdAt"] as? Timestamp
                        return FirestoreMessage(
                            id: doc.documentID,
                            from: d["from"] as? String ?? "",
                            text: d["text"] as? String ?? "",
                            createdAt: ts?.dateValue()
                        )
                    } ?? []
                }
            }
    }

    func stopListeningMessages() {
        messagesListener?.remove()
        messagesListener = nil
        Task { @MainActor in self.activeMessages = [] }
    }

    // MARK: - Create or fetch conversation

    /// Conversation ID = sorted(uid1, uid2).joined("__") + "__" + listingId
    func getOrCreateConversation(myUid: String, sellerUid: String, listingId: String) async throws -> String {
        let convId = ([myUid, sellerUid].sorted() + [listingId]).joined(separator: "__")
        let ref = db.collection("conversations").document(convId)
        let snap = try await ref.getDocument()
        if !snap.exists {
            try await ref.setData([
                "participants":      [myUid, sellerUid],
                "listingId":         listingId,
                "sellerUid":         sellerUid,
                "lastMessage":       "",
                "lastMessageAt":     FieldValue.serverTimestamp(),
                "unread":            [myUid: 0, sellerUid: 0],
                "sellerConfirmed":   false,
                "receiverConfirmed": false,
                "createdAt":         FieldValue.serverTimestamp(),
            ])
        }
        return convId
    }

    // MARK: - Send a message

    func sendMessage(convId: String, text: String, senderUid: String) async throws {
        let msgRef = db.collection("conversations").document(convId)
            .collection("messages").document()
        try await msgRef.setData([
            "from":      senderUid,
            "text":      text,
            "createdAt": FieldValue.serverTimestamp(),
        ])
        try await db.collection("conversations").document(convId).updateData([
            "lastMessage":    text,
            "lastMessageAt":  FieldValue.serverTimestamp(),
        ])
    }

    // MARK: - Confirm handoff

    /// One side confirms. When both confirm, listing status → "completed".
    func confirmHandoff(convId: String, listingId: String, myUid: String, isSeller: Bool) async throws {
        let field = isSeller ? "sellerConfirmed" : "receiverConfirmed"
        let convRef = db.collection("conversations").document(convId)
        try await convRef.updateData([field: true])

        let snap = try await convRef.getDocument()
        let d = snap.data() ?? [:]
        let sellerOK   = d["sellerConfirmed"]   as? Bool == true
        let receiverOK = d["receiverConfirmed"] as? Bool == true
        if sellerOK && receiverOK {
            try await db.collection("listings").document(listingId).updateData(["status": "completed"])
        }
    }

    // MARK: - Create a new listing

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
            "status":         "available",
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
        self.status         = data["status"]       as? String ?? "available"
        self.handoffKind    = HandoffKind(rawValue: handoffStr) ?? .meetIndoor
        self.doorsideWindow = data["doorsideWindow"] as? String ?? ""
        self.imageUrl       = data["imageUrl"]       as? String
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
