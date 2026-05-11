import SwiftUI

struct DraftData: Codable, Identifiable {
    var id: UUID = UUID()
    var title: String = ""
    var category: String = ""
    var condition: String = ""
    var age: String = ""
    var pickup: String = ""
    var notes: String = ""
    var savedAt: Date = Date()
}

enum DraftStore {
    private static let key = "rehome_drafts_v1"

    static func load() -> [DraftData] {
        guard let raw = UserDefaults.standard.data(forKey: key),
              let list = try? JSONDecoder().decode([DraftData].self, from: raw)
        else { return [] }
        return list
    }

    static func save(_ drafts: [DraftData]) {
        if let raw = try? JSONEncoder().encode(drafts) {
            UserDefaults.standard.set(raw, forKey: key)
        }
    }

    static func append(_ draft: DraftData) {
        var list = load()
        list.insert(draft, at: 0)
        save(list)
    }
}
