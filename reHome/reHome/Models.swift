import SwiftUI

enum ItemCondition: String {
    case new, excellent, good, fair

    var label: String {
        switch self {
        case .new: return "Like new"
        case .excellent: return "Excellent"
        case .good: return "Good"
        case .fair: return "Used"
        }
    }
}

struct ItemCategory: Identifiable, Hashable {
    let id: String
    let label: String
    let glyph: String
}

enum HandoffKind: String, CaseIterable {
    case meetIndoor   = "meet_indoor"
    case doorsideDrop = "doorside_drop"

    var label: String {
        switch self {
        case .meetIndoor:   return "Meet indoors"
        case .doorsideDrop: return "Doorstep drop"
        }
    }
    var detail: String {
        switch self {
        case .meetIndoor:   return "Receiver comes to your unit"
        case .doorsideDrop: return "Item left at door, no contact needed"
        }
    }
    var icon: String {
        switch self {
        case .meetIndoor:   return "person.2"
        case .doorsideDrop: return "shippingbox"
        }
    }
}

struct Listing: Identifiable, Hashable {
    let id: String
    let title: String
    let category: String        // ItemCategory.id
    let condition: ItemCondition
    let estValue: Int           // dollars
    let age: String
    let pickup: String
    let desc: String
    let sellerHandle: String    // maps to sellerUid in Firestore
    let location: String
    let photoColors: [Color]
    let photoLabel: String
    let savedCount: Int
    let posted: String
    var status: String = "available"   // "available" | "completed"
    var imageName: String? = nil
    var photoAspectRatio: CGFloat = 1.0
    var handoffKind: HandoffKind = .meetIndoor
    var doorsideWindow: String = ""
}

// MARK: - Firestore-backed conversation/message models

struct FirestoreConversation: Identifiable, Hashable {
    let id: String
    let participants: [String]
    let listingId: String
    let sellerUid: String
    let lastMessage: String
    let sellerConfirmed: Bool
    let receiverConfirmed: Bool
    let lastMessageAt: Date?

    var isBothConfirmed: Bool { sellerConfirmed && receiverConfirmed }

    func otherParticipant(excluding myUid: String) -> String {
        participants.first { $0 != myUid } ?? ""
    }
}

struct FirestoreMessage: Identifiable, Hashable {
    let id: String
    let from: String    // uid
    let text: String
    let createdAt: Date?

    func isMe(uid: String) -> Bool { from == uid }

    var timeLabel: String {
        guard let d = createdAt else { return "now" }
        let f = DateFormatter()
        f.timeStyle = .short
        return f.string(from: d)
    }
}

struct SellerProfile: Identifiable, Hashable {
    let id: String              // matches Listing.sellerHandle
    let name: String
    let handle: String
    let school: String
    let eduVerified: Bool
    let localVerified: Bool
    let rating: Double
    let deals: Int
    let bio: String
    let avatarColor: Color
    let avatarInitials: String
    var avatarAnimal: String?    // SF Symbol name; nil → hash-based random
    var avatarPhotoURL: String?  // Firebase Storage download URL
}

struct Conversation: Identifiable, Hashable {
    let id: String
    let withUser: String        // SellerProfile.id
    let listingId: String
    let unread: Int
    let lastMessage: String
    let time: String
}
