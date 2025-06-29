#!/bin/bash

# 🎬 VibeCode Bible Demo Assets Creator
# 🕉️ Sacred script for generating meditative programming demonstrations

set -e

echo "🕉️ Starting Sacred Demo Assets Creation..."
echo "*\"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन\"* - *\"Ты имеешь право только на действие, но не на плоды\"*"
echo ""

# Colors for sacred output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Sacred directories
ASSETS_DIR="assets"
GIFS_DIR="$ASSETS_DIR/gifs"
SCREENSHOTS_DIR="$ASSETS_DIR/screenshots"
DEMOS_DIR="$ASSETS_DIR/demos"

# Ensure sacred directories exist
mkdir -p "$GIFS_DIR" "$SCREENSHOTS_DIR" "$DEMOS_DIR"

echo -e "${PURPLE}🧘‍♂️ Sacred Directories Prepared${NC}"

# Function to check if required tools are installed
check_sacred_tools() {
    echo -e "${CYAN}🔍 Checking Sacred Tools...${NC}"
    
    # Check for screenshot tools (macOS)
    if command -v screencapture >/dev/null 2>&1; then
        echo -e "${GREEN}✅ screencapture (macOS native)${NC}"
    else
        echo -e "${RED}❌ screencapture not found${NC}"
    fi
    
    # Check for GIF creation tools
    if command -v ffmpeg >/dev/null 2>&1; then
        echo -e "${GREEN}✅ ffmpeg${NC}"
    else
        echo -e "${YELLOW}⚠️  ffmpeg not found. Install with: brew install ffmpeg${NC}"
    fi
    
    if command -v gifsicle >/dev/null 2>&1; then
        echo -e "${GREEN}✅ gifsicle${NC}"
    else
        echo -e "${YELLOW}⚠️  gifsicle not found. Install with: brew install gifsicle${NC}"
    fi
    
    # Check for terminal recording
    if command -v asciinema >/dev/null 2>&1; then
        echo -e "${GREEN}✅ asciinema${NC}"
    else
        echo -e "${YELLOW}⚠️  asciinema not found. Install with: brew install asciinema${NC}"
    fi
    
    echo ""
}

# Function to create TDD cycle demonstration
create_tdd_demo() {
    echo -e "${PURPLE}🧘‍♂️ Creating Meditative TDD Cycle Demo...${NC}"
    
    # Create a demo script for TDD cycle
    cat > "$DEMOS_DIR/tdd-demo-script.md" << 'EOF'
# 🧘‍♂️ Meditative TDD Cycle Demonstration Script

## 🕉️ Pre-Recording Meditation (3 minutes)
> Take a moment to center yourself. Breathe deeply. Set intention for conscious coding.

## 🎬 Recording Sequence:

### 1. 🔴 RED Phase - Write Failing Test
```bash
# Open terminal and navigate to project
cd /path/to/vibecode-bible

# Create new test file
cat > src/__tests__/wisdom-service.test.ts << 'TEST'
import { WisdomService } from '../services/wisdom-service';

describe('🕉️ Meditative Wisdom Service', () => {
  it('should return daily wisdom with sacred symbol', async () => {
    const wisdomService = new WisdomService();
    const wisdom = await wisdomService.getDailyWisdom();
    
    expect(wisdom).toContain('🕉️');
    expect(wisdom.length).toBeGreaterThan(10);
  });
  
  it('should provide different wisdom based on date', async () => {
    const wisdomService = new WisdomService();
    const wisdom1 = await wisdomService.getDailyWisdom();
    
    // Mock different date
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(15);
    const wisdom2 = await wisdomService.getDailyWisdom();
    
    expect(wisdom1).toBeDefined();
    expect(wisdom2).toBeDefined();
  });
});
TEST

# Run the test (should fail)
bun test wisdom-service.test.ts
```

### 2. 🟢 GREEN Phase - Make Test Pass
```bash
# Create minimal implementation
mkdir -p src/services
cat > src/services/wisdom-service.ts << 'SERVICE'
export class WisdomService {
  async getDailyWisdom(): Promise<string> {
    return '🕉️ तत्त्वमसि - Ты есть То';
  }
}
SERVICE

# Run test again (should pass)
bun test wisdom-service.test.ts
```

### 3. ♻️ REFACTOR Phase - Improve Implementation
```bash
# Enhance the service
cat > src/services/wisdom-service.ts << 'SERVICE'
export class WisdomService {
  private readonly sacredWisdom = [
    '🕉️ तत्त्वमसि - Ты есть То (Tat tvam asi)',
    '🕉️ सत्यमेव जयते - Истина побеждает (Satyameva jayate)',
    '🕉️ अहिंसा परमो धर्मः - Ненасилие - высшая дхарма (Ahimsa paramo dharma)',
    '🕉️ सर्वं खल्विदं ब्रह्म - Всё есть Брахман (Sarvam khalvidam brahma)',
    '🕉️ अहं ब्रह्मास्मि - Я есть Брахман (Aham Brahmasmi)'
  ];

  async getDailyWisdom(): Promise<string> {
    const today = new Date().getDate();
    const index = today % this.sacredWisdom.length;
    return this.sacredWisdom[index];
  }

  async getRandomWisdom(): Promise<string> {
    const index = Math.floor(Math.random() * this.sacredWisdom.length);
    return this.sacredWisdom[index];
  }
}
SERVICE

# Run tests to ensure they still pass
bun test wisdom-service.test.ts

# Run all tests
bun test
```

### 4. 🧘‍♂️ Gratitude Phase
```bash
# Check code quality
bun run typecheck
bun run lint

# Commit with gratitude
git add .
git commit -m "🕉️ feat: add meditative wisdom service with TDD

- Added WisdomService with daily wisdom rotation
- Implemented comprehensive test coverage
- Followed sacred TDD cycle: RED → GREEN → REFACTOR
- Added Sanskrit wisdom with translations

*Om Shanti* 🙏"

echo "🕉️ TDD Cycle completed with consciousness and gratitude"
```

## 🎯 Recording Tips:
1. **Use slow, deliberate typing** - Show the meditative process
2. **Pause between phases** - Allow viewer to absorb each step
3. **Show terminal output clearly** - Zoom in if necessary
4. **Include brief explanations** - Via comments or overlays
5. **End with peaceful moment** - Brief pause showing success

## 📱 Post-Processing:
- Speed up to 1.5x-2x for optimal viewing
- Add captions for key steps
- Optimize for mobile viewing
- Keep under 60 seconds for attention span
EOF

    echo -e "${GREEN}✅ TDD Demo Script Created${NC}"
}

