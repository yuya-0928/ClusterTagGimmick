# Pannelギミックで登場するオブジェクト

- PannelManager（PannelManager.js）
  - ギミックの管理を行うオブジェクト
  - ボタン、Pannelの情報を管理する
- Pannel（SkillsPannel.js）
  - ユーザーの属性を表示するオブジェクト
- Button（PannelSwtich.js）
  - 表示したい属性を選択するオブジェクト

# Pannelギミックの仕組み

主な処理の流れ

1. 全体のギミックの初期化
  - PannelManagerに対して、ボタンが自分のIDを送る
  - PannelManagerに対して、Pannelが自分のIDを送る
  - 最終的に、PannelManagerがすべてのボタン、Pannelの情報を持つ状態になったら初期化完了
2. パネルを装備したら、PannelManagerに対して、パネルのIDとユーザーIDを送る
  - PannelManagerは、どのPannelをどのユーザーが持っているか把握できる状態になる
3. ボタンが押されたら、ボタンからPannelManagerにメッセージを送る
4. ボタンが押されたことをPannelManagerが感知したら、ユーザーと対応するPannelに対して情報をおくる

ギミックの処理の流れについて、図示した画像を同じディレクトリに配置しているので、そちらを参照してください。