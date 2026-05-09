import SwiftUI

struct ItemDetailScreen: View {
    let listing: Listing
    @Binding var savedSet: Set<String>
    @Environment(\.dismiss) private var dismiss

    private var seller: SellerProfile { MockData.users[listing.sellerHandle]! }
    private var saved: Bool { savedSet.contains(listing.id) }

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    // Hero photo
                    PhotoPlaceholder(colors: listing.photoColors, label: listing.photoLabel,
                                     aspectRatio: 1, corner: 0)
                        .overlay(alignment: .topLeading) {
                            backButton.padding(14)
                        }
                        .overlay(alignment: .topTrailing) {
                            HStack(spacing: 10) {
                                circleAction(systemName: "square.and.arrow.up") {}
                                circleAction(systemName: saved ? "heart.fill" : "heart",
                                             tint: saved ? Theme.accent : nil) {
                                    if saved { savedSet.remove(listing.id) } else { savedSet.insert(listing.id) }
                                }
                            }
                            .padding(14)
                        }

                    VStack(alignment: .leading, spacing: 18) {
                        // Title block
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                FreeTag(est: listing.estValue)
                                Spacer()
                                Text(listing.posted + " · saved \(listing.savedCount)")
                                    .font(.system(size: 11, design: .monospaced))
                                    .foregroundStyle(Theme.textFaint)
                            }
                            Text(listing.title)
                                .font(.system(size: 22, weight: .bold))
                                .tracking(-0.3)
                                .foregroundStyle(Theme.text)
                            HStack(spacing: 8) {
                                Image(systemName: "mappin.and.ellipse")
                                    .font(.system(size: 12))
                                Text(listing.location)
                                    .font(.system(size: 13))
                            }
                            .foregroundStyle(Theme.textMuted)
                        }

                        // Stats row
                        HStack(spacing: 0) {
                            statBlock(label: "Condition", value: listing.condition.label)
                            divider
                            statBlock(label: "Age",       value: listing.age)
                            divider
                            statBlock(label: "Pickup",    value: listing.pickup)
                        }
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                                .fill(Theme.surfaceAlt)
                                .overlay(
                                    RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                                        .strokeBorder(Theme.border, lineWidth: 0.5)
                                )
                        )

                        // Description
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Details")
                                .font(.system(size: 13, weight: .semibold, design: .monospaced))
                                .tracking(0.6)
                                .foregroundStyle(Theme.textMuted)
                            Text(listing.desc)
                                .font(.system(size: 14))
                                .foregroundStyle(Theme.text)
                                .fixedSize(horizontal: false, vertical: true)
                                .lineSpacing(3)
                        }

                        // Seller card
                        sellerCard

                        Color.clear.frame(height: 100)
                    }
                    .padding(20)
                }
            }
            .ignoresSafeArea(.container, edges: .top)

            // Bottom CTA bar
            HStack(spacing: 10) {
                Button {
                    if saved { savedSet.remove(listing.id) } else { savedSet.insert(listing.id) }
                } label: {
                    Image(systemName: saved ? "heart.fill" : "heart")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(saved ? Theme.accent : Theme.text)
                        .frame(width: 54, height: 54)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .strokeBorder(Theme.border, lineWidth: 1)
                        )
                }
                Button {} label: {
                    HStack {
                        Image(systemName: "paperplane.fill")
                            .font(.system(size: 14, weight: .semibold))
                        Text("Message \(seller.name.split(separator: " ").first.map(String.init) ?? seller.name)")
                            .font(.system(size: 15, weight: .semibold))
                    }
                    .foregroundStyle(Theme.bg)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Theme.text)
                    )
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 30)
            .background(
                Theme.bg
                    .opacity(0.95)
                    .ignoresSafeArea(edges: .bottom)
                    .overlay(
                        Rectangle()
                            .fill(Theme.border)
                            .frame(height: 0.5)
                            .frame(maxHeight: .infinity, alignment: .top)
                    )
            )
        }
        .background(Theme.bg.ignoresSafeArea())
        .navigationBarBackButtonHidden(true)
    }

    // MARK: - Pieces
    private var backButton: some View {
        Button { dismiss() } label: {
            Image(systemName: "chevron.left")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Theme.text)
                .frame(width: 38, height: 38)
                .background(Circle().fill(.ultraThinMaterial))
        }
    }

    private func circleAction(systemName: String, tint: Color? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(tint ?? Theme.text)
                .frame(width: 38, height: 38)
                .background(Circle().fill(.ultraThinMaterial))
        }
    }

    private func statBlock(label: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .semibold, design: .monospaced))
                .tracking(0.8)
                .foregroundStyle(Theme.textFaint)
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Theme.text)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    private var divider: some View {
        Rectangle().fill(Theme.border).frame(width: 0.5, height: 28)
    }

    private var sellerCard: some View {
        HStack(spacing: 12) {
            AvatarView(user: seller, size: 46)
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(seller.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    if seller.eduVerified { VerifiedBadge(kind: .edu) }
                }
                Text(seller.school)
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.textMuted)
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 10))
                        .foregroundStyle(Color(hex: "E1A82A"))
                    Text(String(format: "%.1f", seller.rating))
                        .font(.system(size: 12, weight: .semibold))
                    Text("· \(seller.deals) deals")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textMuted)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13))
                .foregroundStyle(Theme.textFaint)
        }
        .padding(14)
        .background(Theme.surface)
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
        )
    }
}
