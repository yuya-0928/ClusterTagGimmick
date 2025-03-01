# ClusterTagGimmickDev

VRChat向けのギミックを開発するためのTypeScriptスクリプト群です。

## 必要条件

- [Bun](https://bun.sh) 1.0.0以上

## セットアップ

1. このディレクトリで依存関係をインストールします：

```bash
bun install
```

2. ビルドプロセスを実行します：

```bash
bun run build.ts
```

ビルドプロセスでは以下の処理が行われます：

1. `../Assets/Scripts` ディレクトリ内の既存の `.js` ファイルを削除
2. `./scripts` ディレクトリ内のすべてのファイルをビルド
3. ビルド結果を `../Assets/Scripts` ディレクトリに出力

## 開発

このプロジェクトは[Biome](https://biomejs.dev/)を使用してコードの品質管理を行っています。

### リンター・フォーマッターの実行

```bash
bunx biome check .  # コードチェック
bunx biome format . # コードフォーマット
```

## ディレクトリ構成

- `scripts/` - TypeScriptのソースコード
- `build.ts` - ビルドスクリプト
