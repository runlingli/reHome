import SwiftUI

// MARK: - Models

struct NearbySchool: Identifiable {
    let id: String
    let name: String
    let shortName: String
    let distanceMiles: Double
    let events: [SchoolEvent]

    var nextUpcomingEvent: SchoolEvent? {
        events.filter { $0.daysUntil >= 0 }.min { $0.daysUntil < $1.daysUntil }
    }
}

struct SchoolEvent: Identifiable {
    let id = UUID()
    let kind: EventKind
    let date: Date

    enum EventKind {
        case graduation, lastClassDay, moveOut

        var label: String {
            switch self {
            case .graduation:   return "Graduation"
            case .lastClassDay: return "Last class day"
            case .moveOut:      return "Move-out deadline"
            }
        }
        var icon: String {
            switch self {
            case .graduation:   return "graduationcap"
            case .lastClassDay: return "book.closed"
            case .moveOut:      return "shippingbox"
            }
        }
        var activityNote: String {
            switch self {
            case .graduation:   return "Peak free item activity"
            case .lastClassDay: return "High listing volume starts"
            case .moveOut:      return "Last chance — items going fast"
            }
        }
    }

    var daysUntil: Int {
        Calendar.current.dateComponents(
            [.day],
            from: Calendar.current.startOfDay(for: Date()),
            to:   Calendar.current.startOfDay(for: date)
        ).day ?? 0
    }

    var formattedDate: String {
        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }
}

// MARK: - Mock data (Boston area, 2026)

private func schoolDate(_ month: Int, _ day: Int) -> Date {
    var c = DateComponents()
    c.year = 2026; c.month = month; c.day = day
    return Calendar.current.date(from: c) ?? Date()
}

let nearbySchools: [NearbySchool] = [
    NearbySchool(id: "bu", name: "Boston University", shortName: "BU",
                 distanceMiles: 0.3, events: [
                     SchoolEvent(kind: .lastClassDay, date: schoolDate(5,  8)),
                     SchoolEvent(kind: .graduation,   date: schoolDate(5, 18)),
                     SchoolEvent(kind: .moveOut,      date: schoolDate(5, 31)),
                 ]),
    NearbySchool(id: "emerson", name: "Emerson College", shortName: "Emerson",
                 distanceMiles: 0.6, events: [
                     SchoolEvent(kind: .lastClassDay, date: schoolDate(5, 10)),
                     SchoolEvent(kind: .graduation,   date: schoolDate(5, 14)),
                 ]),
    NearbySchool(id: "northeastern", name: "Northeastern University", shortName: "Northeastern",
                 distanceMiles: 0.8, events: [
                     SchoolEvent(kind: .graduation,   date: schoolDate(5,  1)),
                     SchoolEvent(kind: .moveOut,      date: schoolDate(5, 20)),
                 ]),
    NearbySchool(id: "mit", name: "MIT", shortName: "MIT",
                 distanceMiles: 1.2, events: [
                     SchoolEvent(kind: .lastClassDay, date: schoolDate(5, 15)),
                     SchoolEvent(kind: .graduation,   date: schoolDate(6,  6)),
                 ]),
    NearbySchool(id: "harvard", name: "Harvard University", shortName: "Harvard",
                 distanceMiles: 2.1, events: [
                     SchoolEvent(kind: .lastClassDay, date: schoolDate(5,  8)),
                     SchoolEvent(kind: .graduation,   date: schoolDate(5, 28)),
                 ]),
    NearbySchool(id: "tufts", name: "Tufts University", shortName: "Tufts",
                 distanceMiles: 4.5, events: [
                     SchoolEvent(kind: .graduation,   date: schoolDate(5, 18)),
                     SchoolEvent(kind: .moveOut,      date: schoolDate(5, 25)),
                 ]),
]

// MARK: - School alert banner (used in HomeScreen)

struct SchoolAlertBanner: View {
    let school: NearbySchool
    let event: SchoolEvent

    private var amberColor: Color { Color(hex: "D4900A") }
    private var amberBg: Color    { Color(hex: "D4900A").opacity(0.09) }
    private var amberBorder: Color { Color(hex: "D4900A").opacity(0.28) }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "bell.badge.fill")
                .font(.system(size: 20))
                .foregroundStyle(amberColor)
                .frame(width: 44, height: 44)
                .background(Circle().fill(amberBg))

            VStack(alignment: .leading, spacing: 2) {
                Text(headlineText)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.text)
                Text(event.kind.activityNote + " · " + event.formattedDate)
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.textMuted)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textFaint)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                .fill(amberBg)
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                        .strokeBorder(amberBorder, lineWidth: 0.75)
                )
        )
    }

    private var headlineText: String {
        let days = event.daysUntil
        if days == 0 { return "\(school.shortName) \(event.kind.label) — today" }
        if days == 1 { return "\(school.shortName) \(event.kind.label) — tomorrow" }
        return "\(school.shortName) \(event.kind.label) in \(days) days"
    }
}
