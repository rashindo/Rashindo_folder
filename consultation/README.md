# 無料相談 事前フォーム（consultation）

羅針堂サイト配下に配置する、無料相談前の事前整理ページです。  
回答送信後に TimeRex 予約ページへ自然に接続する構成です。

## ファイル構成

- `consultation/index.html` : ページ本体（導入文、フォーム、完了表示）
- `consultation/style.css` : 配色・余白・レスポンシブスタイル
- `consultation/script.js` : バリデーション、送信処理、完了状態制御
- `consultation/config.js` : 本番設定（GAS URL / TimeRex URL / 自動遷移時間）
- `consultation/config.example.js` : 差し替え用設定サンプル（公開不要）
- `consultation/gas-sample.gs` : GAS側サンプルコード（公開不要）

## 本番公開対象ファイル

- `index.html`
- `style.css`
- `script.js`
- `config.js`

## 公開不要ファイル

- `README.md`
- `config.example.js`
- `gas-sample.gs`

## ローカル確認方法

1. プロジェクトルートで簡易サーバーを起動
   ```bash
   python3 -m http.server 8080
   ```
2. ブラウザで以下を開く
   - `http://localhost:8080/consultation/`

## GASエンドポイント差し替え方法

現在は `consultation/script.js` 内 `DEFAULT_CONFIG.FORM_ENDPOINT` がプレースホルダーです。  
本番では `consultation/config.js`（`config.example.js` をコピー）で上書きしてください。

### 方法A（推奨）: `config.js` で上書き

1. `consultation/config.example.js` を `consultation/config.js` としてコピー
2. `ENDPOINTS.GAS_WEBAPP_URL`（または `FORM_ENDPOINT`）を実URLへ変更
3. `index.html` で `script.js` より前に `config.js` を読み込む

```html
<script src="./config.js"></script>
<script src="./script.js" defer></script>
```

### 補足: 互換キーについて

- `ENDPOINTS.GAS_WEBAPP_URL` を優先して利用
- 既存互換として `FORM_ENDPOINT` も利用可能

## TimeRex URL差し替え方法

- `script.js` の `DEFAULT_CONFIG.TIMEREX_URL` を変更
- または `config.js` の `TIMEREX_URL` で上書き

## デプロイ手順（簡易メモ）

1. `consultation/` ディレクトリを既存サイトに配置
2. 必要に応じて `config.js` を追加して設定上書き
3. サイト公開後、LINEリッチメニュー遷移先を `/consultation/` に設定
4. 本番でフォーム送信 → スプレッドシート記録 → TimeRex遷移の動作確認

## フロント送信 payload 仕様

`consultation/script.js` から、以下のキーで GAS に POST されます。

- `timestamp`
- `businessType`
- `industry`
- `monthlyRevenue`
- `employeeCount`
- `concerns`（配列）
- `consultationIntent`
- `consultationPreference`
- `consultationDetails`
- `userAgent`
- `referrer`
- `source`（固定値: `line_richmenu_consultation`）

## GAS 設定手順

1. Google スプレッドシートを作成
2. 拡張機能 → Apps Script を開く
3. `consultation/gas-sample.gs` の内容を貼り付け
4. `SHEET_ID` と `SHEET_NAME` を実値に変更
5. 「デプロイ」→「新しいデプロイ」→ 種別「ウェブアプリ」
   - 実行ユーザー: 自分
   - アクセス権: 全員（匿名含む）
6. 発行された Web アプリ URL を `consultation/config.js` の `ENDPOINTS.GAS_WEBAPP_URL` に設定

## スプレッドシート推奨カラム構成

1行目に以下ヘッダーを設定してください（順序推奨）。

1. `timestamp`
2. `businessType`
3. `industry`
4. `monthlyRevenue`
5. `employeeCount`
6. `concerns`
7. `consultationIntent`
8. `consultationPreference`
9. `consultationDetails`
10. `userAgent`
11. `referrer`
12. `source`

`concerns` は複数選択のため、GAS 側で `A | B | C` 形式の文字列に連結して保存します。

## デプロイ手順（本番）

1. `consultation/config.example.js` を `consultation/config.js` としてコピー
2. `ENDPOINTS.GAS_WEBAPP_URL` に本番 GAS URL を設定
3. 必要に応じて `TIMEREX_URL` / `AUTO_REDIRECT_DELAY_MS` を調整
4. `index.html` で `config.js` を `script.js` より前に読み込む
5. サイトへ反映し、LINE リッチメニュー遷移先を `/consultation/` に設定

## テスト手順

1. ローカルまたはステージングでフォーム入力（必須項目+Q2複数選択）
2. 送信後に完了画面が表示されることを確認
3. 完了画面に TimeRex ボタンが表示されることを確認
4. 3〜5秒程度で TimeRex に自動遷移することを確認
5. スプレッドシートに 12項目が期待通り記録されることを確認
6. GAS URL をわざと誤設定し、失敗時エラー表示・再送可能状態への復帰を確認

## GAS サンプルコード

- `consultation/gas-sample.gs` を参照してください。
