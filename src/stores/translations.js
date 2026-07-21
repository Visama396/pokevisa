export const typeNames = {
  normal: { en: "Normal", es: "Normal", fr: "Normal", de: "Normal", it: "Normale", ja: "ノーマル", ko: "노말", "zh-hans": "一般", "zh-hant": "一般" },
  fire: { en: "Fire", es: "Fuego", fr: "Feu", de: "Feuer", it: "Fuoco", ja: "ほのお", ko: "불꽃", "zh-hans": "火", "zh-hant": "火" },
  water: { en: "Water", es: "Agua", fr: "Eau", de: "Wasser", it: "Acqua", ja: "みず", ko: "물", "zh-hans": "水", "zh-hant": "水" },
  electric: { en: "Electric", es: "Eléctrico", fr: "Électrik", de: "Elektro", it: "Elettro", ja: "でんき", ko: "전기", "zh-hans": "电", "zh-hant": "電" },
  grass: { en: "Grass", es: "Planta", fr: "Plante", de: "Pflanze", it: "Erba", ja: "くさ", ko: "풀", "zh-hans": "草", "zh-hant": "草" },
  ice: { en: "Ice", es: "Hielo", fr: "Glace", de: "Eis", it: "Ghiaccio", ja: "こおり", ko: "얼음", "zh-hans": "冰", "zh-hant": "冰" },
  fighting: { en: "Fighting", es: "Lucha", fr: "Combat", de: "Kampf", it: "Lotta", ja: "かくとう", ko: "격투", "zh-hans": "格斗", "zh-hant": "格鬥" },
  poison: { en: "Poison", es: "Veneno", fr: "Poison", de: "Gift", it: "Veleno", ja: "どく", ko: "독", "zh-hans": "毒", "zh-hant": "毒" },
  ground: { en: "Ground", es: "Tierra", fr: "Sol", de: "Boden", it: "Terra", ja: "じめん", ko: "땅", "zh-hans": "地面", "zh-hant": "地面" },
  flying: { en: "Flying", es: "Volador", fr: "Vol", de: "Flug", it: "Volante", ja: "ひこう", ko: "비행", "zh-hans": "飞行", "zh-hant": "飛行" },
  psychic: { en: "Psychic", es: "Psíquico", fr: "Psy", de: "Psycho", it: "Psico", ja: "エスパー", ko: "에스퍼", "zh-hans": "超能力", "zh-hant": "超能力" },
  bug: { en: "Bug", es: "Bicho", fr: "Insecte", de: "Käfer", it: "Coleottero", ja: "むし", ko: "벌레", "zh-hans": "虫", "zh-hant": "蟲" },
  rock: { en: "Rock", es: "Roca", fr: "Roche", de: "Gestein", it: "Roccia", ja: "いわ", ko: "바위", "zh-hans": "岩石", "zh-hant": "岩石" },
  ghost: { en: "Ghost", es: "Fantasma", fr: "Spectre", de: "Geist", it: "Spettro", ja: "ゴースト", ko: "고스트", "zh-hans": "幽灵", "zh-hant": "幽靈" },
  dragon: { en: "Dragon", es: "Dragón", fr: "Dragon", de: "Drachen", it: "Drago", ja: "ドラゴン", ko: "드래곤", "zh-hans": "龙", "zh-hant": "龍" },
  dark: { en: "Dark", es: "Siniestro", fr: "Ténèbres", de: "Unlicht", it: "Buio", ja: "あく", ko: "악", "zh-hans": "恶", "zh-hant": "惡" },
  steel: { en: "Steel", es: "Acero", fr: "Acier", de: "Stahl", it: "Acciaio", ja: "はがね", ko: "강철", "zh-hans": "钢", "zh-hant": "鋼" },
  fairy: { en: "Fairy", es: "Hada", fr: "Fée", de: "Fee", it: "Folletto", ja: "フェアリー", ko: "페어리", "zh-hans": "妖精", "zh-hant": "妖精" },
};

export function getTypeName(type, language) {
  return typeNames[type]?.[language] || typeNames[type]?.en || type;
}

