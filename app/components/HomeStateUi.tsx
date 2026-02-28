import React from "react";

type HomeState = "loading" | "ready" | "error";

interface HomeStateUiProps {
  state: HomeState;
}

const HomeStateUi: React.FC<HomeStateUiProps> = ({ state }) => {
  switch (state) {
    case "loading":
      return <div>読み込み中です…⏳</div>;
    case "ready":
      return <div>ようこそ！✨ ホーム画面へようこそ！</div>;
    case "error":
      return <div>エラーが発生しました。もう一度お試しください ⚠️</div>;
    default:
      return <div>不明な状態です…💭</div>;
  }
};

export default HomeStateUi;
