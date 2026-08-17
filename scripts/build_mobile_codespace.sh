#!/usr/bin/env bash
set -e

echo "========================================================="
echo "   POFORGE ANDROID COACH - CLOUD BUILD IN CODESPACE      "
echo "========================================================="

cd "$(dirname "$0")/../Mobile/conduit"

echo "[1/4] Running flutter pub get in Cloud Codespace..."
flutter pub get

echo "[2/4] Running flutter analyze..."
flutter analyze || true

echo "[3/4] Building release Android APK..."
flutter build apk --release

echo "[4/4] Release APK output:"
ls -lh build/app/outputs/flutter-apk/app-release.apk

echo "========================================================="
echo "   BUILD COMPLETE: APK GENERATED IN CODESPACE            "
echo "========================================================="
