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
  "Evolution (header)": {
    en: "Evolution", es: "Evolución", fr: "Évolution", de: "Entwicklung", it: "Evoluzione",
    ja: "進化", ko: "진화", "zh-hans": "进化", "zh-hant": "進化",
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

  "A Roguelite Pokémon Journey": {
    en: "A Roguelite Pokémon Journey", es: "Un Viaje Pokémon Roguelite", fr: "Un Voyage Pokémon Roguelite", de: "Eine Roguelite Pokémon-Reise", it: "Un Viaggio Pokémon Roguelite",
    ja: "ローグライトポケモン旅", ko: "로그라이트 포켓몬 여행", "zh-hans": "肉鸽宝可梦之旅", "zh-hant": "肉鴿寶可夢之旅",
  },
  "Inspired by Slay the Spire": {
    en: "Inspired by Slay the Spire", es: "Inspirado en Slay the Spire", fr: "Inspiré de Slay the Spire", de: "Inspiriert von Slay the Spire", it: "Ispirato a Slay the Spire",
    ja: "Slay the Spireに影響を受けて", ko: "Slay the Spire에서 영감을 받음", "zh-hans": "灵感来自《杀戮尖塔》", "zh-hant": "靈感來自《殺戮尖塔》",
  },
  "Build your team. Battle trainers. Conquer the Gym Leaders.": {
    en: "Build your team. Battle trainers. Conquer the Gym Leaders.", es: "Construye tu equipo. Combate entrenadores. Conquista a los Líderes de Gimnasio.", fr: "Constituez votre équipe. Affrontez les dresseurs. Vainquez les Champions d'Arène.", de: "Baue dein Team auf. Kämpfe gegen Trainer. Besiege die Arenaleiter.", it: "Costruisci la tua squadra. Combatti gli allenatori. Conquista i Capipalestra.",
    ja: "チームを組め。トレーナーと戦え。ジムリーダーを倒せ。", ko: "팀을 구성하세요. 트레이너와 싸우세요. 체육관 관장을 정복하세요.", "zh-hans": "组建你的队伍。挑战训练家。征服道馆馆主。", "zh-hant": "組建你的隊伍。挑戰訓練家。征服道館館主。",
  },
  "Choose your starter to begin your run!": {
    en: "Choose your starter to begin your run!", es: "¡Elige tu inicial para comenzar tu aventura!", fr: "Choisissez votre starter pour commencer votre run !", de: "Wähle dein Starter-Pokémon, um deinen Lauf zu beginnen!", it: "Scegli il tuo starter per iniziare la run!",
    ja: "旅の始まりは最初の1匹を選べ！", ko: "스타터를 선택하여 여정을 시작하세요!", "zh-hans": "选择你的初始宝可梦开始冒险！", "zh-hant": "選擇你的初始寶可夢開始冒險！",
  },
  "Loading Pokédex...": {
    en: "Loading Pokédex...", es: "Cargando Pokédex...", fr: "Chargement du Pokédex...", de: "Pokédex wird geladen...", it: "Caricamento Pokédex...",
    ja: "ポケモン図鑑を読み込み中...", ko: "포켓몬도감 불러오는 중...", "zh-hans": "加载宝可梦图鉴...", "zh-hant": "載入寶可夢圖鑑...",
  },
  "Choose your path": {
    en: "Choose your path", es: "Elige tu camino", fr: "Choisissez votre chemin", de: "Wähle deinen Weg", it: "Scegli il tuo percorso",
    ja: "進路を選べ", ko: "경로를 선택하세요", "zh-hans": "选择你的路径", "zh-hant": "選擇你的路徑",
  },
  "Your Team": {
    en: "Your Team", es: "Tu Equipo", fr: "Votre Équipe", de: "Dein Team", it: "La Tua Squadra",
    ja: "あなたのチーム", ko: "당신의 팀", "zh-hans": "你的队伍", "zh-hant": "你的隊伍",
  },
  "Wild Pokémon": {
    en: "Wild Pokémon", es: "Pokémon Salvaje", fr: "Pokémon Sauvage", de: "Wildes Pokémon", it: "Pokémon Selvatico",
    ja: "野生ポケモン", ko: "야생 포켓몬", "zh-hans": "野生宝可梦", "zh-hant": "野生寶可夢",
  },
  "Trainer": {
    en: "Trainer", es: "Entrenador", fr: "Dresseur", de: "Trainer", it: "Allenatore",
    ja: "トレーナー", ko: "트레이너", "zh-hans": "训练家", "zh-hant": "訓練家",
  },
  "Team Rocket": {
    en: "Team Rocket", es: "Team Rocket", fr: "Team Rocket", de: "Team Rocket", it: "Team Rocket",
    ja: "ロケット団", ko: "로켓단", "zh-hans": "火箭队", "zh-hant": "火箭隊",
  },
  "Item": {
    en: "Item", es: "Objeto", fr: "Objet", de: "Item", it: "Strumento",
    ja: "どうぐ", ko: "도구", "zh-hans": "道具", "zh-hant": "道具",
  },
  "Change Move": {
    en: "Change Move", es: "Cambiar Movimiento", fr: "Changer Capacité", de: "Attacke ändern", it: "Cambia Mossa",
    ja: "わざを変える", ko: "기술 변경", "zh-hans": "更改招式", "zh-hant": "更改招式",
  },
  "Upgrade Move": {
    en: "Upgrade Move", es: "Mejorar Movimiento", fr: "Améliorer Capacité", de: "Attacke verbessern", it: "Migliora Mossa",
    ja: "わざを強化", ko: "기술 강화", "zh-hans": "强化招式", "zh-hant": "強化招式",
  },
  "Pokémon Center": {
    en: "Pokémon Center", es: "Centro Pokémon", fr: "Centre Pokémon", de: "Pokémon-Center", it: "Centro Pokémon",
    ja: "ポケモンセンター", ko: "포켓몬센터", "zh-hans": "宝可梦中心", "zh-hant": "寶可夢中心",
  },
  "Poké Trader": {
    en: "Poké Trader", es: "Poké Mercado", fr: "Poké Marché", de: "Poké Händler", it: "Poké Mercato",
    ja: "ポケモン交換", ko: "포켓몬 교환", "zh-hans": "宝可梦交换", "zh-hant": "寶可夢交換",
  },
  "Gym Leader": {
    en: "Gym Leader", es: "Líder de Gimnasio", fr: "Champion d'Arène", de: "Arenaleiter", it: "Capopalestra",
    ja: "ジムリーダー", ko: "체육관 관장", "zh-hans": "道馆馆主", "zh-hant": "道館館主",
  },
  "Champion": {
    en: "Champion", es: "Campeón", fr: "Champion", de: "Champion", it: "Campione",
    ja: "チャンピオン", ko: "챔피언", "zh-hans": "冠军", "zh-hant": "冠軍",
  },
  "wants to battle!": {
    en: "wants to battle!", es: "quiere combatir!", fr: "veut se battre!", de: "fordert dich heraus!", it: "vuole lottare!",
    ja: "勝負を挑んできた！", ko: "승부를 걸어왔다!", "zh-hans": "想要对战！", "zh-hant": "想要對戰！",
  },
  "Victory!": {
    en: "Victory!", es: "¡Victoria!", fr: "Victoire !", de: "Sieg!", it: "Vittoria!",
    ja: "勝利！", ko: "승리!", "zh-hans": "胜利！", "zh-hant": "勝利！",
  },
  "All Pokémon fainted!": {
    en: "All Pokémon fainted!", es: "¡Todos los Pokémon se debilitaron!", fr: "Tous les Pokémon sont K.O. !", de: "Alle Pokémon sind kampfunfähig!", it: "Tutti i Pokémon sono esausti!",
    ja: "全てのポケモンがたおれた！", ko: "모든 포켓몬이 쓰러졌다!", "zh-hans": "所有宝可梦都倒下了！", "zh-hant": "所有寶可夢都倒下了！",
  },
  "Continue": {
    en: "Continue", es: "Continuar", fr: "Continuer", de: "Weiter", it: "Continua",
    ja: "続ける", ko: "계속", "zh-hans": "继续", "zh-hant": "繼續",
  },
  "You conquered the Pokémon League!": {
    en: "You conquered the Pokémon League!", es: "¡Conquistaste la Liga Pokémon!", fr: "Vous avez vaincu la Ligue Pokémon !", de: "Du hast die Pokémon-Liga bezwungen!", it: "Hai conquistato la Lega Pokémon!",
    ja: "ポケモンリーグを制覇した！", ko: "포켓몬 리그를 정복했다!", "zh-hans": "你征服了宝可梦联盟！", "zh-hant": "你征服了寶可夢聯盟！",
  },
  "Final Team": {
    en: "Final Team", es: "Equipo Final", fr: "Équipe Finale", de: "Endteam", it: "Squadra Finale",
    ja: "最終チーム", ko: "최종 팀", "zh-hans": "最终队伍", "zh-hant": "最終隊伍",
  },
  "Floors Cleared": {
    en: "Floors Cleared", es: "Rutas Completadas", fr: "Routes Terminées", de: "Abschnitte geschafft", it: "Percorsi Completati",
    ja: "クリアしたルート", ko: "클리어한 루트", "zh-hans": "已通关路线", "zh-hant": "已通關路線",
  },
  "Play Again": {
    en: "Play Again", es: "Jugar de nuevo", fr: "Rejouer", de: "Nochmal spielen", it: "Gioca ancora",
    ja: "もう一度プレイ", ko: "다시 플레이", "zh-hans": "再玩一次", "zh-hant": "再玩一次",
  },
  "Try Again": {
    en: "Try Again", es: "Intentar de nuevo", fr: "Réessayer", de: "Erneut versuchen", it: "Riprova",
    ja: "もう一度挑戦", ko: "다시 도전", "zh-hans": "再试一次", "zh-hant": "再試一次",
  },
  "Your run ended on": {
    en: "Your run ended on", es: "Tu aventura terminó en", fr: "Votre run s'est terminée sur", de: "Dein Lauf endete auf", it: "La tua run è terminata su",
    ja: "挑戦はで終了", ko: "여정이에서 종료됨", "zh-hans": "你的冒险结束于", "zh-hant": "你的冒險結束於",
  },
  "Team size": {
    en: "Team size", es: "Tamaño del equipo", fr: "Taille de l'équipe", de: "Teamgröße", it: "Dimensione squadra",
    ja: "チーム数", ko: "팀 규모", "zh-hans": "队伍规模", "zh-hant": "隊伍規模",
  },
  "Choose a Pokémon to add to your team": {
    en: "Choose a Pokémon to add to your team", es: "Elige un Pokémon para añadir a tu equipo", fr: "Choisissez un Pokémon à ajouter à votre équipe", de: "Wähle ein Pokémon für dein Team", it: "Scegli un Pokémon da aggiungere alla squadra",
    ja: "チームに加えるポケモンを選べ", ko: "팀에 추가할 포켓몬을 선택하세요", "zh-hans": "选择一只宝可梦加入队伍", "zh-hant": "選擇一隻寶可夢加入隊伍",
  },
  "Skip": {
    en: "Skip", es: "Saltar", fr: "Passer", de: "Überspringen", it: "Salta",
    ja: "スキップ", ko: "건너뛰기", "zh-hans": "跳过", "zh-hant": "跳過",
  },
  "Found an Item!": {
    en: "Found an Item!", es: "¡Has encontrado un Objeto!", fr: "Vous avez trouvé un Objet !", de: "Item gefunden!", it: "Hai trovato uno Strumento!",
    ja: "どうぐをみつけた！", ko: "도구를 발견했다!", "zh-hans": "发现了一个道具！", "zh-hant": "發現了一個道具！",
  },
  "Choose a Pokémon to give it to:": {
    en: "Choose a Pokémon to give it to:", es: "Elige un Pokémon para dárselo:", fr: "Choisissez un Pokémon à qui le donner :", de: "Wähle ein Pokémon, dem du es geben möchtest:", it: "Scegli un Pokémon a cui darlo:",
    ja: "渡すポケモンを選べ:", ko: "줄 포켓몬을 선택하세요:", "zh-hans": "选择一只宝可梦给予:", "zh-hant": "選擇一隻寶可夢給予:",
  },
  "Change a Move": {
    en: "Change a Move", es: "Cambiar un Movimiento", fr: "Changer une Capacité", de: "Eine Attacke ändern", it: "Cambia una Mossa",
    ja: "わざを変える", ko: "기술 변경", "zh-hans": "更改招式", "zh-hant": "更改招式",
  },
  "Choose a Pokémon to change a move:": {
    en: "Choose a Pokémon to change a move:", es: "Elige un Pokémon para cambiar un movimiento:", fr: "Choisissez un Pokémon pour changer une capacité :", de: "Wähle ein Pokémon, um eine Attacke zu ändern:", it: "Scegli un Pokémon per cambiare una mossa:",
    ja: "わざを変えるポケモンを選べ:", ko: "기술을 변경할 포켓몬을 선택하세요:", "zh-hans": "选择要更改招式的宝可梦:", "zh-hant": "選擇要更改招式的寶可夢:",
  },
  "Choose a move to replace:": {
    en: "Choose a move to replace:", es: "Elige un movimiento para reemplazar:", fr: "Choisissez une capacité à remplacer :", de: "Wähle eine zu ersetzende Attacke:", it: "Scegli una mossa da sostituire:",
    ja: "入れ替えるわざを選べ:", ko: "교체할 기술을 선택하세요:", "zh-hans": "选择要替换的招式:", "zh-hant": "選擇要替換的招式:",
  },
  "Cancel": {
    en: "Cancel", es: "Cancelar", fr: "Annuler", de: "Abbrechen", it: "Annulla",
    ja: "キャンセル", ko: "취소", "zh-hans": "取消", "zh-hant": "取消",
  },
  "Upgrade a Move": {
    en: "Upgrade a Move", es: "Mejorar un Movimiento", fr: "Améliorer une Capacité", de: "Eine Attacke verbessern", it: "Migliora una Mossa",
    ja: "わざを強化", ko: "기술 강화", "zh-hans": "强化招式", "zh-hant": "強化招式",
  },
  "Choose a Pokémon to upgrade a move:": {
    en: "Choose a Pokémon to upgrade a move:", es: "Elige un Pokémon para mejorar un movimiento:", fr: "Choisissez un Pokémon pour améliorer une capacité :", de: "Wähle ein Pokémon, um eine Attacke zu verbessern:", it: "Scegli un Pokémon per migliorare una mossa:",
    ja: "わざを強化するポケモンを選べ:", ko: "기술을 강화할 포켓몬을 선택하세요:", "zh-hans": "选择要强化招式的宝可梦:", "zh-hant": "選擇要強化招式的寶可夢:",
  },
  "Choose a move to upgrade:": {
    en: "Choose a move to upgrade:", es: "Elige un movimiento para mejorar:", fr: "Choisissez une capacité à améliorer :", de: "Wähle eine zu verbessernde Attacke:", it: "Scegli una mossa da migliorare:",
    ja: "強化するわざを選べ:", ko: "강화할 기술을 선택하세요:", "zh-hans": "选择要强化的招式:", "zh-hant": "選擇要強化的招式:",
  },
  "Your Pokémon have been fully healed!": {
    en: "Your Pokémon have been fully healed!", es: "¡Tus Pokémon han sido curados por completo!", fr: "Vos Pokémon ont été complètement soignés !", de: "Deine Pokémon wurden vollständig geheilt!", it: "I tuoi Pokémon sono stati completamente curati!",
    ja: "ポケモンが完全に回復した！", ko: "포켓몬이 완전히 회복되었다!", "zh-hans": "你的宝可梦已完全恢复！", "zh-hant": "你的寶可夢已完全恢復！",
  },
  "Trade one of your Pokémon for a random one!": {
    en: "Trade one of your Pokémon for a random one!", es: "¡Intercambia uno de tus Pokémon por uno aleatorio!", fr: "Échangez un de vos Pokémon contre un Pokémon aléatoire !", de: "Tausche eines deiner Pokémon gegen ein zufälliges!", it: "Scambia uno dei tuoi Pokémon con uno casuale!",
    ja: "手持ちのポケモンをランダムなポケモンと交換！", ko: "네 포켓몬 중 하나를 랜덤 포켓몬과 교환!", "zh-hans": "用你的一只宝可梦交换一只随机宝可梦！", "zh-hant": "用你的一隻寶可夢交換一隻隨機寶可夢！",
  },
  "You will receive:": {
    en: "You will receive:", es: "Recibirás:", fr: "Vous recevrez :", de: "Du erhältst:", it: "Riceverai:",
    ja: "受け取る:", ko: "받을 포켓몬:", "zh-hans": "你将获得:", "zh-hant": "你將獲得:",
  },
  "Choose a Pokémon to trade away:": {
    en: "Choose a Pokémon to trade away:", es: "Elige un Pokémon para intercambiar:", fr: "Choisissez un Pokémon à échanger :", de: "Wähle ein Pokémon zum Tauschen:", it: "Scegli un Pokémon da scambiare:",
    ja: "交換に出すポケモンを選べ:", ko: "교환할 포켓몬을 선택하세요:", "zh-hans": "选择要交换的宝可梦:", "zh-hant": "選擇要交換的寶可夢:",
  },
  "Decline Trade": {
    en: "Decline Trade", es: "Rechazar Intercambio", fr: "Refuser l'Échange", de: "Tausch ablehnen", it: "Rifiuta Scambio",
    ja: "交換しない", ko: "교환 거절", "zh-hans": "拒绝交换", "zh-hant": "拒絕交換",
  },
  "You traded": {
    en: "You traded", es: "Intercambiaste", fr: "Vous avez échangé", de: "Du hast getauscht", it: "Hai scambiato",
    ja: "交換した", ko: "교환했습니다", "zh-hans": "你交换了", "zh-hant": "你交換了",
  },
  "You received:": {
    en: "You received:", es: "Recibiste:", fr: "Vous avez reçu :", de: "Du erhieltst:", it: "Hai ricevuto:",
    ja: "受け取った:", ko: "받았습니다:", "zh-hans": "你收到了:", "zh-hant": "你收到了:",
  },
  "Confirm Trade": {
    en: "Confirm Trade", es: "Confirmar Intercambio", fr: "Confirmer l'Échange", de: "Tausch bestätigen", it: "Conferma Scambio",
    ja: "交換を確定", ko: "교환 확인", "zh-hans": "确认交换", "zh-hant": "確認交換",
  },
  "fainted!": {
    en: "fainted!", es: "¡se debilitó!", fr: "est K.O. !", de: "ist kampfunfähig!", it: "è esausto!",
    ja: "たおれた！", ko: "쓰러졌다!", "zh-hans": "倒下了！", "zh-hant": "倒下了！",
  },
  "enters!": {
    en: "enters!", es: "¡entra!", fr: "entre en jeu !", de: "tritt ein!", it: "entra!",
    ja: "登場！", ko: "등장!", "zh-hans": "上场！", "zh-hant": "登場！",
  },
  "dmg": {
    en: "dmg", es: "daño", fr: "dégâts", de: "Schaden", it: "danno",
    ja: "ダメージ", ko: "피해", "zh-hans": "伤害", "zh-hant": "傷害",
  },
  "Super effective!": {
    en: "Super effective!", es: "¡Muy eficaz!", fr: "Super efficace !", de: "Effektiv!", it: "Super efficace!",
    ja: "効果は抜群だ！", ko: "효과가 굉장했다!", "zh-hans": "效果拔群！", "zh-hant": "效果絕佳！",
  },
  "Not very effective...": {
    en: "Not very effective...", es: "No muy eficaz...", fr: "Pas très efficace...", de: "Nicht sehr effektiv...", it: "Non molto efficace...",
    ja: "効果は今ひとつ...", ko: "효과가 별로인 듯...", "zh-hans": "效果一般...", "zh-hant": "效果一般...",
  },
  "No effect!": {
    en: "No effect!", es: "¡Sin efecto!", fr: "Aucun effet !", de: "Keine Wirkung!", it: "Nessun effetto!",
    ja: "効果がない！", ko: "효과가 없다!", "zh-hans": "没有效果！", "zh-hant": "沒有效果！",
  },
  "HP": {
    en: "HP", es: "PS", fr: "PV", de: "KP", it: "PS",
    ja: "HP", ko: "HP", "zh-hans": "HP", "zh-hant": "HP",
  },
  "Moves": {
    en: "Moves", es: "Movimientos", fr: "Capacités", de: "Attacken", it: "Mosse",
    ja: "わざ", ko: "기술", "zh-hans": "招式", "zh-hant": "招式",
  },
  "VS": {
    en: "VS", es: "VS", fr: "VS", de: "VS", it: "VS",
    ja: "VS", ko: "VS", "zh-hans": "VS", "zh-hant": "VS",
  },
  "Turn": {
    en: "Turn", es: "Turno", fr: "Tour", de: "Runde", it: "Turno",
    ja: "ターン", ko: "턴", "zh-hans": "回合", "zh-hant": "回合",
  },
  "has no moves!": {
    en: "has no moves!", es: "no tiene movimientos!", fr: "n'a pas de capacités!", de: "hat keine Attacken!", it: "non ha mosse!",
    ja: "わざがない！", ko: "기술이 없다!", "zh-hans": "没有招式！", "zh-hant": "沒有招式！",
  },
  "used": {
    en: "used", es: "usó", fr: "a utilisé", de: "eingesetzt", it: "ha usato",
    ja: "使った", ko: "사용했다", "zh-hans": "使用了", "zh-hant": "使用了",
  },
  "Stats": {
    en: "Stats", es: "Estad.", fr: "Stats", de: "Stats", it: "Stat.",
    ja: "ステータス", ko: "스탯", "zh-hans": "能力", "zh-hant": "能力",
  },
  "Back": {
    en: "Back", es: "Atrás", fr: "Retour", de: "Zurück", it: "Indietro",
    ja: "戻る", ko: "뒤로", "zh-hans": "返回", "zh-hant": "返回",
  },
  "Your team is full!": {
    en: "Your team is full!", es: "¡Tu equipo está lleno!", fr: "Votre équipe est complète!", de: "Dein Team ist voll!", it: "La tua squadra è piena!",
    ja: "チームがいっぱいです！", ko: "팀이 가득 찼습니다!", "zh-hans": "你的队伍已满！", "zh-hant": "你的隊伍已滿！",
  },
  "Choose a Pokémon to release:": {
    en: "Choose a Pokémon to release:", es: "Elige un Pokémon para liberar:", fr: "Choisissez un Pokémon à relâcher:", de: "Wähle ein Pokémon zum Freilassen:", it: "Scegli un Pokémon da rilasciare:",
    ja: "離すポケモンを選んでください：", ko: "놓아줄 포켓몬을 선택하세요:", "zh-hans": "选择要放生的宝可梦：", "zh-hant": "選擇要放生的寶可夢：",
  },

  // Stats Battle
  "Stats Battle": {
    en: "Stats Battle", es: "Batalla de Stats", fr: "Bataille de Stats", de: "Stat-Kampf", it: "Battaglia Stat",
    ja: "ステータスバトル", ko: "스탯 배틀", "zh-hans": "属性对战", "zh-hant": "屬性對戰",
  },
  "Which Pokémon has the highest": {
    en: "Which Pokémon has the highest", es: "¿Quién tiene más", fr: "Quel Pokémon a le plus haut", de: "Welches Pokémon hat den höchsten", it: "Quale Pokémon ha l'",
    ja: "どのポケモンが最も", ko: "어떤 포켓몬이 더 높은", "zh-hans": "哪只宝可梦的", "zh-hant": "哪隻寶可夢的",
  },
  "Score": {
    en: "Score", es: "Puntos", fr: "Score", de: "Punkte", it: "Punteggio",
    ja: "スコア", ko: "점수", "zh-hans": "得分", "zh-hant": "得分",
  },
  "Round": {
    en: "Round", es: "Ronda", fr: "Tour", de: "Runde", it: "Turno",
    ja: "ラウンド", ko: "라운드", "zh-hans": "回合", "zh-hant": "回合",
  },
  "Correct!": {
    en: "Correct!", es: "¡Correcto!", fr: "Correct !", de: "Richtig!", it: "Corretto!",
    ja: "正解！", ko: "정답!", "zh-hans": "正确！", "zh-hant": "正確！",
  },
  "Wrong!": {
    en: "Wrong!", es: "¡Incorrecto!", fr: "Faux !", de: "Falsch!", it: "Sbagliato!",
    ja: "不正解！", ko: "오답!", "zh-hans": "错误！", "zh-hant": "錯誤！",
  },
  "Play": {
    en: "Play", es: "Jugar", fr: "Jouer", de: "Spielen", it: "Gioca",
    ja: "プレイ", ko: "플레이", "zh-hans": "开始", "zh-hant": "開始",
  },
  "Play Again": {
    en: "Play Again", es: "Jugar de nuevo", fr: "Rejouer", de: "Nochmal spielen", it: "Gioca ancora",
    ja: "もう一度プレイ", ko: "다시 플레이", "zh-hans": "再玩一次", "zh-hant": "再玩一次",
  },
  "Total Score": {
    en: "Total Score", es: "Puntuación Total", fr: "Score Total", de: "Gesamtpunktzahl", it: "Punteggio Totale",
    ja: "合計スコア", ko: "총 점수", "zh-hans": "总分", "zh-hant": "總分",
  },
  "Best Streak": {
    en: "Best Streak", es: "Mejor Racha", fr: "Meilleure Série", de: "Beste Serie", it: "Miglior Serie",
    ja: "最高連勝", ko: "최고 연승", "zh-hans": "最佳连胜", "zh-hant": "最佳連勝",
  },
  "or": {
    en: "or", es: "o", fr: "ou", de: "oder", it: "o",
    ja: "か", ko: "또는", "zh-hans": "或", "zh-hant": "或",
  },
  "statsbattle-desc": {
    en: "You're given a question, and two Pokémon to choose from. Guess which wins.",
    es: "Recibes una pregunta y dos Pokémon para elegir. Adivina cuál gana.",
    fr: "Vous recevez une question et deux Pokémon parmi lesquels choisir. Devinez lequel gagne.",
    de: "Du bekommst eine Frage und zwei Pokémon zur Auswahl. Errate, welches gewinnt.",
    it: "Ricevi una domanda e due Pokémon tra cui scegliere. Indovina chi vince.",
    ja: "質問と2体のポケモンが表示される。勝つほうを当てよう！",
    ko: "질문과 선택할 포켓몬 2마리가 주어진다. 누가 이길지 맞춰보세요!",
    "zh-hans": "给出一个问题和两只宝可梦，猜猜谁赢。",
    "zh-hant": "給出一個問題和兩隻寶可夢，猜猜誰贏。",
  },
  "statsbattle-rule1": {
    en: "⚔️ Two Pokémon appear. Pick the one you think wins the stat.",
    es: "⚔️ Aparecen dos Pokémon. Elige al que crees que gana la estadística.",
    fr: "⚔️ Deux Pokémon apparaissent. Choisissez celui que vous pensez gagner.",
    de: "⚔️ Zwei Pokémon erscheinen. Wähle das, von dem du denkst, dass es die Statistik gewinnt.",
    it: "⚔️ Appaiono due Pokémon. Scegli quello che pensi vinca la stat.",
    ja: "⚔️ 2体のポケモンが登場。勝つほうを選ぼう！",
    ko: "⚔️ 포켓몬 2마리가 나타난다. 이길 것 같은 쪽을 고르세요.",
    "zh-hans": "⚔️ 两只宝可梦出现，选出你认为赢的那只。",
    "zh-hant": "⚔️ 兩隻寶可夢出現，選出你認為贏的那隻。",
  },
  "statsbattle-rule2": {
    en: "🏆 The winner stays as champion for the next round!",
    es: "🏆 ¡El ganador se queda como campeón para la siguiente ronda!",
    fr: "🏆 Le gagnant reste champion pour le prochain tour !",
    de: "🏆 Der Gewinner bleibt Champion für die nächste Runde!",
    it: "🏆 Il vincitore resta campione per il prossimo turno!",
    ja: "🏆 勝者は次のラウンドのチャンピオンとして残る！",
    ko: "🏆 승자는 다음 라운드의 챔피언으로 남습니다!",
    "zh-hans": "🏆 赢家作为冠军留在下一轮！",
    "zh-hant": "🏆 贏家作為冠軍留在下一輪！",
  },
  "statsbattle-rule3": {
    en: "💀 One wrong answer and it's game over.",
    es: "💀 Una respuesta incorrecta y se acabó el juego.",
    fr: "💀 Une mauvaise réponse et c'est terminé.",
    de: "💀 Eine falsche Antwort und das Spiel ist vorbei.",
    it: "💀 Una risposta sbagliata e la partita è finita.",
    ja: "💀 間違えるとゲームオーバー！",
    ko: "💀 한 번 틀리면 게임 오버!",
    "zh-hans": "💀 答错一次就游戏结束。",
    "zh-hant": "💀 答錯一次就遊戲結束。",
  },
};

export function t(key, language) {
  return ui[key]?.[language] || ui[key]?.en || key;
}
