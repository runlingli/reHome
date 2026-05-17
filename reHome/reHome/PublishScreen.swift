import SwiftUI
import PhotosUI
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage

struct PublishScreen: View {
    var initialDraft: DraftData? = nil

    @Environment(\.dismiss) private var dismiss
    @State private var step = 1
    @State private var showSaveSheet = false
    @State private var isPosting = false
    @State private var postError: String?

    // Step 1
    @State private var photoItems: [PhotosPickerItem] = []
    @State private var loadedImages: [Image] = []
    @State private var photoData: [Data] = []     // raw bytes for upload (kept in sync with loadedImages)
    @State private var title = ""
    @State private var descriptionText = ""
    @State private var descriptionLang = "en"

    // Step 2
    @State private var category = ""
    @State private var condition: ItemCondition? = nil
    @State private var ageOption = ""

    // Step 3
    @State private var pickupWindow = ""
    @State private var pickupDate = ""
    @State private var selectedTimeSlots: Set<String> = []
    @State private var customTimeInput = ""
    @State private var customTimeTags: [String] = []
    @State private var pickupSpot = ""
    @State private var handoffKind: HandoffKind = .meetIndoor
    @State private var doorsideWindow = ""

    private let doorsideWindows = ["Morning (8–12)", "Afternoon (12–5)", "Evening (5–9)", "All day"]

    // Static data
    private let ageOptions = ["< 6 mo", "6-12 mo", "1 yr", "2 yr", "3+ yr"]
    private let pickupWindows = ["Mid-May", "May 18 – 22", "May 23 – 28", "May 29 – Jun 2", "Flexible"]
    private let timeSlots = ["Morning (8–12)", "Afternoon (12–17)", "Evening (17–20)"]
    private let conditionData: [(ItemCondition, String)] = [
        (.new,       "est. 78% of retail"),
        (.excellent, "est. 62% of retail"),
        (.good,      "est. 45% of retail"),
        (.fair,      "est. 28% of retail"),
    ]
    private let windowDates: [String: [String]] = [
        "Mid-May":        ["May 13", "May 14", "May 15", "May 16", "May 17", "May 18"],
        "May 18 – 22":    ["May 18", "May 19", "May 20", "May 21", "May 22"],
        "May 23 – 28":    ["May 23", "May 24", "May 25", "May 26", "May 27", "May 28"],
        "May 29 – Jun 2": ["May 29", "May 30", "May 31", "Jun 1",  "Jun 2"],
    ]

    private var hasContent: Bool {
        !title.isEmpty || !descriptionText.isEmpty || !loadedImages.isEmpty
    }

    private var estimatedValue: Int {
        let base: [String: Int] = [
            "furniture": 250, "kitchen": 60, "appliance": 180,
            "bike": 350, "clothing": 90, "household": 75,
        ]
        let cMult: [ItemCondition: Double] = [
            .new: 0.78, .excellent: 0.62, .good: 0.45, .fair: 0.28,
        ]
        let aMult: [String: Double] = [
            "< 6 mo": 1.0, "6-12 mo": 0.9, "1 yr": 0.8, "2 yr": 0.7, "3+ yr": 0.6,
        ]
        let b  = base[category] ?? 100
        let cm = condition.flatMap { cMult[$0] } ?? 0.6
        let am = aMult[ageOption] ?? 0.75
        return max(5, Int(Double(b) * cm * am))
    }

    private var autoDesc: String {
        guard descriptionText.isEmpty else { return descriptionText }
        let catLabel  = MockData.categories.first { $0.id == category }?.label.lowercased() ?? "item"
        let condLabel = condition?.label ?? "Good condition"
        let pickup    = pickupWindow.isEmpty ? "flexible" : pickupWindow
        let age       = ageOption.isEmpty ? "" : ", \(ageOption) old"
        return "\(condLabel) \(catLabel)\(age). Available for \(pickup) pickup."
    }

    // MARK: - Body

