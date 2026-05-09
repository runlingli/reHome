import SwiftUI

struct ContentView: View {
    @State private var savedSet: Set<String> = ["i3", "i12"]
    @State private var selectedTab: Int = 0
    @State private var presentedListing: Listing?
    @State private var publishPresented: Bool = false

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeScreen(
                savedSet: $savedSet,
                openListing: { presentedListing = $0 },
                openPublish: { publishPresented = true }
            )
            .tabItem {
                Label("Home", systemImage: selectedTab == 0 ? "house.fill" : "house")
            }
            .tag(0)

            MessagesScreen()
                .tabItem {
                    Label("Messages", systemImage: selectedTab == 1 ? "message.fill" : "message")
                }
                .tag(1)

            ProfileScreen()
                .tabItem {
                    Label("Profile", systemImage: selectedTab == 2 ? "person.fill" : "person")
                }
                .tag(2)
        }
        .tint(Theme.text)
        .sheet(item: $presentedListing) { listing in
            ItemDetailScreen(listing: listing, savedSet: $savedSet)
        }
        .fullScreenCover(isPresented: $publishPresented) {
            PublishScreen()
        }
    }
}

#Preview {
    ContentView()
}
