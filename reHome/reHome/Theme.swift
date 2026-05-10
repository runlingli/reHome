import SwiftUI

extension Color {
    /// `nonisolated` so non-MainActor code (e.g. Firestore decoders) can build colors.
    /// SwiftUI’s underlying `Color.init(red:green:blue:)` is itself nonisolated.
    nonisolated init(hex: String) {
        let s = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let r = Double((v >> 16) & 0xFF) / 255
        let g = Double((v >>  8) & 0xFF) / 255
        let b = Double( v        & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

enum Theme {
    static let bg          = Color(hex: "FAF8F5")
    static let bgElev      = Color(hex: "F2EDE3")
    static let surface     = Color(hex: "FFFFFF")
    static let surfaceAlt  = Color(hex: "F6F2E9")
    static let border      = Color(hex: "EAE4D7")
    static let borderSubtle = Color(hex: "F0EBDF")
    static let text        = Color(hex: "1A1A1A")
    static let textMuted   = Color(hex: "6B6863")
    static let textFaint   = Color(hex: "9C968D")

    static let accent      = Color(hex: "C8553D") // terracotta
    static let accentSoft  = Color(hex: "F2DED7")
    static let accentInk   = Color.white

    static let eduColor    = Color(hex: "1F8A5B")
    static let eduBg       = Color(hex: "E0F1E7")
    static let localColor  = Color(hex: "2A6FDB")
    static let localBg     = Color(hex: "E0EAFA")
}

enum Radius {
    static let sm: CGFloat  = 8
    static let md: CGFloat  = 12
    static let lg: CGFloat  = 16
    static let xl: CGFloat  = 20
    static let pill: CGFloat = 999
}
