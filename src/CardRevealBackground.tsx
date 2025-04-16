import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";

// 內部使用的樣式常數
const STYLE_CONSTANTS = {
  BORDER_SIZE_COEFFICIENT: 1,
  DEFAULT_IMAGE_ASPECT_RATIO: 9 / 16,
} as const;

export const STAGES = {
  INITIAL: "initial",
  REVEAL: "reveal",
  DONE: "done",
} as const;

export type Stage = (typeof STAGES)[keyof typeof STAGES];

interface CardRevealBackgroundProps {
  backgroundImage: string;
  gridSize?: { rows: number; columns: number };
  cardBorderRadius?: number;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  animationDuration?: number;
  animationPattern?: "center" | "topLeft" | "random";
  delayBetweenCards?: number;
  stage?: Stage;
  overlayText?: string;
  overlayTextSize?: number;
  remainCards?: number;
  onAnimationComplete?: () => void;
}

const Container = styled.div<{
  backgroundImage: string;
  aspectRatio: number;
  stage: Stage;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ backgroundImage }) =>
    backgroundImage ? `background-image: url(${backgroundImage});` : ""}
  background-size: cover;
  background-position: center;
`;

const CardsContainer = styled.div<{
  aspectRatio: number;
  viewportHeight: number;
  viewportWidth: number;
}>`
  position: relative;
  width: 100%;
  aspect-ratio: ${(props) => props.aspectRatio};
  transform: ${(props) => {
    const viewportRatio = props.viewportWidth / props.viewportHeight;
    if (viewportRatio < props.aspectRatio) {
      const scale =
        (props.viewportHeight * props.aspectRatio) / props.viewportWidth;
      return `scale(${scale})`;
    }
    return "none";
  }};
  transform-origin: center;
`;

const Card = styled(motion.div)<{
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  overlayTextSize: number;
  backgroundImage: string;
}>`
  position: absolute;
  width: ${(props) => `${100 / props.totalCols}%`};
  height: ${(props) => `${100 / props.totalRows}%`};
  left: ${(props) => `${(props.col / props.totalCols) * 100}%`};
  top: ${(props) => `${(props.row / props.totalRows) * 100}%`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  container-type: size;
  overflow: hidden;
  background-image: url(${(props) => props.backgroundImage});
  background-size: ${(props) =>
    `${props.totalCols * 100}% ${props.totalRows * 100}%`};
  background-position: ${(props) =>
    `${props.col * -100}% ${props.row * -100}%`};
  border-radius: ${(props) =>
    `${props.borderRadius * STYLE_CONSTANTS.BORDER_SIZE_COEFFICIENT / (props.totalRows * 2)}cqw`};

  &::before {
    content: attr(data-text);
    font-size: ${(props) => `${props.overlayTextSize}cqw`};
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: ${(props) =>
      `${
        props.borderWidth * STYLE_CONSTANTS.BORDER_SIZE_COEFFICIENT
      }cqw solid ${props.borderColor}`};
    border-radius: ${(props) =>
      `${props.borderRadius * STYLE_CONSTANTS.BORDER_SIZE_COEFFICIENT}cqw`};
  }
`;

const calculateDelay = (
  row: number,
  col: number,
  gridSize: { rows: number; columns: number },
  pattern: "center" | "topLeft" | "random",
  delayBetweenCards: number,
  stage: Stage
) => {
  switch (pattern) {
    case "center": {
      const centerRow = (gridSize.rows - 1) / 2;
      const centerCol = (gridSize.columns - 1) / 2;
      const distance = Math.sqrt(
        Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
      );
      // initial stage: 從外到內出現
      // reveal stage: 從內到外出現
      return stage === STAGES.INITIAL
        ? (Math.max(gridSize.rows, gridSize.columns) - distance) *
            delayBetweenCards
        : distance * delayBetweenCards;
    }
    case "topLeft": {
      const maxDistance = gridSize.rows + gridSize.columns - 2;
      const distance = row + col;
      // initial stage: 從右下到左上出現
      // reveal stage: 從左上到右下出現
      return stage === STAGES.INITIAL
        ? (maxDistance - distance) * delayBetweenCards
        : distance * delayBetweenCards;
    }
    case "random": {
      const centerRow = Math.floor(gridSize.rows / 2);
      const centerCol = Math.floor(gridSize.columns / 2);

      // 如果是中心卡片，延遲為 0
      if (row === centerRow && col === centerCol) {
        return 0;
      }

      // 其他卡片根據階段決定延遲
      if (stage === STAGES.INITIAL) {
        return Infinity;
      } else if (stage === STAGES.REVEAL) {
        return (
          Math.random() *
          delayBetweenCards *
          Math.max(gridSize.rows, gridSize.columns)
        );
      } else {
        return 0;
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
  cardBorderColor = "#ffffff",
  cardBorderWidth = 2,
  animationDuration = 0.5,
  animationPattern = "center",
  delayBetweenCards = 0.15,
  stage = STAGES.INITIAL,
  remainCards,
  overlayText,
  overlayTextSize = 50,
  onAnimationComplete,
}) => {
  const [cards, setCards] = useState<
    { row: number; col: number; delay: number }[]
  >([]);
  const [currentStage, setCurrentStage] = useState(stage);
  const [imageAspectRatio, setImageAspectRatio] = useState(
    STYLE_CONSTANTS.DEFAULT_IMAGE_ASPECT_RATIO
  );
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const cardsToDone =
    remainCards ??
    Math.min(
      Math.floor(gridSize.rows * gridSize.columns * delayBetweenCards),
      cards.length
    );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSize = () => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

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
        const delay = calculateDelay(
          row,
          col,
          gridSize,
          animationPattern,
          delayBetweenCards,
          currentStage
        );
        newCards.push({ row, col, delay });
      }
    }

    if (animationPattern === "random") {
      newCards.sort((a, b) => a.delay - b.delay);
    }

    setCards(newCards);
  }, [gridSize, animationPattern, delayBetweenCards, currentStage]);

  return (
    <Container
      backgroundImage={currentStage === STAGES.DONE ? backgroundImage : ""}
      aspectRatio={imageAspectRatio}
      stage={currentStage}
    >
      <CardsContainer
        aspectRatio={imageAspectRatio}
        viewportHeight={viewportSize.height}
        viewportWidth={viewportSize.width}
      >
        <AnimatePresence>
          {cards.map(({ row, col, delay }, index) => (
            <Card
              key={`${row}-${col}`}
              row={row}
              col={col}
              totalRows={gridSize.rows}
              totalCols={gridSize.columns}
              borderRadius={cardBorderRadius}
              borderColor={cardBorderColor}
              borderWidth={cardBorderWidth}
              overlayTextSize={overlayTextSize}
              backgroundImage={backgroundImage}
              data-text={overlayText}
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  delay === Infinity || currentStage === STAGES.DONE ? 0 : 1,
              }}
              transition={{
                duration: animationDuration,
                delay:
                  delay === Infinity || currentStage === STAGES.DONE
                    ? 0
                    : delay,
                ease: "easeOut",
              }}
              onAnimationComplete={() => {
                if (index === cards.length - cardsToDone) {
                  if (currentStage === STAGES.REVEAL) {
                    setCurrentStage(STAGES.DONE);
                  }
                }
                if (index === cards.length - 1) {
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
