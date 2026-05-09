import Foundation

enum Flower: String, Codable, CaseIterable, Identifiable {
    case daisy, sunflower, bluebell

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .daisy: return "Daisy"
        case .sunflower: return "Sunflower"
        case .bluebell: return "Bluebell"
        }
    }

    /// Real-time seconds from planting to bloom.
    var growSeconds: TimeInterval {
        switch self {
        case .daisy: return 60
        case .bluebell: return 120
        case .sunflower: return 180
        }
    }

    var seedCost: Int {
        switch self {
        case .daisy: return 1
        case .bluebell: return 2
        case .sunflower: return 4
        }
    }

    var reward: Int {
        switch self {
        case .daisy: return 3
        case .bluebell: return 6
        case .sunflower: return 10
        }
    }
}

struct Plant: Codable, Equatable {
    let flower: Flower
    let plantedAt: Date

    enum Stage { case seed, sprout, bloom }

    func stage(now: Date) -> Stage {
        let elapsed = now.timeIntervalSince(plantedAt)
        let total = flower.growSeconds
        if elapsed < total / 3 { return .seed }
        if elapsed < total { return .sprout }
        return .bloom
    }

    func progress(now: Date) -> Double {
        let elapsed = now.timeIntervalSince(plantedAt)
        return min(1, max(0, elapsed / flower.growSeconds))
    }
}

struct Plot: Codable, Identifiable, Equatable {
    let id: UUID
    var plant: Plant?
}

final class Garden: ObservableObject {
    @Published var plots: [Plot]
    @Published var coins: Int

    private static let storageKey = "cozyGarden.state.v1"

    init() {
        if let saved = Self.load() {
            self.plots = saved.plots
            self.coins = saved.coins
        } else {
            self.plots = (0..<6).map { _ in Plot(id: UUID(), plant: nil) }
            self.coins = 5
        }
    }

    func plant(_ flower: Flower, in plotID: UUID) {
        guard coins >= flower.seedCost,
              let i = plots.firstIndex(where: { $0.id == plotID }),
              plots[i].plant == nil else { return }
        coins -= flower.seedCost
        plots[i].plant = Plant(flower: flower, plantedAt: Date())
        save()
    }

    func harvest(plotID: UUID, now: Date = Date()) {
        guard let i = plots.firstIndex(where: { $0.id == plotID }),
              let plant = plots[i].plant,
              plant.stage(now: now) == .bloom else { return }
        coins += plant.flower.reward
        plots[i].plant = nil
        save()
    }

    private struct PersistedState: Codable {
        let plots: [Plot]
        let coins: Int
    }

    private func save() {
        let state = PersistedState(plots: plots, coins: coins)
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: Self.storageKey)
        }
    }

    private static func load() -> PersistedState? {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let state = try? JSONDecoder().decode(PersistedState.self, from: data)
        else { return nil }
        return state
    }
}
