import SwiftUI
import UIKit

// MARK: - Photo placeholder (gradient + diagonal stripes + label)
struct PhotoPlaceholder: View {
    let colors: [Color]
    let label: String
    var aspectRatio: CGFloat? = 1
    var corner: CGFloat = Radius.md

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
            DiagonalStripes(spacing: 14, color: colors.last ?? .black, opacity: 0.18)
            Text(label.uppercased())
                .font(.system(size: 9, weight: .regular, design: .monospaced))
                .tracking(0.4)
                .foregroundStyle(Color.black.opacity(0.42))
                .padding(.leading, 10)
                .padding(.bottom, 8)
        }
        .frame(maxWidth: .infinity)
        .aspectRatio(aspectRatio, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
    }
}

private struct DiagonalStripes: View {
    let spacing: CGFloat
    let color: Color
    let opacity: Double
    var body: some View {
        GeometryReader { geo in
            Canvas { ctx, size in
                let diag = sqrt(size.width * size.width + size.height * size.height)
                ctx.translateBy(x: size.width / 2, y: size.height / 2)
                ctx.rotate(by: .degrees(45))
                ctx.translateBy(x: -diag / 2, y: -diag / 2)
                var x: CGFloat = 0
                while x < diag {
                    let p = Path { p in
                        p.move(to: CGPoint(x: x, y: 0))
                        p.addLine(to: CGPoint(x: x, y: diag))
                    }
                    ctx.stroke(p, with: .color(color.opacity(opacity)), lineWidth: 1)
                    x += spacing
                }
            }
            .allowsHitTesting(false)
        }
    }
}

// MARK: - Listing photo (real image with gradient fallback)
struct ListingPhoto: View {
    let listing: Listing
    var aspectRatio: CGFloat? = 1
    var corner: CGFloat = Radius.md

    var body: some View {
        if let name = listing.imageName {
            Color.clear
                .aspectRatio(aspectRatio, contentMode: .fit)
                .overlay(Image(name).resizable().scaledToFill())
                .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
        } else {
            PhotoPlaceholder(colors: listing.photoColors, label: listing.photoLabel,
                             aspectRatio: aspectRatio, corner: corner)
        }
    }
}

// MARK: - Avatar (custom photo, chosen animal, or hash-based random animal)
struct AvatarView: View {
    let user: SellerProfile
    var size: CGFloat = 36

    static let animalPool: [(symbol: String, bg: String, fg: String)] = [
        ("hare.fill",     "E8E0D4", "8A7560"),
        ("tortoise.fill", "D4E8D8", "4A7A5A"),
        ("bird.fill",     "D4E0F0", "4A6A9A"),
        ("fish.fill",     "D4EEF0", "3A8A90"),
        ("cat.fill",      "EEE0F0", "8A4A9A"),
        ("dog.fill",      "F0E8D0", "9A7A3A"),
        ("lizard.fill",   "DCF0D4", "5A8A4A"),
        ("ladybug.fill",  "F0D4D4", "9A3A3A"),
    ]

    private var resolvedAnimal: (symbol: String, bg: String, fg: String) {
        if let sym = user.avatarAnimal,
           let entry = Self.animalPool.first(where: { $0.symbol == sym }) { return entry }
        return Self.animalPool[abs(user.id.hashValue) % Self.animalPool.count]
    }

    var body: some View {
        ZStack {
            if let urlStr = user.avatarPhotoURL, let url = URL(string: urlStr) {
                AsyncImage(url: url) { phase in
                    if case .success(let img) = phase {
                        img.resizable().scaledToFill()
                    } else {
                        animalLayer
                    }
                }
            } else {
                animalLayer
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(Circle().strokeBorder(Color.black.opacity(0.06), lineWidth: 0.5))
    }

    private var animalLayer: some View {
        ZStack {
            Color(hex: resolvedAnimal.bg)
            Image(systemName: resolvedAnimal.symbol)
                .resizable()
                .scaledToFit()
                .foregroundStyle(Color(hex: resolvedAnimal.fg))
                .padding(size * 0.22)
        }
    }
}

// MARK: - Cropping image picker (square crop via UIImagePickerController)
struct CroppingImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) private var dismiss

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .photoLibrary
        picker.allowsEditing = true
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CroppingImagePicker
        init(_ parent: CroppingImagePicker) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController,
                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.image = (info[.editedImage] ?? info[.originalImage]) as? UIImage
            parent.dismiss()
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }
}

