import SwiftUI

struct SavedScreen: View {
    @Binding var savedSet: Set<String>
    @ObservedObject private var fs = FirestoreService.shared

    private var savedIds: [String] { savedSet.sorted() }

    private func listing(for id: String) -> Listing? {
        fs.listings.first { $0.id == id } ?? MockData.listings.first { $0.id == id }
    }

    private func isSold(_ id: String) -> Bool {
        !fs.listings.contains { $0.id == id }
    }

    private var hasInvalid: Bool {
        savedIds.contains { isSold($0) }
    }

    var body: some View {
        Group {
            if savedIds.isEmpty {
                VStack(spacing: 14) {
                    Image(systemName: "heart")
                        .font(.system(size: 48))
                        .foregroundStyle(Theme.textFaint)
                    Text("Nothing saved yet")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    Text("Tap the heart on any item to save it here.")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 40)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Theme.bg)
            } else {
                List {
                    ForEach(savedIds, id: \.self) { id in
                        if let item = listing(for: id) {
                            SavedRow(listing: item, isSold: isSold(id))
                                .listRowBackground(isSold(id) ? Theme.surfaceAlt.opacity(0.6) : Theme.bg)
                                .listRowSeparatorTint(Theme.borderSubtle)
                        } else {
                            HStack(spacing: 14) {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Theme.surfaceAlt)
                                    .frame(width: 60, height: 60)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Item no longer available")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(Theme.textMuted)
                                    Text("已售出")
                                        .font(.system(size: 11))
                                        .foregroundStyle(.red.opacity(0.6))
                                }
                                Spacer()
                            }
                            .padding(.vertical, 6)
                            .opacity(0.55)
                            .listRowBackground(Theme.surfaceAlt.opacity(0.6))
                        }
                    }
                    .onDelete { offsets in
                        let ids = savedIds
                        for idx in offsets { savedSet.remove(ids[idx]) }
                    }
                }
                .listStyle(.plain)
                .background(Theme.bg)
            }
        }
        .navigationTitle("Saved")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if hasInvalid {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("清除失效物品") {
                        let liveIds = Set(fs.listings.map(\.id))
                        savedSet = savedSet.filter { liveIds.contains($0) }
                    }
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textMuted)
                }
            }
        }
    }
}

private struct SavedRow: View {
    let listing: Listing
    let isSold: Bool

    var body: some View {
        HStack(spacing: 14) {
            ZStack(alignment: .center) {
                ListingPhoto(listing: listing, aspectRatio: 1, corner: 10)
                    .frame(width: 60, height: 60)
                    .opacity(isSold ? 0.45 : 1)
                if isSold {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.black.opacity(0.38))
                        .frame(width: 60, height: 60)
                    Text("已售出")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.white)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(isSold ? Theme.textMuted : Theme.text)
                    .lineLimit(1)
                if isSold {
                    Text("已被他人领取")
                        .font(.system(size: 11))
                        .foregroundStyle(.red.opacity(0.65))
                } else {
                    Text("\(listing.condition.label) · 取件 \(listing.pickup)")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textMuted)
                    FreeTag(est: listing.estValue)
                }
            }

            Spacer()

            if !isSold {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.textFaint)
            }
        }
        .padding(.vertical, 8)
        .opacity(isSold ? 0.75 : 1)
    }
}
