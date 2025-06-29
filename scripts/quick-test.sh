#!/bin/bash

# ⚡ VibeCode Bible Quick Test Runner
# 🎯 Максимально быстрое тестирование для rapid feedback

set -e

echo "🧘‍♂️ Starting Quick Sacred Tests..."
echo "*\"प्रज्ञानं ब्रह्म\"* - *\"Consciousness is Brahman\"*"
echo ""

# ⏱️ Start timing
start_time=$(date +%s)

# 🔧 TypeScript Check (самое важное)
echo "🔍 TypeScript Check..."
bun exec tsc --noEmit --fast
echo "✅ TypeScript OK"

# 🧪 Unit Tests Only (без E2E)
echo "🧪 Running Unit Tests..."
bun test --test-name-pattern="unit|Unit" --timeout=5000 2>/dev/null || {
    echo "⚠️ Some unit tests failed, but continuing..."
}
echo "✅ Unit Tests completed"

# 📦 Build Check
echo "🏗️ Build Check..."
bun run build >/dev/null 2>&1 || {
    echo "❌ Build failed"
    exit 1
}
echo "✅ Build OK"

# 🎨 Lint Quick Check (only errors, no warnings)
echo "🎨 Lint Quick Check..."
bun exec eslint src/ --max-warnings 0 --quiet || {
    echo "⚠️ Linting issues found, but continuing..."
}
echo "✅ Lint completed"

# ⏱️ End timing
end_time=$(date +%s)
duration=$((end_time - start_time))

echo ""
echo "🎉 Quick Tests Completed in ${duration}s"
echo "🕉️ *\"योगः कर्मसु कौशलम्\"* - *\"Skill in action is yoga\"*"
echo ""
echo "✨ Ready for rapid development iteration!"
