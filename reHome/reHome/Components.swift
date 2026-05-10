import SwiftUI

// MARK: - Photo placeholder (gradient + diagonal stripes + label)
struct PhotoPlaceholder: View {
    let colors: [Color]
    let label: String
    var aspectRatio: CGFloat? = 1
    var corner: CGFloat = Radius.md

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
            DiagonalStripes(spacing: 14, color: colors.last ?? .black, opacity: 0.18)
            Text(label.uppercased())
                .font(.system(size: 9, weight: .regular, design: .monospaced))
                .tracking(0.4)
                .foregroundStyle(Color.black.opacity(0.42))
                .padding(.leading, 10)
                .padding(.bottom, 8)
        }
        .frame(maxWidth: .infinity)
        .aspectRatio(aspectRatio, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
    }
}

private struct DiagonalStripes: View {
    let spacing: CGFloat
    let color: Color
    let opacity: Double
    var body: some View {
        GeometryReader { geo in
            Canvas { ctx, size in
                let diag = sqrt(size.width * size.width + size.height * size.height)
                ctx.translateBy(x: size.width / 2, y: size.height / 2)
                ctx.rotate(by: .degrees(45))
                ctx.translateBy(x: -diag / 2, y: -diag / 2)
                var x: CGFloat = 0
                while x < diag {
                    let p = Path { p in
                        p.move(to: CGPoint(x: x, y: 0))
                        p.addLine(to: CGPoint(x: x, y: diag))
                    }
                    ctx.stroke(p, with: .color(color.opacity(opacity)), lineWidth: 1)
                    x += spacing
                }
            }
            .allowsHitTesting(false)
        }
    }
}

// MARK: - Listing photo (real image with gradient fallback)
struct ListingPhoto: View {
    let listing: Listing
    var aspectRatio: CGFloat? = 1
    var corner: CGFloat = Radius.md

    var body: some View {
        if let name = listing.imageName {
            Color.clear
                .aspectRatio(aspectRatio, contentMode: .fit)
                .overlay(Image(name).resizable().scaledToFill())
                .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
        } else {
            PhotoPlaceholder(colors: listing.photoColors, label: listing.photoLabel,
                             aspectRatio: aspectRatio, corner: corner)
        }
    }
}

// MARK: - Avatar (initials in colored circle)
struct AvatarView: View {
    let user: SellerProfile
    var size: CGFloat = 36

    var body: some View {
        ZStack {
            Circle().fill(user.avatarColor)
            Text(user.avatarInitials)
                .font(.system(size: size * 0.38, weight: .semibold))
                .foregroundStyle(.white)
        }
        .frame(width: size, height: size)
        .overlay(
            Circle().strokeBorder(Color.black.opacity(0.06), lineWidth: 0.5)
        )
    }
}

// MARK: - Verified Badge
enum VerifiedKind {
    case edu, local
    var color: Color { self == .edu ? Theme.eduColor : Theme.localColor }
    var bg: Color    { self == .edu ? Theme.eduBg    : Theme.localBg    }
    var label: String { self == .edu ? ".edu Verified" : "Local Verified" }
}

struct VerifiedBadge: View {
    let kind: VerifiedKind
    var compact: Bool = true

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: compact ? 9 : 11, weight: .bold))
            Text(kind.label)
                .font(.system(size: compact ? 10 : 12, weight: .semibold))
                .lineLimit(1)
        }
        .foregroundStyle(kind.color)
        .padding(.horizontal, compact ? 6 : 8)
        .padding(.vertical,   compact ? 2 : 4)
        .background(Capsule().fill(kind.bg))
    }
}

// MARK: - "Free · est. $XX" tag
struct FreeTag: View {
    let est: Int
    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 5) {
            Text("Free")
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(Theme.accent)
                .tracking(0.1)
            Text("est. $\(est)")
                .font(.system(size: 10, weight: .regular, design: .monospaced))
                .foregroundStyle(Theme.textFaint)
                .tracking(0.2)
        }
    }
}