    var body: some View {
        VStack(spacing: 0) {
            navHeader
            progressBar
            currentStepView
                .id(step)
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing),
                    removal: .move(edge: .leading)
                ))
        }
        .animation(.easeInOut(duration: 0.22), value: step)
        .background(Theme.bg.ignoresSafeArea())
        .navigationBarBackButtonHidden(true)
        .confirmationDialog("Save your draft?", isPresented: $showSaveSheet, titleVisibility: .visible) {
            Button("Save Draft") {
                DraftStore.append(DraftData(
                    title: title,
                    category: category,
                    condition: condition?.rawValue ?? "",
                    age: ageOption,
                    pickup: pickupWindow,
                    notes: descriptionText
                ))
                dismiss()
            }
            Button("Don't Save", role: .destructive) { dismiss() }
            Button("Continue Editing", role: .cancel) {}
        } message: {
            Text("You've added details. We can save this as a draft so you can finish later.")
        }
        .onAppear {
            guard let d = initialDraft else { return }
            title = d.title
            descriptionText = d.notes
            category = d.category
            if let c = ItemCondition(rawValue: d.condition) { condition = c }
            ageOption = d.age
            pickupWindow = d.pickup
        }
    }

    @ViewBuilder
    private var currentStepView: some View {
        switch step {
        case 1:  step1
        case 2:  step2
        case 3:  step3
        default: step4
        }
    }

    // MARK: - Header

    private var navHeader: some View {
        let titles = ["Photos & title", "Category & condition", "Pickup window", "Estimated value & post"]
        return HStack {
            Button {
                if step > 1 { withAnimation { step -= 1 } }
                else if hasContent { showSaveSheet = true }
                else { dismiss() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .frame(width: 38, height: 38)
                    .background(Circle().fill(Theme.surface))
                    .overlay(Circle().strokeBorder(Theme.border, lineWidth: 0.75))
            }
            Spacer()
            VStack(spacing: 3) {
                Text("NEW LISTING · \(step)/4")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .tracking(0.6)
                    .foregroundStyle(Theme.textFaint)
                Text(titles[step - 1])
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(Theme.text)
            }
            Spacer()
            Color.clear.frame(width: 38, height: 38)
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
        .padding(.bottom, 10)
        .background(Theme.bg)
    }

    // MARK: - Progress bar

    private var progressBar: some View {
        HStack(spacing: 4) {
            ForEach(1...4, id: \.self) { i in
                Capsule()
                    .fill(i <= step ? Theme.accent : Theme.border)
                    .frame(height: 3)
                    .animation(.easeInOut, value: step)
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 6)
    }

    // MARK: - Step 1: Photos & Title

    private var step1: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 22) {
                    VStack(alignment: .leading, spacing: 10) {
                        PubLabel("Photos · 1–4")
                        photoPickerGrid
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        PubLabel("Title")
                        TextField("e.g. IKEA Malm desk · white", text: $title)
                            .font(.system(size: 15))
                            .pubFieldStyle()
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            PubLabel("Description")
                            Spacer()
                            LangPicker(selected: $descriptionLang)
                        }
                        descriptionInput
                        if descriptionText.isEmpty {
                            Text("Leave blank — we'll write one from your selections.")
                                .font(.system(size: 11))
                                .foregroundStyle(Theme.textFaint)
                        } else if descriptionLang != "en" {
                            HStack(spacing: 4) {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                    .font(.system(size: 10))
                                Text("Auto-translated to English for buyers")
                                    .font(.system(size: 11))
                            }
                            .foregroundStyle(Theme.textMuted)
                        }
                    }

                    Color.clear.frame(height: 80)
                }
                .padding(20)
            }
            .background(Theme.bg)

            pubContinue(enabled: !title.isEmpty) { withAnimation { step = 2 } }
        }
    }

    private var descriptionInput: some View {
        let ph: String
        switch descriptionLang {
        case "zh": ph = "描述物品状态和细节..."
        case "es": ph = "Describe el estado del artículo..."
        case "fr": ph = "Décrivez l'état de l'article..."
        case "ko": ph = "물건 상태와 세부사항을 입력하세요..."
        case "ja": ph = "商品の状態を説明してください..."
        default:   ph = "Brand, age, any quirks, pickup notes..."
        }
        return TextField(ph, text: $descriptionText, axis: .vertical)
            .lineLimit(3...6)
            .font(.system(size: 15))
            .pubFieldStyle()
    }

    private var photoPickerGrid: some View {
        let cols = [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8),
                    GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)]
        return PhotosPicker(selection: $photoItems, maxSelectionCount: 4, matching: .images) {
            LazyVGrid(columns: cols, spacing: 8) {
                ForEach(0..<4, id: \.self) { i in
                    photoSlot(i)
                }
            }
        }
        .onChange(of: photoItems) { _, newItems in
            Task {
                var imgs: [Image] = []
                var data: [Data] = []
                for item in newItems {
                    guard let raw = try? await item.loadTransferable(type: Data.self),
                          let ui  = UIImage(data: raw) else { continue }
                    // Re-encode at 0.85 JPEG to cap upload size; PhotosPicker
                    // sometimes hands back 5-10MB HEIC originals.
                    let jpeg = ui.jpegData(compressionQuality: 0.85) ?? raw
                    imgs.append(Image(uiImage: ui))
                    data.append(jpeg)
                }
                await MainActor.run { loadedImages = imgs; photoData = data }
            }
        }
    }

    private func photoSlot(_ index: Int) -> some View {
        Group {
            if index < loadedImages.count {
                loadedImages[index]
                    .resizable()
                    .scaledToFill()
                    .frame(maxWidth: .infinity)
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
            } else {
                Image(systemName: "camera")
                    .font(.system(size: index == 0 ? 20 : 16))
                    .foregroundStyle(index == 0 ? Theme.textMuted : Theme.textFaint)
                    .frame(maxWidth: .infinity)
                    .aspectRatio(1, contentMode: .fit)
                    .background(Theme.surfaceAlt)
                    .overlay(
                        RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                            .strokeBorder(
                                style: StrokeStyle(lineWidth: 1.5, dash: [index == 0 ? 4 : 3])
                            )
                            .foregroundStyle(index == 0 ? Theme.border : Theme.borderSubtle)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
            }
        }
    }

    // MARK: - Step 2: Category & Condition

    private var step2: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        PubLabel("Category")
                        categoryGrid
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        PubLabel("Condition")
                        conditionRows
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        PubLabel("How long owned")
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(ageOptions, id: \.self) { opt in
                                    Button { ageOption = opt } label: {
                                        Text(opt)
                                            .font(.system(size: 13, weight: .medium))
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 8)
                                            .background(selCapsule(ageOption == opt))
                                            .foregroundStyle(ageOption == opt ? Theme.accentInk : Theme.text)
                                    }
                                    .buttonStyle(CardPressStyle())
                                }
                            }
                        }
                    }

                    Color.clear.frame(height: 80)
                }
                .padding(20)
            }
            .background(Theme.bg)

            pubNavBar(enabled: !category.isEmpty && condition != nil && !ageOption.isEmpty,
                      back: { withAnimation { step = 1 } }) {
                withAnimation { step = 3 }
            }
        }
    }

    private var categoryGrid: some View {
        let cats = MockData.categories.filter { $0.id != "all" }
        let cols = [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)]
        return LazyVGrid(columns: cols, spacing: 8) {
            ForEach(cats) { cat in
                Button { category = cat.id } label: {
                    HStack(spacing: 10) {
                        Text(cat.glyph).font(.system(size: 16))
                        Text(cat.label)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(category == cat.id ? Theme.accentInk : Theme.text)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 14)
                    .background(selRect(category == cat.id))
                }
                .buttonStyle(CardPressStyle())
            }
        }
    }

    private var conditionRows: some View {
        VStack(spacing: 8) {
            ForEach(conditionData, id: \.0.rawValue) { cond, subtitle in
                Button { condition = cond } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(cond.label)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(condition == cond ? Theme.accentInk : Theme.text)
                            Text(subtitle)
                                .font(.system(size: 12))
                                .foregroundStyle(condition == cond ? Theme.accentInk.opacity(0.7) : Theme.textMuted)
                        }
                        Spacer()
                        radioCircle(condition == cond)
                    }
                    .padding(16)
                    .background(selRect(condition == cond))
                }
                .buttonStyle(CardPressStyle())
            }
        }
    }

    // MARK: - Step 3: Pickup

    private var step3: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        PubLabel("Pickup window")
                        VStack(spacing: 8) {
                            ForEach(pickupWindows, id: \.self) { w in
                                Button {
                                    pickupWindow = w
                                    pickupDate = ""
                                    selectedTimeSlots = []
                                    customTimeTags = []
                                    customTimeInput = ""
                                } label: {
                                    HStack {
                                        Image(systemName: "mappin")
                                            .font(.system(size: 14))
                                            .foregroundStyle(pickupWindow == w ? Theme.accentInk.opacity(0.7) : Theme.textMuted)
                                        Text(w)
                                            .font(.system(size: 15, weight: .medium))
                                            .foregroundStyle(pickupWindow == w ? Theme.accentInk : Theme.text)
                                        Spacer()
                                        radioCircle(pickupWindow == w)
                                    }
                                    .padding(16)
                                    .background(selRect(pickupWindow == w))
                                }
                                .buttonStyle(CardPressStyle())
                            }
                        }
                    }

                    if !pickupWindow.isEmpty && pickupWindow != "Flexible" {
                        if let dates = windowDates[pickupWindow] {
                            VStack(alignment: .leading, spacing: 10) {
                                PubLabel("Preferred day")
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(dates, id: \.self) { d in
                                            Button { pickupDate = d } label: {
                                                Text(d)
                                                    .font(.system(size: 13, weight: .medium))
                                                    .padding(.horizontal, 14)
                                                    .padding(.vertical, 8)
                                                    .background(selCapsule(pickupDate == d))
                                                    .foregroundStyle(pickupDate == d ? Theme.accentInk : Theme.text)
                                            }
                                            .buttonStyle(CardPressStyle())
                                        }
                                    }
                                }
                            }
                        }

                        VStack(alignment: .leading, spacing: 10) {
                            PubLabel("Preferred time  (tap to multi-select)")
                            HStack(spacing: 8) {
                                ForEach(timeSlots, id: \.self) { slot in
                                    Button {
                                        if selectedTimeSlots.contains(slot) {
                                            selectedTimeSlots.remove(slot)
                                        } else {
                                            selectedTimeSlots.insert(slot)
                                        }
                                    } label: {
                                        Text(slot)
                                            .font(.system(size: 11, weight: .medium))
                                            .multilineTextAlignment(.center)
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 9)
                                            .frame(maxWidth: .infinity)
                                            .background(selRect(selectedTimeSlots.contains(slot)))
                                            .foregroundStyle(selectedTimeSlots.contains(slot) ? Theme.accentInk : Theme.text)
                                    }
                                    .buttonStyle(CardPressStyle())
                                }
                            }

                            HStack(spacing: 8) {
                                TextField("Custom, e.g. 3 – 5 pm", text: $customTimeInput)
                                    .font(.system(size: 13))
                                    .pubFieldStyle()
                                if !customTimeInput.trimmingCharacters(in: .whitespaces).isEmpty {
                                    Button {
                                        let t = customTimeInput.trimmingCharacters(in: .whitespaces)
                                        if !customTimeTags.contains(t) { customTimeTags.append(t) }
                                        customTimeInput = ""
                                    } label: {
                                        Text("Add")
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundStyle(Theme.accentInk)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 10)
                                            .background(Capsule().fill(Theme.accent))
                                    }
                                }
                            }

                            if !customTimeTags.isEmpty {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(customTimeTags, id: \.self) { tag in
                                            HStack(spacing: 5) {
                                                Text(tag)
                                                    .font(.system(size: 12, weight: .medium))
                                                Button { customTimeTags.removeAll { $0 == tag } } label: {
                                                    Image(systemName: "xmark")
                                                        .font(.system(size: 9, weight: .bold))
                                                }
                                            }
                                            .foregroundStyle(Theme.accentInk)
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 6)
                                            .background(Capsule().fill(Theme.accent))
                                        }
                                    }
                                }
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        PubLabel("Pickup spot")
                        TextField("Address or landmark", text: $pickupSpot)
                            .font(.system(size: 15))
                            .pubFieldStyle()
                        Text("Exact address only shared after pickup is agreed.")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.textFaint)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        PubLabel("Handoff type")
                        VStack(spacing: 8) {
                            ForEach(HandoffKind.allCases, id: \.rawValue) { kind in
                                Button { handoffKind = kind } label: {
                                    HStack(spacing: 12) {
                                        Image(systemName: kind.icon)
                                            .font(.system(size: 15))
                                            .foregroundStyle(handoffKind == kind ? Theme.accentInk : Theme.textMuted)
                                            .frame(width: 22)
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(kind.label)
                                                .font(.system(size: 15, weight: .semibold))
                                                .foregroundStyle(handoffKind == kind ? Theme.accentInk : Theme.text)
                                            Text(kind.detail)
                                                .font(.system(size: 12))
                                                .foregroundStyle(handoffKind == kind ? Theme.accentInk.opacity(0.7) : Theme.textMuted)
                                        }
                                        Spacer()
                                        radioCircle(handoffKind == kind)
                                    }
                                    .padding(16)
                                    .background(selRect(handoffKind == kind))
                                }
                                .buttonStyle(CardPressStyle())
                            }
                        }

                        if handoffKind == .doorsideDrop {
                            VStack(alignment: .leading, spacing: 10) {
                                PubLabel("When item is at the door")
                                LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)], spacing: 8) {
                                    ForEach(doorsideWindows, id: \.self) { slot in
                                        Button { doorsideWindow = slot } label: {
                                            Text(slot)
                                                .font(.system(size: 12, weight: .medium))
                                                .multilineTextAlignment(.center)
                                                .padding(.horizontal, 10)
                                                .padding(.vertical, 10)
                                                .frame(maxWidth: .infinity)
                                                .background(selRect(doorsideWindow == slot))
                                                .foregroundStyle(doorsideWindow == slot ? Theme.accentInk : Theme.text)
                                        }
                                        .buttonStyle(CardPressStyle())
                                    }
                                }
                            }
                            .transition(.opacity.combined(with: .move(edge: .top)))
                        }
                    }

                    Color.clear.frame(height: 80)
                }
                .padding(20)
            }
            .background(Theme.bg)

            pubNavBar(enabled: !pickupWindow.isEmpty,
                      back: { withAnimation { step = 2 } }) {
                withAnimation { step = 4 }
            }
        }
    }

    // MARK: - Step 4: Review & Post

    private var step4: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {

                    // Estimated value card
                    VStack(alignment: .leading, spacing: 10) {
                        Text("ESTIMATED RETAIL VALUE")
                            .font(.system(size: 11, weight: .semibold, design: .monospaced))
                            .tracking(0.8)
                            .foregroundStyle(Theme.accentInk.opacity(0.75))
                        Text("$\(estimatedValue)")
                            .font(.system(size: 44, weight: .bold))
                            .foregroundStyle(Theme.accentInk)
                        Text("We surface this beside \"Free\" so receivers see the worth of your hand-off.")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.accentInk.opacity(0.85))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: Radius.lg, style: .continuous).fill(Theme.accent)
                    )

                    // Final review table
                    VStack(alignment: .leading, spacing: 12) {
                        PubLabel("Final review")
                        VStack(spacing: 0) {
                            reviewRow("Title",     value: title.isEmpty ? "—" : title)
                            reviewDivider
                            reviewRow("Category",
                                      value: MockData.categories.first { $0.id == category }?.label ?? "—")
                            reviewDivider
                            reviewRow("Condition", value: condition?.label ?? "—",       bold: condition != nil)
                            reviewDivider
                            reviewRow("Pickup",    value: pickupWindow.isEmpty ? "—" : pickupWindow,
                                      bold: !pickupWindow.isEmpty)
                            reviewDivider
                            reviewRow("Time",
                                      value: {
                                          let all = selectedTimeSlots.sorted() + customTimeTags
                                          return all.isEmpty ? "—" : all.joined(separator: ", ")
                                      }(),
                                      bold: !selectedTimeSlots.isEmpty || !customTimeTags.isEmpty)
                            reviewDivider
                            reviewRow("Handoff",
                                      value: handoffKind == .doorsideDrop && !doorsideWindow.isEmpty
                                             ? "Doorstep · \(doorsideWindow)"
                                             : handoffKind.label,
                                      bold: true)
                            reviewDivider
                            reviewRow("Photos",    value: "\(loadedImages.count) / 4")
                        }
                        .background(Theme.surface)
                        .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                                .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
                        )
                    }

                    // Auto-generated description preview
                    if descriptionText.isEmpty && !category.isEmpty && condition != nil {
                        VStack(alignment: .leading, spacing: 8) {
                            PubLabel("Auto-generated description")
                            Text(autoDesc)
                                .font(.system(size: 13))
                                .foregroundStyle(Theme.textMuted)
                                .padding(14)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Theme.surfaceAlt)
                                .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
                        }
                    }

                    // .edu verified badge
                    HStack(spacing: 10) {
                        Image(systemName: "checkmark.shield.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(Theme.eduColor)
                        Text("Posting as **@you.edu · BU** — listing carries your .edu Verified badge.")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.eduColor)
                    }
                    .padding(14)
                    .background(Theme.eduBg)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))

                    Color.clear.frame(height: 100)
                }
                .padding(20)
            }
            .background(Theme.bg)

            VStack(spacing: 8) {
                HStack(spacing: 10) {
                    Button { withAnimation { step = 3 } } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(Theme.text)
                            .frame(width: 52, height: 52)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Theme.surface)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .strokeBorder(Theme.border, lineWidth: 0.75)
                            )
                    }
                    Button {
                        Task { await postListing() }
                    } label: {
                        HStack(spacing: 8) {
                            if isPosting { ProgressView().tint(Theme.accentInk) }
                            Text(isPosting ? "Publishing…" : "Publish · free for everyone")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Theme.accentInk)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Theme.accent)
                        )
                        .opacity(isPosting ? 0.7 : 1)
                    }
                    .disabled(isPosting)
                }
                if let postError {
                    Text(postError)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.accent)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 30)
            .padding(.top, 12)
            .background(Theme.bg)
        }
    }

    private func postListing() async {
        guard let uid = Auth.auth().currentUser?.uid else {
            postError = "Not signed in."
            return
        }
        postError = nil
        isPosting = true
        defer { isPosting = false }
        do {
            // 1. Create the listing first to get the doc id.
            let listingId = try await FirestoreService.shared.createListing(
                title:          title,
                category:       category,
                condition:      condition ?? .good,
                estValue:       estimatedValue,
                age:            ageOption,
                pickup:         pickupWindow,
                desc:           autoDesc,
                location:       "",                    // location TODO: collect in form
                sellerUid:      uid,
                handoffKind:    handoffKind,
                doorsideWindow: doorsideWindow
            )

            // 2. Upload selected photos to Storage at listings/{id}/{N}.jpg.
            //    Use the first one as the listing's primary imageUrl.
            if !photoData.isEmpty {
                let storage = Storage.storage().reference()
                var firstURL: String?
                for (idx, data) in photoData.enumerated() {
                    let ref = storage.child("listings/\(listingId)/\(idx).jpg")
                    let meta = StorageMetadata()
                    meta.contentType = "image/jpeg"
                    _ = try await ref.putDataAsync(data, metadata: meta)
                    if idx == 0 { firstURL = try? await ref.downloadURL().absoluteString }
                }
                if let url = firstURL {
                    try? await Firestore.firestore()
                        .collection("listings").document(listingId)
                        .updateData(["imageUrl": url])
                }
            }
            dismiss()
        } catch {
            postError = AuthErrorMessage.friendly(error)
        }
    }

    // MARK: - Shared UI helpers

    private func pubContinue(enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text("Continue")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Theme.bg)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Theme.text)
                )
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 30)
        .padding(.top, 12)
        .background(Theme.bg)
        .opacity(enabled ? 1 : 0.4)
        .disabled(!enabled)
    }

    private func pubNavBar(enabled: Bool, back: @escaping () -> Void, action: @escaping () -> Void) -> some View {
        HStack(spacing: 10) {
            Button(action: back) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.text)
                    .frame(width: 52, height: 52)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Theme.surface)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(Theme.border, lineWidth: 0.75)
                    )
            }
            Button(action: action) {
                Text("Continue")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.bg)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Theme.text)
                    )
            }
            .opacity(enabled ? 1 : 0.4)
            .disabled(!enabled)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 30)
        .padding(.top, 12)
        .background(Theme.bg)
    }

    private func reviewRow(_ label: String, value: String, bold: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundStyle(Theme.textMuted)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: bold ? .semibold : .regular))
                .foregroundStyle(bold ? Theme.text : Theme.textMuted)
                .lineLimit(1)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private var reviewDivider: some View {
        Divider().background(Theme.borderSubtle).padding(.leading, 16)
    }

    private func selRect(_ active: Bool) -> some View {
        RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
            .fill(active ? Theme.accent : Theme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                    .strokeBorder(active ? Theme.accent : Theme.border, lineWidth: active ? 1.5 : 0.75)
            )
    }

    private func selCapsule(_ active: Bool) -> some View {
        Capsule()
            .fill(active ? Theme.accent : Theme.surface)
            .overlay(Capsule().strokeBorder(active ? Theme.accent : Theme.border, lineWidth: 0.75))
    }

    private func radioCircle(_ active: Bool) -> some View {
        ZStack {
            Circle()
                .strokeBorder(active ? Theme.accentInk : Theme.border, lineWidth: 1.5)
                .frame(width: 22, height: 22)
            if active {
                Circle().fill(Theme.accentInk).frame(width: 12, height: 12)
            }
        }
    }
}

