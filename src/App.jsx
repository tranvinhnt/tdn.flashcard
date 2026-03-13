import { useState, useEffect, useMemo } from 'react';
import './App.css';
import flashcardData from './data/flashcards.json';

const TOPICS = [
  { id: 'toan', name: 'Toán & Tư duy Logic', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', icon: '🔢' },
  { id: 'anh', name: 'Năng lực Tiếng Anh', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: '🇬🇧' },
  { id: 'viet', name: 'Thực hành Tiếng Việt', color: 'linear-gradient(135deg, #ff9a44 0%, #fc6076 100%)', icon: '📖' },
  { id: 'khoahoc', name: 'Khoa học & Thường thức', color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', icon: '🌍' }
];

function App() {
  const [topic, setTopic] = useState(null);
  const [learnedCards, setLearnedCards] = useState(() => {
    const saved = localStorage.getItem('tdn_learned_cards');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('tdn_learned_cards', JSON.stringify(learnedCards));
  }, [learnedCards]);

  const cardsInTopic = useMemo(() => {
    if (!topic) return [];
    return flashcardData.filter(c => c.category === topic.id);
  }, [topic]);

  const unlearnedCards = useMemo(() => {
    return cardsInTopic.filter(c => !learnedCards[c.id]);
  }, [cardsInTopic, learnedCards]);

  const pickRandomCard = () => {
    if (unlearnedCards.length === 0) {
      setCurrentCard(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * unlearnedCards.length);
    setCurrentCard(unlearnedCards[randomIndex]);
    setIsFlipped(false);
  };

  useEffect(() => {
    if (topic) {
      pickRandomCard();
    }
  }, [topic]);

  const handleMarkLearned = (e) => {
    e.stopPropagation();
    if (!currentCard) return;
    setLearnedCards(prev => ({ ...prev, [currentCard.id]: true }));
    setIsFlipped(false);
  };

  useEffect(() => {
    if (topic && currentCard && learnedCards[currentCard.id]) {
      pickRandomCard();
    }
  }, [learnedCards]);

  const getTopicProgress = (tId) => {
    const total = flashcardData.filter(c => c.category === tId).length;
    const learnedCount = flashcardData.filter(c => c.category === tId && learnedCards[c.id]).length;
    return { total, learnedCount };
  };

  const renderTopicSelection = () => (
    <div className="topic-selection">
      <div className="header">
        <h1>Ôn luyện Trần Đại Nghĩa 💡</h1>
        <p>Học thật vui, thi thật tốt vào lớp 6!</p>
      </div>
      
      <div className="progress-summary">
        Bạn đã học thuộc {Object.keys(learnedCards).length} / {flashcardData.length} thẻ
      </div>

      <div className="topic-grid">
        {TOPICS.map(t => {
          const { total, learnedCount } = getTopicProgress(t.id);
          const percent = total > 0 ? (learnedCount / total) * 100 : 0;
          return (
            <div 
              key={t.id} 
              className="topic-card" 
              style={{ background: t.color }}
              onClick={() => setTopic(t)}
            >
              <div className="topic-icon">{t.icon}</div>
              <h2>{t.name}</h2>
              <div className="progress-text">Tiến độ: {learnedCount} / {total}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFlashcard = () => {
    if (unlearnedCards.length === 0) {
      return (
        <div className="completion-screen">
          <div className="trophy">🏆</div>
          <h2>Chúc mừng!</h2>
          <p>Bạn đã hoàn thành tất cả thẻ trong chủ đề <strong>{topic.name}</strong>!</p>
          <button className="btn back-btn" onClick={() => setTopic(null)}>Quay lại chọn chủ đề</button>
        </div>
      );
    }

    if (!currentCard) return null;

    return (
      <div className="flashcard-container">
        <div className="top-bar">
          <button className="btn back-btn-small" onClick={() => setTopic(null)}>⬅ Chủ đề khác</button>
          <span className="stats-badge">Còn lại: {unlearnedCards.length} thẻ</span>
        </div>
        
        <div className="card-scene">
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="front">
              <span className="badge">Câu hỏi</span>
              <div className="card-content">
                <p>{currentCard.front}</p>
              </div>
              <div className="hint-text">Chạm để lật thẻ 👆</div>
            </div>
            <div className={`back subject-${topic.id}`}>
              <span className="badge answer-badge">Đáp án</span>
              <div className="card-content">
                <p>{currentCard.back}</p>
              </div>
              <div className="hint-text">Chạm để lật thẻ 👆</div>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn skip-btn" onClick={(e) => {e.stopPropagation(); pickRandomCard();}}>
             Bỏ qua 🔄
          </button>
          <button className="btn learned-btn" onClick={handleMarkLearned}>
            ✅ Đã thuộc!
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-wrapper">
      {flashcardData.length === 0 ? <p>Loading data...</p> : (!topic ? renderTopicSelection() : renderFlashcard())}
    </div>
  );
}

export default App;