// MARK: - Category chip
struct CategoryChip: View {
    let category: ItemCategory
    let active: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(category.glyph)
                    .font(.system(size: 12))
                    .opacity(0.85)
                Text(category.label)
                    .font(.system(size: 13, weight: .medium))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(
                Capsule()
                    .fill(active ? Theme.text : Color.clear)
                    .overlay(
                        Capsule().strokeBorder(active ? Theme.text : Theme.border, lineWidth: 0.75)
                    )
            )
            .foregroundStyle(active ? Theme.bg : Theme.textMuted)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Press style (replaces dark system highlight with subtle scale)
struct CardPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Item card (grid)
struct ItemCard: View {
    let listing: Listing
    @Binding var savedSet: Set<String>

    private var seller: SellerProfile { MockData.user(for: listing.sellerHandle) }
    private var saved: Bool { savedSet.contains(listing.id) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topLeading) {
                ListingPhoto(listing: listing, aspectRatio: listing.photoAspectRatio, corner: 0)
                VerifiedBadge(kind: .edu)
                    .padding(8)
            }
            .overlay(alignment: .topTrailing) {
                Button {
                    if saved { savedSet.remove(listing.id) } else { savedSet.insert(listing.id) }
                } label: {
                    Image(systemName: saved ? "heart.fill" : "heart")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(saved ? Theme.accent : Color(white: 0.27))
                        .frame(width: 30, height: 30)
                        .background(
                            Circle().fill(.ultraThinMaterial)
                        )
                }
                .padding(6)
            }

            VStack(alignment: .leading, spacing: 5) {
                Text(listing.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                Text("\(listing.condition.label) · \(listing.location.split(separator: ",").first.map(String.init) ?? listing.location)")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textMuted)
                HStack {
                    FreeTag(est: listing.estValue)
                    Spacer()
                    Text(listing.posted)
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Theme.textFaint)
                }
                .padding(.top, 2)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
        .background(Theme.surface)
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
        )
    }
}

// MARK: - Section header
struct SectionHeader: View {
    let eyebrow: String?
    let title: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let eyebrow {
                Text(eyebrow.uppercased())
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .tracking(1.2)
                    .foregroundStyle(Theme.textFaint)
            }
            Text(title)
                .font(.system(size: 18, weight: .bold))
                .tracking(-0.2)
                .foregroundStyle(Theme.text)
        }
    }
}

// MARK: - Logo
struct ReHomeLogo: View {
    var size: CGFloat = 22
    var body: some View {
        HStack(spacing: 6) {
            ZStack {
                RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
                    .fill(Theme.accent)
                RoundedRectangle(cornerRadius: size * 0.18, style: .continuous)
                    .fill(Theme.bg)
                    .padding(size * 0.22)
            }
            .frame(width: size * 0.95, height: size * 0.95)
            Text("reHome")
                .font(.system(size: size, weight: .bold))
                .tracking(-0.6)
                .foregroundStyle(Theme.text)
        }
    }
}

// MARK: - Auth text field
struct AuthField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var isSecure = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .tracking(1)
                .foregroundStyle(Theme.textFaint)
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(label.lowercased().contains("email") ? .emailAddress : .default)
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(Theme.text)
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .background(
                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                    .fill(Theme.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                            .strokeBorder(Theme.border, lineWidth: 0.75)
                    )
            )
        }
    }
}

// MARK: - Round icon button (top-right header buttons)
struct CircleIconButton: View {
    let systemName: String
    var action: () -> Void = {}
    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 16, weight: .regular))
                .foregroundStyle(Theme.textMuted)
                .frame(width: 38, height: 38)
                .background(
                    Circle()
                        .fill(Theme.surface)
                        .overlay(Circle().strokeBorder(Theme.border, lineWidth: 0.75))
                )
        }
    }
}
