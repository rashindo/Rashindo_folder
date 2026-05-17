# 無料相談 事前フォーム（consultation）

羅針堂サイト配下に配置する、無料相談前の事前整理ページです。  
回答送信後に TimeRex 予約ページへ自然に接続する構成です。

## ファイル構成

- `consultation/index.html` : ページ本体（導入文、フォーム、完了表示）
- `consultation/style.css` : 配色・余白・レスポンシブスタイル
- `consultation/script.js` : バリデーション、送信処理、完了状態制御
- `consultation/config.example.js` : 差し替え用設定サンプル

## ローカル確認方法

1. プロジェクトルートで簡易サーバーを起動
   ```bash
   python3 -m http.server 8080
   ```
2. ブラウザで以下を開く
   - `http://localhost:8080/consultation/`

## GASエンドポイント差し替え方法

現在は `consultation/script.js` 内 `DEFAULT_CONFIG.FORM_ENDPOINT` が仮URLです。
本番では以下のどちらかで差し替えてください。

### 方法A（推奨）: `config.js` で上書き

1. `consultation/config.example.js` を `consultation/config.js` としてコピー
2. `FORM_ENDPOINT` を実URLへ変更
3. `index.html` で `script.js` より前に `config.js` を読み込む

```html
<script src="./config.js"></script>
<script src="./script.js" defer></script>
```

### 方法B: 直接 `script.js` を編集

- `DEFAULT_CONFIG.FORM_ENDPOINT` の値を直接置換

## TimeRex URL差し替え方法

- `script.js` の `DEFAULT_CONFIG.TIMEREX_URL` を変更
- または `config.js` の `TIMEREX_URL` で上書き

## デプロイ手順（簡易メモ）

1. `consultation/` ディレクトリを既存サイトに配置
2. 必要に応じて `config.js` を追加して設定上書き
3. サイト公開後、LINEリッチメニュー遷移先を `/consultation/` に設定
4. 本番でフォーム送信 → スプレッドシート記録 → TimeRex遷移の動作確認

## Google Apps Script サンプル

以下は JSON POST を受け取り、スプレッドシートに追記する最小例です。

```javascript
const SHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'consultation';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    sheet.appendRow([
      new Date(),
      data.submittedAt || '',
      data.businessType || '',
      data.industry || '',
      data.monthlySales || '',
      data.employeeCount || '',
      (data.concerns || []).join(' / '),
      data.consultationGoal || '',
      data.consultationStyle || '',
      data.notes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 補足
- Webアプリとしてデプロイし、アクセス権を適切に設定してください。
- フロント側からの `fetch` を使うため、必要に応じてCORSポリシーを確認してください。
