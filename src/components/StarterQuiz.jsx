import { useState, useMemo } from "react";
import { getLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { getStartersForTrait } from "../lib/moves";
import PokeTypeBadge from "./PokeTypeBadge";
import { addTeamMember, saveProfile } from "../lib/auth";

const QUESTIONS = [
  {
    text: { en: "You're walking through a dark forest. A strange noise echoes from the trees. What do you do?", ja: "暗い森を歩いている。木々から不思議な音が響いてくる。どうする？" },
    answers: [
      { text: { en: "Charge toward the noise to investigate", ja: "音の方に向かって走り出す" }, trait: "brave" },
      { text: { en: "Wait quietly and listen carefully", ja: "静かに待って注意深く聞く" }, trait: "clever" },
      { text: { en: "Climb a tree to get a better view", ja: "木に登って様子を見る" }, trait: "quick" },
      { text: { en: "Find a sturdy stick and stand your ground", ja: "丈夫な枝を見つけてその場に構える" }, trait: "tough" },
      { text: { en: "Call out gently to see if anyone needs help", ja: "誰か助けてほしいっていないか優しく声をかける" }, trait: "gentle" },
    ],
  },
  {
    text: { en: "A wild Pidgey is caught in a thorny bush, struggling. What do you do?", ja: "野生のポッポがトゲのある茂みに絡まってもがいている。どうする？" },
    answers: [
      { text: { en: "Rush in and pull it free without hesitation", ja: "迷わずに突っ込んで引っ張り出す" }, trait: "brave" },
      { text: { en: "Carefully cut the thorns away one by one", ja: "丁寧にトゲを一本ずつ切りながら助ける" }, trait: "gentle" },
      { text: { en: "Look for the safest way to free it quickly", ja: "最も安全で速い方法を考える" }, trait: "clever" },
      { text: { en: "Grab it firmly and pull hard", ja: "しっかり掴んで力いっぱい引く" }, trait: "tough" },
      { text: { en: "Sprint to find help from someone experienced", ja: "経験者を頼りに素早く走り出す" }, trait: "quick" },
    ],
  },
  {
    text: { en: "You find a mysterious orb glowing on the ground. What's your first instinct?", ja: "地面に謎の輝くオーブを見つけた。第一の直感は？" },
    answers: [
      { text: { en: "Pick it up immediately — finders keepers!", ja: "すぐに拾う — 見つけた物は自分の物！" }, trait: "brave" },
      { text: { en: "Observe it from a distance first", ja: "距離を保ってまず観察する" }, trait: "clever" },
      { text: { en: "Roll it with a stick to see what happens", ja: "棒で転がして何が起きるか確認する" }, trait: "tough" },
      { text: { en: "Try to sense if it has good energy", ja: "いいエネルギーを持っていないか感じる" }, trait: "gentle" },
      { text: { en: "Grab it and run before someone else does", ja: "誰かに取られる前にgrabって走る" }, trait: "quick" },
    ],
  },
  {
    text: { en: "Your team is split on which path to take. The left is dark and dangerous, the right is long but safe. What do you suggest?", ja: "チームが分かれた。左は暗くて危ない、右は遠いけど安全。どう提案する？" },
    answers: [
      { text: { en: "Take the left — fortune favors the bold", ja: "左へ — 運は冒険者に味方する" }, trait: "brave" },
      { text: { en: "Go right — everyone needs to get home safe", ja: "右へ — 全員が無事に帰ることが大事" }, trait: "gentle" },
      { text: { en: "Look for a hidden third option", ja: "隠された第三の選択肢を探す" }, trait: "clever" },
      { text: { en: "Volunteer to scout the left alone", ja: "一人で左を偵察する" }, trait: "quick" },
      { text: { en: "Take the left and power through whatever comes", ja: "左へ向かって何が来ても力で乗り切る" }, trait: "tough" },
    ],
  },
  {
    text: { en: "A Magikarp is flopping helplessly on dry land. What do you do?", ja: "ヒンバスが乾いた地面で helplessに跳ねている。どうする？" },
    answers: [
      { text: { en: "Pick it up and carry it to water as fast as possible", ja: "素早く持ち上げて水まで運ぶ" }, trait: "quick" },
      { text: { en: "Gently scoop it up and cradle it to the water", ja: "優しくすくい上げてそっと水に返す" }, trait: "gentle" },
      { text: { en: "Roll it toward the water — it can handle it", ja: "水の方に転がす — たまられるだろ" }, trait: "tough" },
      { text: { en: "Check if the water source is safe first", ja: "まず水源が安全か確認する" }, trait: "clever" },
      { text: { en: "Dive in headfirst to bring water back to it", ja: "頭から突っ込んで水を持ってくる" }, trait: "brave" },
    ],
  },
  {
    text: { en: "You discover an abandoned camp with supplies still inside. What do you think?", ja: "放棄されたキャンプと中の物資を発見した。どう思う？" },
    answers: [
      { text: { en: "We should set up camp here — perfect spot!", ja: "ここでキャンプを張ろう — 最高の場所！" }, trait: "brave" },
      { text: { en: "Whoever left this might come back for it", ja: "ここを出了た人が戻ってくるかもしれない" }, trait: "gentle" },
      { text: { en: "Check if anything is booby-trapped first", ja: "まず罠がないか確認する" }, trait: "clever" },
      { text: { en: "We don't need handouts, let's keep moving", ja: "物乞いはしない、前行こう" }, trait: "tough" },
      { text: { en: "Quickly take what we need and move on", ja: "必要な物を素早く取って先へ進む" }, trait: "quick" },
    ],
  },
  {
    text: { en: "A storm is approaching. You see a cave and a sturdy tree. Where do you shelter?", ja: "嵐が近づいている。洞窟と丈夫な木が見える。どこで避難する？" },
    answers: [
      { text: { en: "The cave — explore it while waiting out the storm", ja: "洞窟 — 嵐を待つ間に探索しよう" }, trait: "brave" },
      { text: { en: "The tree — make a shelter for everyone", ja: "木 — 全員の為にシェルターを作ろう" }, trait: "gentle" },
      { text: { en: "The cave — but check deep inside for dangers first", ja: "洞窟 — まず奥に危険がないか確認" }, trait: "clever" },
      { text: { en: "The tree — I can weather any storm", ja: "木 — どんな嵐でも耐えられる" }, trait: "tough" },
      { text: { en: "Sprint to whichever is closer", ja: "より近い方に全力で走る" }, trait: "quick" },
    ],
  },
  {
    text: { en: "You find a baby Pokémon crying alone. It looks scared of you. What do you do?", ja: "一人で泣いている子ポケモンを見つけた。あなたを見て怯えている。どうする？" },
    answers: [
      { text: { en: "Sit nearby and wait for it to come to you", ja: "近くに座ってこちらに来るのを待つ" }, trait: "gentle" },
      { text: { en: "Offer food from your bag gently", ja: "バッグから食べ物を優しく差し出す" }, trait: "gentle" },
      { text: { en: "Look around for its parents", ja: "お父母を探して周りを見回す" }, trait: "clever" },
      { text: { en: "Pick it up — it needs to come with us", ja: "抱き上げる — 一緒に来てもらう" }, trait: "brave" },
      { text: { en: "Stay alert — its parents might be dangerous", ja: "警戒する — 親が危ないかもしれない" }, trait: "tough" },
    ],
  },
  {
    text: { en: "You're racing against time to reach a destination. A river blocks your path. What do you do?", ja: "目的地に急いでいる。川が道を塞いでいる。どうする？" },
    answers: [
      { text: { en: "Dive in and swim across immediately", ja: "即座に飛び込んで泳ぎ切る" }, trait: "brave" },
      { text: { en: "Find the shallowest point and cross carefully", ja: "最も浅い場所を探して慎重に渡る" }, trait: "clever" },
      { text: { en: "Run along the bank at full speed looking for a bridge", ja: "橋を探すため岸を全力で走る" }, trait: "quick" },
      { text: { en: "Wade through — no river stops me", ja: "趟ぎ渡る — どんな川も止まれない" }, trait: "tough" },
      { text: { en: "Call out to see if any Water Pokémon can help", ja: "水ポケモンに協力を頼んでみる" }, trait: "gentle" },
    ],
  },
  {
    text: { en: "You reach the end of the dungeon. A powerful Pokémon blocks the exit. It looks angry but tired. What's your approach?", ja: "ダンジョンの終わりに到着した。強いポケモンが出口を塞いでいる。怒っているが疲れている。どうする？" },
    answers: [
      { text: { en: "Challenge it head-on — this is what I trained for", ja: "正面から挑む — これが修行の成果を見せる時" }, trait: "brave" },
      { text: { en: "Try to talk it down and find a peaceful solution", ja: "落ち着かせて平和的な解決策を探す" }, trait: "gentle" },
      { text: { en: "Look for another way around it", ja: "迂回路がないか探す" }, trait: "clever" },
      { text: { en: "Outlast it — it's tired, I just need to hold on", ja: "持久戦に持ち込む — 相手は疲れている" }, trait: "tough" },
      { text: { en: "Dash past it before it can react", ja: "反応する前に素早く通り抜ける" }, trait: "quick" },
    ],
  },
];

function calcTrait(answers) {
  const counts = { brave: 0, gentle: 0, quick: 0, tough: 0, clever: 0 };
  for (const a of answers) {
    counts[a] = (counts[a] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export default function StarterQuiz({ accountId, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [trait, setTrait] = useState(null);
  const [starters, setStarters] = useState([]);
  const [rerollsLeft, setRerollsLeft] = useState(1);
  const [saving, setSaving] = useState(false);
  const language = getLanguage();

  const question = QUESTIONS[step];

  function handleAnswer(answerTrait) {
    const newAnswers = [...answers, answerTrait];
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const result = trait || calcTrait(newAnswers);
      setTrait(result);
      setStarters(getStartersForTrait(result));
    }
  }

  function handleReroll() {
    if (rerollsLeft <= 0) return;
    setRerollsLeft(rerollsLeft - 1);
    setStarters(getStartersForTrait(trait));
  }

  async function handlePickStarter(starter) {
    setSaving(true);
    try {
      await saveProfile(accountId, {
        quiz_result: trait,
        starter_id: starter.pokemonId,
      });

      const baseHp = 20 + starter.pokemonId % 10;
      await addTeamMember(accountId, {
        pokemon_id: starter.pokemonId,
        nickname: starter.name,
        level: 5,
        hp: baseHp,
        max_hp: baseHp,
        moves: starter.moves,
        slot: 0,
        is_starter: true,
      });

      onComplete(trait, starter.pokemonId);
    } catch (err) {
      console.error("Failed to save starter:", err);
    } finally {
      setSaving(false);
    }
  }

  // Quiz phase
  if (!trait) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500">
              {t("Question", language)} {step + 1} / {QUESTIONS.length}
            </p>
            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-200 text-center leading-relaxed">
            {question.text[language] || question.text.en}
          </p>

          <div className="space-y-2">
            {question.answers.map((ans, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(ans.trait)}
                className="w-full text-left rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/60 hover:border-slate-500 transition-colors"
              >
                {ans.text[language] || ans.text.en}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Starter selection phase
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-slate-200">
            {t("Your personality type", language)}: {t(trait, language)}
          </h2>
          <p className="text-sm text-slate-400">
            {t("Choose your partner Pokémon!", language)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {starters.map((s) => (
            <button
              key={s.pokemonId}
              onClick={() => handlePickStarter(s)}
              disabled={saving}
              className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4 hover:bg-slate-700/60 hover:border-yellow-500 transition-all disabled:opacity-50"
            >
              <img
                src={`${SPRITE_URL}/${s.pokemonId}.png`}
                alt={s.name}
                className="w-16 h-16"
              />
              <div className="text-left">
                <p className="font-semibold text-slate-200">{s.name}</p>
                <div className="flex gap-1">
                  {s.types.map((type) => (
                    <PokeTypeBadge key={type} type={type} language={language} />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {rerollsLeft > 0 && (
          <button
            onClick={handleReroll}
            disabled={saving}
            className="w-full rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/40 transition-colors disabled:opacity-50"
          >
            {t("Reroll", language)} ({rerollsLeft})
          </button>
        )}

        {saving && (
          <p className="text-center text-xs text-slate-400">{t("Saving...", language)}</p>
        )}
      </div>
    </div>
  );
}
