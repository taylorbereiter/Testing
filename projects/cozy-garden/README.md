# cozy-garden

A tiny SwiftUI iOS game where you plant seeds, wait for them to grow in real
time, and harvest blooms for leaves (the in-game currency) to plant more.

## Core loop

1. Tap an empty plot → pick a seed (Daisy, Bluebell, or Sunflower).
2. Wait. Plants pass through `seed → sprout → bloom` over real seconds
   (1, 2, and 3 minutes respectively — easy to tweak in `Garden.swift`).
3. Tap a bloom to harvest leaves. Spend leaves on more seeds.

State is persisted to `UserDefaults` so growth continues across launches.

## Files

```
CozyGarden/
  CozyGardenApp.swift   # @main entry, owns the Garden state object
  ContentView.swift     # garden grid, plot, plant art, seed picker
  Garden.swift          # Flower / Plant / Plot models + Garden store
  Theme.swift           # color palette
```

## Running it

This repo lives on Linux, so the project itself can't be built here. To try it:

1. On a Mac with Xcode 15+, create a new project: **iOS → App**, name it
   `CozyGarden`, interface **SwiftUI**, language **Swift**, minimum deployment
   **iOS 16.0** (needed for `presentationDetents`).
2. Delete the auto-generated `CozyGardenApp.swift` and `ContentView.swift`.
3. Drag the four files from `CozyGarden/` into the project (check "Copy items
   if needed", add to the `CozyGarden` target).
4. Build and run on a simulator or device.

## Ideas to extend

- Weather: rare rainy days that grow plants faster.
- Decorations: spend leaves on garden gnomes, fences, lanterns.
- A small fox or cat that wanders through and naps near blooms.
- Cloud sync via iCloud (`NSUbiquitousKeyValueStore` is a one-line swap).
- Notifications when a plant is ready to harvest.
- Haptics on harvest (`UIImpactFeedbackGenerator(style: .soft)`).
