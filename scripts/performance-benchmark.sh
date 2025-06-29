#!/bin/bash

# 🏃‍♀️ VibeCode Bible Performance Benchmark
# 🎯 Comprehensive testing of functional vs OOP performance

set -e

echo "🏃‍♀️ Starting Comprehensive Performance Benchmark..."
echo "*\"कर्मसु कौशलं योगः\"* - *\"Skill in action is yoga\"*"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ⏱️ Timing function
measure_time() {
    local description="$1"
    local command="$2"
    
    echo -e "${CYAN}📊 Testing: $description${NC}"
    
    local start_time=$(date +%s%N)
    eval "$command"
    local end_time=$(date +%s%N)
    
    local duration=$((($end_time - $start_time) / 1000000))
    echo -e "${GREEN}✅ $description: ${duration}ms${NC}"
    
    return $duration
}

# 🧪 Test Results Storage
declare -a test_results=()

# 📊 Performance Tests
echo -e "${PURPLE}📊 Running Performance Benchmarks...${NC}"

# 1. TypeScript Compilation Speed
echo -e "${BLUE}1. TypeScript Compilation Performance${NC}"
measure_time "TypeScript Check" "bun exec tsc --noEmit" 
tsc_time=$?
test_results+=("TypeScript Check: ${tsc_time}ms")

# 2. Build Performance  
echo -e "${BLUE}2. Build Performance${NC}"
measure_time "Production Build" "bun run build >/dev/null 2>&1"
build_time=$?
test_results+=("Production Build: ${build_time}ms")

# 3. Test Suite Performance
echo -e "${BLUE}3. Test Suite Performance${NC}"
measure_time "Unit Tests" "bun test --silent >/dev/null 2>&1"
test_time=$?
test_results+=("Unit Tests: ${test_time}ms")

# 4. Functional Storage Performance
echo -e "${BLUE}4. Functional Storage Performance${NC}"
cat > /tmp/storage-bench.ts << 'EOF'
import { FunctionalStorage, createEmptyStorage } from '../src/adapters/functional-storage.ts';

const iterations = 10000;
let storage = createEmptyStorage();

console.log('Starting functional storage benchmark...');
const start = performance.now();

for (let i = 0; i < iterations; i++) {
  const userData = {
    telegram_id: i,
    username: `user_${i}`,
    first_name: 'Test',
    last_name: 'User',
    subscription_level: 'free',
    last_active_at: new Date(),
  };
  
  const [newStorage, user] = FunctionalStorage.addUser(storage, userData);
  storage = newStorage;
  
  if (i % 1000 === 0) {
    FunctionalStorage.findUserByTelegramId(storage, i);
  }
}

const end = performance.now();
console.log(`Functional storage benchmark: ${end - start}ms for ${iterations} operations`);
EOF

measure_time "Functional Storage (10k ops)" "bun run /tmp/storage-bench.ts"
storage_time=$?
test_results+=("Functional Storage: ${storage_time}ms")

# 5. Import/Module Loading Performance
echo -e "${BLUE}5. Module Loading Performance${NC}"
measure_time "Module Import Speed" "bun -e 'import(\"./src/commands/functional-commands.js\").then(() => console.log(\"OK\"))'"
import_time=$?
test_results+=("Module Import: ${import_time}ms")

# 6. Dependency Resolution Performance
echo -e "${BLUE}6. Dependency Resolution${NC}"
measure_time "Dependency Install" "bun install --frozen-lockfile >/dev/null 2>&1"
deps_time=$?
test_results+=("Dependency Install: ${deps_time}ms")

# 7. Code Quality Checks
echo -e "${BLUE}7. Code Quality Performance${NC}"
measure_time "Prettier Format Check" "bun exec prettier --check src/ >/dev/null 2>&1 || true"
prettier_time=$?
test_results+=("Prettier Check: ${prettier_time}ms")

# 8. Memory Usage Test
echo -e "${BLUE}8. Memory Usage Analysis${NC}"
cat > /tmp/memory-test.ts << 'EOF'
import { createFunctionalMemoryAdapter } from '../src/adapters/functional-memory.ts';

const adapter = createFunctionalMemoryAdapter();
const iterations = 1000;

console.log('Memory usage test starting...');
const start = process.memoryUsage();

for (let i = 0; i < iterations; i++) {
  await adapter.createUser({
    telegram_id: i,
    username: `user_${i}`,
    first_name: 'Test',
    last_name: 'User',
  });
}

