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
  onAnimationComplete?: () => void;
}

const Container = styled.div<{ backgroundImage: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: none;
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
}>`
  position: absolute;
  background-image: url(${props => props.backgroundImage});
  background-size: ${props => `${props.totalCols * 100}% ${props.totalRows * 100}%`};
  background-position: ${props => `${(props.col / (props.totalCols - 1)) * 100}% ${(props.row / (props.totalRows - 1)) * 100}%`};
  width: ${props => `${100 / props.totalCols}%`};
  height: ${props => `${100 / props.totalRows}%`};
  left: ${props => `${(props.col / props.totalCols) * 100}%`};
  top: ${props => `${(props.row / props.totalRows) * 100}%`};
  border: ${props => `${props.borderWidth}px solid ${props.borderColor}`};
  border-radius: ${props => `${props.borderRadius}px`};
  box-sizing: border-box;
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
  onAnimationComplete
}) => {
  const [cards, setCards] = useState<{ row: number; col: number; delay: number }[]>([]);
  const [currentStage, setCurrentStage] = useState(stage);

  // 當 stage prop 改變時，更新內部狀態
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

    // 如果是隨機模式，對卡片進行排序以確保動畫順序
    if (animationPattern === 'random') {
      newCards.sort((a, b) => a.delay - b.delay);
    }
    
    setCards(newCards);
  }, [gridSize, animationPattern, delayBetweenCards, currentStage]);

  return (
    <Container backgroundImage={backgroundImage}>
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
    </Container>
  );
};

export default CardRevealBackground; 