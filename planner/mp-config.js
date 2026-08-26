// ★ Match Planner 設定ファイル ★
// firebaseSecret は各端末の「設定」画面から入力してください（このファイルには書かない）

const MP_CONFIG = {
  clubName:       'ALASERIO',
  clubId:         'alaserio',
  firebaseUrl:    'https://hp-1-d7bce-default-rtdb.asia-southeast1.firebasedatabase.app',
  firebaseApiKey: '',  // Firebase の Web APIキー（クラブ別ログインに必要・コンソールで確認して記入）
  firebaseSecret: '',  // 旧方式の管理者キー用（通常は空欄のまま）

  stats: { enabled: true },  // プレミアム: 大会マスター・クラブスタッツ（大会別/カテゴリー別集計・得点/アシストランキング）
};