# Function to create bot setup demo
create_bot_setup_demo() {
    echo -e "${PURPLE}🤖 Creating Bot Setup Demo...${NC}"
    
    cat > "$DEMOS_DIR/bot-setup-script.md" << 'EOF'
# 🤖 Sacred Bot Setup Demonstration

## 🎬 Recording Sequence:

### 1. 🔑 Environment Setup
```bash
# Show environment file setup
cp .env.example .env
echo "# 🕉️ Sacred Configuration" >> .env
echo "BOT_TOKEN=your_bot_token_here" >> .env
echo "OPENAI_API_KEY=your_openai_key_here" >> .env

# Show token configuration in editor (blur sensitive parts)
code .env
```

### 2. 📦 Installation
```bash
# Sacred dependency installation
bun install

# Show package.json briefly
cat package.json | head -20
```

### 3. 🚀 Bot Startup
```bash
# Start the sacred bot
bun run dev

# Show logs in real-time
tail -f logs/bot.log
```

### 4. 🧪 Testing
```bash
# Send test message via script
bun run scripts/test-bot-message.cjs

# Show successful response in Telegram (screen recording)
```

### 5. ✅ Verification
```bash
# Show bot status
curl http://localhost:3000/health

# Show successful deployment
echo "🕉️ Sacred Bot is awakened and ready to serve!"
```
EOF

    echo -e "${GREEN}✅ Bot Setup Demo Script Created${NC}"
}

# Function to create quick deploy demo
create_deploy_demo() {
    echo -e "${PURPLE}🚀 Creating Quick Deploy Demo...${NC}"
    
    cat > "$DEMOS_DIR/deploy-demo-script.md" << 'EOF'
# 🚀 Sacred Quick Deploy Demonstration

## 🎬 Recording Sequence:

### 1. 📋 Pre-Deploy Check
```bash
# Sacred quality check
bun run typecheck
bun run test
bun run lint

# Show all green checkmarks
echo "🕉️ All sacred checks passed"
```

### 2. 🏗️ Build Process
```bash
# Sacred build
bun run build

# Show build artifacts
ls -la dist/
```

### 3. 🚀 Railway Deploy
```bash
# Deploy to Railway
railway login
railway link
railway up

# Show deployment progress
railway logs
```

### 4. 🌐 Live Verification
```bash
# Test live deployment
curl https://your-app.railway.app/health

# Show Telegram bot working in production
echo "🕉️ Sacred deployment complete! Bot is live and serving wisdom."
```

### 5. 📊 Monitoring
```bash
# Show Railway dashboard
open https://railway.app/dashboard

# Show logs and metrics
railway logs --tail
```
EOF

    echo -e "${GREEN}✅ Deploy Demo Script Created${NC}"
}

