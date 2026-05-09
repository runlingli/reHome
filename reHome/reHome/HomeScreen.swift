import SwiftUI

struct HomeScreen: View {
    @Binding var savedSet: Set<String>
    let openListing: (Listing) -> Void
    let openPublish: () -> Void

    @State private var query: String = ""
    @State private var selectedCategory: String = "all"

    private var filtered: [Listing] {
        MockData.listings.filter { item in
            if selectedCategory != "all", item.category != selectedCategory { return false }
            if !query.isEmpty {
                let blob = (item.title + " " + item.location + " " + item.desc).lowercased()
                if !blob.contains(query.lowercased()) { return false }
            }
            return true
        }
    }

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(spacing: 0) {
                header
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 16) {
                        if query.isEmpty && selectedCategory == "all" {
                            gradBanner
                                .padding(.horizontal, 16)
                                .padding(.top, 4)
                        }

                        if let featured = filtered.first {
                            VStack(alignment: .leading, spacing: 10) {
                                SectionHeader(eyebrow: "Quick win", title: "Picked for you")
                                FeatureCard(listing: featured, savedSet: $savedSet) {
                                    openListing(featured)
                                }
                            }
                            .padding(.horizontal, 16)
                        }

                        VStack(alignment: .leading, spacing: 10) {
                            if query.isEmpty && selectedCategory == "all" {
                                SectionHeader(eyebrow: "Apartments closing", title: "Take it before May 31")
                            }
                            LazyVGrid(columns: columns, spacing: 10) {
                                ForEach(filtered.dropFirst().map { $0 }) { item in
                                    Button { openListing(item) } label: {
                                        ItemCard(listing: item, savedSet: $savedSet)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .padding(.horizontal, 16)

                        Color.clear.frame(height: 80)
                    }
                    .padding(.top, 4)
                }
            }

            // Post FAB
            Button(action: openPublish) {
                Image(systemName: "plus")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(Theme.accentInk)
                    .frame(width: 56, height: 56)
                    .background(
                        Circle().fill(Theme.accent)
                    )
                    .shadow(color: Theme.accent.opacity(0.34), radius: 14, x: 0, y: 10)
                    .shadow(color: Color.black.opacity(0.12), radius: 4, x: 0, y: 2)
            }
            .padding(.trailing, 18)
            .padding(.bottom, 18)
            .accessibilityLabel("Post item")
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    // MARK: - Header (title row + search + category chips)
    private var header: some View {
        VStack(spacing: 12) {
            HStack {
                ReHomeLogo(size: 22)
                Spacer()
                CircleIconButton(systemName: "bell")
            }

            HStack(spacing: 8) {
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 14, weight: .regular))
                        .foregroundStyle(Theme.textMuted)
                    TextField("Search \"desk\", \"Trek\", \"kitchen\"…", text: $query)
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.text)
                        .textInputAutocapitalization(.never)
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

                Button {} label: {
                    Image(systemName: "line.3.horizontal.decrease")
                        .font(.system(size: 15, weight: .regular))
                        .foregroundStyle(Theme.textMuted)
                        .frame(width: 42, height: 42)
                        .background(
                            Circle()
                                .fill(Theme.surface)
                                .overlay(Circle().strokeBorder(Theme.border, lineWidth: 0.75))
                        )
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(MockData.categories) { c in
                        CategoryChip(category: c, active: selectedCategory == c.id) {
                            selectedCategory = c.id
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
        .padding(.bottom, 6)
        .background(Theme.bg)
    }

    // MARK: - Graduating-soon banner
    private var gradBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "graduationcap.fill")
                .font(.system(size: 22))
                .foregroundStyle(Theme.accent)
                .frame(width: 44, height: 44)
                .background(Circle().fill(Theme.accentSoft))
            VStack(alignment: .leading, spacing: 2) {
                Text("Grad season is on")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.text)
                Text("New listings drop every hour through May.")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.textMuted)
            }
            Spacer()
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .fill(Theme.surfaceAlt)
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                        .strokeBorder(Theme.border, lineWidth: 0.75)
                )
        )
    }
}

// MARK: - Featured card (full-width, taller)
struct FeatureCard: View {
    let listing: Listing
    @Binding var savedSet: Set<String>
    let action: () -> Void

    private var seller: SellerProfile { MockData.users[listing.sellerHandle]! }
    private var saved: Bool { savedSet.contains(listing.id) }

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .topLeading) {
                    PhotoPlaceholder(colors: listing.photoColors, label: listing.photoLabel,
                                     aspectRatio: 16.0/10, corner: 0)
                    HStack {
                        VerifiedBadge(kind: .edu)
                        Spacer()
                        Button {
                            if saved { savedSet.remove(listing.id) } else { savedSet.insert(listing.id) }
                        } label: {
                            Image(systemName: saved ? "heart.fill" : "heart")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(saved ? Theme.accent : Color(white: 0.27))
                                .frame(width: 32, height: 32)
                                .background(Circle().fill(.ultraThinMaterial))
                        }
                    }
                    .padding(10)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text(listing.title)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Theme.text)
                        .lineLimit(1)
                    HStack(spacing: 8) {
                        AvatarView(user: seller, size: 22)
                        Text(seller.name)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(Theme.textMuted)
                        Text("·")
                            .foregroundStyle(Theme.textFaint)
                        Text(listing.location)
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.textMuted)
                    }
                    HStack {
                        FreeTag(est: listing.estValue)
                        Spacer()
                        Text("Pickup: \(listing.pickup)")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(Theme.textFaint)
                    }
                }
                .padding(14)
            }
            .background(Theme.surface)
            .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                    .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
            )
        }
        .buttonStyle(.plain)
    }
}
