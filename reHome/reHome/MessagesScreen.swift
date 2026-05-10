import SwiftUI
import FirebaseAuth

struct MessagesScreen: View {
    @ObservedObject private var fs = FirestoreService.shared
    @State private var query = ""
    @State private var selectedConv: FirestoreConversation?

    private var myUid: String { Auth.auth().currentUser?.uid ?? "" }

    /// Use live Firestore conversations; fall back to mock data for demo.
    private var allConversations: [FirestoreConversation] {
        if !fs.firestoreConversations.isEmpty { return fs.firestoreConversations }
        return MockData.conversations.map { c in
            FirestoreConversation(
                id: c.id,
                participants: [myUid, c.withUser],
                listingId: c.listingId,
                sellerUid: c.withUser,
                lastMessage: c.lastMessage,
                sellerConfirmed: false,
                receiverConfirmed: false,
                lastMessageAt: nil
            )
        }
    }

    private var filtered: [FirestoreConversation] {
        guard !query.isEmpty else { return allConversations }
        let q = query.lowercased()
        return allConversations.filter { c in
            let other = MockData.user(for: c.otherParticipant(excluding: myUid))
            let nameMatch = other.name.lowercased().contains(q)
            let msgMatch  = c.lastMessage.lowercased().contains(q)
            let title     = fs.listings.first { $0.id == c.listingId }?.title ?? ""
            let itemMatch = title.lowercased().contains(q)
            return nameMatch || msgMatch || itemMatch
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            searchBar
            Divider().background(Theme.borderSubtle)

            ScrollView(showsIndicators: false) {
                if filtered.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 32))
                            .foregroundStyle(Theme.textFaint)
                        Text(query.isEmpty ? "No messages yet" : "No conversations match")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.textMuted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 64)
                } else {
                    LazyVStack(spacing: 0) {
                        ForEach(filtered) { c in
                            Button { selectedConv = c } label: {
                                ConversationRow(conv: c, myUid: myUid,
                                                listings: fs.listings, highlight: query)
                            }
                            .buttonStyle(.plain)
                            Divider()
                                .background(Theme.borderSubtle)
                                .padding(.leading, 78)
                        }
                    }
                    .padding(.top, 4)
                }
            }
        }
        .background(Theme.bg.ignoresSafeArea())
        .sheet(item: $selectedConv) { c in
            chatSheet(for: c)
        }
    }

    @ViewBuilder
    private func chatSheet(for conv: FirestoreConversation) -> some View {
        let listing = fs.listings.first { $0.id == conv.listingId }
            ?? MockData.listings.first { $0.id == conv.listingId }
        if let listing {
            ChatDetailScreen(convId: conv.id, listing: listing, sellerUid: conv.sellerUid)
        }
    }

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 14))
                .foregroundStyle(Theme.textMuted)
            TextField("Search by name or message…", text: $query)
                .font(.system(size: 14))
                .foregroundStyle(Theme.text)
                .autocorrectionDisabled()
            if !query.isEmpty {
                Button { query = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.textFaint)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .background(
            Capsule()
                .fill(Theme.surface)
                .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 0.75))
        )
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.bg)
    }
}

private struct ConversationRow: View {
    let conv: FirestoreConversation
    let myUid: String
    let listings: [Listing]
    let highlight: String

    private var otherUid: String { conv.otherParticipant(excluding: myUid) }
    private var user: SellerProfile { MockData.user(for: otherUid) }
    private var listing: Listing? { listings.first { $0.id == conv.listingId }
        ?? MockData.listings.first { $0.id == conv.listingId } }

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            AvatarView(user: user, size: 48)
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(user.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    if user.eduVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.eduColor)
                    }
                    Spacer()
                    if conv.isBothConfirmed {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.eduColor)
                    }
                    if let d = conv.lastMessageAt {
                        Text(relTime(d))
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(Theme.textFaint)
                    }
                }
                if let listing {
                    Text("Re: \(listing.title)")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textMuted)
                        .lineLimit(1)
                }
                if !conv.lastMessage.isEmpty {
                    Text(conv.lastMessage)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                        .lineLimit(2)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private func relTime(_ d: Date) -> String {
        let sec = Date().timeIntervalSince(d)
        if sec < 3600   { return "\(Int(sec / 60))m" }
        if sec < 86_400 { return "\(Int(sec / 3600))h" }
        return "\(Int(sec / 86_400))d"
    }
}
