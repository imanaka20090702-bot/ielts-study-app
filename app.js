const readingDataStore = {
  curriculum: {
    levels: [
      { name: "初級", threshold: 0, practice: ["短文の主旨把握", "基本語彙確認"] },
      { name: "中級", threshold: 40, practice: ["段落マッチング", "パラフレーズ判定"] },
      { name: "上級", threshold: 75, practice: ["学術長文読解", "複合問題演習"] }
    ]
  },
  vocabulary: [
    { word: "mitigate", meaning: "和らげる", example: "Green roofs mitigate heat in urban areas.", mastery: 2 },
    { word: "disparity", meaning: "格差", example: "The report highlighted income disparity.", mastery: 3 },
    { word: "allocate", meaning: "割り当てる", example: "Governments allocate funds to education.", mastery: 2 }
  ],
  speedTraining: { durationSec: 60, startedAt: null, elapsedSec: 60 },
  skills: { skimming: 45, scanning: 60, detailed: 35 },
  weaknesses: {},
  stats: {
    dailyHours: 1.2,
    weeklyHours: 7.8,
    monthlyHours: 28,
    accuracyTrend: [58, 61, 66, 70, 73],
    typePerformance: {
      "True/False/Not Given": 72,
      "Matching Headings": 55,
      "Sentence Completion": 64
    }
  },
  motivation: {
    streakDays: 6,
    badges: ["3日連続学習", "語彙100語到達"],
    goalHours: 8
  }
};

const analysisEngine = {
  getCurrentLevel(achievement) {
    const levels = readingDataStore.curriculum.levels;
    return [...levels].reverse().find((level) => achievement >= level.threshold) ?? levels[0];
  },
  getNextStep(achievement) {
    if (achievement < 40) return "中級へ向けて段落ごとの要点整理を毎日1セット";
    if (achievement < 75) return "上級へ向けて時間制限つき演習を週3回";
    return "上級維持: Full-length模試で安定化";
  },
  getSpeedBalance(wpm, accuracy) {
    if (wpm >= 180 && accuracy >= 80) return "速度・正確性ともに良好です。";
    if (wpm < 150 && accuracy >= 80) return "正確性は高いので、速度を段階的に上げましょう。";
    if (wpm >= 180 && accuracy < 70) return "速度は十分なので、設問根拠の確認で正確性を改善しましょう。";
    return "速度と正確性をバランス良く強化しましょう。";
  },
  predictScore() {
    const trend = readingDataStore.stats.accuracyTrend;
    const recent = trend.slice(-3).reduce((sum, value) => sum + value, 0) / 3;
    return Math.min(9, Math.max(4, (recent / 10).toFixed(1)));
  },
  recommendWeaknessCourse() {
    const entries = Object.entries(readingDataStore.weaknesses);
    if (entries.length === 0) return "弱点データを追加すると推奨コースを表示します。";
    const [type] = entries.sort((a, b) => b[1] - a[1])[0];
    return `弱点集中コース: ${type}を3日連続で演習`;
  }
};

let cardIndex = 0;
let cardFlipped = false;
let timer = null;

function renderCurriculum() {
  const achievement = Number(document.getElementById("achievement").value);
  const level = analysisEngine.getCurrentLevel(achievement);
  document.getElementById("current-level").textContent = level.name;
  document.getElementById("next-step").textContent = analysisEngine.getNextStep(achievement);
  document.getElementById("level-practice").innerHTML = level.practice.map((item) => `<li>${item}</li>`).join("");
}

function renderFlashcard() {
  const card = readingDataStore.vocabulary[cardIndex];
  document.getElementById("flashcard-word").textContent = card.word;
  document.getElementById("flashcard-detail").textContent = cardFlipped
    ? `${card.meaning} / ${card.example}`
    : "タップして意味と例文を確認";
  document.getElementById("mastery").value = card.mastery;
  document.getElementById("mastery-status").textContent = `現在習熟度: ${card.mastery}/5`;
}

function renderSkills() {
  const skillProgress = document.getElementById("skill-progress");
  skillProgress.innerHTML = Object.entries(readingDataStore.skills)
    .map(
      ([name, value]) =>
        `<div><strong>${name}</strong> ${value}%<div class="progress"><span style="width:${value}%"></span></div></div>`
    )
    .join("");
}

function renderWeaknesses() {
  const list = document.getElementById("mistake-list");
  const items = Object.entries(readingDataStore.weaknesses).map(([type, count]) => `<li>${type}: ${count}回</li>`);
  list.innerHTML = items.join("") || "<li>まだ記録がありません</li>";
  document.getElementById("weakness-course").textContent = analysisEngine.recommendWeaknessCourse();
}

