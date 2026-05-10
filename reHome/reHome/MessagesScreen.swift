import SwiftUI

struct MessagesScreen: View {
    @State private var query = ""

    private var filtered: [Conversation] {
        guard !query.isEmpty else { return MockData.conversations }
        let q = query.lowercased()
        return MockData.conversations.filter { c in
            let user = MockData.users[c.withUser]
            let nameMatch    = user?.name.lowercased().contains(q) ?? false
            let msgMatch     = c.lastMessage.lowercased().contains(q)
            let listingTitle = MockData.listings.first { $0.id == c.listingId }?.title ?? ""
            let itemMatch    = listingTitle.lowercased().contains(q)
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
                        Text("No conversations match")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.textMuted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 64)
                } else {
                    LazyVStack(spacing: 0) {
                        ForEach(filtered) { c in
                            ConversationRow(conversation: c, highlight: query)
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
    let conversation: Conversation
    let highlight: String

    private var user: SellerProfile { MockData.user(for: conversation.withUser) }
    private var listing: Listing? { MockData.listings.first { $0.id == conversation.listingId } }

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
                    Text(conversation.time)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.textFaint)
                }
                if let listing {
                    Text("Re: \(listing.title)")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textMuted)
                        .lineLimit(1)
                }
                HStack(alignment: .top) {
                    Text(conversation.lastMessage)
                        .font(.system(size: 13))
                        .foregroundStyle(conversation.unread > 0 ? Theme.text : Theme.textMuted)
                        .lineLimit(2)
                    Spacer()
                    if conversation.unread > 0 {
                        Text("\(conversation.unread)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(minWidth: 18, minHeight: 18)
                            .padding(.horizontal, 4)
                            .background(Capsule().fill(Theme.accent))
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
