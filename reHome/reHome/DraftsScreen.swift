import SwiftUI

struct DraftsScreen: View {
    @State private var drafts: [DraftData] = DraftStore.load()
    @State private var resumingDraft: DraftData? = nil

    var body: some View {
        Group {
            if drafts.isEmpty {
                VStack(spacing: 14) {
                    Image(systemName: "tray")
                        .font(.system(size: 48))
                        .foregroundStyle(Theme.textFaint)
                    Text("No drafts")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    Text("Start a listing and choose \"Save Draft\" when you exit to continue later.")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 40)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Theme.bg)
            } else {
                List {
                    ForEach(drafts) { draft in
                        DraftRow(draft: draft) {
                            resumingDraft = draft
                        }
                        .listRowBackground(Theme.bg)
                        .listRowSeparatorTint(Theme.borderSubtle)
                    }
                    .onDelete { offsets in
                        drafts.remove(atOffsets: offsets)
                        DraftStore.save(drafts)
                    }
                }
                .listStyle(.plain)
                .background(Theme.bg)
            }
        }
        .navigationTitle("Drafts")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { drafts = DraftStore.load() }
        .fullScreenCover(item: $resumingDraft) { draft in
            PublishScreen(initialDraft: draft)
        }
    }
}

private struct DraftRow: View {
    let draft: DraftData
    let onResume: () -> Void

    private var catLabel: String {
        MockData.categories.first { $0.id == draft.category }?.label ?? draft.category
    }

    private var relativeTime: String {
        let sec = Date().timeIntervalSince(draft.savedAt)
        if sec < 3600  { return "\(max(1, Int(sec / 60)))m ago" }
        if sec < 86400 { return "\(Int(sec / 3600))h ago" }
        return "\(Int(sec / 86400))d ago"
    }

    var body: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text(draft.title.isEmpty ? "Untitled listing" : draft.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .lineLimit(1)
                HStack(spacing: 8) {
                    if !draft.category.isEmpty {
                        Text(catLabel)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Theme.textMuted)
                            .padding(.horizontal, 7).padding(.vertical, 3)
                            .background(Capsule().fill(Theme.surfaceAlt))
                    }
                    Text(relativeTime)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.textFaint)
                }
            }
            Spacer()
            Button(action: onResume) {
                Text("继续编辑")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.bg)
                    .padding(.horizontal, 12).padding(.vertical, 7)
                    .background(Capsule().fill(Theme.text))
            }
        }
        .padding(.vertical, 8)
    }
}
