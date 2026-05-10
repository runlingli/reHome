import SwiftUI
import FirebaseAuth

struct LoginScreen: View {
    @Binding var isLoggedIn: Bool
    @State private var showRegister = false
    @State private var email = ""
    @State private var password = ""
    @State private var errorMsg = ""
    @State private var isWorking = false

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    Spacer(minLength: 80)

                    ReHomeLogo(size: 30)
                        .padding(.bottom, 10)
                    Text("Free stuff for students, by students.")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 52)

                    VStack(spacing: 14) {
                        AuthField(label: "School email",
                                  placeholder: "you@university.edu",
                                  text: $email,
                                  isSecure: false)
                        AuthField(label: "Password",
                                  placeholder: "••••••••",
                                  text: $password,
                                  isSecure: true)
                        if !errorMsg.isEmpty {
                            Text(errorMsg)
                                .font(.system(size: 13))
                                .foregroundStyle(Theme.accent)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                    .padding(.bottom, 20)

                    Button {
                        guard !email.isEmpty, !password.isEmpty else {
                            errorMsg = "Please fill in all fields."
                            return
                        }
                        Task { await signIn() }
                    } label: {
                        HStack(spacing: 8) {
                            if isWorking { ProgressView().tint(Theme.accentInk) }
                            Text(isWorking ? "Signing in…" : "Sign in")
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
                    .padding(.bottom, 18)

                    Button { showRegister = true } label: {
                        (Text("No account? ")
                            .foregroundStyle(Theme.textMuted)
                         + Text("Sign up")
                            .foregroundStyle(Theme.accent)
                            .bold())
                        .font(.system(size: 14))
                    }

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 28)
            }
        }
        .fullScreenCover(isPresented: $showRegister) {
            RegisterScreen(isLoggedIn: $isLoggedIn)
        }
    }

    private func signIn() async {
        errorMsg = ""
        isWorking = true
        defer { isWorking = false }
        do {
            _ = try await Auth.auth().signIn(withEmail: email, password: password)
            isLoggedIn = true
        } catch {
            errorMsg = (error as NSError).localizedDescription
        }
    }
}
