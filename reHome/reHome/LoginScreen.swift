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
                    .padding(.bottom, 14)

                    HStack(spacing: 10) {
                        Rectangle().fill(Theme.border).frame(height: 0.5)
                        Text("OR").font(.system(size: 11, weight: .semibold, design: .monospaced))
                            .foregroundStyle(Theme.textFaint).tracking(1)
                        Rectangle().fill(Theme.border).frame(height: 0.5)
                    }
                    .padding(.bottom, 14)

                    GoogleSignInRow(isWorking: $isWorking, errorMsg: $errorMsg, isLoggedIn: $isLoggedIn)
                        .padding(.bottom, 18)

                    Button { showRegister = true } label: {
                        Text("No account? \(Text("Sign up").foregroundStyle(Theme.accent).bold())")
                            .foregroundStyle(Theme.textMuted)
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

// MARK: - "Continue with Google" pill (shared between Login + Register)
struct GoogleSignInRow: View {
    @Binding var isWorking: Bool
    @Binding var errorMsg: String
    @Binding var isLoggedIn: Bool

    var body: some View {
        Button {
            Task { await go() }
        } label: {
            HStack(spacing: 10) {
                GoogleGLogo(size: 22)
                Text("Continue with Google")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.text)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                    .fill(Theme.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                            .strokeBorder(Theme.border, lineWidth: 1)
                    )
            )
        }
        .disabled(isWorking)
        .opacity(isWorking ? 0.6 : 1)
    }

    private func go() async {
        errorMsg = ""
        isWorking = true
        defer { isWorking = false }
        do {
            _ = try await GoogleAuth.signIn()
            isLoggedIn = true
        } catch {
            errorMsg = (error as NSError).localizedDescription
        }
    }
}

// MARK: - Google G four-colour arc logo
struct GoogleGLogo: View {
    var size: CGFloat = 20

    private static let segments: [(start: Double, end: Double, hex: String)] = [
        (-90,  25, "EA4335"),   // red    – top
        ( 30, 118, "FBBC05"),   // yellow – right
        (123, 211, "34A853"),   // green  – bottom
        (216, 270, "4285F4"),   // blue   – left
    ]

    var body: some View {
        Canvas { ctx, sz in
            let s  = min(sz.width, sz.height)
            let lw = s * 0.195
            let r  = (s - lw) / 2
            let c  = CGPoint(x: sz.width / 2, y: sz.height / 2)
            for seg in Self.segments {
                var p = Path()
                p.addArc(center: c, radius: r,
                         startAngle: .degrees(seg.start),
                         endAngle: .degrees(seg.end),
                         clockwise: false)
                ctx.stroke(p, with: .color(Color(hex: seg.hex)),
                           style: StrokeStyle(lineWidth: lw, lineCap: .round))
            }
        }
        .frame(width: size, height: size)
    }
}
