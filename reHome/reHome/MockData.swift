import SwiftUI

enum MockData {
    static let categories: [ItemCategory] = [
        .init(id: "all",       label: "All",        glyph: "✦"),
        .init(id: "furniture", label: "Furniture",  glyph: "▦"),
        .init(id: "kitchen",   label: "Kitchen",    glyph: "◍"),
        .init(id: "appliance", label: "Appliances", glyph: "◉"),
        .init(id: "bike",      label: "Bikes",      glyph: "◷"),
        .init(id: "clothing",  label: "Clothing",   glyph: "◇"),
        .init(id: "household", label: "Household",  glyph: "○"),
    ]

    static let users: [String: SellerProfile] = [
        "u_emma":  .init(id: "u_emma",  name: "Emma L.",  handle: "@emma.l",   school: "UC Davis",
                         eduVerified: true,  localVerified: false, rating: 4.9, deals: 12,
                         bio: "Graduating spring quarter. Moving back to the Bay — everything in my apartment must go.",
                         avatarColor: Color(hex: "C8553D"), avatarInitials: "EL"),
        "u_jin":   .init(id: "u_jin",   name: "Jin C.",   handle: "@jin.chen", school: "UC Berkeley",
                         eduVerified: true,  localVerified: false, rating: 5.0, deals: 7,
                         bio: "PhD wrap-up. Moving back to Davis — apartment cleanout, items barely used.",
                         avatarColor: Color(hex: "5C7A5E"), avatarInitials: "JC"),
        "u_dani":  .init(id: "u_dani",  name: "Dani O.",  handle: "@dani.o",   school: "Sacramento State",
                         eduVerified: true,  localVerified: false, rating: 4.8, deals: 19,
                         bio: "Lab relocating to SF. Take it all please.",
                         avatarColor: Color(hex: "4F46E5"), avatarInitials: "DO"),
        "u_lucas": .init(id: "u_lucas", name: "Lucas M.", handle: "@lucasm",   school: "UC Santa Cruz",
                         eduVerified: true,  localVerified: false, rating: 4.7, deals: 5,
                         bio: "Internship wrapping up. Heading home for summer — clearing everything out.",
                         avatarColor: Color(hex: "1F1F1F"), avatarInitials: "LM"),
        "me_student": .init(id: "me_student", name: "You", handle: "@you.edu", school: "UC Davis",
                            eduVerified: true, localVerified: false, rating: 5.0, deals: 3,
                            bio: "Class of '26. Hand-me-downs from my last sublet.",
                            avatarColor: Theme.accent, avatarInitials: "Yo"),
    ]

