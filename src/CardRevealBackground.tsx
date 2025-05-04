import React, { useEffect, useState, useMemo } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";

// 內部使用的樣式常數
const STYLE_CONSTANTS = {
  DEFAULT_IMAGE_ASPECT_RATIO: 9 / 16,
} as const;

export const STAGES = {
  INITIAL: "initial",
  REVEAL: "reveal",
  DONE: "done",
} as const;

export type Stage = (typeof STAGES)[keyof typeof STAGES];

interface CardSize {
  width: number;
  height: number;
}

const calculateGridSize = (
  viewportSize: { width: number; height: number },
  cardSize: CardSize
): { rows: number; columns: number } => {
  const columns = Math.ceil(viewportSize.width / cardSize.width);
  const rows = Math.ceil(viewportSize.height / cardSize.height);
  return { rows, columns };
};

interface CardRevealBackgroundProps {
  backgroundImage: string;
  backgroundColor?: string;
  gridSize?: { rows: number; columns: number };
  cardSize?: CardSize;
  cardBorderRadius?: number;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  animationDuration?: number;
  animationPattern?: "center" | "topLeft" | "random";
  startCell?: { row: number; col: number };
  delayBetweenCards?: number;
  stage?: Stage;
  renderOverlay?: () => React.ReactNode;
  remainCards?: number;
  onAnimationComplete?: () => void;
}

const Container = styled.div<{
  backgroundColor?: string;
  backgroundImage: string;
  aspectRatio: number;
  stage: Stage;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: ${(props) => props.backgroundColor ?? ""};
  ${({ backgroundImage }) =>
    backgroundImage ? `background-image: url(${backgroundImage});` : ""}
  background-size: cover;
  background-position: center;
`;

const Card = styled(motion.div)<{
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  backgroundImage: string;
  viewportSize: { width: number; height: number };
  aspectRatio: number;
  cardSize: CardSize;
}>`
  position: absolute;
  width: ${(props) => props.cardSize.width}px;
  height: ${(props) => props.cardSize.height}px;
  left: ${(props) => props.col * props.cardSize.width}px;
  top: ${(props) => props.row * props.cardSize.height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  container-type: size;
  overflow: hidden;
  background-image: url(${(props) => props.backgroundImage});
  ${(props) => {
    // 計算 cover 模式下的圖片尺寸
    const viewportRatio = props.viewportSize.width / props.viewportSize.height;
    let scale = 1;
    if (viewportRatio < props.aspectRatio) {
      scale =
        (props.viewportSize.height * props.aspectRatio) /
        props.viewportSize.width;
    }
    const width = props.viewportSize.width * scale;
    const height = width / props.aspectRatio;

    // 計算圖片在 cover 模式下的偏移量
    const offsetX = (width - props.viewportSize.width) / 2;
    const offsetY = (height - props.viewportSize.height) / 2;

    // 計算這個卡片在整個網格中的位置
    const cardX = props.col * props.cardSize.width;
    const cardY = props.row * props.cardSize.height;

    // 計算背景圖片的位置
    const backgroundX = -(cardX + offsetX);
    const backgroundY = -(cardY + offsetY);

    return `
      background-size: ${width}px ${height}px;
      background-position: ${backgroundX}px ${backgroundY}px;
    `;
  }}
  border-radius: ${(props) => props.borderRadius}px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: ${(props) => `${props.borderWidth}px solid ${props.borderColor}`};
    border-radius: ${(props) => props.borderRadius}px;
  }
`;

const calculateDelay = (
  row: number,
  col: number,
  gridSize: { rows: number; columns: number },
  startCell: { row: number; col: number } | undefined,
  delayBetweenCards: number,
  stage: Stage
) => {
  const centerRow = startCell ? startCell.row : Math.floor(gridSize.rows / 2);
  const centerCol = startCell
    ? startCell.col
    : Math.floor(gridSize.columns / 2);

  // 如果是起始卡片，延遲為 0
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
};

export const CardRevealBackground: React.FC<CardRevealBackgroundProps> = ({
  backgroundImage,
  backgroundColor,
  gridSize: propGridSize,
  cardSize,
  cardBorderRadius = 8,
  cardBorderColor = "#ffffff",
  cardBorderWidth = 2,
  animationDuration = 0.5,
  startCell,
  delayBetweenCards = 0.15,
  stage = STAGES.INITIAL,
  remainCards,
  renderOverlay,
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

  // 計算實際的 gridSize
  const gridSize = useMemo(() => {
    if (cardSize) {
      return calculateGridSize(viewportSize, cardSize);
    }
    return propGridSize ?? { rows: 4, columns: 4 };
  }, [cardSize, viewportSize, propGridSize]);

  // 計算實際的卡片尺寸
  const actualCardSize = useMemo(() => {
    if (cardSize) {
      return cardSize;
    }
    return {
      width: viewportSize.width / gridSize.columns,
      height: viewportSize.height / gridSize.rows,
    };
  }, [cardSize, viewportSize, gridSize]);

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
    if (stage === STAGES.DONE) {
      onAnimationComplete?.();
    }
  }, [stage]);

  useEffect(() => {
    const newCards = [];

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.columns; col++) {
        const delay = calculateDelay(
          row,
          col,
          gridSize,
          startCell,
          delayBetweenCards,
          currentStage
        );
        newCards.push({ row, col, delay });
      }
    }

    newCards.sort((a, b) => a.delay - b.delay);

    setCards(newCards);
  }, [gridSize, delayBetweenCards, currentStage]);

  return (
    <Container
      backgroundImage={currentStage === STAGES.DONE ? backgroundImage : ""}
      backgroundColor={backgroundColor}
      aspectRatio={imageAspectRatio}
      stage={currentStage}
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
            backgroundImage={backgroundImage}
            viewportSize={viewportSize}
            aspectRatio={imageAspectRatio}
            cardSize={actualCardSize}
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                delay === Infinity || currentStage === STAGES.DONE ? 0 : 1,
            }}
            transition={{
              duration: animationDuration,
              delay:
                delay === Infinity || currentStage === STAGES.DONE ? 0 : delay,
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              if (index === cards.length - cardsToDone) {
                if (currentStage === STAGES.REVEAL) {
                  setCurrentStage(STAGES.DONE);
                  onAnimationComplete?.();
                }
              }
            }}
          >
            {renderOverlay?.()}
          </Card>
        ))}
      </AnimatePresence>
    </Container>
  );
};
