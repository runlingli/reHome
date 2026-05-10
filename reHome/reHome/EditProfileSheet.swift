import SwiftUI

struct EditProfileSheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var store = ProfileStore.shared

    @State private var name:           String  = ""
    @State private var handle:         String  = ""
    @State private var bio:            String  = ""
    @State private var school:         String  = ""
    @State private var selectedAnimal: String? = nil
    @State private var selectedImage:  UIImage? = nil

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    AvatarPickerSection(selectedAnimal: $selectedAnimal, selectedImage: $selectedImage)
                        .padding(.top, 8)

                    VStack(alignment: .leading, spacing: 16) {
                        EPField(label: "Name",   placeholder: "Your full name",      text: $name)
                        EPField(label: "Handle", placeholder: "@handle",             text: $handle)
                        EPField(label: "School", placeholder: "University name",     text: $school)
                        EPField(label: "Bio",    placeholder: "A short intro…",      text: $bio, multiline: true)
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.bottom, 40)
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle("Edit profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.textMuted)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        store.save(
                            name:   name.trimmingCharacters(in: .whitespaces),
                            handle: handle.trimmingCharacters(in: .whitespaces),
                            bio:    bio.trimmingCharacters(in: .whitespaces),
                            school: school.trimmingCharacters(in: .whitespaces),
                            animal: selectedAnimal,
                            photo:  selectedImage
                        )
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
            .onAppear {
                name           = store.displayName
                handle         = store.displayHandle
                bio            = store.displayBio
                school         = store.displaySchool
                selectedAnimal = store.animal
                selectedImage  = store.avatarImage
            }
        }
    }
}

private struct EPField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var multiline: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .tracking(0.8)
                .foregroundStyle(Theme.textFaint)

            if multiline {
                TextEditor(text: $text)
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.text)
                    .frame(minHeight: 80, maxHeight: 140)
                    .padding(10)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Theme.surface)
                            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Theme.border, lineWidth: 0.75))
                    )
            } else {
                TextField(placeholder, text: $text)
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.text)
                    .padding(14)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Theme.surface)
                            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Theme.border, lineWidth: 0.75))
                    )
            }
        }
    }
}
