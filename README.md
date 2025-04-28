# Card Reveal Background

一個 React 組件，用於創建卡片展示背景動畫效果。這個組件可以將一張背景圖片分割成多個卡片，並以動畫方式逐漸展示，最終合併成完整的背景圖片。

## 安裝

```bash
npm install https://github.com/relabcc/card-reveal-background
```

## 使用方法

```jsx
import { CardRevealBackground, STAGES } from 'card-reveal-background';

function App() {
  return (
    <CardRevealBackground
      backgroundImage="/path/to/your/image.jpg"
      gridSize={{ rows: 4, columns: 4 }}
      cardBorderRadius={8}
      cardBorderColor="#ffffff"
      cardBorderWidth={2}
      animationDuration={0.5}
      animationPattern="random"
      delayBetweenCards={0.15}
      stage={STAGES.INITIAL}
      renderOverlay={() => <div>Custom Overlay</div>}
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
| animationPattern | 'center' \| 'topLeft' \| 'random' | 'center' | 卡片出現的動畫模式 |
| delayBetweenCards | number | 0.15 | 卡片之間的延遲時間（秒） |
| stage | 'initial' \| 'reveal' \| 'done' | 'initial' | 動畫的當前階段 |
| remainCards | number | undefined | 保留的卡片數量，用於控制動畫完成時機 |
| renderOverlay | () => React.ReactNode | undefined | 自定義卡片內容的渲染函數 |
| onAnimationComplete | () => void | undefined | 動畫完成時的回調函數 |

## 動畫階段

組件支援三個動畫階段：

1. **initial**: 初始階段，卡片從外到內或從右下到左上出現
2. **reveal**: 揭示階段，卡片從內到外或從左上到右下出現
3. **done**: 完成階段，顯示完整的背景圖片

## 動畫模式

- **center**: 從中心向外擴散
- **topLeft**: 從左上角開始
- **random**: 隨機順序出現

## 特點

- 自適應螢幕大小和圖片比例
- 可自定義網格大小
- 可自定義卡片樣式和內容
- 流暢的動畫效果
- 支援多階段動畫
- 支援任意背景圖片
- TypeScript 支援

## 注意事項

1. 背景圖片需要是可公開訪問的 URL
2. 建議使用適當大小的圖片以確保最佳效能
3. 網格大小會影響動畫的整體效果，建議根據實際需求調整
4. 使用 `renderOverlay` 可以在卡片上添加自定義內容

## License

MIT 