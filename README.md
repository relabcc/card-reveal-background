# Card Reveal Background

一個 React 組件，用於創建卡片展示背景動畫效果。這個組件可以將一張背景圖片分割成多個卡片，並以動畫方式逐漸展示，最終合併成完整的背景圖片。

## 安裝

```bash
npm install card-reveal-background
```

## 使用方法

```jsx
import { CardRevealBackground } from 'card-reveal-background';

function App() {
  return (
    <CardRevealBackground
      backgroundImage="/path/to/your/image.jpg"
      gridSize={{ rows: 4, columns: 4 }}
      cardBorderRadius={8}
      cardBorderColor="#ffffff"
      cardBorderWidth={2}
      animationDuration={0.5}
      onAnimationComplete={() => console.log('Animation completed!')}
    />
  );
}
```

## 屬性

| 屬性名稱 | 類型 | 預設值 | 說明 |
|----------|------|--------|------|
| backgroundImage | string | 必填 | 背景圖片的 URL |
| gridSize | { rows: number; columns: number } | { rows: 4, columns: 4 } | 卡片網格的行數和列數 |
| cardBorderRadius | number | 8 | 卡片的圓角大小（像素） |
| cardBorderColor | string | '#ffffff' | 卡片邊框的顏色 |
| cardBorderWidth | number | 2 | 卡片邊框的寬度（像素） |
| animationDuration | number | 0.5 | 每張卡片的動畫持續時間（秒） |
| onAnimationComplete | () => void | undefined | 動畫完成時的回調函數 |

## 特點

- 自適應螢幕大小
- 可自定義網格大小
- 可自定義卡片樣式
- 流暢的動畫效果
- 支援任意背景圖片
- TypeScript 支援

## 注意事項

1. 背景圖片需要是可公開訪問的 URL
2. 建議使用適當大小的圖片以確保最佳效能
3. 網格大小會影響動畫的整體效果，建議根據實際需求調整

## License

MIT 