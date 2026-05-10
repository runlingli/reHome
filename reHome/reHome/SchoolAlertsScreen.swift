import SwiftUI

struct SchoolAlertsScreen: View {
    @AppStorage("subscribedSchools") private var subscribedRaw: String = "bu,mit"

    private var subscribed: Set<String> {
        Set(subscribedRaw.split(separator: ",").map(String.init))
    }

    private func toggle(_ id: String) {
        var s = subscribed
        if s.contains(id) { s.remove(id) } else { s.insert(id) }
        subscribedRaw = s.joined(separator: ",")
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {

                Text("Subscribe to nearby schools. You'll get a push notification 14 days and 3 days before each graduation or semester-end date — when free listings surge.")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textMuted)
                    .padding(.top, 4)

                VStack(spacing: 0) {
                    ForEach(nearbySchools) { school in
                        schoolRow(school)
                        if school.id != nearbySchools.last?.id {
                            Divider()
                                .background(Theme.borderSubtle)
                                .padding(.leading, 16)
                        }
                    }
                }
                .background(Theme.surface)
                .clipShape(RoundedRectangle(cornerRadius: Radius.lg, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.lg, style: .continuous)
                        .strokeBorder(Theme.borderSubtle, lineWidth: 0.75)
                )

                upcomingSection

                Color.clear.frame(height: 40)
            }
            .padding(16)
        }
        .background(Theme.bg)
        .navigationTitle("School Alerts")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.bg, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
    }

    // MARK: - School row

    private func schoolRow(_ school: NearbySchool) -> some View {
        let isOn = subscribed.contains(school.id)
        let next = school.nextUpcomingEvent

        return HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 8) {
                    Text(school.name)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Theme.text)
                    Text(String(format: "%.1f mi", school.distanceMiles))
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Theme.textFaint)
                        .padding(.horizontal, 6).padding(.vertical, 2)
                        .background(Capsule().fill(Theme.surfaceAlt))
                }

                if let ev = next {
                    HStack(spacing: 5) {
                        Image(systemName: ev.kind.icon)
                            .font(.system(size: 10))
                        Text("\(ev.kind.label) · \(ev.formattedDate)")
                            .font(.system(size: 11))
                        daysLabel(ev.daysUntil)
                    }
                    .foregroundStyle(Theme.textMuted)
                } else {
                    Text("No upcoming events this season")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textFaint)
                }
            }

            Spacer()

            Toggle("", isOn: Binding(
                get: { isOn },
                set: { _ in toggle(school.id) }
            ))
            .tint(Theme.accent)
            .labelsHidden()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    @ViewBuilder
    private func daysLabel(_ days: Int) -> some View {
        if days == 0 {
            Text("today")
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .foregroundStyle(Color(hex: "D4900A"))
        } else if days > 0 && days <= 7 {
            Text("in \(days)d")
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .foregroundStyle(Color(hex: "D4900A"))
        } else if days > 0 {
            Text("in \(days)d")
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.textFaint)
        }
    }

    // MARK: - Upcoming events timeline (subscribed only)

    private var upcomingSection: some View {
        let events: [(NearbySchool, SchoolEvent)] = nearbySchools
            .filter { subscribed.contains($0.id) }
            .flatMap { school in school.events.map { (school, $0) } }
            .filter { $0.1.daysUntil >= 0 }
            .sorted { $0.1.daysUntil < $1.1.daysUntil }

        return Group {
            if !events.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("UPCOMING")
                        .font(.system(size: 11, weight: .semibold, design: .monospaced))
                        .tracking(0.8)
                        .foregroundStyle(Theme.textFaint)

                    VStack(spacing: 0) {
                        ForEach(Array(events.prefix(6)), id: \.1.id) { school, ev in
                            HStack(spacing: 14) {
                                VStack(spacing: 0) {
                                    Circle()
                                        .fill(ev.daysUntil <= 7 ? Color(hex: "D4900A") : Theme.border)
                                        .frame(width: 8, height: 8)
                                    if ev.id != events.prefix(6).last?.1.id {
                                        Rectangle()
                                            .fill(Theme.borderSubtle)
                                            .frame(width: 1)
                                            .frame(maxHeight: .infinity)
                                    }
                                }
                                .frame(width: 8)

                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("\(school.shortName) · \(ev.kind.label)")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundStyle(Theme.text)
                                        Text(ev.kind.activityNote)
                                            .font(.system(size: 11))
                                            .foregroundStyle(Theme.textMuted)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 2) {
                                        Text(ev.formattedDate)
                                            .font(.system(size: 12, design: .monospaced))
                                            .foregroundStyle(Theme.textMuted)
                                        daysLabel(ev.daysUntil)
                                    }
                                }
                                .padding(.vertical, 12)
                            }
                        }
                    }
                }
            }
        }
    }
}
