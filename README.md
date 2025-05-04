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
      cardSize={{ width: 200, height: 300 }}
      cardBorderRadius={8}
      cardBorderColor="#ffffff"
      cardBorderWidth={2}
      animationDuration={0.5}
      startCell={{ row: 3, col: 2 }}
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
| backgroundColor | string | 選填 | 背景顏色 |
| gridSize | { rows: number; columns: number } | { rows: 4, columns: 4 } | 卡片網格的行數和列數 |
| cardSize | { width: number; height: number } | undefined | 每張卡片的固定尺寸（像素） |
| cardBorderRadius | number | 8 | 卡片的圓角大小（像素） |
| cardBorderColor | string | '#ffffff' | 卡片邊框的顏色 |
| cardBorderWidth | number | 2 | 卡片邊框的寬度（像素） |
| animationDuration | number | 0.5 | 每張卡片的動畫持續時間（秒） |
| startCell | { row: number; col: number } | undefined | 初始卡片的座標 |
| delayBetweenCards | number | 0.15 | 卡片之間的延遲時間（秒） |
| stage | 'initial' \| 'reveal' \| 'done' | 'initial' | 動畫的當前階段 |
| remainCards | number | undefined | 保留的卡片數量，用於控制動畫完成時機 |
| renderOverlay | () => React.ReactNode | undefined | 自定義卡片內容的渲染函數 |
| onAnimationComplete | () => void | undefined | stage 轉換為 done 時的回傳函數 |

## 網格大小設定

組件提供兩種方式來設定卡片網格的大小：

### 1. 使用 gridSize

直接指定網格的行數和列數：

```jsx
gridSize={{ rows: 4, columns: 4 }}
```

這種方式會自動計算每張卡片的大小，以填滿整個視窗。

### 2. 使用 cardSize

指定每張卡片的固定尺寸，組件會自動計算需要的行數和列數：

```jsx
cardSize={{ width: 200, height: 300 }}
```

當使用 `cardSize` 時：
- 組件會根據視窗大小和指定的卡片尺寸，自動計算需要的行數和列數
- 確保每張卡片都嚴格符合指定的尺寸
- 網格會自動擴展以覆蓋整個視窗
- 例如：如果視窗是 1920x1080，且 cardSize 是 { width: 200, height: 300 }，則會自動計算出需要 10 列（200 * 10 >= 1920）和 4 行（300 * 4 >= 1080）

注意事項：
- `gridSize` 和 `cardSize` 是互斥的，建議只使用其中一種方式
- 如果同時提供兩個屬性，`cardSize` 會優先使用
- 使用 `cardSize` 可以確保每張卡片都保持固定大小，適合需要精確控制卡片尺寸的場景

## 動畫階段

組件支援三個動畫階段：

1. **initial**: 初始階段，卡片從外到內或從右下到左上出現
2. **reveal**: 揭示階段，卡片從內到外或從左上到右下出現
3. **done**: 完成階段，顯示完整的背景圖片

## 特點

- 自適應螢幕大小和圖片比例
- 可自定義網格大小或卡片尺寸
- 可自定義卡片樣式和內容
- 流暢的動畫效果
- 支援多階段動畫
- 支援任意背景圖片
- TypeScript 支援

## 注意事項

1. 背景圖片需要是可公開訪問的 URL
2. 建議使用適當大小的圖片以確保最佳效能
3. 網格大小或卡片尺寸會影響動畫的整體效果，建議根據實際需求調整
4. 使用 `renderOverlay` 可以在卡片上添加自定義內容
5. 當使用 `cardSize` 時，請確保卡片尺寸適合你的使用場景，過大的尺寸可能會導致網格過大

## License

MIT 