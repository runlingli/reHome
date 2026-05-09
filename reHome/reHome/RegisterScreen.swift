import SwiftUI

struct RegisterScreen: View {
    @Binding var isLoggedIn: Bool
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var errorMsg = ""

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
                        .padding(.bottom, 36)

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
                        errorMsg = ""
                        isLoggedIn = true
                    } label: {
                        Text("Create account")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Theme.accentInk)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 15)
                            .background(
                                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                                    .fill(Theme.accent)
                            )
                    }
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
}
