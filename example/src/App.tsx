import React, { useState } from 'react';
import { CardRevealBackground } from '../../src';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b',
];

function App() {
  const [selectedImage, setSelectedImage] = useState(DEFAULT_IMAGES[0]);
  const [rows, setRows] = useState(4);
  const [columns, setColumns] = useState(4);
  const [borderRadius, setBorderRadius] = useState(8);
  const [borderWidth, setBorderWidth] = useState(2);
  const [animationDuration, setAnimationDuration] = useState(0.5);
  const [animationPattern, setAnimationPattern] = useState<'center' | 'topLeft' | 'random'>('center');
  const [delayBetweenCards, setDelayBetweenCards] = useState(0.15);

  const renderKey = [
    selectedImage,
    rows,
    columns,
    borderRadius,
    borderWidth,
    animationDuration,
    animationPattern,
  ].join('-');

  return (
    <div>
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
        <label>
          動畫模式：
          <select
            value={animationPattern}
            onChange={(e) => setAnimationPattern(e.target.value as 'center' | 'topLeft' | 'random')}
          >
            <option value="center">從中心開始</option>
            <option value="topLeft">從左上角開始</option>
            <option value="random">隨機順序</option>
          </select>
        </label>
        <label>
          列數：
          <input
            type="number"
            min="2"
            max="20"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </label>
        <label>
          行數：
          <input
            type="number"
            min="2"
            max="20"
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
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

      <CardRevealBackground
        key={renderKey}
        backgroundImage={selectedImage}
        gridSize={{ rows, columns }}
        cardBorderRadius={borderRadius}
        cardBorderWidth={borderWidth}
        animationDuration={animationDuration}
        animationPattern={animationPattern}
        delayBetweenCards={delayBetweenCards}
        onAnimationComplete={() => console.log('Animation completed!')}
      />
    </div>
  );
}

export default App; 