import SwiftUI

struct ChatDetailScreen: View {
    let conversation: Conversation
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    private var seller: SellerProfile { MockData.user(for: conversation.withUser) }
    private var listing: Listing? { MockData.listings.first { $0.id == conversation.listingId } }

    private var messages: [(text: String, isMe: Bool)] {
        switch conversation.id {
        case "c1": return [
            ("Hi! Is the desk still available?", true),
            ("Yes, still here. When can you pick up?", false),
            ("I can swing by Saturday at 2?", true),
        ]
        case "c2": return [
            ("Hey, interested in the bike!", true),
            ("Great, it's in good shape — recently tuned.", false),
            ("Works for me. See you Sunday then.", false),
            ("Cool — see you Sunday.", true),
        ]
        case "c3": return [
            ("Is the Dyson still up?", true),
            ("Yep! Near the Davis Amtrak station, easy access.", false),
            ("Sent the address — 4-min walk from there.", false),
        ]
        case "c4": return [
            ("Does the chair break down for transport?", true),
            ("Yep, four bolts. Takes about 10 min.", false),
            ("I can split it into two trips if needed.", true),
        ]
        default: return [(conversation.lastMessage, false)]
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider().background(Theme.borderSubtle)
            messageList
            Divider().background(Theme.borderSubtle)
            inputBar
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private var header: some View {
        HStack(spacing: 12) {
            Button { dismiss() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.text)
                    .frame(width: 36, height: 36)
            }
            AvatarView(user: seller, size: 38)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(seller.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    if seller.eduVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.eduColor)
                    }
                }
                if let listing {
                    Text(listing.title)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textMuted)
                        .lineLimit(1)
                }
            }
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Theme.bg)
    }

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 8) {
                    ForEach(messages.indices, id: \.self) { i in
                        let msg = messages[i]
                        HStack(alignment: .bottom, spacing: 0) {
                            if msg.isMe { Spacer(minLength: 64) }
                            Text(msg.text)
                                .font(.system(size: 14))
                                .foregroundStyle(msg.isMe ? Theme.accentInk : Theme.text)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(
                                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                                        .fill(msg.isMe ? Theme.accent : Theme.surface)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                                .strokeBorder(msg.isMe ? Color.clear : Theme.borderSubtle, lineWidth: 0.75)
                                        )
                                )
                            if !msg.isMe { Spacer(minLength: 64) }
                        }
                        .id(i)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
            .background(Theme.bg)
            .onAppear {
                proxy.scrollTo(messages.indices.last, anchor: .bottom)
            }
        }
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Message…", text: $draft)
                .font(.system(size: 14))
                .foregroundStyle(Theme.text)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(Theme.surface)
                        .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 0.75))
                )
            Button {
                guard !draft.isEmpty else { return }
                draft = ""
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 30))
                    .foregroundStyle(draft.isEmpty ? Theme.textFaint : Theme.accent)
            }
            .disabled(draft.isEmpty)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Theme.bg)
    }
}