    static let listings: [Listing] = [
        .init(id: "i1",  title: "IKEA Malm desk · white",        category: "furniture", condition: .excellent, estValue: 149, age: "14 mo", pickup: "Mid-June",
              desc: "Compact desk, fits a 27\" monitor. Two screw holes near the back from a monitor mount. Pickup only — 2nd-floor unit off Russell Blvd.",
              sellerHandle: "u_emma", location: "Davis, CA",
              photoColors: [Color(hex: "F4EFE6"), Color(hex: "D9CFB8")], photoLabel: "desk · white", savedCount: 18, posted: "2d",
              imageName: "item_i1", photoAspectRatio: 1.0),
        .init(id: "i2",  title: "Cuisinart 4-cup coffee maker",   category: "appliance", condition: .good, estValue: 38, age: "2 yr", pickup: "June 18 – 22",
              desc: "Works perfectly, just descaled. Comes with a permanent gold filter, no paper needed.",
              sellerHandle: "u_jin", location: "Berkeley, CA",
              photoColors: [Color(hex: "E8DFD0"), Color(hex: "B8A687")], photoLabel: "coffee maker", savedCount: 7, posted: "5h",
              imageName: "item_i2", photoAspectRatio: 0.8,
              handoffKind: .doorsideDrop, doorsideWindow: "Morning (8–12)"),
        .init(id: "i3",  title: "Trek FX 2 hybrid bike",          category: "bike",      condition: .good, estValue: 420, age: "3 yr", pickup: "After June 10",
              desc: "Size M. Recently tuned at Davis Bike Church. Includes lock and front light. One small scratch on the top tube.",
              sellerHandle: "u_dani", location: "Sacramento, CA",
              photoColors: [Color(hex: "EDE4D2"), Color(hex: "90785A")], photoLabel: "hybrid bike", savedCount: 41, posted: "1d",
              imageName: "item_i3", photoAspectRatio: 0.75),
        .init(id: "i4",  title: "Twin XL mattress + frame",       category: "furniture", condition: .good, estValue: 220, age: "10 mo", pickup: "June 20 – 25",
              desc: "Memory-foam, used with mattress protector since day one. Frame is metal, easy to disassemble.",
              sellerHandle: "u_emma", location: "Davis, CA",
              photoColors: [Color(hex: "F1E9DC"), Color(hex: "C9B89A")], photoLabel: "mattress", savedCount: 12, posted: "3d",
              imageName: "item_i4", photoAspectRatio: 1.0),
        .init(id: "i5",  title: "Dyson V8 vacuum",                category: "appliance", condition: .excellent, estValue: 280, age: "1 yr", pickup: "Flexible",
              desc: "Two attachments included. Battery still holds full charge — about 35 min of runtime.",
              sellerHandle: "u_jin", location: "Berkeley, CA",
              photoColors: [Color(hex: "E5E1D7"), Color(hex: "A09583")], photoLabel: "vacuum", savedCount: 24, posted: "6h",
              imageName: "item_i5", photoAspectRatio: 0.85),
        .init(id: "i6",  title: "Lodge cast-iron skillet · 10\"", category: "kitchen",   condition: .good, estValue: 30, age: "2 yr", pickup: "Mid-June",
              desc: "Well-seasoned. Becomes nonstick with a thin coat of oil.",
              sellerHandle: "u_lucas", location: "Woodland, CA",
              photoColors: [Color(hex: "E2DBCB"), Color(hex: "5A4A38")], photoLabel: "skillet", savedCount: 5, posted: "4d",
              imageName: "item_i6", photoAspectRatio: 0.8,
              handoffKind: .doorsideDrop, doorsideWindow: "Afternoon (12–5)"),
        .init(id: "i7",  title: "Uniqlo down jacket · M",         category: "clothing",  condition: .excellent, estValue: 70, age: "8 mo", pickup: "Mid-June",
              desc: "Black, ultra-light. Worn one season. No stains.",
              sellerHandle: "u_dani", location: "Sacramento, CA",
              photoColors: [Color(hex: "EDE4D2"), Color(hex: "3A3530")], photoLabel: "down jacket", savedCount: 9, posted: "7h",
              imageName: "item_i7", photoAspectRatio: 0.75),
        .init(id: "i8",  title: "Air fryer · Cosori 5.8 qt",      category: "appliance", condition: .excellent, estValue: 90, age: "1 yr", pickup: "June 20 – 25",
              desc: "Cleaned thoroughly. Comes with original manual.",
              sellerHandle: "u_lucas", location: "Woodland, CA",
              photoColors: [Color(hex: "E8E2D2"), Color(hex: "444036")], photoLabel: "air fryer", savedCount: 31, posted: "11h",
              imageName: "item_i8", photoAspectRatio: 1.0),
        .init(id: "i9",  title: "Bookshelf, 3-tier · oak",        category: "furniture", condition: .fair, estValue: 80, age: "4 yr", pickup: "Before June 20",
              desc: "Solid. Some water rings on the top shelf — not visible when loaded.",
              sellerHandle: "u_emma", location: "Davis, CA",
              photoColors: [Color(hex: "E9DFC9"), Color(hex: "8A6A45")], photoLabel: "bookshelf", savedCount: 4, posted: "6d",
              imageName: "item_i9", photoAspectRatio: 0.65),
        .init(id: "i10", title: "Ceramic dinner set · 4 pcs",     category: "kitchen",   condition: .excellent, estValue: 45, age: "1 yr", pickup: "Mid-June",
              desc: "Crate & Barrel. Plates, bowls, and mugs — service for two.",
              sellerHandle: "u_jin", location: "Berkeley, CA",
              photoColors: [Color(hex: "F4EDDD"), Color(hex: "A89876")], photoLabel: "dinnerware", savedCount: 11, posted: "2d",
              imageName: "item_i10", photoAspectRatio: 0.85,
              handoffKind: .doorsideDrop, doorsideWindow: "All day"),
        .init(id: "i11", title: "Standing lamp · brass",          category: "household", condition: .good, estValue: 55, age: "2 yr", pickup: "Flexible",
              desc: "Warm 3000K bulb included.",
              sellerHandle: "u_dani", location: "Sacramento, CA",
              photoColors: [Color(hex: "EFE7D6"), Color(hex: "9A7D4A")], photoLabel: "lamp", savedCount: 6, posted: "8h",
              imageName: "item_i11", photoAspectRatio: 0.6),
        .init(id: "i12", title: "Office chair · Steelcase Series 1", category: "furniture", condition: .excellent, estValue: 380, age: "18 mo", pickup: "Late June",
              desc: "Adjustable arms, lumbar, headrest. Smoke-free apartment.",
              sellerHandle: "u_lucas", location: "Woodland, CA",
              photoColors: [Color(hex: "E5DECC"), Color(hex: "383330")], photoLabel: "office chair", savedCount: 47, posted: "12h",
              imageName: "item_i12", photoAspectRatio: 1.0),
    ]

    /// Look up a seller by handle/uid. Falls back to a generic placeholder
    /// when the listing was posted by a real Firebase user not in mock data.
    static func user(for handle: String) -> SellerProfile {
        if let u = users[handle] { return u }
        let initials = handle.split(separator: "_").last
            .map { String($0.prefix(2)).uppercased() } ?? "U"
        return SellerProfile(
            id: handle,
            name: "Member",
            handle: "@" + handle.prefix(8),
            school: "",
            eduVerified: true,
            localVerified: false,
            rating: 5.0,
            deals: 0,
            bio: "",
            avatarColor: Theme.accent,
            avatarInitials: initials
        )
    }

    static let conversations: [Conversation] = [
        .init(id: "c1", withUser: "u_emma",  listingId: "i1",  unread: 2, lastMessage: "I can swing by Saturday at 2?", time: "11:42"),
        .init(id: "c2", withUser: "u_dani",  listingId: "i3",  unread: 0, lastMessage: "Cool — see you Sunday.", time: "Yesterday"),
        .init(id: "c3", withUser: "u_jin",   listingId: "i5",  unread: 0, lastMessage: "Sent the address — 4-min walk from Harvard Sq.", time: "Tue"),
        .init(id: "c4", withUser: "u_lucas", listingId: "i12", unread: 1, lastMessage: "I can split it into two trips if needed.", time: "Tue"),
    ]
}
