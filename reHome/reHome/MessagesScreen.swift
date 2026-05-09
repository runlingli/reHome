import SwiftUI

struct MessagesScreen: View {
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 0) {
                    ForEach(MockData.conversations) { c in
                        ConversationRow(conversation: c)
                        Divider()
                            .background(Theme.borderSubtle)
                            .padding(.leading, 78)
                    }
                }
                .padding(.top, 8)
            }
            .background(Theme.bg)
            .navigationTitle("Messages")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.bg, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
        }
    }
}

private struct ConversationRow: View {
    let conversation: Conversation

    private var user: SellerProfile { MockData.users[conversation.withUser]! }
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