export const statLabels = {
  hp: { en: "HP", es: "PS", fr: "PV", de: "KP", it: "PS", ja: "HP", ko: "HP", "zh-hans": "HP", "zh-hant": "HP" },
  attack: { en: "Attack", es: "Ataque", fr: "Attaque", de: "Angriff", it: "Attacco", ja: "こうげき", ko: "공격", "zh-hans": "攻击", "zh-hant": "攻擊" },
  defense: { en: "Defense", es: "Defensa", fr: "Défense", de: "Verteidigung", it: "Difesa", ja: "ぼうぎょ", ko: "방어", "zh-hans": "防御", "zh-hant": "防禦" },
  "special-attack": { en: "Sp. Atk", es: "At. Esp.", fr: "Att. Spéc.", de: "Sp.-Ang.", it: "Att. Sp.", ja: "とくこう", ko: "특수공격", "zh-hans": "特攻", "zh-hant": "特攻" },
  "special-defense": { en: "Sp. Def", es: "Def. Esp.", fr: "Déf. Spéc.", de: "Sp.-Vert.", it: "Dif. Sp.", ja: "とくぼう", ko: "특수방어", "zh-hans": "特防", "zh-hant": "特防" },
  speed: { en: "Speed", es: "Velocidad", fr: "Vitesse", de: "Initiative", it: "Velocità", ja: "すばやさ", ko: "스피드", "zh-hans": "速度", "zh-hant": "速度" },
};

export function getStatLabel(stat, language) {
  return statLabels[stat]?.[language] || statLabels[stat]?.en || stat;
}