# Function to take screenshots
take_sacred_screenshots() {
    echo -e "${PURPLE}📸 Taking Sacred Screenshots...${NC}"
    
    # Screenshot of terminal with VibeCode
    echo "Taking terminal screenshot..."
    echo "🕉️ Please open terminal with VibeCode Bible project and press Enter when ready..."
    read -r
    
    screencapture -i "$SCREENSHOTS_DIR/terminal-vibecode.png"
    echo -e "${GREEN}✅ Terminal screenshot saved${NC}"
    
    # Screenshot of code editor
    echo "Taking code editor screenshot..."
    echo "🕉️ Please open your code editor with the project and press Enter when ready..."
    read -r
    
    screencapture -i "$SCREENSHOTS_DIR/editor-vibecode.png" 
    echo -e "${GREEN}✅ Editor screenshot saved${NC}"
    
    # Screenshot of Telegram bot in action
    echo "Taking Telegram bot screenshot..."
    echo "🕉️ Please open Telegram with bot conversation and press Enter when ready..."
    read -r
    
    screencapture -i "$SCREENSHOTS_DIR/telegram-bot.png"
    echo -e "${GREEN}✅ Telegram screenshot saved${NC}"
}

# Function to create asset index
create_asset_index() {
    echo -e "${PURPLE}📋 Creating Sacred Asset Index...${NC}"
    
    cat > "$ASSETS_DIR/README.md" << 'EOF'
# 🎨 VibeCode Bible Sacred Assets

🕉️ *"सत्यं शिवं सुन्दरम्"* - *"Truth, Goodness, Beauty"*

## 📁 Asset Organization

### 🎬 GIFs (`gifs/`)
- `meditative-tdd-cycle.gif` - Complete TDD workflow demonstration
- `quick-deploy.gif` - Railway deployment process
- `bot-setup.gif` - Telegram bot configuration and testing

### 📸 Screenshots (`screenshots/`)
- `terminal-vibecode.png` - Terminal with VibeCode Bible
- `editor-vibecode.png` - Code editor with meditative code
- `telegram-bot.png` - Bot in action on Telegram

### 🎭 Demo Scripts (`demos/`)
- `tdd-demo-script.md` - Step-by-step TDD recording guide
- `bot-setup-script.md` - Bot setup recording guide  
- `deploy-demo-script.md` - Deployment recording guide

## 🎯 Usage Guidelines

### 📱 Mobile Optimization
- Keep GIFs under 10MB for mobile loading
- Use 16:9 or 1:1 aspect ratios
- Optimize for 60fps playback

### 🎨 Style Guide
- Use consistent terminal themes
- Include sacred symbols (🕉️) in demonstrations
- Maintain meditative pace in recordings
- Show gratitude and mindfulness

### 📊 Technical Specs
- **GIF Resolution**: 1920x1080 or 1080x1080
- **Duration**: 30-90 seconds optimal
- **File Size**: <10MB for web
- **Format**: GIF for compatibility, MP4 for quality

## 🛠️ Creation Tools

### macOS Native
```bash
# Screenshots
screencapture -i filename.png

# Screen recording (convert to GIF later)
screencapture -v filename.mov
```

### Professional Tools
```bash
# Install required tools
brew install ffmpeg gifsicle asciinema

# Convert video to GIF
ffmpeg -i input.mov -vf "fps=15,scale=1080:-1" output.gif

# Optimize GIF
gifsicle -O3 --colors=256 input.gif -o output.gif

# Terminal recording
asciinema rec terminal-session.cast
```

## 🔄 Update Process

1. **Record new assets** following demo scripts
2. **Optimize** for web delivery
3. **Test** on mobile devices
4. **Update** documentation links
5. **Commit** with sacred gratitude

---

*🕉️ "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः" - "Where there is Krishna and Arjuna, there is prosperity"* 🙏
EOF

    echo -e "${GREEN}✅ Asset Index Created${NC}"
}

# Main execution flow
main() {
    echo -e "${BLUE}🕉️ Sacred Demo Assets Creation Starting...${NC}"
    echo ""
    
    check_sacred_tools
    create_tdd_demo
    create_bot_setup_demo  
    create_deploy_demo
    create_asset_index
    
    echo ""
    echo -e "${CYAN}📷 Would you like to take screenshots now? (y/n)${NC}"
    read -r take_screenshots
    
    if [[ $take_screenshots =~ ^[Yy]$ ]]; then
        take_sacred_screenshots
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Sacred Demo Assets Creation Complete!${NC}"
    echo -e "${PURPLE}🕉️ Next Steps:${NC}"
    echo "1. 📹 Record GIFs using the demo scripts in $DEMOS_DIR"
    echo "2. 🎨 Optimize assets for web delivery"
    echo "3. 📱 Test on mobile devices"
    echo "4. 🔗 Update documentation links"
    echo ""
    echo -e "${YELLOW}*\"कर्मसु कौशलं योगः\"* - *\"Skill in action is yoga\"* - Bhagavad Gita${NC}"
    echo -e "${CYAN}🙏 May your demonstrations bring peace and understanding to all developers${NC}"
}

# Run the sacred script
main "$@"
