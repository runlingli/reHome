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
    let sellerHandle: String    // SellerProfile.handle key
    let location: String
    let photoColors: [Color]
    let photoLabel: String
    let savedCount: Int
    let posted: String
    var imageName: String? = nil
    var photoAspectRatio: CGFloat = 1.0   // width ÷ height; < 1 = portrait
    var handoffKind: HandoffKind = .meetIndoor
    var doorsideWindow: String = ""
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
}

struct Conversation: Identifiable, Hashable {
    let id: String
    let withUser: String        // SellerProfile.id
    let listingId: String
    let unread: Int
    let lastMessage: String
    let time: String
}
