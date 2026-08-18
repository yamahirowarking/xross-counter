# クロススターズ ライフカウンター LOCAL v5.2

v5.0 の機能を維持したまま、保守しやすいようにファイルを分割したリファクタリング版です。

## 構成

- `index.html` : 画面構造のみ
- `css/base.css` : 共通スタイル
- `css/board.css` : 8面盤面
- `css/menu.css` : メニュー・装備・背景設定
- `css/responsive.css` : スマホ横画面／縦画面回転対応
- `js/config.js` : HP・ダメージ等の定数
- `js/state.js` : 状態の初期化・localStorage
- `js/game-rules.js` : HP計算・装備・ラウンド処理
- `js/background-storage.js` : IndexedDB背景画像保存
- `js/board-ui.js` : 盤面描画・文字サイズ
- `js/menu-ui.js` : メニュー・装備UI
- `js/app.js` : イベント配線と起動処理

## GitHub Pages

フォルダ構成を崩さず、`index.html`、`css`、`js` をまとめてリポジトリへアップロードしてください。

## 互換性

既存版と同じ `localStorage` キーと IndexedDB 名を使用しているため、同一オリジン上で差し替えれば既存の盤面設定・文字サイズ・背景画像を引き継ぐ設計です。


## v5.2 背景画像安定化

- 盤面背景を CSS 疑似要素ではなく、各面の専用 `<img>` レイヤーで描画
- 覚醒／DOWN の色レイヤーを背景画像と分離
- 画像登録時に長辺1600pxまで自動縮小
- JPEG変換して保存容量とスマホ描画負荷を軽減
- IndexedDB、背景設定の保存／読込は従来仕様を維持

## v5.2.1

- 上半分反転ON時、上4面の背景画像も盤面UIと同じく180度反転するよう修正
