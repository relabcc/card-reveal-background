import React, { useEffect, useState } from "react";
import { CardRevealBackground, STAGES, Stage } from "../../src";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b",
];

function App() {
  const [selectedImage, setSelectedImage] = useState(DEFAULT_IMAGES[0]);
  const [cardWidth, setCardWidth] = useState(300);
  const [cardHeight, setCardHeight] = useState(400);
  const [borderRadius, setBorderRadius] = useState(10);
  const [borderWidth, setBorderWidth] = useState(2);
  const [animationDuration, setAnimationDuration] = useState(1);
  const [delayBetweenCards, setDelayBetweenCards] = useState(0.25);
  const [stage, setStage] = useState<Stage>(STAGES.INITIAL);

  const renderKey = [
    selectedImage,
    cardWidth,
    cardHeight,
    borderRadius,
    borderWidth,
    animationDuration,
    delayBetweenCards,
  ].join("-");

  return (
    <>
      <div className="controls">
        <label>
          背景圖片：
          <select
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
          >
            {DEFAULT_IMAGES.map((img, index) => (
              <option key={img} value={img}>
                示例圖片 {index + 1}
              </option>
            ))}
          </select>
        </label>
        {/* <label>
          動畫階段：
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as "initial" | "reveal")}
          >
            <option value="initial">初始階段</option>
            <option value="reveal">顯示剩餘卡片</option>
          </select>
        </label> */}
        <label>
          卡片寬度：
          <input
            type="number"
            min="2"
            max="20"
            value={cardWidth}
            onChange={(e) => setCardWidth(Number(e.target.value))}
          />
        </label>
        <label>
          卡片高度：
          <input
            type="number"
            min="2"
            max="20"
            value={cardHeight}
            onChange={(e) => setCardHeight(Number(e.target.value))}
          />
        </label>
        <label>
          圓角大小：
          <input
            type="number"
            min="0"
            max="50"
            value={borderRadius}
            onChange={(e) => setBorderRadius(Number(e.target.value))}
          />
        </label>
        <label>
          邊框寬度：
          <input
            type="number"
            min="0"
            max="10"
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value))}
          />
        </label>
        <label>
          動畫時間：
          <input
            type="number"
            min="0.1"
            max="2"
            step="0.1"
            value={animationDuration}
            onChange={(e) => setAnimationDuration(Number(e.target.value))}
          />
        </label>
        <label>
          卡片間延遲：
          <input
            type="number"
            min="0.05"
            max="0.5"
            step="0.05"
            value={delayBetweenCards}
            onChange={(e) => setDelayBetweenCards(Number(e.target.value))}
          />
        </label>
      </div>
      <div
        className="card-container"
        onClick={() => setStage(stage === "initial" ? "reveal" : "initial")}
      >
        <CardRevealBackground
          key={renderKey}
          backgroundImage={selectedImage}
          cardSize={{ width: cardWidth, height: cardHeight }}
          cardBorderRadius={borderRadius}
          cardBorderWidth={borderWidth}
          animationDuration={animationDuration}
          delayBetweenCards={delayBetweenCards}
          stage={stage}
          renderOverlay={() => <div>Hello</div>}
          onAnimationComplete={() => console.log("Animation completed!")}
        />
      </div>
    </>
  );
}

export default App;
