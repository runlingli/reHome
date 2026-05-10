import SwiftUI
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage

struct RegisterScreen: View {
    @Binding var isLoggedIn: Bool
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var errorMsg = ""
    @State private var isWorking = false
    @State private var avatarAnimal: String?
    @State private var avatarImage: UIImage?

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    HStack {
                        Button { dismiss() } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundStyle(Theme.textMuted)
                                .frame(width: 38, height: 38)
                                .background(
                                    Circle()
                                        .fill(Theme.surface)
                                        .overlay(Circle().strokeBorder(Theme.border, lineWidth: 0.75))
                                )
                        }
                        Spacer()
                    }
                    .padding(.top, 12)
                    .padding(.bottom, 28)

                    ReHomeLogo(size: 26)
                        .padding(.bottom, 8)
                    Text("Create your student account")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.textMuted)
                        .padding(.bottom, 28)

                    AvatarPickerSection(selectedAnimal: $avatarAnimal, selectedImage: $avatarImage)
                        .padding(.bottom, 28)

                    VStack(spacing: 14) {
                        AuthField(label: "Name",
                                  placeholder: "First Last",
                                  text: $name,
                                  isSecure: false)
                        AuthField(label: "School email",
                                  placeholder: "you@university.edu",
                                  text: $email,
                                  isSecure: false)
                        AuthField(label: "Password",
                                  placeholder: "Min. 8 characters",
                                  text: $password,
                                  isSecure: true)
                        AuthField(label: "Confirm password",
                                  placeholder: "Re-enter password",
                                  text: $confirmPassword,
                                  isSecure: true)
                        if !errorMsg.isEmpty {
                            Text(errorMsg)
                                .font(.system(size: 13))
                                .foregroundStyle(Theme.accent)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                    .padding(.bottom, 24)

                    Button {
                        guard !name.isEmpty, !email.isEmpty, !password.isEmpty else {
                            errorMsg = "Please fill in all fields."
                            return
                        }
                        guard password == confirmPassword else {
                            errorMsg = "Passwords do not match."
                            return
                        }
                        guard password.count >= 6 else {
                            errorMsg = "Password must be at least 6 characters."
                            return
                        }
                        Task { await register() }
                    } label: {
                        HStack(spacing: 8) {
                            if isWorking { ProgressView().tint(Theme.accentInk) }
                            Text(isWorking ? "Creating…" : "Create account")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Theme.accentInk)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(
                            RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                                .fill(Theme.accent)
                        )
                        .opacity(isWorking ? 0.7 : 1)
                    }
                    .disabled(isWorking)
                    .padding(.bottom, 14)

                    HStack(spacing: 10) {
                        Rectangle().fill(Theme.border).frame(height: 0.5)
                        Text("OR").font(.system(size: 11, weight: .semibold, design: .monospaced))
                            .foregroundStyle(Theme.textFaint).tracking(1)
                        Rectangle().fill(Theme.border).frame(height: 0.5)
                    }
                    .padding(.bottom, 14)

                    GoogleSignInRow(isWorking: $isWorking, errorMsg: $errorMsg, isLoggedIn: $isLoggedIn)
                        .padding(.bottom, 20)

                    Text("By signing up you agree to our Terms & Privacy Policy.")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textFaint)
                        .multilineTextAlignment(.center)

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 28)
            }
        }
    }

    private func register() async {
        errorMsg = ""
        isWorking = true
        defer { isWorking = false }
        do {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            let uid = result.user.uid
            let initials = name.split(separator: " ").prefix(2)
                .compactMap { $0.first }.map(String.init).joined().uppercased()
            let isEdu = email.lowercased().hasSuffix(".edu")
            let school = isEdu
                ? (email.split(separator: "@").last.map(String.init) ?? "")
                    .replacingOccurrences(of: ".edu", with: "").uppercased()
                : ""

            // eduVerified starts false even for .edu — Firebase rules require the
            // email-verification link to be clicked first, then EmailVerification.promote()
            // flips it to true on the next app foreground.
            var userData: [String: Any] = [
                "name":           name,
                "handle":         "@" + (email.split(separator: "@").first.map(String.init) ?? "user"),
                "school":         school,
                "bio":            "",
                "avatarColor":    "#C8553D",
                "avatarInitials": initials.isEmpty ? "U" : initials,
                "rating":         5.0,
                "deals":          0,
                "eduVerified":    false,
                "localVerified":  false,
                "createdAt":      FieldValue.serverTimestamp(),
            ]

            if let img = avatarImage, let data = img.jpegData(compressionQuality: 0.85) {
                let ref = Storage.storage().reference().child("avatars/\(uid).jpg")
                let meta = StorageMetadata(); meta.contentType = "image/jpeg"
                _ = try await ref.putDataAsync(data, metadata: meta)
                userData["avatarPhotoURL"] = try await ref.downloadURL().absoluteString
            } else if let animal = avatarAnimal {
                userData["avatarAnimal"] = animal
            }

            try await Firestore.firestore().collection("users").document(uid).setData(userData)

            // Send the verification email asynchronously; we don't block on it.
            try? await result.user.sendEmailVerification()

            isLoggedIn = true
        } catch {
            errorMsg = (error as NSError).localizedDescription
        }
    }
}
