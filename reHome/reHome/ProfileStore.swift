import SwiftUI

class ProfileStore: ObservableObject {
    static let shared = ProfileStore()

    @Published var name:   String
    @Published var handle: String
    @Published var bio:    String
    @Published var school: String
    @Published var animal: String?
    @Published var avatarImage: UIImage?

    private init() {
        let ud = UserDefaults.standard
        name   = ud.string(forKey: "p_name")   ?? ""
        handle = ud.string(forKey: "p_handle") ?? ""
        bio    = ud.string(forKey: "p_bio")    ?? ""
        school = ud.string(forKey: "p_school") ?? ""
        let a  = ud.string(forKey: "p_animal") ?? ""
        animal = a.isEmpty ? nil : a
        if let data = ud.data(forKey: "p_photo") { avatarImage = UIImage(data: data) }
    }

    func save(name: String, handle: String, bio: String, school: String,
              animal: String?, photo: UIImage?) {
        let ud = UserDefaults.standard
        self.name   = name;   ud.set(name,          forKey: "p_name")
        self.handle = handle; ud.set(handle,         forKey: "p_handle")
        self.bio    = bio;    ud.set(bio,            forKey: "p_bio")
        self.school = school; ud.set(school,         forKey: "p_school")
        self.animal = animal; ud.set(animal ?? "",   forKey: "p_animal")

        avatarImage = photo
        if let img = photo, let data = img.jpegData(compressionQuality: 0.65) {
            ud.set(data, forKey: "p_photo")
        } else if photo == nil {
            ud.removeObject(forKey: "p_photo")
        }
    }

    var displayName:   String { name.isEmpty   ? "You"                                              : name   }
    var displayHandle: String { handle.isEmpty ? "@you.edu"                                         : handle }
    var displaySchool: String { school.isEmpty ? "UC Davis"                                         : school }
    var displayBio:    String { bio.isEmpty    ? "Class of '26. Hand-me-downs from my last sublet." : bio    }
}