const ui = {
  "Home": {
    en: "Home", es: "Inicio", fr: "Accueil", de: "Start", it: "Home",
    ja: "ホーム", ko: "홈", "zh-hans": "首页", "zh-hant": "首頁",
  },
  "Back to Pokédex": {
    en: "Back to Pokédex", es: "Volver a la Pokédex", fr: "Retour au Pokédex", de: "Zurück zum Pokédex", it: "Torna al Pokédex",
    ja: "ポケモン図鑑に戻る", ko: "포켓몬도감으로 돌아가기", "zh-hans": "返回图鉴", "zh-hant": "返回圖鑑",
  },
  "Previous": {
    en: "Previous", es: "Anterior", fr: "Précédent", de: "Vorherige", it: "Precedente",
    ja: "前へ", ko: "이전", "zh-hans": "上一个", "zh-hant": "上一個",
  },
  "Next": {
    en: "Next", es: "Siguiente", fr: "Suivant", de: "Nächste", it: "Successivo",
    ja: "次へ", ko: "다음", "zh-hans": "下一个", "zh-hant": "下一個",
  },
  "Pokédex": {
    en: "Pokédex", es: "Pokédex", fr: "Pokédex", de: "Pokédex", it: "Pokédex",
    ja: "ポケモン図鑑", ko: "포켓몬도감", "zh-hans": "宝可梦图鉴", "zh-hant": "寶可夢圖鑑",
  },
  "National №": {
    en: "National №", es: "N° Nacional", fr: "N° National", de: "National-Nr.", it: "N. Nazionale",
    ja: "全国No.", ko: "전국번호", "zh-hans": "全国编号", "zh-hant": "全國編號",
  },
  "Species": {
    en: "Species", es: "Especie", fr: "Espèce", de: "Art", it: "Specie",
    ja: "たね", ko: "종", "zh-hans": "种类", "zh-hant": "種類",
  },
  "Height": {
    en: "Height", es: "Altura", fr: "Taille", de: "Größe", it: "Altezza",
    ja: "たかさ", ko: "키", "zh-hans": "身高", "zh-hant": "身高",
  },
  "Weight": {
    en: "Weight", es: "Peso", fr: "Poids", de: "Gewicht", it: "Peso",
    ja: "おもさ", ko: "몸무게", "zh-hans": "体重", "zh-hant": "體重",
  },
  "Abilities": {
    en: "Abilities", es: "Habilidades", fr: "Talents", de: "Fähigkeiten", it: "Abilità",
    ja: "とくせい", ko: "특성", "zh-hans": "特性", "zh-hant": "特性",
  },
  "Hidden": {
    en: "Hidden", es: "Oculta", fr: "Cachée", de: "Versteckt", it: "Nascosta",
    ja: "隠れ", ko: "숨김", "zh-hans": "隐藏", "zh-hant": "隱藏",
  },
  "Local Entries": {
    en: "Local Entries", es: "Entradas Locales", fr: "Entrées Locales", de: "Lokale Einträge", it: "Voci Locali",
    ja: "地域図鑑番号", ko: "지역 도감 번호", "zh-hans": "地区图鉴编号", "zh-hant": "地區圖鑑編號",
  },
  "Training": {
    en: "Training", es: "Entrenamiento", fr: "Entraînement", de: "Training", it: "Allenamento",
    ja: "育て方", ko: "트레이닝", "zh-hans": "培养", "zh-hant": "培養",
  },
  "EV Yield": {
    en: "EV Yield", es: "Esfuerzo", fr: "EV", de: "FP-Ausschüttung", it: "Sforzo",
    ja: "努力値", ko: "노력치", "zh-hans": "努力值", "zh-hant": "努力值",
  },
  "Catch Rate": {
    en: "Catch Rate", es: "Captura", fr: "Taux de Capture", de: "Fangrate", it: "Tasso di Cattura",
    ja: "捕まえやすさ", ko: "포획률", "zh-hans": "捕获率", "zh-hant": "捕獲率",
  },
  "Base Friendship": {
    en: "Base Friendship", es: "Amistad Base", fr: "Amitié de Base", de: "Basis-Freundschaft", it: "Amicizia Base",
    ja: "初期なつき度", ko: "기초 친밀도", "zh-hans": "初始亲密度", "zh-hant": "初始親密度",
  },
  "Base Exp.": {
    en: "Base Exp.", es: "Exp. Base", fr: "Exp. Base", de: "Basis-EP", it: "Esp. Base",
    ja: "基礎経験値", ko: "기초 경험치", "zh-hans": "基础经验", "zh-hant": "基礎經驗",
  },
  "Growth Rate": {
    en: "Growth Rate", es: "Ritmo de Crecimiento", fr: "Type d'Exp.", de: "Wachstumsrate", it: "Velocità di Crescita",
    ja: "経験値タイプ", ko: "경험치 타입", "zh-hans": "成长率", "zh-hant": "成長率",
  },
  "Breeding": {
    en: "Breeding", es: "Cría", fr: "Reproduction", de: "Zucht", it: "Allevamento",
    ja: "タマゴ", ko: "알", "zh-hans": "培育", "zh-hant": "培育",
  },
  "Egg Groups": {
    en: "Egg Groups", es: "Grupos Huevo", fr: "Groupes d'Œuf", de: "Ei-Gruppen", it: "Gruppi Uovo",
    ja: "タマゴグループ", ko: "알 그룹", "zh-hans": "蛋群", "zh-hant": "蛋群",
  },
  "Gender": {
    en: "Gender", es: "Género", fr: "Sexe", de: "Geschlecht", it: "Sesso",
    ja: "せいべつ", ko: "성별", "zh-hans": "性别", "zh-hant": "性別",
  },
  "Genderless": {
    en: "Genderless", es: "Sin género", fr: "Asexué", de: "Geschlechtslos", it: "Asessuato",
    ja: "ふめい", ko: "성별 없음", "zh-hans": "无性别", "zh-hant": "無性別",
  },
  "Egg Cycles": {
    en: "Egg Cycles", es: "Pasos Eclosión", fr: "Cycles d'Éclosion", de: "Ei-Zyklen", it: "Passi per Schiudere",
    ja: "タマゴサイクル", ko: "알 사이클", "zh-hans": "孵化周期", "zh-hant": "孵化週期",
  },
  "Base Stats": {
    en: "Base Stats", es: "Estadísticas Base", fr: "Stats de Base", de: "Basiswerte", it: "Statistiche Base",
    ja: "種族値", ko: "종족값", "zh-hans": "种族值", "zh-hant": "種族值",
  },
  "Total": {
    en: "Total", es: "Total", fr: "Total", de: "Gesamt", it: "Totale",
    ja: "合計", ko: "합계", "zh-hans": "总计", "zh-hant": "總計",
  },
  "Type Effectiveness": {
    en: "Type Effectiveness", es: "Efectividad de Tipos", fr: "Efficacité des Types", de: "Typeneffektivität", it: "Efficacia dei Tipi",
    ja: "タイプ相性", ko: "타입 상성", "zh-hans": "属性相性", "zh-hant": "屬性相性",
  },
  "Evolution Chart": {
    en: "Evolution Chart", es: "Evoluciones", fr: "Évolutions", de: "Entwicklungen", it: "Evoluzioni",
    ja: "進化", ko: "진화", "zh-hans": "进化链", "zh-hant": "進化鏈",
  },
  "Stage": {
    en: "Stage", es: "Fase", fr: "Stade", de: "Stufe", it: "Fase",
    ja: "段階", ko: "단계", "zh-hans": "阶段", "zh-hant": "階段",
  },
  "Moves by Level": {
    en: "Moves by Level", es: "Movimientos por Nivel", fr: "Capacités par Niveau", de: "Attacken durch Level", it: "Mosse per Livello",
    ja: "レベル技", ko: "레벨업 기술", "zh-hans": "升级招式", "zh-hant": "升級招式",
  },
  "Lv.": {
    en: "Lv.", es: "Nv.", fr: "Niv.", de: "Lv.", it: "Lv.",
    ja: "Lv.", ko: "Lv.", "zh-hans": "Lv.", "zh-hant": "Lv.",
  },
  "Moves by TM": {
    en: "Moves by TM", es: "Movimientos por MT", fr: "Capacités par CT", de: "Attacken durch VM", it: "Mosse per MT",
    ja: "わざマシン", ko: "기술머신", "zh-hans": "招式学习器", "zh-hant": "招式學習器",
  },
  "Moves by Breeding": {
    en: "Moves by Breeding", es: "Movimientos por Cría", fr: "Capacités par Reproduction", de: "Attacken durch Zucht", it: "Mosse per Allevamento",
    ja: "タマゴ技", ko: "알 기술", "zh-hans": "蛋招式", "zh-hant": "蛋招式",
  },
  "Moves by Tutor": {
    en: "Moves by Tutor", es: "Movimientos por Tutor", fr: "Capacités par Donneur", de: "Attacken durch Tutor", it: "Mosse dall'Insegnante",
    ja: "教え技", ko: "가르치기 기술", "zh-hans": "传授招式", "zh-hant": "傳授招式",
  },
  "Pokédex Entries": {
    en: "Pokédex Entries", es: "Entradas de la Pokédex", fr: "Descriptions du Pokédex", de: "Pokédex-Einträge", it: "Voci del Pokédex",
    ja: "図鑑説明文", ko: "도감 설명", "zh-hans": "图鉴介绍", "zh-hant": "圖鑑介紹",
  },
  "Gen": {
    en: "Gen", es: "Gen", fr: "Gen", de: "Gen", it: "Gen",
    ja: "世代", ko: "세대", "zh-hans": "世代", "zh-hant": "世代",
  },
  "Other Languages": {
    en: "Other Languages", es: "Otros Idiomas", fr: "Autres Langues", de: "Andere Sprachen", it: "Altre Lingue",
    ja: "他の言語", ko: "다른 언어", "zh-hans": "其他语言", "zh-hant": "其他語言",
  },
  "Legendary": {
    en: "Legendary", es: "Legendario", fr: "Légendaire", de: "Legendär", it: "Leggendario",
    ja: "伝説", ko: "전설", "zh-hans": "传说", "zh-hant": "傳說",
  },
  "Mythical": {
    en: "Mythical", es: "Mítico", fr: "Fabuleux", de: "Mysteriös", it: "Mitico",
    ja: "幻", ko: "환상", "zh-hans": "幻之", "zh-hant": "幻之",
  },
  "Search by name, type, or number...": {
    en: "Search by name, type, or number...", es: "Buscar por nombre, tipo o número...", fr: "Chercher par nom, type ou numéro...", de: "Suche nach Name, Typ oder Nummer...", it: "Cerca per nome, tipo o numero...",
    ja: "名前、タイプ、番号で検索...", ko: "이름, 타입, 번호로 검색...", "zh-hans": "按名称、属性或编号搜索...", "zh-hant": "按名稱、屬性或編號搜尋...",
  },
  "No Pokémon found": {
    en: "No Pokémon found", es: "No se encontraron Pokémon", fr: "Aucun Pokémon trouvé", de: "Kein Pokémon gefunden", it: "Nessun Pokémon trovato",
    ja: "ポケモンが見つかりません", ko: "포켓몬을 찾을 수 없습니다", "zh-hans": "未找到宝可梦", "zh-hant": "未找到寶可夢",
  },
  "Try a different search term": {
    en: "Try a different search term", es: "Prueba con otro término", fr: "Essayez un autre terme", de: "Versuche einen anderen Begriff", it: "Prova con un altro termine",
    ja: "別の検索語をお試しください", ko: "다른 검색어를 시도해보세요", "zh-hans": "请尝试其他搜索词", "zh-hant": "請嘗試其他搜尋詞",
  },
  "Showing": {
    en: "Showing", es: "Mostrando", fr: "Affichage", de: "Zeige", it: "Mostrando",
    ja: "表示中", ko: "표시 중", "zh-hans": "显示", "zh-hant": "顯示",
  },
  "of": {
    en: "of", es: "de", fr: "sur", de: "von", it: "di",
    ja: "の", ko: "중", "zh-hans": "，共", "zh-hant": "，共",
  },
  "Pokémon": {
    en: "Pokémon", es: "Pokémon", fr: "Pokémon", de: "Pokémon", it: "Pokémon",
    ja: "ポケモン", ko: "포켓몬", "zh-hans": "宝可梦", "zh-hant": "寶可夢",
  },
  "Type a Pokémon name...": {
    en: "Type a Pokémon name...", es: "Escribe un nombre de Pokémon...", fr: "Tapez un nom de Pokémon...", de: "Gib einen Pokémon-Namen ein...", it: "Scrivi un nome di Pokémon...",
    ja: "ポケモンの名前を入力...", ko: "포켓몬 이름 입력...", "zh-hans": "输入宝可梦名称...", "zh-hant": "輸入寶可夢名稱...",
  },
  "Type a Pokémon name in any language...": {
    en: "Type a Pokémon name in any language...", es: "Escribe un nombre de Pokémon en cualquier idioma...", fr: "Tapez un nom de Pokémon dans n'importe quelle langue...", de: "Gib einen Pokémon-Namen in beliebiger Sprache ein...", it: "Scrivi un nome di Pokémon in qualsiasi lingua...",
    ja: "任意の言語でポケモンの名前を入力...", ko: "모든 언어로 포켓몬 이름 입력...", "zh-hans": "以任意语言输入宝可梦名称...", "zh-hant": "以任意語言輸入寶可夢名稱...",
  },
  "Guess today's Pokémon —": {
    en: "Guess today's Pokémon —", es: "Adivina el Pokémon de hoy —", fr: "Devinez le Pokémon du jour —", de: "Errate das heutige Pokémon —", it: "Indovina il Pokémon di oggi —",
    ja: "今日のポケモンを当てよう —", ko: "오늘의 포켓몬을 맞춰보세요 —", "zh-hans": "猜今天的宝可梦 —", "zh-hant": "猜今天的寶可夢 —",
  },
  "Pokémon (header)": {
    en: "Pokémon", es: "Pokémon", fr: "Pokémon", de: "Pokémon", it: "Pokémon",
    ja: "ポケモン", ko: "포켓몬", "zh-hans": "宝可梦", "zh-hant": "寶可夢",
  },
  "Gen (header)": {
    en: "Gen", es: "Gen", fr: "Gen", de: "Gen", it: "Gen",
    ja: "世代", ko: "세대", "zh-hans": "世代", "zh-hant": "世代",
  },
  "Types (header)": {
    en: "Types", es: "Tipos", fr: "Types", de: "Typen", it: "Tipi",
    ja: "タイプ", ko: "타입", "zh-hans": "属性", "zh-hant": "屬性",
  },
  "Abilities (header)": {
    en: "Abilities", es: "Habilidades", fr: "Talents", de: "Fähigkeiten", it: "Abilità",
    ja: "特性", ko: "특성", "zh-hans": "特性", "zh-hant": "特性",
  },
  "Height (header)": {
    en: "Height", es: "Altura", fr: "Taille", de: "Größe", it: "Altezza",
    ja: "高さ", ko: "키", "zh-hans": "身高", "zh-hant": "身高",
  },
  "Weight (header)": {
    en: "Weight", es: "Peso", fr: "Poids", de: "Gewicht", it: "Peso",
    ja: "重さ", ko: "몸무게", "zh-hans": "体重", "zh-hant": "體重",
  },
  "Color (header)": {
    en: "Color", es: "Color", fr: "Couleur", de: "Farbe", it: "Colore",
    ja: "色", ko: "색", "zh-hans": "颜色", "zh-hant": "顏色",
  },
  "Correct!": {
    en: "Correct!", es: "¡Correcto!", fr: "Correct !", de: "Richtig!", it: "Corretto!",
    ja: "正解！", ko: "정답!", "zh-hans": "正确！", "zh-hant": "正確！",
  },
  "You guessed it in": {
    en: "You guessed it in", es: "Lo adivinaste en", fr: "Vous l'avez deviné en", de: "Du hast es erraten in", it: "Lo hai indovinato in",
    ja: "かかった回数：", ko: "시도한 횟수:", "zh-hans": "你猜了", "zh-hant": "你猜了",
  },
  "attempt": {
    en: "attempt", es: "intento", fr: "tentative", de: "Versuch", it: "tentativo",
    ja: "回", ko: "회", "zh-hans": "次", "zh-hant": "次",
  },
  "attempts": {
    en: "attempts", es: "intentos", fr: "tentatives", de: "Versuche", it: "tentativi",
    ja: "回", ko: "회", "zh-hans": "次", "zh-hant": "次",
  },
  "Game Over": {
    en: "Game Over", es: "Fin del Juego", fr: "Partie Terminée", de: "Spiel vorbei", it: "Fine del Gioco",
    ja: "ゲームオーバー", ko: "게임 오버", "zh-hans": "游戏结束", "zh-hant": "遊戲結束",
  },
  "The Pokémon was": {
    en: "The Pokémon was", es: "El Pokémon era", fr: "Le Pokémon était", de: "Das Pokémon war", it: "Il Pokémon era",
    ja: "ポケモンは", ko: "포켓몬은", "zh-hans": "宝可梦是", "zh-hant": "寶可夢是",
  },
  "Streak": {
    en: "Streak", es: "Racha", fr: "Série", de: "Serie", it: "Serie",
    ja: "連勝", ko: "연승", "zh-hans": "连胜", "zh-hant": "連勝",
  },
  "Correct": {
    en: "Correct", es: "Acertados", fr: "Trouvés", de: "Richtig", it: "Corretti",
    ja: "正解数", ko: "정답 수", "zh-hans": "正确", "zh-hant": "正確",
  },
  "Continue in Arcade": {
    en: "Continue in Arcade", es: "Continuar en Arcade", fr: "Continuer en Arcade", de: "Im Arcade-Modus weitermachen", it: "Continua in Arcade",
    ja: "アーケードを続ける", ko: "아케이드 계속하기", "zh-hans": "继续街机模式", "zh-hant": "繼續街機模式",
  },
  "Play Again": {
    en: "Play Again", es: "Jugar de nuevo", fr: "Rejouer", de: "Nochmal spielen", it: "Gioca ancora",
    ja: "もう一度プレイ", ko: "다시 플레이", "zh-hans": "再玩一次", "zh-hant": "再玩一次",
  },
  "Back to Classic": {
    en: "Back to Classic", es: "Volver al Clásico", fr: "Retour au Classique", de: "Zurück zum Klassik", it: "Torna al Classico",
    ja: "クラシックに戻る", ko: "클래식으로 돌아가기", "zh-hans": "返回经典模式", "zh-hant": "返回經典模式",
  },
  "Arcade mode": {
    en: "Arcade mode", es: "Modo Arcade", fr: "Mode Arcade", de: "Arcade-Modus", it: "Modalità Arcade",
    ja: "アーケードモード", ko: "아케이드 모드", "zh-hans": "街机模式", "zh-hant": "街機模式",
  },
  "black": { en: "Black", es: "Negro", fr: "Noir", de: "Schwarz", it: "Nero", ja: "黒", ko: "검정", "zh-hans": "黑色", "zh-hant": "黑色" },
  "blue": { en: "Blue", es: "Azul", fr: "Bleu", de: "Blau", it: "Blu", ja: "青", ko: "파랑", "zh-hans": "蓝色", "zh-hant": "藍色" },
  "brown": { en: "Brown", es: "Marrón", fr: "Brun", de: "Braun", it: "Marrone", ja: "茶", ko: "갈색", "zh-hans": "棕色", "zh-hant": "棕色" },
  "gray": { en: "Gray", es: "Gris", fr: "Gris", de: "Grau", it: "Grigio", ja: "灰", ko: "회색", "zh-hans": "灰色", "zh-hant": "灰色" },
  "green": { en: "Green", es: "Verde", fr: "Vert", de: "Grün", it: "Verde", ja: "緑", ko: "초록", "zh-hans": "绿色", "zh-hant": "綠色" },
  "pink": { en: "Pink", es: "Rosa", fr: "Rose", de: "Pink", it: "Rosa", ja: "ピンク", ko: "분홍", "zh-hans": "粉色", "zh-hant": "粉色" },
  "purple": { en: "Purple", es: "Púrpura", fr: "Violet", de: "Violett", it: "Viola", ja: "紫", ko: "보라", "zh-hans": "紫色", "zh-hant": "紫色" },
  "red": { en: "Red", es: "Rojo", fr: "Rouge", de: "Rot", it: "Rosso", ja: "赤", ko: "빨강", "zh-hans": "红色", "zh-hant": "紅色" },
  "white": { en: "White", es: "Blanco", fr: "Blanc", de: "Weiß", it: "Bianco", ja: "白", ko: "하양", "zh-hans": "白色", "zh-hant": "白色" },
  "yellow": { en: "Yellow", es: "Amarillo", fr: "Jaune", de: "Gelb", it: "Giallo", ja: "黄", ko: "노랑", "zh-hans": "黄色", "zh-hant": "黃色" },
  "Guessed": { en: "Guessed", es: "Adivinado", fr: "Trouvé", de: "Erraten", it: "Trovato", ja: "見つけた", ko: "찾음", "zh-hans": "已猜出", "zh-hant": "已猜出" },
  "Power": { en: "Power", es: "Potencia", fr: "Puissance", de: "Stärke", it: "Potenza", ja: "威力", ko: "위력", "zh-hans": "威力", "zh-hant": "威力" },
  "Accuracy": { en: "Accuracy", es: "Precisión", fr: "Précision", de: "Genauigkeit", it: "Precisione", ja: "命中", ko: "명중률", "zh-hans": "命中", "zh-hant": "命中" },
  "Type": { en: "Type", es: "Tipo", fr: "Type", de: "Typ", it: "Tipo", ja: "タイプ", ko: "타입", "zh-hans": "属性", "zh-hant": "屬性" },
};

export function t(key, language) {
  return ui[key]?.[language] || ui[key]?.en || key;
}
