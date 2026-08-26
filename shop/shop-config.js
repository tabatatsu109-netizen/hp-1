// ★ アイテムショップ設定ファイル（クラブごとに書き換える）★
// 管理者キー（Firebaseシークレット）はこのファイルに書かない。
// 管理者ページのログイン画面で入力 → 端末のLocalStorageに保存される。

var SHOP_CONFIG = {
  clubName:     'ALASERIO',
  clubNameFull: 'FC ALASERIO',
  clubId:       'alaserio',            // HP・Plannerと同じID
  firebaseUrl:  'https://hp-1-d7bce-default-rtdb.asia-southeast1.firebasedatabase.app',

  // カラー（HPのカラー: オレンジ #f77f00 × ネイビー #141f47 × グリーン #009a44）
  colors: {
    primary:     '#f77f00',  // メイン（ボタン・価格）
    primaryDark: '#c96700',  // メイン濃いめ（サブボタン）
    deep:        '#141f47',  // 最も濃い（ヘッダー・フッター背景 = クラブネイビー）
    accent:      '#009a44',  // アクセント（縁取り・強調 = クラブグリーン）
    bg:          '#f7f4ef'   // 薄い背景
  },

  // 注文フォームの「チーム」選択肢
  teams: ['ジュニアユース（U-15）'],

  // 支払方法の選択肢
  payMethods: ['口座引き落とし（山梨中央銀行）'],

  // 商品カテゴリー（フィルタボタン）
  productCats: ['すべて', 'ユニフォーム', 'トップス', 'ボトムス', 'ソックス', 'バッグ', 'その他'],

  // 受付ルール等のお知らせ帯（商品一覧の上に表示。<br>使用可。不要なら ''）
  notice: '※ 商品リストは仮掲載です。正式な商品・価格はクラブからの案内をお待ちください。',

  // 商品リスト（★仮リスト — クラブから正式な商品・価格が届き次第差し替える）
  // sizes: サイズ展開 / cat: カテゴリー / reqJU: ジュニアユース必需品
  // img: 商品写真のパス（例 'assets/item01.jpg'）。省略時はカテゴリーアイコン表示
  products: [
    { id: 1, name: 'ユニフォーム（ホーム）', brand: '', desc: '公式戦で着用します。', price: 8000, cat: 'ユニフォーム', sizes: ['140','150','160','S','M','L','O'], reqJ: false, reqJU: true },
    { id: 2, name: 'ユニフォーム（アウェイ）', brand: '', desc: '公式戦で着用します。', price: 8000, cat: 'ユニフォーム', sizes: ['140','150','160','S','M','L','O'], reqJ: false, reqJU: true },
    { id: 3, name: 'プラクティスシャツ', brand: '', desc: '練習時に着用します。', price: 4000, cat: 'トップス', sizes: ['140','150','160','S','M','L','O'], reqJ: false, reqJU: false },
    { id: 4, name: 'ゲームパンツ', brand: '', desc: '', price: 4500, cat: 'ボトムス', sizes: ['140','150','160','S','M','L','O'], reqJ: false, reqJU: true },
    { id: 5, name: 'ソックス', brand: '', desc: '', price: 1500, cat: 'ソックス', sizes: ['22-24','25-27'], reqJ: false, reqJU: true }
  ]
};