// MARK: - Language picker

private struct LangPicker: View {
    @Binding var selected: String
    @State private var showSheet = false

    private let langs: [(code: String, label: String)] = [
        ("en", "English"),
        ("zh", "中文"),
        ("es", "Español"),
        ("fr", "Français"),
        ("ko", "한국어"),
        ("ja", "日本語"),
    ]

    private var current: (code: String, label: String) {
        langs.first { $0.code == selected } ?? langs[0]
    }

    var body: some View {
        Button { showSheet = true } label: {
            HStack(spacing: 4) {
                Image(systemName: "globe")
                    .font(.system(size: 11, weight: .regular))
                    .foregroundStyle(Theme.textMuted)
                Text(current.label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(Theme.textMuted)
                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(Theme.textFaint)
            }
        }
        .confirmationDialog("Description language", isPresented: $showSheet, titleVisibility: .visible) {
            ForEach(langs, id: \.code) { lang in
                Button(lang.label) { selected = lang.code }
            }
        }
    }
}

// MARK: - Field label

private struct PubLabel: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 11, weight: .semibold, design: .monospaced))
            .tracking(0.6)
            .foregroundStyle(Theme.textMuted)
    }
}

// MARK: - TextField style

private extension View {
    func pubFieldStyle() -> some View {
        self
            .padding(14)
            .background(Theme.surface)
            .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
    }
}