function renderStats() {
  const stats = readingDataStore.stats;
  document.getElementById("study-time").textContent = `学習時間: 日別 ${stats.dailyHours}h / 週別 ${stats.weeklyHours}h / 月別 ${stats.monthlyHours}h`;

  const accuracyGraph = document.getElementById("accuracy-graph");
  accuracyGraph.innerHTML = stats.accuracyTrend
    .map((value, index) => `<div class="bar">Week ${index + 1}: ${value}%</div>`)
    .join("");

  const entries = Object.entries(stats.typePerformance).sort((a, b) => b[1] - a[1]);
  document.getElementById("strength-weakness").textContent = `得意: ${entries[0][0]} / 不得意: ${entries[entries.length - 1][0]}`;
  document.getElementById("score-prediction").textContent = `予測スコア: Band ${analysisEngine.predictScore()}`;
}

function renderMotivation() {
  const motivation = readingDataStore.motivation;
  document.getElementById("streak").textContent = `連続学習日数: ${motivation.streakDays}日`;
  document.getElementById("badges").textContent = `達成バッジ: ${motivation.badges.join(" / ")}`;
  document.getElementById("goal-status").textContent = `目標: 週${motivation.goalHours}時間`;

  const weekly = readingDataStore.stats.weeklyHours;
  const remaining = Math.max(0, motivation.goalHours - weekly).toFixed(1);
  document.getElementById("schedule").textContent =
    remaining === "0.0"
      ? "今週の目標達成！復習中心の軽めスケジュールを推奨。"
      : `推奨スケジュール: 残り${remaining}時間を3日で分割して学習`;
}

function setupEvents() {
  document.getElementById("achievement").addEventListener("input", renderCurriculum);

  document.getElementById("flip-card").addEventListener("click", () => {
    cardFlipped = !cardFlipped;
    renderFlashcard();
  });

  document.getElementById("next-card").addEventListener("click", () => {
    cardIndex = (cardIndex + 1) % readingDataStore.vocabulary.length;
    cardFlipped = false;
    renderFlashcard();
  });

  document.getElementById("save-mastery").addEventListener("click", () => {
    const mastery = Math.min(5, Math.max(1, Number(document.getElementById("mastery").value) || 1));
    readingDataStore.vocabulary[cardIndex].mastery = mastery;
    renderFlashcard();
  });

  document.getElementById("start-speed").addEventListener("click", () => {
    clearInterval(timer);
    readingDataStore.speedTraining.startedAt = Date.now();
    let timeLeft = readingDataStore.speedTraining.durationSec;
    document.getElementById("time-left").textContent = String(timeLeft);

    timer = setInterval(() => {
      timeLeft -= 1;
      document.getElementById("time-left").textContent = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        clearInterval(timer);
        readingDataStore.speedTraining.elapsedSec = readingDataStore.speedTraining.durationSec;
      }
    }, 1000);
  });

  document.getElementById("calculate-speed").addEventListener("click", () => {
    const passage = document.getElementById("reading-passage").textContent || "";
    const words = passage.trim().split(/\s+/).filter(Boolean).length;
    const startedAt = readingDataStore.speedTraining.startedAt;
    const elapsedSec = startedAt
      ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
      : readingDataStore.speedTraining.elapsedSec;
    const wpm = Math.round((words / elapsedSec) * 60);

    const correct = Number(document.getElementById("correct-answers").value);
    const accuracy = Math.round((correct / 5) * 100);

    document.getElementById("wpm-result").textContent = `WPM: ${wpm}（${elapsedSec}秒）`;
    document.getElementById("balance-result").textContent = `速度vs正確性: ${analysisEngine.getSpeedBalance(wpm, accuracy)} 正答率${accuracy}%`;
    document.getElementById("speed-plan").textContent = `次回目標: 今回より+10 WPMを目指す`;
  });

  document.getElementById("add-mistake").addEventListener("click", () => {
    const type = document.getElementById("mistake-type").value;
    readingDataStore.weaknesses[type] = (readingDataStore.weaknesses[type] || 0) + 1;
    renderWeaknesses();
  });

  document.querySelectorAll("[data-test]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.getAttribute("data-test");
      const config = {
        mini: { max: 10, label: "ミニテスト" },
        section: { max: 40, label: "セクション別テスト" },
        full: { max: 40, label: "Full-length模試" }
      }[type];
      const score = Math.floor(Math.random() * (config.max - 5)) + 5;
      const feedback = score / config.max >= 0.7 ? "良いペースです" : "復習して再チャレンジしましょう";
      document.getElementById("test-feedback").textContent = `${config.label}: ${score}/${config.max} - ${feedback}`;
    });
  });

  document.getElementById("set-goal").addEventListener("click", () => {
    const goal = Math.max(1, Number(document.getElementById("goal-hours").value) || 1);
    readingDataStore.motivation.goalHours = goal;
    renderMotivation();
  });
}

function init() {
  renderCurriculum();
  renderFlashcard();
  renderSkills();
  renderWeaknesses();
  renderStats();
  renderMotivation();
  setupEvents();
}

init();
