import readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const type = process.argv[2] || 'patch'; // デフォルトはpatch

console.log('========================================');
console.log(`🚀 自動リリースツール (Type: ${type})`);
console.log('========================================');

rl.question('\n📝 リリースノート（今回の変更内容）を入力してください:\n> ', (notes) => {
  if (!notes.trim()) {
    console.error('❌ リリースノートが空のため、リリースを中断しました。');
    process.exit(1);
  }

  try {
    console.log(`\n[1/3] バージョンをアップグレードしています...`);
    const newVersion = execSync(`npm version ${type}`).toString().trim();

    console.log(`\n[2/3] GitHubにコードとタグを送信しています...`);
    execSync(`git push`);
    execSync(`git push --tags`);

    console.log(`\n[3/3] GitHub Releases（履歴ページ）を作成しています...`);
    // gh CLIを使ってリリースを作成
    execSync(`gh release create ${newVersion} --title "${newVersion}" --notes "${notes}"`);

    console.log(`\n✅ 完璧です！ ${newVersion} のリリース作業が全て完了しました。`);
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.log('※GitHub CLI (gh) がインストールされ、ログインされているか確認してください。');
  } finally {
    rl.close();
  }
});
