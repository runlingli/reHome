import SwiftUI

// Lightweight stub for the publish flow. Per design, the full flow is 4 steps:
// 1. Photos & title  · 2. Category & condition  · 3. Pickup & description  · 4. Review.
// First iteration shows step 1 only and the back-with-unsaved-content prompt.

struct PublishScreen: View {
    @Environment(\.dismiss) private var dismiss

    @State private var title: String = ""
    @State private var notes: String = ""
    @State private var photoCount: Int = 0
    @State private var showSaveSheet = false

    private var hasContent: Bool {
        !title.isEmpty || !notes.isEmpty || photoCount > 0
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Photos
                    VStack(alignment: .leading, spacing: 8) {
                        FieldLabel("Photos")
                        photoGrid
                    }

                    // Title
                    VStack(alignment: .leading, spacing: 8) {
                        FieldLabel("Title")
                        TextField("e.g. IKEA Malm desk · white", text: $title)
                            .padding(14)
                            .background(Theme.surface)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                                    .strokeBorder(Theme.border, lineWidth: 1)
                            )
                    }

                    // Notes
                    VStack(alignment: .leading, spacing: 8) {
                        FieldLabel("Notes (optional)")
                        TextField("Anything quick worth noting…", text: $notes, axis: .vertical)
                            .lineLimit(3...6)
                            .padding(14)
                            .background(Theme.surface)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                                    .strokeBorder(Theme.border, lineWidth: 1)
                            )
                    }

                    Color.clear.frame(height: 80)
                }
                .padding(20)
            }
            .background(Theme.bg)

            // Bottom CTA
            Button {} label: {
                Text("Continue")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.bg)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Theme.text)
                    )
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
            .padding(.top, 12)
            .background(Theme.bg)
            .opacity(title.isEmpty ? 0.4 : 1)
            .disabled(title.isEmpty)
        }
        .background(Theme.bg)
        .navigationBarBackButtonHidden(true)
        .confirmationDialog("Save your draft?",
                            isPresented: $showSaveSheet,
                            titleVisibility: .visible) {
            Button("Save Draft") { dismiss() }
            Button("Don't Save", role: .destructive) { dismiss() }
            Button("Continue Editing", role: .cancel) { }
        } message: {
            Text("You've added details. We can save this as a draft so you can finish later.")
        }
    }

    // MARK: - Header
    private var header: some View {
        HStack {
            Button {
                if hasContent {
                    showSaveSheet = true
                } else {
                    dismiss()
                }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .frame(width: 38, height: 38)
                    .background(Circle().fill(Theme.surface))
                    .overlay(Circle().strokeBorder(Theme.border, lineWidth: 0.75))
            }
            Spacer()
            VStack(spacing: 2) {
                Text("New listing")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.text)
                Text("Step 1 of 4 · Photos & title")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(Theme.textFaint)
            }
            Spacer()
            // Visual symmetry placeholder
            Color.clear.frame(width: 38, height: 38)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Theme.bg)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Theme.borderSubtle)
                .frame(height: 0.5)
        }
    }

    private var photoGrid: some View {
        let cols = [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)]
        return LazyVGrid(columns: cols, spacing: 8) {
            // Add photo button
            Button {
                photoCount = min(photoCount + 1, 6)
            } label: {
                VStack(spacing: 6) {
                    Image(systemName: "camera")
                        .font(.system(size: 22))
                        .foregroundStyle(Theme.textMuted)
                    Text("Add")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Theme.textMuted)
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)
                .background(Theme.surfaceAlt)
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                        .strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [4]))
                        .foregroundStyle(Theme.border)
                )
                .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
            }

            ForEach(0..<photoCount, id: \.self) { i in
                PhotoPlaceholder(
                    colors: [Color(hex: "F4EFE6"), Color(hex: "B8A687")],
                    label: "photo \(i+1)",
                    aspectRatio: 1,
                    corner: Radius.md
                )
            }
        }
    }
}

private struct FieldLabel: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 11, weight: .semibold, design: .monospaced))
            .tracking(0.6)
            .foregroundStyle(Theme.textMuted)
    }
}
