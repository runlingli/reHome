import SwiftUI
import FirebaseAuth

struct ProfileScreen: View {
    @Binding var savedSet: Set<String>
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("subscribedSchools") private var subscribedSchools: String = "bu,mit"
    @ObservedObject private var fs = FirestoreService.shared
    private var me: SellerProfile { MockData.users["me_student"]! }

    private var myUid: String { Auth.auth().currentUser?.uid ?? "" }

    /// Conversations where handoff is fully confirmed — appear in history.
    private var completedConversations: [FirestoreConversation] {
        fs.firestoreConversations.filter { $0.isBothConfirmed }
    }

    private var activeAlertCount: Int {
        let subs = Set(subscribedSchools.split(separator: ",").map(String.init))
        return nearbySchools
            .filter { subs.contains($0.id) }
            .compactMap { $0.nextUpcomingEvent }
            .filter { $0.daysUntil >= 0 && $0.daysUntil <= 14 }
            .count
    }

    /// Listings posted by the currently signed-in Firebase user.
    /// Falls back to demo seller "u_emma" if not signed in (e.g. SwiftUI preview).
    private var myListings: [Listing] {
        let uid = Auth.auth().currentUser?.uid ?? "u_emma"
        return fs.listings.filter { $0.sellerHandle == uid }
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

                    // Handoff history
                    if !completedConversations.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            SectionHeader(eyebrow: "History", title: "Completed handoffs")
                            ForEach(completedConversations) { conv in
                                let isSeller = conv.sellerUid == myUid
                                let relatedListing = fs.listings.first { $0.id == conv.listingId }
                                    ?? MockData.listings.first { $0.id == conv.listingId }
                                if let item = relatedListing {
                                    HStack(spacing: 12) {
                                        ListingPhoto(listing: item, aspectRatio: 1, corner: 10)
                                            .frame(width: 52)
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(item.title)
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundStyle(Theme.text)
                                                .lineLimit(1)
                                            Label(isSeller ? "Handed off" : "Picked up",
                                                  systemImage: "checkmark.seal.fill")
                                                .font(.system(size: 11, weight: .semibold))
                                                .foregroundStyle(Theme.eduColor)
                                        }
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(Theme.eduBg.opacity(0.5))
                                    .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                                            .strokeBorder(Theme.eduColor.opacity(0.25), lineWidth: 0.75)
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                    }

                    // My listings
                    VStack(alignment: .leading, spacing: 10) {
                        SectionHeader(eyebrow: "My listings", title: "Posted by you")
                        ForEach(myListings) { item in
                            HStack(spacing: 12) {
                                ListingPhoto(listing: item, aspectRatio: 1, corner: 10)
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
            .toolbar(.hidden, for: .navigationBar)
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
            Button {
                try? Auth.auth().signOut()
                isLoggedIn = false
            } label: {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 16))
                    .foregroundStyle(Theme.textFaint)
            }
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
    @ViewBuilder
    private var verificationCard: some View {
        if EmailVerification.needsVerification {
            unverifiedCard
        } else {
            verifiedCard
        }
    }

    private var verifiedCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 26))
                    .foregroundStyle(Theme.eduColor)
                VStack(alignment: .leading, spacing: 2) {
                    Text(".edu Verified")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.eduColor)
                    if let e = Auth.auth().currentUser?.email {
                        Text(e)
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(Theme.eduColor.opacity(0.8))
                    }
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
                .background(Capsule().strokeBorder(Theme.border, lineWidth: 1))
                .foregroundStyle(Theme.text)
            }
        }
        .padding(14)
        .background(Theme.eduBg.opacity(0.55))
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
    }

    @State private var verifyState: VerifyAction = .idle
    private enum VerifyAction { case idle, sending, sentOK, error(String) }

    private var unverifiedCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "envelope.badge")
                    .font(.system(size: 24))
                    .foregroundStyle(Theme.accent)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Verify your email")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    if let e = Auth.auth().currentUser?.email {
                        Text("Check \(e) — click the link to unlock posting.")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.textMuted)
                            .lineSpacing(2)
                    }
                }
                Spacer()
            }

            HStack(spacing: 8) {
                Button {
                    Task {
                        await EmailVerification.promoteIfReady()
                        verifyState = .idle
                    }
                } label: {
                    Text("I've verified")
                        .font(.system(size: 13, weight: .semibold))
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(Capsule().fill(Theme.text))
                        .foregroundStyle(Theme.bg)
                }
                Button {
                    Task {
                        verifyState = .sending
                        do { try await EmailVerification.resend(); verifyState = .sentOK }
                        catch { verifyState = .error((error as NSError).localizedDescription) }
                    }
                } label: {
                    HStack(spacing: 4) {
                        if case .sending = verifyState { ProgressView().scaleEffect(0.7) }
                        Text(resendLabel)
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(Capsule().strokeBorder(Theme.border, lineWidth: 1))
                    .foregroundStyle(Theme.text)
                }
                Spacer()
            }

            if case .error(let msg) = verifyState {
                Text(msg).font(.system(size: 11)).foregroundStyle(Theme.accent)
            }
        }
        .padding(14)
        .background(Theme.accentSoft.opacity(0.55))
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
    }

    private var resendLabel: String {
        switch verifyState {
        case .idle, .error:        return "Resend email"
        case .sending:             return "Sending…"
        case .sentOK:              return "Sent ✓"
        }
    }

    private var quickLinks: some View {
        let draftCount = DraftStore.load().count
        return VStack(spacing: 0) {
            NavigationLink(destination: SavedScreen(savedSet: $savedSet)) {
                quickLinkRowContent(systemName: "heart", label: "Saved",
                                    count: savedSet.isEmpty ? nil : savedSet.count)
            }
            .buttonStyle(.plain)
            Divider().background(Theme.borderSubtle).padding(.leading, 48)
            NavigationLink(destination: DraftsScreen()) {
                quickLinkRowContent(systemName: "tray.full", label: "Drafts",
                                    count: draftCount > 0 ? draftCount : nil)
            }
            .buttonStyle(.plain)
            Divider().background(Theme.borderSubtle).padding(.leading, 48)
            NavigationLink(destination: SchoolAlertsScreen()) {
                quickLinkRowContent(systemName: "bell.badge",
                                    label: "School alerts",
                                    count: activeAlertCount > 0 ? activeAlertCount : nil)
            }
            .buttonStyle(.plain)
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
        quickLinkRowContent(systemName: systemName, label: label, count: count)
    }

    private func quickLinkRowContent(systemName: String, label: String, count: Int?) -> some View {
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
                    .foregroundStyle(Color(hex: "D4900A"))
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(Capsule().fill(Color(hex: "D4900A").opacity(0.1)))
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textFaint)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