const end = process.memoryUsage();
const memDiff = end.heapUsed - start.heapUsed;
console.log(`Memory used: ${(memDiff / 1024 / 1024).toFixed(2)}MB for ${iterations} users`);
EOF

measure_time "Memory Usage Test" "bun run /tmp/memory-test.ts"
memory_time=$?
test_results+=("Memory Test: ${memory_time}ms")

# 🎯 Performance Analysis
echo ""
echo -e "${PURPLE}📊 Performance Analysis Results${NC}"
echo "=================================="

total_time=0
for result in "${test_results[@]}"; do
    echo -e "${GREEN}✅ $result${NC}"
    # Extract time from result
    time_value=$(echo "$result" | grep -o '[0-9]\+ms' | grep -o '[0-9]\+')
    total_time=$((total_time + time_value))
done

echo ""
echo -e "${BLUE}📈 Summary Statistics${NC}"
echo "=================================="
echo -e "${CYAN}Total Benchmark Time: ${total_time}ms${NC}"
echo -e "${CYAN}Average Per Test: $((total_time / ${#test_results[@]}))ms${NC}"

# 🏆 Performance Grades
echo ""
echo -e "${PURPLE}🏆 Performance Grades${NC}"
echo "=================================="

grade_test() {
    local time=$1
    local test_name="$2"
    
    if [[ $time -lt 1000 ]]; then
        echo -e "${GREEN}🏆 $test_name: EXCELLENT (<1s)${NC}"
    elif [[ $time -lt 3000 ]]; then
        echo -e "${YELLOW}🥈 $test_name: GOOD (<3s)${NC}"
    elif [[ $time -lt 10000 ]]; then
        echo -e "${YELLOW}🥉 $test_name: ACCEPTABLE (<10s)${NC}"
    else
        echo -e "${RED}🐌 $test_name: NEEDS IMPROVEMENT (>10s)${NC}"
    fi
}

grade_test $tsc_time "TypeScript Check"
grade_test $build_time "Build Process"
grade_test $test_time "Test Suite"
grade_test $storage_time "Functional Storage"
grade_test $import_time "Module Loading"

# 🎯 Recommendations
echo ""
echo -e "${PURPLE}🎯 Performance Recommendations${NC}"
echo "=================================="

if [[ $tsc_time -gt 3000 ]]; then
    echo -e "${YELLOW}⚠️ TypeScript compilation slow - consider tsconfig optimization${NC}"
fi

if [[ $test_time -gt 5000 ]]; then
    echo -e "${YELLOW}⚠️ Test suite slow - consider test parallelization${NC}"
fi

if [[ $build_time -gt 10000 ]]; then
    echo -e "${YELLOW}⚠️ Build process slow - consider build optimization${NC}"
fi

if [[ $storage_time -lt 1000 ]]; then
    echo -e "${GREEN}✅ Functional storage is highly performant!${NC}"
fi

# 📊 Save Results
echo ""
echo -e "${BLUE}📊 Saving Benchmark Results...${NC}"

mkdir -p .performance
cat > .performance/benchmark-$(date +%Y%m%d-%H%M%S).json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "results": {
    "typescript_check_ms": $tsc_time,
    "build_time_ms": $build_time,
    "test_suite_ms": $test_time,
    "functional_storage_ms": $storage_time,
    "module_import_ms": $import_time,
    "dependency_install_ms": $deps_time,
    "prettier_check_ms": $prettier_time,
    "memory_test_ms": $memory_time,
    "total_time_ms": $total_time
  },
  "environment": {
    "node_version": "$(node --version)",
    "bun_version": "$(bun --version)",
    "os": "$(uname -s)",
    "arch": "$(uname -m)"
  }
}
EOF

echo -e "${GREEN}✅ Results saved to .performance/benchmark-$(date +%Y%m%d-%H%M%S).json${NC}"

# 🧹 Cleanup
rm -f /tmp/storage-bench.ts /tmp/memory-test.ts

echo ""
echo -e "${PURPLE}🎉 Performance Benchmark Complete!${NC}"
echo -e "${CYAN}🕉️ *\"सत्यं ज्ञानं अनन्तं ब्रह्म\"* - *\"Truth, knowledge, infinity - that is Brahman\"*${NC}"
echo ""
echo -e "${BLUE}📊 Use this data to optimize performance and track improvements over time.${NC}"
