# bartools

## Workspace layout

This is a [Bun workspaces](https://bun.sh/docs/install/workspaces) monorepo:

```
bartools/
├── packages/
│   ├── backend/     # Hono API running on Bun
│   ├── dashboard/   # Vite + React web dashboard
│   ├── mobile/      # Expo (React Native) app
│   └── ui/          # Shared component library (used by dashboard + mobile)
└── package.json     # workspace root
```

## Prerequisites

You need [Bun](https://bun.sh) installed. Grab it from <https://bun.sh> or install via:

```sh
# macOS / Linux / WSL
curl -fsSL https://bun.sh/install | bash

# macOS (Homebrew)
brew install oven-sh/bun/bun

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify with:

```sh
bun --version
```

## Install

Clone and install all workspace dependencies in one shot from the repo root:

```sh
git clone https://github.com/jakehemmerle/bartools
cd bartools
bun install
```

`bun install` walks every package under `packages/*` and links workspace deps (e.g. `@bartools/ui`) automatically — no per-package installs needed.

## Run the hello-world test

There's a tiny `bun test` in `packages/ui` to confirm the toolchain works:

```sh
bun test
```

Expected output:

```
 1 pass
 0 fail
 1 expect() calls
```

The test lives at `packages/ui/src/greet.test.ts` and exercises the shared `greet()` helper that the backend, dashboard, and mobile app all import.

## Run a package

```sh
bun run dev:backend     # Hono API on http://localhost:3000
bun run dev:dashboard   # Vite dev server
bun run dev:mobile      # Expo dev server
```

Or target a workspace directly:

```sh
bun --filter @bartools/backend dev
```

## Running the mobile app on iOS Simulator

### Prerequisites

- **Xcode** installed (with iOS Simulator runtime matching your SDK — check Xcode > Settings > Components)
- **Bun** installed (see above)

### Option A: Expo Go (fastest, no native build)

```sh
cd packages/mobile
bunx expo start --go --ios
```

This installs Expo Go on the simulator and loads the app. Note: native modules like `react-native-vision-camera` won't work in Expo Go — camera features will be unavailable.

### Option B: Development build (full native features)

```sh
cd packages/mobile
bunx expo run:ios
```

This generates the native Xcode project under `ios/`, compiles, and installs on the simulator. The first build takes several minutes. Subsequent builds are incremental.

If xcodebuild fails with a destination error, ensure your simulator runtime version matches the installed Xcode SDK:

```sh
xcodebuild -showsdks | grep -i simulator   # check SDK version
xcrun simctl list runtimes                  # check installed runtimes
```

If they don't match, install the correct simulator runtime from Xcode > Settings > Components.

## Cola Sample Pack

Download the sample pack here:

https://dyuie4zgfxmt6.cloudfront.net/samples/cola-sample-pack-v1.zip
