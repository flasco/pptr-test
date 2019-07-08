echo "plz watch [readme > Attention] when you first run this instruction"
echo "repo url: https://github.com/flasco/pptr-test#attention"

cd "$(dirname "$0")" # 进入当前目录，允许建立快捷键
git pull
yarn install
yarn start