// MARK: - Avatar picker (used in RegisterScreen)
struct AvatarPickerSection: View {
    @Binding var selectedAnimal: String?
    @Binding var selectedImage: UIImage?
    @State private var showPicker = false

    private var imageBinding: Binding<UIImage?> {
        Binding(get: { selectedImage },
                set: { img in selectedImage = img; if img != nil { selectedAnimal = nil } })
    }

    var body: some View {
        VStack(spacing: 16) {
            avatarPreview.frame(width: 72, height: 72)

            Text("CHOOSE YOUR AVATAR")
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .tracking(1.2)
                .foregroundStyle(Theme.textFaint)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                ForEach(0..<AvatarView.animalPool.count, id: \.self) { i in
                    let animal = AvatarView.animalPool[i]
                    let isSelected = selectedAnimal == animal.symbol && selectedImage == nil
                    Button {
                        selectedAnimal = animal.symbol
                        selectedImage = nil
                    } label: {
                        ZStack {
                            Circle().fill(Color(hex: animal.bg))
                            Image(systemName: animal.symbol)
                                .resizable()
                                .scaledToFit()
                                .foregroundStyle(Color(hex: animal.fg))
                                .padding(10)
                        }
                        .frame(maxWidth: .infinity)
                        .aspectRatio(1, contentMode: .fit)
                        .clipShape(Circle())
                        .overlay(Circle().strokeBorder(isSelected ? Theme.accent : Color.clear, lineWidth: 2.5))
                    }
                    .buttonStyle(.plain)
                    .animation(.easeOut(duration: 0.12), value: isSelected)
                }
            }

            Button { showPicker = true } label: {
                HStack(spacing: 6) {
                    Image(systemName: "photo.on.rectangle").font(.system(size: 13))
                    Text(selectedImage != nil ? "Change photo" : "Choose from library")
                        .font(.system(size: 14, weight: .medium))
                }
                .foregroundStyle(selectedImage != nil ? Theme.accent : Theme.textMuted)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 11)
                .background(
                    RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                        .fill(Theme.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                                .strokeBorder(selectedImage != nil ? Theme.accent : Theme.border, lineWidth: 0.75)
                        )
                )
            }
            .buttonStyle(.plain)
            .sheet(isPresented: $showPicker) {
                CroppingImagePicker(image: imageBinding).ignoresSafeArea()
            }

            Text("Skip to get a random animal")
                .font(.system(size: 11))
                .foregroundStyle(Theme.textFaint)
        }
    }

    @ViewBuilder
    private var avatarPreview: some View {
        if let img = selectedImage {
            Image(uiImage: img)
                .resizable().scaledToFill()
                .frame(width: 72, height: 72)
                .clipShape(Circle())
                .overlay(Circle().strokeBorder(Color.black.opacity(0.06), lineWidth: 0.5))
        } else if let sym = selectedAnimal,
                  let a = AvatarView.animalPool.first(where: { $0.symbol == sym }) {
            ZStack {
                Circle().fill(Color(hex: a.bg))
                Image(systemName: a.symbol)
                    .resizable().scaledToFit()
                    .foregroundStyle(Color(hex: a.fg))
                    .padding(72 * 0.22)
            }
            .frame(width: 72, height: 72)
            .clipShape(Circle())
            .overlay(Circle().strokeBorder(Color.black.opacity(0.06), lineWidth: 0.5))
        } else {
            ZStack {
                Circle()
                    .strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [5, 3]))
                    .foregroundStyle(Theme.border)
                Image(systemName: "pawprint")
                    .font(.system(size: 24, weight: .light))
                    .foregroundStyle(Theme.textFaint)
            }
            .frame(width: 72, height: 72)
        }
    }
}

// MARK: - Verified Badge
enum VerifiedKind {
    case edu, local
    var color: Color { self == .edu ? Theme.eduColor : Theme.localColor }
    var bg: Color    { self == .edu ? Theme.eduBg    : Theme.localBg    }
    var label: String { self == .edu ? ".edu Verified" : "Local Verified" }
}

struct VerifiedBadge: View {
    let kind: VerifiedKind
    var compact: Bool = true

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: compact ? 9 : 11, weight: .bold))
            Text(kind.label)
                .font(.system(size: compact ? 10 : 12, weight: .semibold))
                .lineLimit(1)
        }
        .foregroundStyle(kind.color)
        .padding(.horizontal, compact ? 6 : 8)
        .padding(.vertical,   compact ? 2 : 4)
        .background(Capsule().fill(kind.bg))
    }
}

