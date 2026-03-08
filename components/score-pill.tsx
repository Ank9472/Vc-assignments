export function ScorePill({ score }: { score: number }) {
  let tone = "score-low";
  if (score >= 75) {
    tone = "score-high";
  } else if (score >= 50) {
    tone = "score-mid";
  }

  return <span className={`score-pill ${tone}`}>{score}/100</span>;
}
