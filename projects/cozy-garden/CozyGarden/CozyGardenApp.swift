import SwiftUI

@main
struct CozyGardenApp: App {
    @StateObject private var garden = Garden()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(garden)
        }
    }
}
