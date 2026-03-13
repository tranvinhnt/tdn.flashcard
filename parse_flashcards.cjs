const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\trannvx\\.gemini\\antigravity\\brain\\44e44d56-cc2f-46d3-b7ca-899e5ee8d890';
const files = {
    'toan': path.join(brainPath, 'flashcards_toan_logic.md'),
    'anh': path.join(brainPath, 'flashcards_tieng_anh.md'),
    'viet': path.join(brainPath, 'flashcards_tieng_viet.md'),
    'khoahoc': path.join(brainPath, 'flashcards_khoa_hoc_xa_hoi.md')
};

function parseFile(filePath, categoryId) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const cards = [];
    let currentCard = null;

    for (const line of lines) {
        if (line.match(/\*\*Card \d+ \(Front\):\*\*/)) {
            if (currentCard && currentCard.front && currentCard.back) {
                cards.push(currentCard);
            }
            currentCard = {
                id: `${categoryId}_${cards.length + 1}`,
                category: categoryId,
                front: line.replace(/\*\*Card \d+ \(Front\):\*\*\s*/, '').trim(),
                back: ''
            };
        } else if (line.match(/\*\*Card \d+ \(Back\):\*\*/)) {
            if (currentCard) {
                currentCard.back = line.replace(/\*\*Card \d+ \(Back\):\*\*\s*/, '').trim();
            }
        }
    }
    
    if (currentCard && currentCard.front && currentCard.back) {
        cards.push(currentCard);
    }
    
    return cards;
}

let allCards = [];
for (const [cat, file] of Object.entries(files)) {
    if (fs.existsSync(file)) {
        const catCards = parseFile(file, cat);
        allCards = allCards.concat(catCards);
        console.log(`Parsed ${catCards.length} cards for ${cat}.`);
    } else {
        console.log(`File not found: ${file}`);
    }
}

const outputPath = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

fs.writeFileSync(path.join(outputPath, 'flashcards.json'), JSON.stringify(allCards, null, 2));
console.log('Successfully wrote to src/data/flashcards.json');