// MARK: - "Free · est. $XX" tag
struct FreeTag: View {
    let est: Int
    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 5) {
            Text("Free")
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(Theme.accent)
                .tracking(0.1)
            Text("est. $\(est)")
                .font(.system(size: 10, weight: .regular, design: .monospaced))
                .foregroundStyle(Theme.textFaint)
                .tracking(0.2)
        }
    }
}

// MARK: - Category chip
struct CategoryChip: View {
    let category: ItemCategory
    let active: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(category.glyph)
                    .font(.system(size: 12))
                    .opacity(0.85)
                Text(category.label)
                    .font(.system(size: 13, weight: .medium))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(
                Capsule()
                    .fill(active ? Theme.text : Color.clear)
                    .overlay(
                        Capsule().strokeBorder(active ? Theme.text : Theme.border, lineWidth: 0.75)
                    )
            )
            .foregroundStyle(active ? Theme.bg : Theme.textMuted)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Press style (replaces dark system highlight with subtle scale)
struct CardPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Item card (grid)
struct ItemCard: View {
    let listing: Listing
    @Binding var savedSet: Set<String>

    private var seller: SellerProfile { MockData.user(for: listing.sellerHandle) }
    private var saved: Bool { savedSet.contains(listing.id) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topLeading) {
                ListingPhoto(listing: listing, aspectRatio: listing.photoAspectRatio, corner: 0)
                VerifiedBadge(kind: .edu)
                    .padding(8)
            }
            .overlay(alignment: .topTrailing) {
                Button {
                    if saved { savedSet.remove(listing.id) } else { savedSet.insert(listing.id) }
                } label: {
                    Image(systemName: saved ? "heart.fill" : "heart")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(saved ? Theme.accent : Color(white: 0.27))
                        .frame(width: 30, height: 30)
                        .background(
                            Circle().fill(.ultraThinMaterial)
                        )
                }
                .padding(6)
            }

            VStack(alignment: .leading, spacing: 5) {
                Text(listing.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                Text("\(listing.condition.label) · \(listing.location.split(separator: ",").first.map(String.init) ?? listing.location)")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textMuted)
                HStack {
                    FreeTag(est: listing.estValue)
                    Spacer()
                    Text(listing.posted)
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Theme.textFaint)
                }
                .padding(.top, 2)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
        .background(Theme.surface)
        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
        )
    }
}

// MARK: - Section header
struct SectionHeader: View {
    let eyebrow: String?
    let title: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let eyebrow {
                Text(eyebrow.uppercased())
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .tracking(1.2)
                    .foregroundStyle(Theme.textFaint)
            }
            Text(title)
                .font(.system(size: 18, weight: .bold))
                .tracking(-0.2)
                .foregroundStyle(Theme.text)
        }
    }
}

// MARK: - Logo
struct ReHomeLogo: View {
    var size: CGFloat = 22
    var body: some View {
        HStack(spacing: 6) {
            ZStack {
                RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
                    .fill(Theme.accent)
                RoundedRectangle(cornerRadius: size * 0.18, style: .continuous)
                    .fill(Theme.bg)
                    .padding(size * 0.22)
            }
            .frame(width: size * 0.95, height: size * 0.95)
            Text("reHome")
                .font(.system(size: size, weight: .bold))
                .tracking(-0.6)
                .foregroundStyle(Theme.text)
        }
    }
}

// MARK: - Auth text field
struct AuthField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var isSecure = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .tracking(1)
                .foregroundStyle(Theme.textFaint)
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(label.lowercased().contains("email") ? .emailAddress : .default)
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(Theme.text)
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .background(
                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                    .fill(Theme.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                            .strokeBorder(Theme.border, lineWidth: 0.75)
                    )
            )
        }
    }
}

// MARK: - Round icon button (top-right header buttons)
struct CircleIconButton: View {
    let systemName: String
    var action: () -> Void = {}
    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 16, weight: .regular))
                .foregroundStyle(Theme.textMuted)
                .frame(width: 38, height: 38)
                .background(
                    Circle()
                        .fill(Theme.surface)
                        .overlay(Circle().strokeBorder(Theme.border, lineWidth: 0.75))
                )
        }
    }
}
