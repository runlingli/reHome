import SwiftUI
import FirebaseAuth

struct ChatDetailScreen: View {
    let convId: String
    let listing: Listing
    let sellerUid: String

    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var fs = FirestoreService.shared
    @State private var draft = ""
    @State private var isSending = false
    @State private var confirmError: String?

    private var myUid: String { Auth.auth().currentUser?.uid ?? "" }
    private var isSeller: Bool { sellerUid == myUid }

    private var conv: FirestoreConversation? {
        fs.firestoreConversations.first { $0.id == convId }
    }
    private var myConfirmed: Bool {
        guard let c = conv else { return false }
        return isSeller ? c.sellerConfirmed : c.receiverConfirmed
    }
    private var otherConfirmed: Bool {
        guard let c = conv else { return false }
        return isSeller ? c.receiverConfirmed : c.sellerConfirmed
    }
    private var bothConfirmed: Bool { conv?.isBothConfirmed ?? false }

    private var otherUser: SellerProfile {
        let otherUid = conv?.otherParticipant(excluding: myUid) ?? sellerUid
        return MockData.user(for: otherUid)
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider().background(Theme.borderSubtle)
            itemCard
            Divider().background(Theme.borderSubtle)
            messageList
            bottomBar
        }
        .background(Theme.bg.ignoresSafeArea())
        .onAppear  { fs.startListeningMessages(convId: convId) }
        .onDisappear { fs.stopListeningMessages() }
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 12) {
            Button { dismiss() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.text)
                    .frame(width: 36, height: 36)
            }
            AvatarView(user: otherUser, size: 38)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(otherUser.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    if otherUser.eduVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.eduColor)
                    }
                }
                Text(otherUser.school)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textMuted)
            }
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Theme.bg)
    }

    // MARK: - Item card

    private var itemCard: some View {
        HStack(spacing: 12) {
            ListingPhoto(listing: listing, aspectRatio: 1, corner: 8)
                .frame(width: 52, height: 52)
            VStack(alignment: .leading, spacing: 3) {
                Text("DISCUSSING")
                    .font(.system(size: 9, weight: .semibold, design: .monospaced))
                    .tracking(0.8)
                    .foregroundStyle(Theme.textFaint)
                Text(listing.title)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .lineLimit(1)
                FreeTag(est: listing.estValue)
            }
            Spacer()
            if bothConfirmed {
                Label("Complete", systemImage: "checkmark.seal.fill")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Theme.eduColor)
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(Theme.eduBg)
                    .clipShape(Capsule())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.surfaceAlt)
    }

    // MARK: - Message list

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 8) {
                    HStack {
                        Capsule()
                            .fill(Theme.borderSubtle)
                            .frame(height: 0.5)
                        Text("Chat started")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(Theme.textFaint)
                            .padding(.horizontal, 6)
                        Capsule()
                            .fill(Theme.borderSubtle)
                            .frame(height: 0.5)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 14)

                    ForEach(fs.activeMessages) { msg in
                        let mine = msg.isMe(uid: myUid)
                        HStack(alignment: .bottom, spacing: 0) {
                            if mine { Spacer(minLength: 64) }
                            VStack(alignment: mine ? .trailing : .leading, spacing: 2) {
                                Text(msg.text)
                                    .font(.system(size: 14))
                                    .foregroundStyle(mine ? Theme.accentInk : Theme.text)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 10)
                                    .background(
                                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                                            .fill(mine ? Theme.accent : Theme.surface)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                                    .strokeBorder(mine ? Color.clear : Theme.borderSubtle, lineWidth: 0.75)
                                            )
                                    )
                                Text(msg.timeLabel)
                                    .font(.system(size: 9, design: .monospaced))
                                    .foregroundStyle(Theme.textFaint)
                                    .padding(.horizontal, 4)
                            }
                            if !mine { Spacer(minLength: 64) }
                        }
                        .padding(.horizontal, 16)
                        .id(msg.id)
                    }
                    Color.clear.frame(height: 8).id("bottom")
                }
            }
            .background(Theme.bg)
            .onChange(of: fs.activeMessages.count) { _ in
                withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
            }
            .onAppear {
                proxy.scrollTo("bottom", anchor: .bottom)
            }
        }
    }

    // MARK: - Bottom bar (confirm + input)

    @ViewBuilder
    private var bottomBar: some View {
        if bothConfirmed {
            completedBanner
        } else {
            VStack(spacing: 0) {
                if !myConfirmed {
                    confirmBanner
                } else {
                    waitingBanner
                }
                Divider().background(Theme.borderSubtle)
                inputBar
            }
        }
    }

    private var confirmBanner: some View {
        VStack(spacing: 0) {
            Button {
                Task {
                    do {
                        try await fs.confirmHandoff(
                            convId: convId,
                            listingId: listing.id,
                            myUid: myUid,
                            isSeller: isSeller
                        )
                    } catch {
                        confirmError = (error as NSError).localizedDescription
                    }
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 15, weight: .semibold))
                    Text(isSeller ? "Confirm handed off" : "Confirm picked up")
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundStyle(Theme.accentInk)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .background(Theme.accent)
            }
            if let err = confirmError {
                Text(err)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.accent)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 4)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Theme.bg)
            }
        }
    }

    private var waitingBanner: some View {
        HStack(spacing: 8) {
            ProgressView().scaleEffect(0.75)
            Text(isSeller ? "Waiting for receiver to confirm pickup…"
                          : "Waiting for seller to confirm handoff…")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Theme.surfaceAlt)
    }

    private var completedBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 16))
                .foregroundStyle(Theme.eduColor)
            Text("Handoff complete! This item has been passed on.")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Theme.eduColor)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Theme.eduBg)
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
                let text = draft.trimmingCharacters(in: .whitespaces)
                guard !text.isEmpty, !isSending else { return }
                draft = ""
                isSending = true
                Task {
                    do {
                        try await fs.sendMessage(convId: convId, text: text, senderUid: myUid)
                    } catch {
                        draft = text  // restore on failure
                    }
                    isSending = false
                }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 30))
                    .foregroundStyle(draft.trimmingCharacters(in: .whitespaces).isEmpty ? Theme.textFaint : Theme.accent)
            }
            .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty || isSending)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Theme.bg)
    }
}
