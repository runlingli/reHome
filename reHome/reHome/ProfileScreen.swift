import SwiftUI

struct ProfileScreen: View {
    private var me: SellerProfile { MockData.users["me_student"]! }
    private var myListings: [Listing] {
        // Show a couple of sample "my posted items"
        Array(MockData.listings.filter { $0.sellerHandle == "u_emma" }.prefix(3))
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    // Profile header
                    profileHeader
                        .padding(.horizontal, 16)
                        .padding(.top, 16)

                    // Stats row
                    statsRow
                        .padding(.horizontal, 16)

                    // Verification banners
                    verificationCard
                        .padding(.horizontal, 16)

                    // Quick links
                    quickLinks
                        .padding(.horizontal, 16)

                    // My listings
                    VStack(alignment: .leading, spacing: 10) {
                        SectionHeader(eyebrow: "My listings", title: "Posted by you")
                        ForEach(myListings) { item in
                            HStack(spacing: 12) {
                                PhotoPlaceholder(colors: item.photoColors, label: item.photoLabel,
                                                 aspectRatio: 1, corner: 10)
                                    .frame(width: 64)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.title)
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(Theme.text)
                                        .lineLimit(1)
                                    Text("\(item.condition.label) · saved \(item.savedCount)")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Theme.textMuted)
                                    FreeTag(est: item.estValue)
                                }
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Theme.textFaint)
                            }
                            .padding(12)
                            .background(Theme.surface)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                                    .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
                            )
                        }
                    }
                    .padding(.horizontal, 16)

                    Color.clear.frame(height: 60)
                }
            }
            .background(Theme.bg)
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { } label: {
                        Image(systemName: "gearshape")
                            .foregroundStyle(Theme.text)
                    }
                }
            }
            .toolbarBackground(Theme.bg, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
        }
    }

    // MARK: - Header
    private var profileHeader: some View {
        HStack(alignment: .top, spacing: 14) {
            AvatarView(user: me, size: 64)
            VStack(alignment: .leading, spacing: 6) {
                Text(me.name)
                    .font(.system(size: 22, weight: .bold))
                    .tracking(-0.4)
                    .foregroundStyle(Theme.text)
                Text(me.handle)
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(Theme.textMuted)
                Text(me.bio)
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textMuted)
                    .lineLimit(2)
                    .padding(.top, 2)
            }
            Spacer(minLength: 0)
        }
    }

    private var statsRow: some View {
        HStack(spacing: 0) {
            stat(value: "\(me.deals)", label: "Deals")
            div
            stat(value: String(format: "%.1f", me.rating), label: "Rating")
            div
            stat(value: me.school.split(separator: " ").prefix(2).joined(separator: " "), label: "School")
        }
        .padding(.vertical, 16)
        .background(Theme.surface)
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
        )
    }

    private func stat(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(Theme.text)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label.uppercased())
                .font(.system(size: 9, weight: .semibold, design: .monospaced))
                .tracking(1)
                .foregroundStyle(Theme.textFaint)
        }
        .frame(maxWidth: .infinity)
    }

    private var div: some View {
        Rectangle().fill(Theme.border).frame(width: 0.5, height: 30)
    }

    // MARK: - Verification card (.edu Verified large badge)
    private var verificationCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 26))
                    .foregroundStyle(Theme.eduColor)
                VStack(alignment: .leading, spacing: 2) {
                    Text(".edu Verified")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.eduColor)
                    Text("you@bu.edu · verified Apr 18")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.eduColor.opacity(0.8))
                }
                Spacer()
            }
            Text("You can post items. Add Local Verified to also pick up.")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textMuted)
            Button {} label: {
                HStack(spacing: 6) {
                    Image(systemName: "mappin")
                        .font(.system(size: 11, weight: .semibold))
                    Text("Add Local Verified")
                        .font(.system(size: 13, weight: .semibold))
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    Capsule().strokeBorder(Theme.border, lineWidth: 1)
                )
                .foregroundStyle(Theme.text)
            }
        }
        .padding(14)
        .background(Theme.eduBg.opacity(0.55))
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
    }

    private var quickLinks: some View {
        VStack(spacing: 0) {
            quickLinkRow(systemName: "heart", label: "Saved", count: 2)
            Divider().background(Theme.borderSubtle).padding(.leading, 48)
            quickLinkRow(systemName: "tray.full", label: "Drafts", count: 1)
            Divider().background(Theme.borderSubtle).padding(.leading, 48)
            quickLinkRow(systemName: "shield.lefthalf.filled", label: "Safety center", count: nil)
            Divider().background(Theme.borderSubtle).padding(.leading, 48)
            quickLinkRow(systemName: "questionmark.circle", label: "Help & support", count: nil)
        }
        .background(Theme.surface)
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
        )
    }

    private func quickLinkRow(systemName: String, label: String, count: Int?) -> some View {
        HStack(spacing: 14) {
            Image(systemName: systemName)
                .font(.system(size: 16))
                .foregroundStyle(Theme.textMuted)
                .frame(width: 22)
            Text(label)
                .font(.system(size: 14))
                .foregroundStyle(Theme.text)
            Spacer()
            if let count {
                Text("\(count)")
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(Theme.textMuted)
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textFaint)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
