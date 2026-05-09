import SwiftUI

private struct PlotSelection: Identifiable {
    let id: UUID
}

struct ContentView: View {
    @EnvironmentObject private var garden: Garden
    @State private var now: Date = Date()
    @State private var selection: PlotSelection?

    private let tick = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Theme.sky, Theme.sky.opacity(0.7)],
                startPoint: .top, endPoint: .bottom
            ).ignoresSafeArea()

            VStack(spacing: 24) {
                header
                gardenGrid
                Spacer()
                hint
            }
            .padding()
        }
        .sheet(item: $selection) { sel in
            SeedPicker(
                onChoose: { flower in
                    garden.plant(flower, in: sel.id)
                    selection = nil
                },
                onCancel: { selection = nil }
            )
            .environmentObject(garden)
            .presentationDetents([.medium])
        }
        .onReceive(tick) { now = $0 }
    }

    private var header: some View {
        HStack {
            Text("My Garden")
                .font(.system(.largeTitle, design: .rounded).weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Spacer()
            Label("\(garden.coins)", systemImage: "leaf.fill")
                .font(.system(.title3, design: .rounded).weight(.medium))
                .foregroundStyle(Theme.leaf)
                .padding(.horizontal, 14).padding(.vertical, 8)
                .background(Capsule().fill(.white.opacity(0.6)))
        }
    }

    private var gardenGrid: some View {
        let cols = [GridItem(.flexible(), spacing: 16), GridItem(.flexible(), spacing: 16)]
        return LazyVGrid(columns: cols, spacing: 16) {
            ForEach(garden.plots) { plot in
                PlotView(plot: plot, now: now) {
                    if let plant = plot.plant, plant.stage(now: now) == .bloom {
                        garden.harvest(plotID: plot.id, now: now)
                    } else if plot.plant == nil {
                        selection = PlotSelection(id: plot.id)
                    }
                }
            }
        }
    }

    private var hint: some View {
        Text("Tap an empty plot to plant. Tap a bloom to harvest.")
            .font(.footnote)
            .foregroundStyle(Theme.textPrimary.opacity(0.6))
            .multilineTextAlignment(.center)
    }
}

private struct PlotView: View {
    let plot: Plot
    let now: Date
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Theme.soilLight)
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Theme.soil.opacity(0.35), lineWidth: 2)

                if let plant = plot.plant {
                    PlantArt(plant: plant, now: now)
                } else {
                    Image(systemName: "plus")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(Theme.soil.opacity(0.55))
                }
            }
            .aspectRatio(1, contentMode: .fit)
        }
        .buttonStyle(.plain)
    }
}

private struct PlantArt: View {
    let plant: Plant
    let now: Date

    var body: some View {
        let stage = plant.stage(now: now)
        VStack(spacing: 6) {
            Spacer(minLength: 0)
            switch stage {
            case .seed:
                Circle().fill(Theme.soil).frame(width: 14, height: 14)
            case .sprout:
                VStack(spacing: 0) {
                    Capsule().fill(Theme.leaf).frame(width: 7, height: 32)
                    Ellipse().fill(Theme.soil).frame(width: 24, height: 7)
                }
            case .bloom:
                VStack(spacing: 0) {
                    Bloom(flower: plant.flower)
                    Capsule().fill(Theme.leaf).frame(width: 6, height: 18)
                    Ellipse().fill(Theme.soil).frame(width: 26, height: 7)
                }
            }
            label(for: stage)
                .font(.system(.caption2, design: .rounded))
                .foregroundStyle(Theme.textPrimary.opacity(0.65))
            Spacer(minLength: 0)
        }
        .padding(.vertical, 8)
    }

    private func label(for stage: Plant.Stage) -> Text {
        switch stage {
        case .seed: return Text("planted")
        case .sprout: return Text("growing…")
        case .bloom: return Text("ready!")
        }
    }
}

struct Bloom: View {
    let flower: Flower

    var petals: Color {
        switch flower {
        case .daisy: return .white
        case .sunflower: return Theme.bloomYellow
        case .bluebell: return Theme.bloomBlue
        }
    }

    var center: Color {
        switch flower {
        case .daisy: return Theme.bloomYellow
        case .sunflower: return Theme.soil
        case .bluebell: return Theme.bloomPink
        }
    }

    var body: some View {
        ZStack {
            ForEach(0..<6, id: \.self) { i in
                Circle()
                    .fill(petals)
                    .frame(width: 14, height: 14)
                    .offset(y: -13)
                    .rotationEffect(.degrees(Double(i) * 60))
            }
            Circle().fill(center).frame(width: 13, height: 13)
        }
        .frame(width: 46, height: 46)
    }
}

private struct SeedPicker: View {
    let onChoose: (Flower) -> Void
    let onCancel: () -> Void
    @EnvironmentObject private var garden: Garden

    var body: some View {
        VStack(spacing: 16) {
            Text("Plant a seed")
                .font(.system(.title2, design: .rounded).weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
                .padding(.top, 24)

            VStack(spacing: 12) {
                ForEach(Flower.allCases) { flower in
                    seedRow(flower)
                }
            }

            Button("Cancel", action: onCancel)
                .font(.system(.body, design: .rounded))
                .padding(.top, 8)

            Spacer(minLength: 0)
        }
        .padding()
        .background(Theme.sky.ignoresSafeArea())
    }

    private func seedRow(_ flower: Flower) -> some View {
        let canAfford = garden.coins >= flower.seedCost
        return Button { onChoose(flower) } label: {
            HStack(spacing: 14) {
                Bloom(flower: flower)
                VStack(alignment: .leading, spacing: 2) {
                    Text(flower.displayName)
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Grows in \(format(flower.growSeconds))  ·  +\(flower.reward) leaves")
                        .font(.caption)
                        .foregroundStyle(Theme.textPrimary.opacity(0.6))
                }
                Spacer()
                Text("\(flower.seedCost) 🍃")
                    .font(.system(.body, design: .rounded).weight(.medium))
                    .foregroundStyle(canAfford ? Theme.leaf : .secondary)
            }
            .padding()
            .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.7)))
        }
        .buttonStyle(.plain)
        .disabled(!canAfford)
        .opacity(canAfford ? 1 : 0.45)
    }

    private func format(_ s: TimeInterval) -> String {
        let m = Int(s) / 60
        let sec = Int(s) % 60
        if m > 0 && sec > 0 { return "\(m)m \(sec)s" }
        if m > 0 { return "\(m) min" }
        return "\(sec)s"
    }
}
