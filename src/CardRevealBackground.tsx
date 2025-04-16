import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

interface CardRevealBackgroundProps {
  backgroundImage: string;
  gridSize?: { rows: number; columns: number };
  cardBorderRadius?: number;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  animationDuration?: number;
  animationPattern?: 'center' | 'topLeft' | 'random';
  delayBetweenCards?: number;
  stage?: 'initial' | 'reveal';
  overlayText?: string;
  overlayTextSize?: number;
  onAnimationComplete?: () => void;
}

const Container = styled.div<{ 
  backgroundImage: string;
  aspectRatio: number;
}>`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * 關於圖片填充的處理歷程：
 * 
 * 1. 最初問題：
 *    - 需要在保持圖片比例的同時填滿整個視窗
 *    - 不能有留白
 *    - 不能失真
 * 
 * 2. 嘗試過的方案：
 *    a) 使用 background-size: cover：
 *       結果：每個卡片獨立顯示圖片，無法形成完整拼圖
 * 
 *    b) 使用固定寬高比：
 *       結果：在不同螢幕尺寸下會失真
 * 
 *    c) 使用 scale(1.1)：
 *       結果：這是一種取巧方式，並非真正解決問題
 * 
 * 3. 當前方案（2024/03）：
 *    - 使用 max/min 函數根據視窗比例動態調整
 *    - 當前結果：
 *      * 畫面較寬時：成功！圖片填滿且不失真
 *      * 畫面較窄時：圖片不失真，但上下有留白
 * 
 * 4. 注意事項：
 *    - 不要再回到「圖片填滿但失真」的方案
 *    - 不要再回到「完全不失真但有留白」的方案
 *    - 需要在保持當前「較寬時成功」的基礎上，解決「較窄時留白」的問題
 */
const CardsContainer = styled.div<{
  aspectRatio: number;
}>`
  position: relative;
  width: ${props => {
    const viewportRatio = window.innerWidth / window.innerHeight;
    const widthFromHeight = `${props.aspectRatio * 100}vh`;
    const fullWidth = '100vw';
    // 當視窗較寬時用max，較窄時用min
    return viewportRatio > props.aspectRatio
      ? `max(${widthFromHeight}, ${fullWidth})`
      : `min(${widthFromHeight}, ${fullWidth})`;
  }};
  height: ${props => {
    const viewportRatio = window.innerWidth / window.innerHeight;
    const heightFromWidth = `${100 / props.aspectRatio}vw`;
    const fullHeight = '100vh';
    // 當視窗較寬時用max，較窄時用min
    return viewportRatio > props.aspectRatio
      ? `max(${heightFromWidth}, ${fullHeight})`
      : `min(${heightFromWidth}, ${fullHeight})`;
  }};
`;

const Card = styled(motion.div)<{
  backgroundImage: string;
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  overlayTextSize: number;
}>`
  position: absolute;
  width: ${props => `${100 / props.totalCols}%`};
  height: ${props => `${100 / props.totalRows}%`};
  left: ${props => `${(props.col / props.totalCols) * 100}%`};
  top: ${props => `${(props.row / props.totalRows) * 100}%`};
  border: ${props => `${props.borderWidth}px solid ${props.borderColor}`};
  border-radius: ${props => `${props.borderRadius}px`};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  container-type: size;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -${props => props.row * 100}%;
    left: -${props => props.col * 100}%;
    width: ${props => props.totalCols * 100}%;
    height: ${props => props.totalRows * 100}%;
    background-image: url(${props => props.backgroundImage});
    background-size: 100% 100%;
    z-index: 0;
  }

  &::before {
    content: attr(data-text);
    font-size: ${props => `${props.overlayTextSize}cqw`};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
  }
`;

const calculateDelay = (
  row: number,
  col: number,
  gridSize: { rows: number; columns: number },
  pattern: 'center' | 'topLeft' | 'random',
  delayBetweenCards: number,
  stage: 'initial' | 'reveal'
) => {
  switch (pattern) {
    case 'center': {
      const centerRow = (gridSize.rows - 1) / 2;
      const centerCol = (gridSize.columns - 1) / 2;
      const distance = Math.sqrt(
        Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
      );
      return distance * delayBetweenCards;
    }
    case 'topLeft': {
      return (row + col) * delayBetweenCards;
    }
    case 'random': {
      const centerRow = Math.floor(gridSize.rows / 2);
      const centerCol = Math.floor(gridSize.columns / 2);
      
      // 如果是中心卡片，延遲為 0
      if (row === centerRow && col === centerCol) {
        return 0;
      }
      
      // 其他卡片根據階段決定延遲
      if (stage === 'initial') {
        return Infinity; // 在初始階段不顯示其他卡片
      } else {
        // 在 reveal 階段，確保卡片能夠顯示
        return Math.random() * delayBetweenCards * Math.max(gridSize.rows, gridSize.columns);
      }
    }
    default:
      return 0;
  }
};

const CardRevealBackground: React.FC<CardRevealBackgroundProps> = ({
  backgroundImage,
  gridSize = { rows: 4, columns: 4 },
  cardBorderRadius = 8,
  cardBorderColor = '#ffffff',
  cardBorderWidth = 2,
  animationDuration = 0.5,
  animationPattern = 'center',
  delayBetweenCards = 0.15,
  stage = 'initial',
  overlayText,
  overlayTextSize = 50,
  onAnimationComplete
}) => {
  const [cards, setCards] = useState<{ row: number; col: number; delay: number }[]>([]);
  const [currentStage, setCurrentStage] = useState(stage);
  const [imageAspectRatio, setImageAspectRatio] = useState(16/9); // 預設值

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    // 載入圖片並獲取其實際比例
    const img = new Image();
    img.onload = () => {
      setImageAspectRatio(img.width / img.height);
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  useEffect(() => {
    setCurrentStage(stage);
  }, [stage]);

  useEffect(() => {
    const newCards = [];
    
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.columns; col++) {
        const delay = calculateDelay(row, col, gridSize, animationPattern, delayBetweenCards, currentStage);
        newCards.push({ row, col, delay });
      }
    }

    if (animationPattern === 'random') {
      newCards.sort((a, b) => a.delay - b.delay);
    }
    
    setCards(newCards);
  }, [gridSize, animationPattern, delayBetweenCards, currentStage]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Container backgroundImage={backgroundImage} aspectRatio={imageAspectRatio}>
      <CardsContainer aspectRatio={imageAspectRatio}>
        <AnimatePresence>
          {cards.map(({ row, col, delay }) => (
            <Card
              key={`${row}-${col}`}
              backgroundImage={backgroundImage}
              row={row}
              col={col}
              totalRows={gridSize.rows}
              totalCols={gridSize.columns}
              borderRadius={cardBorderRadius}
              borderColor={cardBorderColor}
              borderWidth={cardBorderWidth}
              overlayTextSize={overlayTextSize}
              data-text={overlayText}
              initial={{ 
                opacity: 0,
              }}
              animate={{ 
                opacity: delay === Infinity ? 0 : 1,
              }}
              transition={{
                duration: animationDuration,
                delay: delay === Infinity ? 0 : delay,
                ease: "easeOut"
              }}
              onAnimationComplete={() => {
                if (row === gridSize.rows - 1 && col === gridSize.columns - 1) {
                  onAnimationComplete?.();
                }
              }}
            />
          ))}
        </AnimatePresence>
      </CardsContainer>
    </Container>
  );
};

export default CardRevealBackground; 