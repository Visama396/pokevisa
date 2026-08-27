// Translation and localization data for all 9 supported languages.
// Key-based lookup: every UI string has a unique key that maps to translations
// in every language. The `t(key, language)` function on line 1248 performs the lookup.
//
// Used by every component that renders user-facing text.

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
  "Today's TMs": {
    en: "Today's TMs", es: "MT de Hoy", fr: "CT du Jour", de: "Tages-VMs", it: "MT di Oggi",
    ja: "今日のわざマシン", ko: "오늘의 기술머신", "zh-hans": "今日招式学习器", "zh-hant": "今日招式學習器",
  },
  "Teaches a move to a compatible Pokémon": {
    en: "Teaches a move to a compatible Pokémon", es: "Enseña un movimiento a un Pokémon compatible", fr: "Enseigne une capacité à un Pokémon compatible", de: "Lehrt einem kompatiblen Pokémon eine Attacke", it: "Insegna una mossa a un Pokémon compatibile",
    ja: "対応するポケモンに技を教えます", ko: "호환되는 포켓몬에게 기술을 가르칩니다", "zh-hans": "教相容的宝可梦学会招式", "zh-hant": "教相容的寶可夢學會招式",
  },
  "can't learn this TM.": {
    en: "can't learn this TM.", es: "no puede aprender esta MT.", fr: "ne peut pas apprendre cette CT.", de: "kann diese VM nicht lernen.", it: "non può imparare questa MT.",
    ja: "このわざマシンは使えません。", ko: "이 기술머신을 배울 수 없습니다.", "zh-hans": "无法学会这个招式学习器。", "zh-hant": "無法學會這個招式學習器。",
  },
  "It already knows that move.": {
    en: "It already knows that move.", es: "Ya conoce ese movimiento.", fr: "Il connaît déjà cette capacité.", de: "Es kann diese Attacke bereits.", it: "Conosce già quella mossa.",
    ja: "その技はすでに覚えています。", ko: "이미 그 기술을 알고 있습니다.", "zh-hans": "它已经会那个招式了。", "zh-hant": "它已經會那個招式了。",
  },
  "learned": {
    en: "learned", es: "aprendió", fr: "a appris", de: "hat gelernt", it: "ha imparato",
    ja: "を覚えた", ko: "을(를) 배웠다", "zh-hans": "学会了", "zh-hant": "學會了",
  },
  "pick a move to forget:": {
    en: "pick a move to forget:", es: "elige un movimiento para olvidar:", fr: "choisis une capacité à oublier :", de: "wähle eine zu vergessende Attacke:", it: "scegli una mossa da dimenticare:",
    ja: "忘れさせたい技を選んでください:", ko: "잊어버릴 기술을 선택하세요:", "zh-hans": "选择要忘掉的招式:", "zh-hant": "選擇要忘掉的招式:",
  },
  "can be learned by replacing a move!": {
    en: "can be learned by replacing a move!", es: "puede aprenderse reemplazando un movimiento!", fr: "peut être apprise en remplaçant une capacité !", de: "kann durch Ersetzen einer Attacke gelernt werden!", it: "può essere imparata sostituendo una mossa!",
    ja: "技を入れ替えることで覚えられます！", ko: "기술을 바꾸면 배울 수 있습니다!", "zh-hans": "可以替换招式来学会它！", "zh-hant": "可以替換招式來學會它！",
  },
  "Type Effectiveness": {
    en: "Type Effectiveness", es: "Efectividad de Tipos", fr: "Efficacité des Types", de: "Typeneffektivität", it: "Efficacia dei Tipi",
    ja: "タイプ相性", ko: "타입 상성", "zh-hans": "属性相性", "zh-hant": "屬性相性",
  },
  "Really Weak To": {
    en: "Really Weak To", es: "Muy débil a", fr: "Très vulnérable à", de: "Sehr schwach gegen", it: "Molto debole a",
    ja: "とても弱点", ko: "매우 약함", "zh-hans": "非常弱", "zh-hant": "非常弱",
  },
  "Weak To": {
    en: "Weak To", es: "Débil a", fr: "Vulnérable à", de: "Schwach gegen", it: "Debole a",
    ja: "弱点", ko: "약함", "zh-hans": "较弱", "zh-hant": "較弱",
  },
  "Neutral": {
    en: "Neutral", es: "Neutral", fr: "Neutre", de: "Neutral", it: "Neutrale",
    ja: "普通", ko: "보통", "zh-hans": "普通", "zh-hant": "普通",
  },
  "Resistant To": {
    en: "Resistant To", es: "Resistente a", fr: "Résistant à", de: "Resistent gegen", it: "Resistente a",
    ja: "耐性", ko: "저항", "zh-hans": "抗性", "zh-hant": "抗性",
  },
  "Very Resistant To": {
    en: "Very Resistant To", es: "Muy resistente a", fr: "Très résistant à", de: "Sehr resistent gegen", it: "Molto resistente a",
    ja: "とても耐性", ko: "매우 저항", "zh-hans": "非常抗", "zh-hant": "非常抗",
  },
  "Immune": {
    en: "Immune", es: "Inmune", fr: "Immunisé", de: "Immun", it: "Immuno",
    ja: "無効", ko: "무효", "zh-hans": "免疫", "zh-hant": "免疫",
  },
  "Mega": {
    en: "Mega", es: "Mega", fr: "Méga", de: "Mega", it: "Mega",
    ja: "メガ", ko: "메가", "zh-hans": "超级", "zh-hant": "超級",
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
  "Move Searcher": {
    en: "Move Searcher", es: "Buscador de Movimientos", fr: "Recherche de Capacités", de: "Attacken-Suche", it: "Cerca Mosse",
    ja: "技検索", ko: "기술 검색", "zh-hans": "招式搜索", "zh-hant": "招式搜尋",
  },
  "Search moves": {
    en: "Search moves", es: "Buscar movimientos", fr: "Rechercher des capacités", de: "Attacken suchen", it: "Cerca mosse",
    ja: "技を検索", ko: "기술 검색", "zh-hans": "搜索招式", "zh-hant": "搜尋招式",
  },
  "No moves found.": {
    en: "No moves found.", es: "No se encontraron movimientos.", fr: "Aucune capacité trouvée.", de: "Keine Attacken gefunden.", it: "Nessuna mossa trovata.",
    ja: "技が見つかりません。", ko: "기술을 찾을 수 없습니다.", "zh-hans": "未找到招式。", "zh-hant": "未找到招式。",
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
  "Yesterday's Pokémon was": {
    en: "Yesterday's Pokémon was", es: "El Pokémon de ayer fue", fr: "Le Pokémon d'hier était", de: "Das gestrige Pokémon war", it: "Il Pokémon di ieri era",
    ja: "昨日のポケモンは", ko: "어제의 포켓몬은", "zh-hans": "昨天的宝可梦是", "zh-hant": "昨天的寶可夢是",
  },
  "Continue in Arcade": {
    en: "Continue in Arcade", es: "Continuar en Arcade", fr: "Continuer en Arcade", de: "Im Arcade-Modus weitermachen", it: "Continua in Arcade",
    ja: "アーケードを続ける", ko: "아케이드 계속하기", "zh-hans": "继续街机模式", "zh-hant": "繼續街機模式",
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
  "miss!": {
    en: "miss!", es: "¡fallo!", fr: "raté !", de: "verfehlt!", it: "fallito!",
    ja: "ミス！", ko: "미스!", "zh-hans": "落空了！", "zh-hant": "落空了！",
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
  // Dungeon Crawler
  "Dungeon Crawler": {
    en: "Dungeon Crawler", es: "Mazmorra", fr: "Donjon", de: "Dungeon", it: "Dungeon",
    ja: "ダンジョン", ko: "던전", "zh-hans": "地牢探险", "zh-hant": "地牢探險",
  },
  "dungeon-desc": {
    en: "Explore dungeons, fight wild Pokémon, and team up with friends!",
    es: "¡Explora mazmorras, lucha contra Pokémon salvajes y haz equipo con amigos!",
    fr: "Explorez les donjons, affrontez des Pokémon sauvages et formez une équipe avec vos amis !",
    de: "Erkunde Dungeons, kämpfe gegen wilde Pokémon und bilde Teams mit Freunden!",
    it: "Esplora dungeon, combatti Pokémon selvatici e forma una squadra con gli amici!",
    ja: "ダンジョンを探索し、野生ポケモンと戦い、フレンドと協力しよう！",
    ko: "던전을 탐험하고, 야생 포켓몬과 싸우고, 친구와 팀을 이루세요!",
    "zh-hans": "探索地牢，与野生宝可梦战斗，和朋友组队！",
    "zh-hant": "探索地牢，與野生寶可夢戰鬥，和朋友組隊！",
  },
  "dungeon-rule1": {
    en: "Explore a randomly generated dungeon grid.",
    es: "Explora una mazmorra generada aleatoriamente.",
    fr: "Explorez un donjon généré aléatoirement.",
    de: "Erkunde ein zufällig generiertes Dungeon-Gitter.",
    it: "Esplora un dungeon generato casualmente.",
    ja: "ランダムに生成されたダンジョンを探索しよう。",
    ko: "랜덤으로 생성된 던전을 탐험하세요.",
    "zh-hans": "探索随机生成的地牢。",
    "zh-hant": "探索隨機生成的地牢。",
  },
  "dungeon-rule2": {
    en: "Battle wild Pokémon in turn-based combat.",
    es: "Lucha contra Pokémon salvajes por turnos.",
    fr: "Affrontez les Pokémon sauvages au tour par tour.",
    de: "Kämpfe rundenbasiert gegen wilde Pokémon.",
    it: "Combatti i Pokémon selvatici a turni.",
    ja: "ターン制バトルで野生ポケモンと戦おう。",
    ko: "턴제 전투로 야생 포켓몬과 싸우세요.",
    "zh-hans": "在回合制战斗中与野生宝可梦对战。",
    "zh-hant": "在回合制戰鬥中與野生寶可夢對戰。",
  },
  "dungeon-rule3": {
    en: "Other players appear on your map in real-time!",
    es: "Otros jugadores aparecen en tu mapa en tiempo real!",
    fr: "D'autres apparaissent sur votre carte en temps réel !",
    de: "Andere Spieler erscheinen in Echtzeit auf deiner Karte!",
    it: "Altri giocatori appaiono sulla tua mappa in tempo reale!",
    ja: "他のプレイヤーがリアルタイムでマップに表示される！",
    ko: "다른 플레이어가 실시간으로 지도에 나타납니다!",
    "zh-hans": "其他玩家会实时出现在你的地图上！",
    "zh-hant": "其他玩家會即時出現在你的地圖上！",
  },
  "dungeon-rule4": {
    en: "If you faint, the run is over for you.",
    es: "Si te debilitas, la partida termina para ti.",
    fr: "Si vous tombez K.O., la partie est terminée pour vous.",
    de: "Wenn du kampfunfähig wirst, ist dein Lauf vorbei.",
    it: "Se vieni sconfitto, la partita è finita per te.",
    ja: "たおれると、あなたの冒険は終了する。",
    ko: "쓰러지면 당신의 모험이 끝납니다.",
    "zh-hans": "如果你倒下了，你的冒险就结束了。",
    "zh-hant": "如果你倒下了，你的冒險就結束了。",
  },
  "dungeon-lobby-waiting": {
    en: "Share the room code with friends to join!",
    es: "¡Comparte el código de sala con amigos para unirse!",
    fr: "Partagez le code de salle avec vos amis pour rejoindre !",
    de: "Teile den Raumcode mit Freunden, um beizutreten!",
    it: "Condividi il codice stanza con gli amici per unirti!",
    ja: "ルームコードを友達と共有して参加しよう！",
    ko: "룸 코드를 친구와 공유하여 참여하세요!",
    "zh-hans": "与朋友分享房间代码加入游戏！",
    "zh-hant": "與朋友分享房間代碼加入遊戲！",
  },
  "dungeon-mobile-warning": {
    en: "The Dungeon Crawler is designed for larger screens and isn't playable on mobile yet — play on a desktop for the best experience.",
    es: "El Dungeon Crawler está diseñado para pantallas grandes y todavía no se puede jugar en móvil — juega en un ordenador para la mejor experiencia.",
    fr: "Le Donjon est conçu pour les grands écrans et n'est pas encore jouable sur mobile — jouez sur un ordinateur pour la meilleure expérience.",
    de: "Der Dungeon ist für größere Bildschirme gedacht und auf dem Handy noch nicht spielbar — spiele am besten am Desktop.",
    it: "Il Dungeon è progettato per schermi grandi e non è ancora giocabile su mobile — gioca su desktop per la migliore esperienza.",
    ja: "ダンジョンは大きな画面向けに設計されており、モバイルではまだプレイできません。デスクトップでプレイするのがおすすめです。",
    ko: "던전은 큰 화면에 맞게 설계되어 있으며 모바일에서는 아직 플레이할 수 없습니다. 데스크톱에서 플레이하는 것이 가장 좋습니다.",
    "zh-hans": "地牢探险是为大屏幕设计的，手机上暂时无法游玩——在电脑上玩体验最佳。",
    "zh-hant": "地牢探險是為大螢幕設計的，手機上暫時無法遊玩——在電腦上玩體驗最佳。",
  },
  "dungeon-controls-hint": {
    en: "Click adjacent tiles to move. Explore the dungeon and find the exit!",
    es: "Haz clic en casillas adyacentes para moverte. ¡Explora y encuentra la salida!",
    fr: "Cliquez sur les cases adjacentes pour vous déplacer. Explorez et trouvez la sortie !",
    de: "Klicke auf benachbarte Felder zum Bewegen. Erkunde und finde den Ausgang!",
    it: "Clicca sulle caselle adiacenti per muoverti. Esplora e trova l'uscita!",
    ja: "隣のタイルをクリックして移動。ダンジョンを探索して出口を見つけよう！",
    ko: "인접 타일을 클릭하여 이동하세요. 던전을 탐험하고 출구를 찾으세요!",
    "zh-hans": "点击相邻格子移动。探索地牢并找到出口！",
    "zh-hant": "點擊相鄰格子移動。探索地牢並找到出口！",
  },
  "dungeon-rule5": {
    en: "Other players appear as blue dots on your map.",
    es: "Otros jugadores aparecen como puntos azules en tu mapa.",
    fr: "Les autres joueurs apparaissent comme des points bleus sur votre carte.",
    de: "Andere Spieler erscheinen als blaue Punkte auf deiner Karte.",
    it: "Gli altri giocatori appaiono come punti blu sulla tua mappa.",
    ja: "他のプレイヤーはマップ上の青い点で表示される。",
    ko: "다른 플레이어는 지도상의 파란 점으로 표시됩니다.",
    "zh-hans": "其他玩家在地图上显示为蓝点。",
    "zh-hant": "其他玩家在地圖上顯示為藍點。",
  },
  "Your Character": {
    en: "Your Character", es: "Tu Personaje", fr: "Votre Personnage", de: "Dein Charakter", it: "Il tuo Personaggio",
    ja: "あなたのキャラクター", ko: "내 캐릭터", "zh-hans": "你的角色", "zh-hant": "你的角色",
  },
  "Enter your name": {
    en: "Enter your name", es: "Ingresa tu nombre", fr: "Entrez votre nom", de: "Gib deinen Namen ein", it: "Inserisci il tuo nome",
    ja: "名前を入力", ko: "이름을 입력하세요", "zh-hans": "输入你的名字", "zh-hant": "輸入你的名字",
  },
  "Choose your Pokémon": {
    en: "Choose your Pokémon", es: "Elige tu Pokémon", fr: "Choisissez votre Pokémon", de: "Wähle dein Pokémon", it: "Scegli il tuo Pokémon",
    ja: "ポケモンを選ぼう", ko: "포켓몬을 선택하세요", "zh-hans": "选择你的宝可梦", "zh-hant": "選擇你的寶可夢",
  },
  "Create Room": {
    en: "Create Room", es: "Crear Sala", fr: "Créer une Salle", de: "Raum Erstellen", it: "Crea Stanza",
    ja: "ルーム作成", ko: "룸 만들기", "zh-hans": "创建房间", "zh-hant": "創建房間",
  },
  "Create a new dungeon and invite friends": {
    en: "Create a new dungeon and invite friends",
    es: "Crea una nueva mazmorra e invita amigos",
    fr: "Créez un nouveau donjon et invitez des amis",
    de: "Erstelle ein neues Dungeon und lade Freunde ein",
    it: "Crea un nuovo dungeon e invita gli amici",
    ja: "新しいダンジョンを作成してフレンドを招待",
    ko: "새 던전을 만들고 친구를 초대하세요",
    "zh-hans": "创建新地牢并邀请朋友",
    "zh-hant": "創建新地牢並邀請朋友",
  },
  "Join Room": {
    en: "Join Room", es: "Unirse a Sala", fr: "Rejoindre une Salle", de: "Raum Beitreten", it: "Entra in Stanza",
    ja: "ルームに参加", ko: "룸 참여하기", "zh-hans": "加入房间", "zh-hant": "加入房間",
  },
  "Join a room to play cooperatively": {
    en: "Join a room to play cooperatively",
    es: "Únete a una sala para jugar cooperativamente",
    fr: "Rejoignez une salle pour jouer en coopération",
    de: "Tritt einem Raum bei, um kooperativ zu spielen",
    it: "Entra in una stanza per giocare in cooperativa",
    ja: "協力プレイでルームに参加",
    ko: "협동 플레이를 위해 룸에 참여하세요",
    "zh-hans": "加入房间进行合作游戏",
    "zh-hant": "加入房間進行合作遊戲",
  },
  "Join": {
    en: "Join", es: "Unirse", fr: "Rejoindre", de: "Beitreten", it: "Entra",
    ja: "参加", ko: "참여", "zh-hans": "加入", "zh-hant": "加入",
  },
  "Enter room code": {
    en: "Enter room code", es: "Ingresa código de sala", fr: "Entrez le code de salle", de: "Raumcode eingeben", it: "Inserisci codice stanza",
    ja: "ルームコードを入力", ko: "룸 코드를 입력하세요", "zh-hans": "输入房间代码", "zh-hant": "輸入房間代碼",
  },
  "Room not found": {
    en: "Room not found", es: "Sala no encontrada", fr: "Salle introuvable", de: "Raum nicht gefunden", it: "Stanza non trovata",
    ja: "ルームが見つからない", ko: "룸을 찾을 수 없습니다", "zh-hans": "未找到房间", "zh-hant": "未找到房間",
  },
  "Game already in progress": {
    en: "Game already in progress", es: "Juego ya en curso", fr: "Partie déjà en cours", de: "Spiel bereits läuft", it: "Partita già in corso",
    ja: "ゲーム進行中", ko: "게임이 이미 진행 중입니다", "zh-hans": "游戏已在进行中", "zh-hant": "遊戲已在進行中",
  },
  "Room is full": {
    en: "Room is full", es: "Sala llena", fr: "Salle complète", de: "Raum voll", it: "Stanza piena",
    ja: "ルームが満員", ko: "룸이 가득 찼습니다", "zh-hans": "房间已满", "zh-hant": "房間已滿",
  },
  "Room": {
    en: "Room", es: "Sala", fr: "Salle", de: "Raum", it: "Stanza",
    ja: "ルーム", ko: "룸", "zh-hans": "房间", "zh-hant": "房間",
  },
  "Code": {
    en: "Code", es: "Código", fr: "Code", de: "Code", it: "Codice",
    ja: "コード", ko: "코드", "zh-hans": "代码", "zh-hant": "代碼",
  },
  "Players": {
    en: "Players", es: "Jugadores", fr: "Joueurs", de: "Spieler", it: "Giocatori",
    ja: "プレイヤー", ko: "플레이어", "zh-hans": "玩家", "zh-hant": "玩家",
  },
  "Waiting...": {
    en: "Waiting...", es: "Esperando...", fr: "En attente...", de: "Warten...", it: "In attesa...",
    ja: "待機中...", ko: "대기 중...", "zh-hans": "等待中...", "zh-hant": "等待中...",
  },
  "Start Game": {
    en: "Start Game", es: "Iniciar Juego", fr: "Commencer", de: "Spiel Starten", it: "Inizia Partita",
    ja: "ゲーム開始", ko: "게임 시작", "zh-hans": "开始游戏", "zh-hant": "開始遊戲",
  },
  "Play": {
    en: "Play", es: "Jugar", fr: "Jouer", de: "Spielen", it: "Gioca",
    ja: "プレイ", ko: "플레이", "zh-hans": "开始", "zh-hant": "開始",
  },
  "Start a dungeon run": {
    en: "Start a dungeon run",
    es: "Inicia una carrera de mazmorra",
    fr: "Commencez un donjon",
    de: "Starte einen Dungeon-Lauf",
    it: "Inizia una corsa dungeon",
    ja: "ダンジョンを開始",
    ko: "던전을 시작하세요",
    "zh-hans": "开始地牢探索",
    "zh-hant": "開始地牢探索",
  },
  "Invade a random dungeon": {
    en: "Invade a random dungeon",
    es: "Invade una mazmorra aleatoria",
    fr: "Envahissez un donjon aléatoire",
    de: "Betritt ein zufälliges Dungeon",
    it: "Invadi un dungeon casuale",
    ja: "ランダムダンジョンに侵入",
    ko: "랜덤 던전에 침입",
    "zh-hans": "入侵随机地牢",
    "zh-hant": "入侵隨機地牢",
  },
  "Waiting for host to start...": {
    en: "Waiting for host to start...", es: "Esperando que el anfitrión inicie...", fr: "En attente de l'hôte...", de: "Warte auf Gastgeber...", it: "In attesa dell'host...",
    ja: "ホストの開始待ち...", ko: "호스트가 시작하기를 기다리는 중...", "zh-hans": "等待房主开始...", "zh-hant": "等待房主開始...",
  },
  "Leave": {
    en: "Leave", es: "Salir", fr: "Quitter", de: "Verlassen", it: "Esci",
    ja: "退出", ko: "떠나기", "zh-hans": "离开", "zh-hant": "離開",
  },
  "Party": {
    en: "Party", es: "Equipo", fr: "Équipe", de: "Gruppe", it: "Squadra",
    ja: "パーティ", ko: "파티", "zh-hans": "队伍", "zh-hant": "隊伍",
  },
  "Generating dungeon...": {
    en: "Generating dungeon...", es: "Generando mazmorra...", fr: "Génération du donjon...", de: "Dungeon wird generiert...", it: "Generazione dungeon...",
    ja: "ダンジョン生成中...", ko: "던전 생성 중...", "zh-hans": "生成地牢中...", "zh-hant": "生成地牢中...",
  },
  "You used": {
    en: "You used", es: "Usaste", fr: "Vous utilisez", de: "Du setzt ein", it: "Hai usato",
    ja: "使った", ko: "사용했다", "zh-hans": "你使用了", "zh-hant": "你使用了",
  },
  "Enemy used": {
    en: "Enemy used", es: "Enemigo usó", fr: "L'ennemi utilise", de: "Gegner setzt ein", it: "Nemico ha usato",
    ja: "敵が使った", ko: "적이 사용했다", "zh-hans": "敌人使用了", "zh-hant": "敵人使用了",
  },
  "Enemy fainted!": {
    en: "Enemy fainted!", es: "¡Enemigo debilitado!", fr: "L'ennemi est K.O. !", de: "Gegner kampfunfähig!", it: "Nemico esausto!",
    ja: "敵がたおれた！", ko: "적이 쓰러졌다!", "zh-hans": "敌人倒下了！", "zh-hant": "敵人倒下了！",
  },
  "Wild Pokémon appeared!": {
    en: "Wild Pokémon appeared!", es: "¡Pokémon salvaje apareció!", fr: "Pokémon sauvage apparaît !", de: "Wildes Pokémon erscheint!", it: "Pokémon selvatico appare!",
    ja: "野生ポケモンが現れた！", ko: "야생 포켓몬이 나타났다!", "zh-hans": "野生宝可梦出现了！", "zh-hant": "野生寶可夢出現了！",
  },
  "Enemy's turn...": {
    en: "Enemy's turn...", es: "Turno del enemigo...", fr: "Tour de l'ennemi...", de: "Gegner ist dran...", it: "Turno del nemico...",
    ja: "敵のターン...", ko: "적의 턴...", "zh-hans": "敌方回合...", "zh-hant": "敵方回合...",
  },
  "Run": {
    en: "Run", es: "Huir", fr: "Fuir", de: "Fliehen", it: "Fuggi",
    ja: "逃げる", ko: "도망가기", "zh-hans": "逃跑", "zh-hant": "逃跑",
  },
  "Got away safely!": {
    en: "Got away safely!", es: "¡Escapaste seguro!", fr: "Fuite réussie !", de: "Sicher entkommen!", it: "Fuga riuscita!",
    ja: "うまく逃げ切った！", ko: "무사히 도망쳤다!", "zh-hans": "成功逃跑了！", "zh-hant": "成功逃跑了！",
  },
  "Couldn't get away!": {
    en: "Couldn't get away!", es: "¡No pudiste escapar!", fr: "Fuite ratée !", de: "Flucht gescheitert!", it: "Fuga fallita!",
    ja: "逃げられなかった！", ko: "도망칠 수 없었다!", "zh-hans": "逃跑失败！", "zh-hant": "逃跑失敗！",
  },
  "Invade Game": {
    en: "Invade Game", es: "Invadir Juego", fr: "Envahir une Partie", de: "Spiel Betreten", it: "Invadi Partita",
    ja: "ゲームに侵入", ko: "게임에 침입", "zh-hans": "入侵游戏", "zh-hant": "入侵遊戲",
  },
  "Start a solo dungeon run": {
    en: "Start a solo dungeon run",
    es: "Inicia una carrera de mazmorra en solitario",
    fr: "Commencez un donjon solo",
    de: "Starte einen Solo-Dungeon-Lauf",
    it: "Inizia una corsa dungeon in solitario",
    ja: "ソロダンジョンを開始",
    ko: "솔로 던전을 시작하세요",
    "zh-hans": "开始单人地牢探索",
    "zh-hant": "開始單人地牢探索",
  },
  "Join an existing room as an invader": {
    en: "Join an existing room as an invader",
    es: "Únete a una sala existente como invasor",
    fr: "Rejoignez une salle existante en tant qu'envahisseur",
    de: "Tritt einem bestehenden Raum als Eindringling bei",
    it: "Entra in una stanza esistente come invasore",
    ja: "既存のルームに侵入者として参加",
    ko: "기존 룸에 침입자로 참여",
    "zh-hans": "以入侵者身份加入现有房间",
    "zh-hant": "以入侵者身份加入現有房間",
  },
  "Room code (optional)": {
    en: "Room code (optional)", es: "Código de sala (opcional)", fr: "Code de salle (optionnel)", de: "Raumcode (optional)", it: "Codice stanza (opzionale)",
    ja: "ルームコード（任意）", ko: "룸 코드 (선택사항)", "zh-hans": "房间代码（可选）", "zh-hant": "房間代碼（可選）",
  },
  "Invade": {
    en: "Invade", es: "Invadir", fr: "Envahir", de: "Betreten", it: "Invadi",
    ja: "侵入", ko: "침입", "zh-hans": "入侵", "zh-hant": "入侵",
  },
  "Invading...": {
    en: "Invading...", es: "Invadiendo...", fr: "Envahissement...", de: "Betreten...", it: "Invasione...",
    ja: "侵入中...", ko: "침입 중...", "zh-hans": "入侵中...", "zh-hant": "入侵中...",
  },
  "Starting...": {
    en: "Starting...", es: "Iniciando...", fr: "Démarrage...", de: "Starten...", it: "Avvio...",
    ja: "開始中...", ko: "시작 중...", "zh-hans": "启动中...", "zh-hant": "啟動中...",
  },
  "Joining...": {
    en: "Joining...", es: "Uniéndose...", fr: "Connexion...", de: "Beitreten...", it: "Connessione...",
    ja: "参加中...", ko: "참가 중...", "zh-hans": "加入中...", "zh-hant": "加入中...",
  },
  "Go to a dungeon": {
    en: "Go to a dungeon",
    es: "Ir a una mazmorra",
    fr: "Aller dans un donjon",
    de: "In einen Dungeon gehen",
    it: "Vai in un dungeon",
    ja: "ダンジョンへ行く",
    ko: "던전으로 이동",
    "zh-hans": "前往地牢",
    "zh-hant": "前往地牢",
  },
  "Invade a dungeon": {
    en: "Invade a dungeon",
    es: "Invadir una mazmorra",
    fr: "Envahir un donjon",
    de: "Ein Dungeon betreten",
    it: "Invadi un dungeon",
    ja: "ダンジョンに侵入",
    ko: "던전에 침입",
    "zh-hans": "入侵地牢",
    "zh-hant": "入侵地牢",
  },
  "Play with a friend": {
    en: "Play with a friend",
    es: "Jugar con un amigo",
    fr: "Jouer avec un ami",
    de: "Mit einem Freund spielen",
    it: "Gioca con un amico",
    ja: "友達と遊ぶ",
    ko: "친구와 플레이",
    "zh-hans": "与朋友一起玩",
    "zh-hant": "與朋友一起玩",
  },
  "Game not started yet": {
    en: "Game not started yet",
    es: "El juego aún no ha empezado",
    fr: "La partie n'a pas encore commencé",
    de: "Spiel hat noch nicht begonnen",
    it: "La partita non è ancora iniziata",
    ja: "ゲームはまだ始まっていません",
    ko: "게임이 아직 시작되지 않았습니다",
    "zh-hans": "游戏尚未开始",
    "zh-hant": "遊戲尚未開始",
  },
  "You're already in that dungeon!": {
    en: "You're already in that dungeon!",
    es: "¡Ya estás en esa mazmorra!",
    fr: "Vous êtes déjà dans ce donjon !",
    de: "Du bist bereits in diesem Dungeon!",
    it: "Sei già in quel dungeon!",
    ja: "そのダンジョンには既にいます！",
    ko: "이미 그 던전에 있습니다!",
    "zh-hans": "你已在该地牢中！",
    "zh-hant": "你已在該地牢中！",
  },
  "Can't attack your allies!": {
    en: "Can't attack your allies!",
    es: "¡No puedes atacar a tus aliados!",
    fr: "Impossible d'attaquer vos alliés !",
    de: "Du kannst deine Verbündeten nicht angreifen!",
    it: "Non puoi attaccare i tuoi alleati!",
    ja: "味方を攻撃できません！",
    ko: "아군을 공격할 수 없습니다!",
    "zh-hans": "不能攻击你的盟友！",
    "zh-hant": "不能攻擊你的盟友！",
  },
  "Loading...": {
    en: "Loading...", es: "Cargando...", fr: "Chargement...", de: "Laden...", it: "Caricamento...",
    ja: "読み込み中...", ko: "로딩 중...", "zh-hans": "加载中...", "zh-hant": "載入中...",
  },
  "No rooms available. Create one instead!": {
    en: "No rooms available. Create one instead!",
    es: "No hay salas disponibles. ¡Crea una!",
    fr: "Aucune salle disponible. Créez-en une !",
    de: "Keine Räume verfügbar. Erstelle einen!",
    it: "Nessuna stanza disponibile. Creane una!",
    ja: "利用可能なルームがありません。作成してください！",
    ko: "사용 가능한 룸이 없습니다. 하나 만들어 보세요!",
    "zh-hans": "没有可用房间。创建一个吧！",
    "zh-hant": "沒有可用房間。創建一個吧！",
  },
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
  "Wrong!": {
    en: "Wrong!", es: "¡Incorrecto!", fr: "Faux !", de: "Falsch!", it: "Sbagliato!",
    ja: "不正解！", ko: "오답!", "zh-hans": "错误！", "zh-hant": "錯誤！",
  },
  "Play": {
    en: "Play", es: "Jugar", fr: "Jouer", de: "Spielen", it: "Gioca",
    ja: "プレイ", ko: "플레이", "zh-hans": "开始", "zh-hant": "開始",
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
  "Login": {
    en: "Login", es: "Iniciar sesión", fr: "Connexion", de: "Anmelden", it: "Accedi",
    ja: "ログイン", ko: "로그인", "zh-hans": "登录", "zh-hant": "登入",
  },
  "Register": {
    en: "Register", es: "Registrarse", fr: "S'inscrire", de: "Registrieren", it: "Registrati",
    ja: "登録", ko: "회원가입", "zh-hans": "注册", "zh-hant": "註冊",
  },
  // PokéSlots auth screen: return to the machine without an account.
  "Play as guest": {
    en: "Play as guest", es: "Jugar como invitado", fr: "Jouer en invité", de: "Als Gast spielen", it: "Gioca come ospite",
    ja: "ゲストとしてプレイ", ko: "게스트로 플레이", "zh-hans": "以访客身份游玩", "zh-hant": "以訪客身分遊玩",
  },
  "Username": {
    en: "Username", es: "Usuario", fr: "Nom d'utilisateur", de: "Benutzername", it: "Nome utente",
    ja: "ユーザー名", ko: "사용자 이름", "zh-hans": "用户名", "zh-hant": "用戶名",
  },
  "Password": {
    en: "Password", es: "Contraseña", fr: "Mot de passe", de: "Passwort", it: "Password",
    ja: "パスワード", ko: "비밀번호", "zh-hans": "密码", "zh-hant": "密碼",
  },
  "Display Name": {
    en: "Display Name", es: "Nombre visible", fr: "Nom affiché", de: "Anzeigename", it: "Nome visualizzato",
    ja: "表示名", ko: "표시 이름", "zh-hans": "显示名称", "zh-hant": "顯示名稱",
  },
  "Enter username": {
    en: "Enter username", es: "Ingresa usuario", fr: "Entrez le nom", de: "Benutzername eingeben", it: "Inserisci nome utente",
    ja: "ユーザー名を入力", ko: "사용자 이름 입력", "zh-hans": "输入用户名", "zh-hant": "輸入用戶名",
  },
  "Enter password": {
    en: "Enter password", es: "Ingresa contraseña", fr: "Entrez le mot de passe", de: "Passwort eingeben", it: "Inserisci password",
    ja: "パスワードを入力", ko: "비밀번호 입력", "zh-hans": "输入密码", "zh-hant": "輸入密碼",
  },
  "How others see you": {
    en: "How others see you", es: "Como te ven otros", fr: "Comment les autres vous voient", de: "Wie andere dich sehen", it: "Come gli altri ti vedono",
    ja: "他の人に見える名前", ko: "다른 사람이 보는 이름", "zh-hans": "他人看到的名称", "zh-hant": "他人看到的名稱",
  },
  "No email required. Don't forget your password!": {
    en: "No email required. Don't forget your password!",
    es: "No se necesita correo. ¡No olvides tu contraseña!",
    fr: "Pas besoin d'email. N'oubliez pas votre mot de passe !",
    de: "Keine E-Mail nötig. Vergiss dein Passwort nicht!",
    it: "Nessuna email necessaria. Non dimenticare la password!",
    ja: "メール不要。パスワードを忘れないでください！",
    ko: "이메일 불필요. 비밀번호를 잊지 마세요!",
    "zh-hans": "无需邮箱。别忘记密码！",
    "zh-hant": "無需郵箱。別忘記密碼！",
  },
  "Change Password": {
    en: "Change Password", es: "Cambiar Contraseña", fr: "Changer le mot de passe", de: "Passwort ändern", it: "Cambia Password",
    ja: "パスワード変更", ko: "비밀번호 변경", "zh-hans": "修改密码", "zh-hant": "修改密碼",
  },
  "Logout": {
    en: "Logout", es: "Cerrar sesión", fr: "Déconnexion", de: "Abmelden", it: "Esci",
    ja: "ログアウト", ko: "로그아웃", "zh-hans": "退出", "zh-hant": "登出",
  },
  "Pokémon": {
    en: "Pokémon", es: "Pokémon", fr: "Pokémon", de: "Pokémon", it: "Pokémon",
    ja: "ポケモン", ko: "포켓몬", "zh-hans": "宝可梦", "zh-hant": "寶可夢",
  },
  "Click to rename": {
    en: "Click to rename", es: "Clic para renombrar", fr: "Cliquer pour renommer", de: "Klicken zum Umbenennen", it: "Clicca per rinominare",
    ja: "クリックして名前変更", ko: "클릭하여 이름 변경", "zh-hans": "点击重命名", "zh-hant": "點擊重命名",
  },
  "Rename": {
    en: "Rename", es: "Renombrar", fr: "Renommer", de: "Umbenennen", it: "Rinomina",
    ja: "名前変更", ko: "이름 변경", "zh-hans": "重命名", "zh-hant": "重命名",
  },
  "Release": {
    en: "Release", es: "Liberar", fr: "Libérer", de: "Freilassen", it: "Rilascia",
    ja: "解放", ko: "풀어주기", "zh-hans": "放生", "zh-hant": "放生",
  },
  "No Pokémon yet. Complete the quiz to get your starter!": {
    en: "No Pokémon yet. Complete the quiz to get your starter!",
    es: "Aún no tienes Pokémon. ¡Completa el quiz para obtener tu inicial!",
    fr: "Pas encore de Pokémon. Complétez le quiz pour obtenir votre starter !",
    de: "Noch keine Pokémon. Mach den Quiz für dein Starter!",
    it: "Nessun Pokémon ancora. Completa il quiz per il tuo starter!",
    ja: "まだポケモンがいません。クイズを完了してスターターをもらおう！",
    ko: "아직 포켓몬이 없습니다. 퀴즈를 풀고 스타터를 받으세요!",
    "zh-hans": "还没有宝可梦。完成测验获取你的初始宝可梦！",
    "zh-hant": "還沒有寶可夢。完成測驗獲取你的初始寶可夢！",
  },
  "Your personality type": {
    en: "Your personality type", es: "Tu tipo de personalidad", fr: "Votre type de personnalité", de: "Dein Persönlichkeitstyp", it: "Il tuo tipo di personalità",
    ja: "あなたの性格タイプ", ko: "당신의 성격 유형", "zh-hans": "你的性格类型", "zh-hant": "你的性格類型",
  },
  "Choose your partner Pokémon!": {
    en: "Choose your partner Pokémon!", es: "¡Elige tu Pokémon compañero!", fr: "Choisissez votre Pokémon partenaire !", de: "Wähle dein Partner-Pokémon!", it: "Scegli il tuo Pokémon partner!",
    ja: "相棒ポケモンを選ぼう！", ko: "파트너 포켓몬을 선택하세요!", "zh-hans": "选择你的搭档宝可梦！", "zh-hant": "選擇你的搭檔寶可夢！",
  },
  "type": {
    en: "type", es: "tipo", fr: "type", de: "Typ", it: "tipo",
    ja: "タイプ", ko: "타입", "zh-hans": "属性", "zh-hant": "屬性",
  },
  "Reroll": {
    en: "Reroll", es: "Reintentar", fr: "Relancer", de: "Neu würfeln", it: "Ritira",
    ja: "再抽選", ko: "다시 뽑기", "zh-hans": "重新抽取", "zh-hant": "重新抽取",
  },
  "Question": {
    en: "Question", es: "Pregunta", fr: "Question", de: "Frage", it: "Domanda",
    ja: "質問", ko: "질문", "zh-hans": "问题", "zh-hant": "問題",
  },
  "brave": {
    en: "Brave", es: "Valiente", fr: "Courageux", de: "Mutig", it: "Coraggioso",
    ja: "勇敢", ko: "용감", "zh-hans": "勇敢", "zh-hant": "勇敢",
  },
  "gentle": {
    en: "Gentle", es: "Gentil", fr: "Doux", de: "Sanft", it: "Gentile",
    ja: "優しい", ko: "온화", "zh-hans": "温柔", "zh-hant": "溫柔",
  },
  "quick": {
    en: "Quick", es: "Rápido", fr: "Rapide", de: "Schnell", it: "Veloce",
    ja: "素早い", ko: "빠름", "zh-hans": "迅捷", "zh-hant": "迅捷",
  },
  "tough": {
    en: "Tough", es: "Duro", fr: "Coriace", de: "Zäh", it: "Robusto",
    ja: "たくましい", ko: "튼튼", "zh-hans": "坚韧", "zh-hant": "堅韌",
  },
  "clever": {
    en: "Clever", es: "Listo", fr: "Rusé", de: "Klug", it: "Intelligente",
    ja: "賢い", ko: "영리", "zh-hans": "聪明", "zh-hant": "聰明",
  },
  "Saving...": {
    en: "Saving...", es: "Guardando...", fr: "Enregistrement...", de: "Speichern...", it: "Salvataggio...",
    ja: "保存中...", ko: "저장 중...", "zh-hans": "保存中...", "zh-hant": "儲存中...",
  },
  "Oh!": {
    en: "Oh!", es: "¡Anda!", fr: "Oh !", de: "Oh!", it: "Oh!",
    ja: "あら！", ko: "어머!", "zh-hans": "哦！", "zh-hant": "哦！",
  },
  "wants to join your team!": {
    en: "wants to join your team!", es: "quiere unirse a tu equipo!", fr: "veut rejoindre votre équipe !", de: "möchte deinem Team beitreten!", it: "vuole unirsi alla tua squadra!",
    ja: "仲間になりたい！", ko: "팀에 합류하고 싶어합니다!", "zh-hans": "想要加入你的队伍！", "zh-hant": "想要加入你的隊伍！",
  },
  "Your team is full! Release a Pokémon to make room.": {
    en: "Your team is full! Release a Pokémon to make room.",
    es: "¡Tu equipo está lleno! Libera un Pokémon para hacer espacio.",
    fr: "Votre équipe est pleine ! Libérez un Pokémon pour faire de la place.",
    de: "Dein Team ist voll! Lass ein Pokémon frei, um Platz zu machen.",
    it: "La tua squadra è piena! Rilascia un Pokémon per fare spazio.",
    ja: "チームが満員です！スペースを空けるためにポケモンを解放してください。",
    ko: "팀이 가득 찼습니다! 자리를 만들려면 포켓몬을 풀어주세요.",
    "zh-hans": "队伍已满！释放一只宝可梦腾出空间。",
    "zh-hant": "隊伍已滿！釋放一隻寶可夢騰出空間。",
  },
  "Add to team": {
    en: "Add to team", es: "Agregar al equipo", fr: "Ajouter à l'équipe", de: "Zum Team hinzufügen", it: "Aggiungi alla squadra",
    ja: "チームに追加", ko: "팀에 추가", "zh-hans": "加入队伍", "zh-hant": "加入隊伍",
  },
  "Decline": {
    en: "Decline", es: "Rechazar", fr: "Refuser", de: "Ablehnen", it: "Rifiuta",
    ja: "辞退", ko: "거절", "zh-hans": "拒绝", "zh-hant": "拒絕",
  },
  "Lv": {
    en: "Lv", es: "Nv", fr: "Nv", de: "Lv", it: "Lv",
    ja: "Lv", ko: "Lv", "zh-hans": "Lv", "zh-hant": "Lv",
  },
  "Floor": {
    en: "Floor", es: "Piso", fr: "Étage", de: "Etage", it: "Piano",
    ja: "階", ko: "층", "zh-hans": "层", "zh-hant": "層",
  },
  "Gold": {
    en: "Gold", es: "Oro", fr: "Or", de: "Gold", it: "Oro",
    ja: "ゴールド", ko: "골드", "zh-hans": "金币", "zh-hant": "金幣",
  },
  "Confirm": {
    en: "Confirm", es: "Confirmar", fr: "Confirmer", de: "Bestätigen", it: "Conferma",
    ja: "確認", ko: "확인", "zh-hans": "确认", "zh-hant": "確認",
  },
  "dungeon-stairs-title": {
    en: "Stairs found!", es: "¡Escaleras encontradas!", fr: "Escaliers trouvés !", de: "Treppe gefunden!", it: "Scale trovate!",
    ja: "階段を発見！", ko: "계단을 찾았다!", "zh-hans": "发现楼梯！", "zh-hant": "發現樓梯！",
  },
  "dungeon-stairs-desc": {
    en: "You found the exit stairs. What will you do?", es: "Encontraste las escaleras de salida. ¿Qué harás?", fr: "Vous avez trouvé les escaliers de sortie. Que faites-vous ?", de: "Du hast die Ausgangstreppe gefunden. Was wirst du tun?", it: "Hai trovato le scale d'uscita. Cosa farai?",
    ja: "出口の階段を発見した。どうする？", ko: "출구 계단을 찾았다. 어떻게 할까?", "zh-hans": "你找到了出口楼梯。你要怎么做？", "zh-hant": "你找到了出口樓梯。你要怎麼做？",
  },
  "dungeon-descend": {
    en: "Descend deeper", es: "Descender más profundo", fr: "Descendre plus profond", de: "Tiefer hinabsteigen", it: "Scendere più in profondità",
    ja: "さらに深く降りる", ko: "더 깊이 내려가기", "zh-hans": "继续深入", "zh-hant": "繼續深入",
  },
  "dungeon-leave-safely": {
    en: "Leave safely", es: "Salir seguro", fr: "Partir en sécurité", de: "Sicher verlassen", it: "Uscire in sicurezza",
    ja: "安全に退出する", ko: "안전하게 나가기", "zh-hans": "安全离开", "zh-hant": "安全離開",
  },
  "dungeon-exit-title": {
    en: "Safe Exit", es: "Salida segura", fr: "Sortie sécurisée", de: "Sicherer Ausgang", it: "Uscita sicura",
    ja: "安全な退出", ko: "안전한 퇴장", "zh-hans": "安全出口", "zh-hant": "安全出口",
  },
  "dungeon-exit-saved": {
    en: "Your gold and items have been saved!", es: "¡Tu oro y objetos han sido guardados!", fr: "Votre or et vos objets ont été sauvegardés !", de: "Dein Gold und deine Gegenstände wurden gespeichert!", it: "Il tuo oro e i tuoi oggetti sono stati salvati!",
    ja: "ゴールドとアイテムは保存された！", ko: "골드와 아이템이 저장되었습니다!", "zh-hans": "你的金币和物品已保存！", "zh-hant": "你的金幣和物品已保存！",
  },
  "dungeon-storage-msg": {
    en: "Your team is full! This Pokémon will be sent to storage.", es: "¡Tu equipo está lleno! Este Pokémon será enviado al almacén.", fr: "Votre équipe est pleine ! Ce Pokémon sera envoyé au stockage.", de: "Dein Team ist voll! Dieses Pokémon wird ins Lager geschickt.", it: "La tua squadra è piena! Questo Pokémon verrà inviato al deposito.",
    ja: "チームがいっぱいです！このポケモンは保管庫に送られます。", ko: "팀이 가득 찼습니다! 이 포켓몬은 보관소로 보내집니다.", "zh-hans": "队伍已满！这只宝可梦将被送到仓库。", "zh-hant": "隊伍已滿！這隻寶可夢將被送到倉庫。",
  },
  "dungeon-send-storage": {
    en: "Send to storage", es: "Enviar al almacén", fr: "Envoyer au stockage", de: "Ins Lager schicken", it: "Invia al deposito",
    ja: "保管庫に送る", ko: "보관소로 보내기", "zh-hans": "送到仓库", "zh-hant": "送到倉庫",
  },
  "Enjoy Pokémon in different ways": {
    en: "Enjoy Pokémon in different ways", es: "Disfruta Pokémon de diferentes maneras", fr: "Profitez de Pokémon de différentes manières", de: "Genieße Pokémon auf verschiedene Weise", it: "Goditi Pokémon in diversi modi",
    ja: "ポケモンをさまざまな方法で楽しもう", ko: "다양한 방법으로 포켓몬을 즐기세요", "zh-hans": "以不同的方式享受宝可梦", "zh-hant": "以不同的方式享受寶可夢",
  },
  "dungeon-enemies-moving": {
    en: "Enemies are moving...", es: "Los enemigos se mueven...", fr: "Les ennemis se déplacent...", de: "Gegner bewegen sich...", it: "I nemici si muovono...",
    ja: "敵が動いている...", ko: "적이 움직이고 있습니다...", "zh-hans": "敌人正在移动...", "zh-hant": "敵人正在移動...",
  },
  "Pokedle": {
    en: "Pokedle", es: "Pokedle", fr: "Pokedle", de: "Pokedle", it: "Pokedle",
    ja: "ポケドル", ko: "포케들", "zh-hans": "宝可梦猜谜", "zh-hant": "寶可夢猜謎",
  },
  "Dexmaster": {
    en: "Dexmaster", es: "Dexmaster", fr: "Dexmaster", de: "Dexmaster", it: "Dexmaster",
    ja: "デックスマスター", ko: "덱스마스터", "zh-hans": "图鉴大师", "zh-hant": "圖鑑大師",
  },
  "Pokéroguelite": {
    en: "Pokéroguelite", es: "Pokéroguelite", fr: "Pokéroguelite", de: "Pokéroguelite", it: "Pokéroguelite",
    ja: "ポケローグライト", ko: "포케로그라이트", "zh-hans": "宝可梦肉鸽", "zh-hant": "寶可夢肉鴿",
  },
  "Patch Notes": {
    en: "Patch Notes", es: "Notas del Parche", fr: "Notes de Mise à Jour", de: "Patch-Notizen", it: "Note di Aggiornamento",
    ja: "パッチノート", ko: "패치 노트", "zh-hans": "更新日志", "zh-hant": "更新日誌",
  },
  "Search and explore Pokemon by name, type, generation, stats, and more": {
    en: "Search and explore Pokemon by name, type, generation, stats, and more",
    es: "Busca y explora Pokémon por nombre, tipo, generación, estadísticas y más",
    fr: "Recherchez et explorez les Pokémon par nom, type, génération, statistiques et plus",
    de: "Suche und erkunde Pokémon nach Name, Typ, Generation, Werten und mehr",
    it: "Cerca ed esplora i Pokémon per nome, tipo, generazione, statistiche e altro",
    ja: "名前、タイプ、世代、ステータスなどでポケモンを検索・探索",
    ko: "이름, 타입, 세대, 스탯 등으로 포켓몬 검색 및 탐색",
    "zh-hans": "按名称、属性、世代、种族值等搜索和探索宝可梦",
    "zh-hant": "按名稱、屬性、世代、種族值等搜索和探索寶可夢",
  },
  "Daily Pokemon guessing game — test your knowledge": {
    en: "Daily Pokemon guessing game — test your knowledge",
    es: "Juego diario de adivinanzas Pokémon — pon a prueba tu conocimiento",
    fr: "Jeu de devinettes Pokémon quotidien — testez vos connaissances",
    de: "Tägliches Pokémon-Ratespiel — teste dein Wissen",
    it: "Gioco di indovinelli Pokémon quotidiano — metti alla prova le tue conoscenze",
    ja: "毎日ポケモン当てクイズ — 知識を試そう",
    ko: "매일 포켓몬 맞추기 게임 — 지식을 테스트하세요",
    "zh-hans": "每日宝可梦猜谜游戏 — 测试你的知识",
    "zh-hant": "每日寶可夢猜謎遊戲 — 測試你的知識",
  },
  "Track your progress and master the Pokedex": {
    en: "Track your progress and master the Pokedex",
    es: "Sigue tu progreso y domina la Pokédex",
    fr: "Suivez votre progression et maîtrisez le Pokédex",
    de: "Verfolge deinen Fortschritt und meistere den Pokédex",
    it: "Tieni traccia dei tuoi progressi e padroneggia il Pokédex",
    ja: "進行状況を追跡し、ポケモン図鑑をマスター",
    ko: "진행 상황을 추적하고 포켓몬도감을 마스터하세요",
    "zh-hans": "追踪进度，掌握宝可梦图鉴",
    "zh-hant": "追蹤進度，掌握寶可夢圖鑑",
  },
  "Team-based roguelite with Slay the Spire-style map progression": {
    en: "Team-based roguelite with Slay the Spire-style map progression",
    es: "Roguelite por equipos con progresión de mapa estilo Slay the Spire",
    fr: "Roguelite en équipe avec progression de carte style Slay the Spire",
    de: "Team-basierter Roguelite mit Kartenfortschritt im Slay the Spire-Stil",
    it: "Roguelite a squadre con progressione della mappa stile Slay the Spire",
    ja: "Slay the Spire風マップ進行のチーム制ローグライト",
    ko: "Slay the Spire 스타일 맵 진행의 팀 기반 로그라이트",
    "zh-hans": "团队肉鸽，杀戮尖塔风格地图推进",
    "zh-hant": "團隊肉鴿，殺戮尖塔風格地圖推進",
  },
  "Compare Pokemon stats and prove your knowledge": {
    en: "Compare Pokemon stats and prove your knowledge",
    es: "Compara estadísticas Pokémon y demuestra tu conocimiento",
    fr: "Comparez les statistiques des Pokémon et prouvez vos connaissances",
    de: "Vergleiche Pokémon-Werte und beweise dein Wissen",
    it: "Confronta le statistiche dei Pokémon e dimostra la tua conoscenza",
    ja: "ポケモンのステータスを比較して知識を証明",
    ko: "포켓몬 스탯을 비교하고 지식을 증명하세요",
    "zh-hans": "比较宝可梦种族值，证明你的知识",
    "zh-hant": "比較寶可夢種族值，證明你的知識",
  },
  "Multiplayer dungeon exploration with friends": {
    en: "Multiplayer dungeon exploration with friends",
    es: "Exploración de mazmorras multijugador con amigos",
    fr: "Exploration de donjons multijoueur entre amis",
    de: "Multiplayer-Dungeon-Erkundung mit Freunden",
    it: "Esplorazione di dungeon multiplayer con gli amici",
    ja: "フレンドと一緒にマルチプレイダンジョン探索",
    ko: "친구와 함께하는 멀티플레이어 던전 탐험",
    "zh-hans": "与朋友一起多人地牢探索",
    "zh-hant": "與朋友一起多人地牢探索",
  },
  "Items": {
    en: "Items", es: "Artículos", fr: "Objets", de: "Gegenstände", it: "Oggetti",
    ja: "アイテム", ko: "아이템", "zh-hans": "道具", "zh-hant": "道具",
  },
  "Use": {
    en: "Use", es: "Usar", fr: "Utiliser", de: "Benutzen", it: "Usa",
    ja: "使う", ko: "사용", "zh-hans": "使用", "zh-hant": "使用",
  },
  "No items collected": {
    en: "No items collected", es: "No hay objetos", fr: "Aucun objet", de: "Keine Gegenstände", it: "Nessun oggetto",
    ja: "アイテムなし", ko: "아이템 없음", "zh-hans": "没有道具", "zh-hant": "沒有道具",
  },
  "Items collected": {
    en: "Items collected", es: "Objetos recogidos", fr: "Objets ramassés", de: "Gesammelte Gegenstände", it: "Oggetti raccolti",
    ja: "集めたアイテム", ko: "수집한 아이템", "zh-hans": "收集的道具", "zh-hant": "收集的道具",
  },
  "healed": {
    en: "healed", es: "recuperó", fr: "soigné", de: "geheilt", it: "recuperato",
    ja: "回復した", ko: "회복됨", "zh-hans": "恢复了", "zh-hant": "恢復了",
  },
  "was cured of": {
    en: "was cured of", es: "se curó de", fr: "guéri de", de: "geheilt von", it: "guarito da",
    ja: "が治った", ko: "을 치료함", "zh-hans": "治愈了", "zh-hant": "治癒了",
  },
  "It had no effect...": {
    en: "It had no effect...", es: "No tuvo efecto...", fr: "Aucun effet...", de: "Keine Wirkung...", it: "Nessun effetto...",
    ja: "効果がなかった...", ko: "효과가 없었다...", "zh-hans": "没有效果...", "zh-hant": "沒有效果...",
  },
  "is now Awaken (sleep-proof until the stairs)!": {
    en: "is now Awaken (sleep-proof until the stairs)!", es: "ahora está Despierto (inmune al sueño hasta las escaleras)!",
    fr: "est maintenant Éveillé (immunisé au sommeil jusqu'aux escaliers) !", de: "ist jetzt Wach (schlafimmun bis zur Treppe)!",
    it: "ora è Sveglio (immune al sonno fino alle scale)!", ja: "目覚めた状態になった（階段まで眠り免疫）！",
    ko: "지금은 깨어있음 상태(계단까지 수면 면역)입니다!", "zh-hans": "现在处于清醒状态（到楼梯前免疫睡眠）！", "zh-hant": "現在處於清醒狀態（到樓梯前免疫睡眠）！",
  },
  "PP fully restored!": {
    en: "PP fully restored!", es: "¡PP totalmente restaurado!", fr: "PP entièrement restaurés !", de: "AP vollständig wiederhergestellt!",
    it: "PP completamente ripristinati!", ja: "PPが全回復した！", ko: "PP가 완전 회복됨!", "zh-hans": "PP完全恢复！", "zh-hant": "PP完全恢復！",
  },
  "is hurt by": {
    en: "is hurt by", es: "recibe daño de", fr: "est blessé par", de: "wird verletzt durch", it: "subisce danni da",
    ja: "によるダメージを受けた", ko: "로 피해를 입음", "zh-hans": "受到了...的伤害", "zh-hant": "受到了...的傷害",
  },
  "woke up!": {
    en: "woke up!", es: "se despertó!", fr: "s'est réveillé !", de: "ist aufgewacht!", it: "si è svegliato!",
    ja: "目を覚ました！", ko: "깨어났다!", "zh-hans": "醒来了！", "zh-hant": "醒來了！",
  },
  "is fast asleep...": {
    en: "is fast asleep...", es: "está profundamente dormido...", fr: "dort profondément...", de: "schläft tief...",
    it: "dorme profondamente...", ja: "ぐっすり眠っている...", ko: "깊이 잠들어 있다...", "zh-hans": "在熟睡...", "zh-hant": "在熟睡...",
  },
  "is paralyzed! It can't move!": {
    en: "is paralyzed! It can't move!", es: "está paralizado! No puede moverse!", fr: "est paralysé ! Il ne peut pas bouger !",
    de: "ist paralysiert! Es kann sich nicht bewegen!", it: "è paralizzato! Non può muoversi!",
    ja: "まひしていて動けない！", ko: "마비되어 움직일 수 없다!", "zh-hans": "麻痹了，无法行动！", "zh-hant": "麻痺了，無法行動！",
  },
  "is protected by Awaken!": {
    en: "is protected by Awaken!", es: "está protegido por Despierto!", fr: "est protégé par Éveil !", de: "ist durch Wach geschützt!",
    it: "è protetto da Sveglio!", ja: "目覚め状態に守られている！", ko: "깨어있음의 보호를 받고 있다!",
    "zh-hans": "受到清醒状态保护！", "zh-hant": "受到清醒狀態保護！",
  },
  "was poisoned": {
    en: "was poisoned", es: "fue envenenado", fr: "a été empoisonné", de: "wurde vergiftet", it: "è stato avvelenato",
    ja: "どく状態になった", ko: "독 상태가 되었다", "zh-hans": "中毒了", "zh-hant": "中毒了",
  },
  "was burned": {
    en: "was burned", es: "fue quemado", fr: "a été brûlé", de: "wurde verbrannt", it: "è stato ustionato",
    ja: "やけど状態になった", ko: "화상 상태가 되었다", "zh-hans": "灼伤了", "zh-hant": "灼傷了",
  },
  "was paralyzed": {
    en: "was paralyzed", es: "fue paralizado", fr: "a été paralysé", de: "wurde paralysiert", it: "è stato paralizzato",
    ja: "まひ状態になった", ko: "마비 상태가 되었다", "zh-hans": "麻痹了", "zh-hant": "麻痺了",
  },
  "fell asleep": {
    en: "fell asleep", es: "se durmió", fr: "s'est endormi", de: "ist eingeschlafen", it: "si è addormentato",
    ja: "眠り状態になった", ko: "잠든 상태가 되었다", "zh-hans": "睡着了", "zh-hant": "睡著了",
  },
  "has no PP left!": {
    en: "has no PP left!", es: "no le queda PP!", fr: "n'a plus de PP !", de: "hat keine AP mehr!", it: "non ha più PP!",
    ja: "PPが残っていない！", ko: "PP가 남아 있지 않다!", "zh-hans": "没有PP了！", "zh-hant": "沒有PP了！",
  },
  "Poisoned": {
    en: "Poisoned", es: "Envenenado", fr: "Empoisonné", de: "Vergiftet", it: "Avvelenato",
    ja: "どく", ko: "독", "zh-hans": "中毒", "zh-hant": "中毒",
  },
  "Burned": {
    en: "Burned", es: "Quemado", fr: "Brûlé", de: "Verbrannt", it: "Ustionato",
    ja: "やけど", ko: "화상", "zh-hans": "灼伤", "zh-hant": "灼傷",
  },
  "Paralyzed": {
    en: "Paralyzed", es: "Paralizado", fr: "Paralysé", de: "Paralysiert", it: "Paralizzato",
    ja: "まひ", ko: "마비", "zh-hans": "麻痹", "zh-hant": "麻痺",
  },
  "Asleep": {
    en: "Asleep", es: "Dormido", fr: "Endormi", de: "Schlafend", it: "Addormentato",
    ja: "ねむり", ko: "잠듦", "zh-hans": "睡眠", "zh-hant": "睡眠",
  },
  "Awaken": {
    en: "Awaken", es: "Despierto", fr: "Éveil", de: "Wach", it: "Sveglio",
    ja: "目覚め", ko: "깨어있음", "zh-hans": "清醒", "zh-hant": "清醒",
  },
  "fainted": {
    en: "fainted", es: "se desmayó", fr: "a fait l'évanouissement", de: "ist ohnmächtig geworden", it: "è svenuto",
    ja: "ひんし", ko: "기절함", "zh-hans": "倒下了", "zh-hant": "倒下了",
  },
  "gifts": {
    en: "Gifts", es: "Regalos", fr: "Cadeaux", de: "Geschenke", it: "Regali",
    ja: "プレゼント", ko: "선물", "zh-hans": "礼物", "zh-hant": "禮物",
  },
  "gift-sent-you": {
    en: "sent you a gift", es: "te envió un regalo", fr: "t'a envoyé un cadeau", de: "hat dir ein Geschenk geschickt", it: "ti ha inviato un regalo",
    ja: "プレゼントを送ってきた", ko: "선물을 보냈습니다", "zh-hans": "送了你一份礼物", "zh-hant": "送了你一份禮物",
  },
  "gift-empty": {
    en: "No gifts yet. Send items or gold to friends to get started!", es: "Aún no hay regalos. ¡Envía objetos u oro a tus amigos para empezar!", fr: "Pas encore de cadeaux. Envoyez des objets ou de l'or à des amis pour commencer !", de: "Noch keine Geschenke. Schicke Freunden Gegenstände oder Gold, um zu starten!", it: "Nessun regalo ancora. Invia oggetti o oro agli amici per iniziare!",
    ja: "まだプレゼントはありません。友達にアイテムやゴールドを送ってみよう！", ko: "아직 선물이 없습니다. 친구에게 아이템이나 골드를 보내보세요!", "zh-hans": "还没有礼物。给朋友发送物品或金币开始吧！", "zh-hant": "還沒有禮物。給朋友發送物品或金幣開始吧！",
  },
  "gift-send-this": {
    en: "Send this to a friend:", es: "Enviar esto a un amigo:", fr: "Envoyer ceci à un ami :", de: "An einen Freund senden:", it: "Invia questo a un amico:",
    ja: "友達に送る：", ko: "친구에게 보내기:", "zh-hans": "发送给朋友：", "zh-hant": "發送給朋友：",
  },
  "gift-send-gold": {
    en: "Send gold to a friend", es: "Enviar oro a un amigo", fr: "Envoyer de l'or à un ami", de: "Gold an einen Freund senden", it: "Invia oro a un amico",
    ja: "友達にゴールドを送る", ko: "친구에게 골드 보내기", "zh-hans": "给朋友发送金币", "zh-hant": "給朋友發送金幣",
  },
  "gift-send-hint": {
    en: "Gold is held until your friend accepts or declines.", es: "El oro se guarda hasta que tu amigo acepte o rechace.", fr: "L'or est conservé jusqu'à ce que votre ami accepte ou refuse.", de: "Gold wird zurückgehalten, bis dein Freund annimmt oder ablehnt.", it: "L'oro viene trattenuto finché il tuo amico non accetta o rifiuta.",
    ja: "友達が受け取るか断るまでゴールドは保留されます。", ko: "친구가 수락하거나 거절할 때까지 골드가 보류됩니다.", "zh-hans": "金币将保留到你的朋友接受或拒绝。", "zh-hant": "金幣將保留到你的朋友接受或拒絕。",
  },
  "gift-no-friends": {
    en: "You have no friends yet. Add friends from the Friends button first!", es: "Aún no tienes amigos. ¡Añade amigos desde el botón Amigos primero!", fr: "Vous n'avez pas encore d'amis. Ajoutez d'abord des amis via le bouton Amis !", de: "Du hast noch keine Freunde. Füge zuerst Freunde über den Freunde-Button hinzu!", it: "Non hai ancora amici. Aggiungi amici dal pulsante Amici prima!",
    ja: "まだ友達がいません。まず友達ボタンから友達を追加しよう！", ko: "아직 친구가 없습니다. 친구 버튼에서 먼저 친구를 추가하세요!", "zh-hans": "还没有朋友。先从好友按钮添加好友吧！", "zh-hant": "還沒有朋友。先從好友按鈕新增好友吧！",
  },
  "gift-send-pkm": {
    en: "Send this Pokémon to a friend:", es: "Enviar este Pokémon a un amigo:", fr: "Envoyer ce Pokémon à un ami :", de: "Dieses Pokémon an einen Freund senden:", it: "Invia questo Pokémon a un amico:",
    ja: "このポケモンを友達に送る：", ko: "이 포켓몬을 친구에게 보내기:", "zh-hans": "将这只宝可梦发送给朋友：", "zh-hant": "將這隻寶可夢發送給朋友：",
  },
  "gift-send-pkm-hint": {
    en: "They'll join your friend's club if accepted, or come back here if declined.", es: "Se unirán al club de tu amigo si se acepta, o volverán aquí si se rechaza.", fr: "Ils rejoindront le club de votre ami s'il accepte, ou reviendront ici s'il refuse.", de: "Sie schließen sich dem Club deines Freundes an, wenn angenommen, oder kommen hierher zurück, wenn abgelehnt.", it: "Si uniranno al club del tuo amico se accettato, o torneranno qui se rifiutato.",
    ja: "受け取られると友達のクラブに加わり、断られるとここに戻ります。", ko: "수락하면 친구의 클럽에 합류하고, 거절하면 여기로 돌아옵니다.", "zh-hans": "接受后它们会加入朋友的俱乐部，拒绝后它们会回到这里。", "zh-hant": "接受後它們會加入朋友的俱樂部，拒絕後它們會回到這裡。",
  },
  "Accept": {
    en: "Accept", es: "Aceptar", fr: "Accepter", de: "Annehmen", it: "Accetta",
    ja: "受け取る", ko: "수락", "zh-hans": "接受", "zh-hant": "接受",
  },
  "Pending": {
    en: "Pending", es: "Pendiente", fr: "En attente", de: "Ausstehend", it: "In attesa",
    ja: "保留中", ko: "대기 중", "zh-hans": "待处理", "zh-hant": "待處理",
  },
  "Accepted": {
    en: "Accepted", es: "Aceptado", fr: "Accepté", de: "Angenommen", it: "Accettato",
    ja: "受け取り済み", ko: "수락됨", "zh-hans": "已接受", "zh-hant": "已接受",
  },
  "Declined": {
    en: "Declined", es: "Rechazado", fr: "Refusé", de: "Abgelehnt", it: "Rifiutato",
    ja: "拒否済み", ko: "거절됨", "zh-hans": "已拒绝", "zh-hant": "已拒絕",
  },

  // ─── Village NPCs & shop ───
  "Shop": {
    en: "Shop", es: "Tienda", fr: "Boutique", de: "Laden", it: "Negozio",
    ja: "ショップ", ko: "상점", "zh-hans": "商店", "zh-hant": "商店",
  },
  "Move Changer": {
    en: "Move Changer", es: "Tutor Movimientos", fr: "Changeur de Capacités", de: "Attacken-Wechsler", it: "Cambia Mosse",
    ja: "わざ変更", ko: "기술 변경가", "zh-hans": "招式变更者", "zh-hant": "招式變更者",
  },
  "Sage": {
    en: "Sage", es: "Sabio", fr: "Sage", de: "Weiser", it: "Saggio",
    ja: "賢者", ko: "현자", "zh-hans": "贤者", "zh-hant": "賢者",
  },
  "Whiscash is a wise old sage who has seen countless evolutions. He can help a Pokémon evolve — by reaching the right level, or with an evolution stone from your storage — whether it's on your team or in the club!": {
    en: "Whiscash is a wise old sage who has seen countless evolutions. He can help a Pokémon evolve — by reaching the right level, or with an evolution stone from your storage — whether it's on your team or in the club!", es: "Whiscash es un viejo sabio que ha presenciado innumerables evoluciones. ¡Puede ayudar a evolucionar a un Pokémon alcanzando el nivel correcto o con una piedra evolutiva de tu almacén — ya sea de tu equipo o del club!", fr: "Whiscash est un vieux sage qui a vu d'innombrables évolutions. Il peut aider un Pokémon à évoluer — en atteignant le bon niveau, ou avec une pierre évolutive de votre stockage — qu'il soit dans votre équipe ou au club !", de: "Whiscash ist ein weiser alter Gelehrter, der unzählige Entwicklungen gesehen hat. Er kann ein Pokémon entwickeln — durch das richtige Level oder einen Evolutionsstein aus deinem Lager — im Team oder im Club!", it: "Whiscash è un vecchio saggio che ha visto innumerevoli evoluzioni. Può far evolvere un Pokémon — raggiungendo il livello giusto o con una pietra evolutiva dal tuo deposito — della tua squadra o del club!",
    ja: "ナマズンは数えきれない進化を見てきた賢い老いたポケモンです。レベルに達するか、保管庫の進化の石を使ってポケモンを進化させられます — チームでもクラブでも！", ko: "메깅은 수많은 진화를 지켜본 현명한 늙은 포켓몬입니다. 알맞은 레벨에 도달하거나 보관소의 진화의 돌을 사용해 포켓몬을 진화시켜 줄 수 있어요 — 팀이든 클럽이든!", "zh-hans": "鲸鱼王是一位见多识广的老贤者，见证过无数进化。只要到达正确等级，或用仓库里的进化之石，他就能帮助宝可梦进化——无论是队伍还是俱乐部里的！", "zh-hant": "鯨魚王是一位見多識廣的老賢者，見證過無數進化。只要到達正確等級，或用倉庫裡的進化之石，他就能幫助寶可夢進化——無論是隊伍還是俱樂部裡的！",
  },
  "Checking...": {
    en: "Checking...", es: "Comprobando...", fr: "Vérification...", de: "Prüfe...", it: "Controllo...",
    ja: "確認中...", ko: "확인 중...", "zh-hans": "检查中...", "zh-hant": "檢查中...",
  },
  "No Pokémon can evolve yet. Reach a new level or find an evolution stone in dungeons!": {
    en: "No Pokémon can evolve yet. Reach a new level or find an evolution stone in dungeons!", es: "Ningún Pokémon puede evolucionar aún. ¡Alcanza un nuevo nivel o encuentra una piedra evolutiva en las mazmorras!", fr: "Aucun Pokémon ne peut évoluer pour l'instant. Atteignez un nouveau niveau ou trouvez une pierre évolutive dans les donjons !", de: "Noch kein Pokémon kann sich entwickeln. Erreiche ein neues Level oder finde einen Evolutionsstein in Dungeons!", it: "Nessun Pokémon può ancora evolversi. Raggiungi un nuovo livello o trova una pietra evolutiva nei dungeon!",
    ja: "まだ進化できるポケモンがいません。新しいレベルに達するか、ダンジョンで進化の石を見つけよう！", ko: "아직 진화할 수 있는 포켓몬이 없습니다. 새 레벨에 도달하거나 던전에서 진화의 돌을 찾으세요!", "zh-hans": "还没有可以进化的宝可梦。达到新等级，或在迷宫中找到进化之石吧！", "zh-hant": "還沒有可以進化的寶可夢。達到新等級，或在迷宮中找到進化之石吧！",
  },
  "Evolve": {
    en: "Evolve", es: "Evolucionar", fr: "Évoluer", de: "Entwickeln", it: "Evolvi",
    ja: "進化", ko: "진화", "zh-hans": "进化", "zh-hant": "進化",
  },
  "Rename": {
    en: "Rename", es: "Renombrar", fr: "Renommer", de: "Umbenennen", it: "Rinomina",
    ja: "名前を変える", ko: "이름 변경", "zh-hans": "重命名", "zh-hant": "重新命名",
  },
  "Bank": {
    en: "Bank", es: "Banco", fr: "Banque", de: "Bank", it: "Banca",
    ja: "銀行", ko: "은행", "zh-hans": "银行", "zh-hant": "銀行",
  },
  "Pocket": {
    en: "Pocket", es: "Bolsillo", fr: "Poche", de: "Tasche", it: "Tasca",
    ja: "ポケット", ko: "주머니", "zh-hans": "口袋", "zh-hant": "口袋",
  },
  "Kangaskhan Storage": {
    en: "Kangaskhan Storage", es: "Consigna Kangaskhan", fr: "Stockage Kangourex", de: "Kangama-Lager", it: "Deposito Kangaskhan",
    ja: "ガルーラ保管庫", ko: "캥카 보관소", "zh-hans": "袋兽仓库", "zh-hant": "袋獸倉庫",
  },
  "Club Wigglytuff": {
    en: "Club Wigglytuff", es: "Club Wigglytuff", fr: "Club Grodoudou", de: "Club Knuddeluff", it: "Club Wigglytuff",
    ja: "プクリンクラブ", ko: "푸크린 클럽", "zh-hans": "胖丁俱乐部", "zh-hant": "胖丁俱樂部",
  },
  "Account Reset": {
    en: "Account Reset", es: "Reinicio de Cuenta", fr: "Réinitialisation du Compte", de: "Konto zurücksetzen", it: "Reset dell'Account",
    ja: "アカウントリセット", ko: "계정 초기화", "zh-hans": "账户重置", "zh-hant": "帳戶重置",
  },
  "Change Password": {
    en: "Change Password", es: "Cambiar Contraseña", fr: "Changer le mot de passe", de: "Passwort ändern", it: "Cambia Password",
    ja: "パスワード変更", ko: "비밀번호 변경", "zh-hans": "修改密码", "zh-hant": "修改密碼",
  },
  "Adventure": {
    en: "Adventure", es: "Aventura", fr: "Aventure", de: "Abenteuer", it: "Avventura",
    ja: "冒険", ko: "모험", "zh-hans": "冒险", "zh-hant": "冒險",
  },
  "gold": {
    en: "gold", es: "oro", fr: "or", de: "Gold", it: "oro",
    ja: "ゴールド", ko: "골드", "zh-hans": "金币", "zh-hant": "金幣",
  },
  "banked": {
    en: "banked", es: "en el banco", fr: "à la banque", de: "auf der Bank", it: "in banca",
    ja: "預けた", ko: "은행에", "zh-hans": "已存入", "zh-hant": "已存入",
  },
  "Use an item on your Pokémon:": {
    en: "Use an item on your Pokémon:", es: "Usa un objeto en tu Pokémon:", fr: "Utilisez un objet sur votre Pokémon :", de: "Benutze ein Item auf deinem Pokémon:", it: "Usa un oggetto sul tuo Pokémon:",
    ja: "ポケモンにアイテムを使う：", ko: "포켓몬에게 아이템 사용:", "zh-hans": "对你的宝可梦使用道具：", "zh-hant": "對你的寶可夢使用道具：",
  },
  "No items!": {
    en: "No items!", es: "¡No hay objetos!", fr: "Pas d'objets !", de: "Keine Items!", it: "Nessun oggetto!",
    ja: "アイテムがない！", ko: "아이템이 없습니다!", "zh-hans": "没有道具！", "zh-hant": "沒有道具！",
  },
  "No usable items!": {
    en: "No usable items!", es: "¡No hay objetos utilizables!", fr: "Pas d'objets utilisables !", de: "Keine benutzbaren Items!", it: "Nessun oggetto utilizzabile!",
    ja: "使えるアイテムがない！", ko: "사용할 수 있는 아이템이 없습니다!", "zh-hans": "没有可用道具！", "zh-hant": "沒有可用道具！",
  },
  "Deposit amount": {
    en: "Deposit amount", es: "Cantidad a depositar", fr: "Montant à déposer", de: "Einzahlbetrag", it: "Importo da depositare",
    ja: "預ける金額", ko: "입금할 금액", "zh-hans": "存入金额", "zh-hant": "存入金額",
  },
  "Deposit": {
    en: "Deposit", es: "Depositar", fr: "Déposer", de: "Einzahlen", it: "Deposita",
    ja: "預ける", ko: "입금", "zh-hans": "存入", "zh-hant": "存入",
  },
  "All": {
    en: "All", es: "Todo", fr: "Tout", de: "Alles", it: "Tutto",
    ja: "すべて", ko: "전부", "zh-hans": "全部", "zh-hant": "全部",
  },
  "Withdraw amount": {
    en: "Withdraw amount", es: "Cantidad a retirar", fr: "Montant à retirer", de: "Auszahlbetrag", it: "Importo da prelevare",
    ja: "引き出す金額", ko: "출금할 금액", "zh-hans": "取出金额", "zh-hant": "取出金額",
  },
  "Withdraw": {
    en: "Withdraw", es: "Retirar", fr: "Retirer", de: "Abheben", it: "Preleva",
    ja: "引き出す", ko: "출금", "zh-hans": "取出", "zh-hant": "取出",
  },
  "Deposit all pocket gold": {
    en: "Deposit all pocket gold", es: "Depositar todo el oro del bolsillo", fr: "Déposer tout l'or de la poche", de: "Das ganze Taschen-Gold einzahlen", it: "Deposita tutto l'oro della tasca",
    ja: "ポケットのゴールドをすべて預ける", ko: "주머니 골드 전부 입금", "zh-hans": "存入口袋全部金币", "zh-hant": "存入口袋全部金幣",
  },
  "Withdraw all bank gold": {
    en: "Withdraw all bank gold", es: "Retirar todo el oro del banco", fr: "Retirer tout l'or de la banque", de: "Das ganze Bank-Gold abheben", it: "Preleva tutto l'oro della banca",
    ja: "銀行のゴールドをすべて引き出す", ko: "은행 골드 전부 출금", "zh-hans": "取出银行全部金币", "zh-hant": "取出銀行全部金幣",
  },
  "Amount": {
    en: "Amount", es: "Cantidad", fr: "Montant", de: "Betrag", it: "Importo",
    ja: "金額", ko: "금액", "zh-hans": "金额", "zh-hant": "金額",
  },
  "Send to": {
    en: "Send to", es: "Enviar a", fr: "Envoyer à", de: "Senden an", it: "Invia a",
    ja: "送る相手：", ko: "보낼 대상:", "zh-hans": "发送给", "zh-hant": "發送給",
  },
  "Gold in the bank is safe if you die in a dungeon.": {
    en: "Gold in the bank is safe if you die in a dungeon.", es: "El oro en el banco está a salvo si mueres en una mazmorra.", fr: "L'or en banque est en sécurité si vous mourez dans un donjon.", de: "Gold auf der Bank ist sicher, wenn du in einem Dungeon stirbst.", it: "L'oro in banca è al sicuro se muori in un dungeon.",
    ja: "ダンジョンで倒れても銀行のゴールドは安全です。", ko: "던전에서 죽어도 은행의 골드는 안전합니다.", "zh-hans": "如果你在地牢中倒下，银行里的金币是安全的。", "zh-hant": "如果你在地牢中倒下，銀行裡的金幣是安全的。",
  },
  "Choose a Pokémon to change its moves:": {
    en: "Choose a Pokémon to change its moves:", es: "Elige un Pokémon para cambiar sus movimientos:", fr: "Choisissez un Pokémon pour changer ses capacités :", de: "Wähle ein Pokémon, um seine Attacken zu ändern:", it: "Scegli un Pokémon per cambiare le sue mosse:",
    ja: "わざを変えるポケモンを選べ：", ko: "기술을 변경할 포켓몬을 선택하세요:", "zh-hans": "选择要更改招式的宝可梦：", "zh-hant": "選擇要更改招式的寶可夢：",
  },
  "Current moves:": {
    en: "Current moves:", es: "Movimientos actuales:", fr: "Capacités actuelles :", de: "Aktuelle Attacken:", it: "Mosse attuali:",
    ja: "現在のわざ：", ko: "현재 기술:", "zh-hans": "当前招式：", "zh-hant": "當前招式：",
  },
  "replace": {
    en: "replace", es: "reemplazar", fr: "remplacer", de: "ersetzen", it: "sostituisci",
    ja: "入れ替え", ko: "교체", "zh-hans": "替换", "zh-hant": "替換",
  },
  "No moves — pick one below to learn it.": {
    en: "No moves — pick one below to learn it.", es: "No hay movimientos — elige uno abajo para aprenderlo.", fr: "Pas de capacités — choisissez-en une ci-dessous pour l'apprendre.", de: "Keine Attacken — wähle unten eine zum Lernen.", it: "Nessuna mossa — scegline una qui sotto per impararla.",
    ja: "わざがありません — 下から覚えるわざを選んでください。", ko: "기술이 없습니다 — 아래에서 배울 기술을 선택하세요.", "zh-hans": "没有招式——从下方选择一个来学会它。", "zh-hant": "沒有招式——從下方選擇一個來學會它。",
  },
  "No level-up moves available.": {
    en: "No level-up moves available.", es: "No hay movimientos por nivel disponibles.", fr: "Aucune capacité de niveau disponible.", de: "Keine Level-up-Attacken verfügbar.", it: "Nessuna mossa di livello disponibile.",
    ja: "レベル技がありません。", ko: "레벨업 기술이 없습니다.", "zh-hans": "没有可用的升级招式。", "zh-hant": "沒有可用的升級招式。",
  },
  "Select a current move to replace.": {
    en: "Select a current move to replace.", es: "Selecciona un movimiento actual para reemplazar.", fr: "Sélectionnez une capacité actuelle à remplacer.", de: "Wähle eine aktuelle Attacke zum Ersetzen.", it: "Seleziona una mossa attuale da sostituire.",
    ja: "入れ替える現在のわざを選択してください。", ko: "교체할 현재 기술을 선택하세요.", "zh-hans": "选择要替换的当前招式。", "zh-hant": "選擇要替換的當前招式。",
  },
  "Choose a Pokémon to rename:": {
    en: "Choose a Pokémon to rename:", es: "Elige un Pokémon para renombrar:", fr: "Choisissez un Pokémon à renommer :", de: "Wähle ein Pokémon zum Umbenennen:", it: "Scegli un Pokémon da rinominare:",
    ja: "名前を変えるポケモンを選べ：", ko: "이름을 바꿀 포켓몬을 선택하세요:", "zh-hans": "选择要重命名的宝可梦：", "zh-hant": "選擇要重命名的寶可夢：",
  },
  "New nickname:": {
    en: "New nickname:", es: "Nuevo apodo:", fr: "Nouveau surnom :", de: "Neuer Spitzname:", it: "Nuovo soprannome:",
    ja: "新しいニックネーム：", ko: "새 별명:", "zh-hans": "新昵称：", "zh-hant": "新暱稱：",
  },
  "Close": {
    en: "Close", es: "Cerrar", fr: "Fermer", de: "Schließen", it: "Chiudi",
    ja: "閉じる", ko: "닫기", "zh-hans": "关闭", "zh-hant": "關閉",
  },
  "Chat": {
    en: "Chat", es: "Chat", fr: "Discussion", de: "Chat", it: "Chat",
    ja: "チャット", ko: "채팅", "zh-hans": "聊天", "zh-hant": "聊天",
  },
  "No messages yet": {
    en: "No messages yet", es: "Aún no hay mensajes", fr: "Aucun message pour l'instant", de: "Noch keine Nachrichten", it: "Nessun messaggio ancora",
    ja: "メッセージはまだありません", ko: "아직 메시지가 없습니다", "zh-hans": "还没有消息", "zh-hant": "還沒有消息",
  },
  "Type a message...": {
    en: "Type a message...", es: "Escribe un mensaje...", fr: "Tapez un message...", de: "Nachricht eingeben...", it: "Scrivi un messaggio...",
    ja: "メッセージを入力...", ko: "메시지 입력...", "zh-hans": "输入消息...", "zh-hant": "輸入訊息...",
  },
  "Send": {
    en: "Send", es: "Enviar", fr: "Envoyer", de: "Senden", it: "Invia",
    ja: "送信", ko: "보내기", "zh-hans": "发送", "zh-hant": "發送",
  },
  "Friends": {
    en: "Friends", es: "Amigos", fr: "Amis", de: "Freunde", it: "Amici",
    ja: "友達", ko: "친구", "zh-hans": "好友", "zh-hant": "好友",
  },
  "Requests": {
    en: "Requests", es: "Solicitudes", fr: "Demandes", de: "Anfragen", it: "Richieste",
    ja: "リクエスト", ko: "요청", "zh-hans": "请求", "zh-hant": "請求",
  },
  "Add": {
    en: "Add", es: "Añadir", fr: "Ajouter", de: "Hinzufügen", it: "Aggiungi",
    ja: "追加", ko: "추가", "zh-hans": "添加", "zh-hant": "新增",
  },
  "No friends yet. Add friends to see who's exploring and join their dungeons!": {
    en: "No friends yet. Add friends to see who's exploring and join their dungeons!", es: "Aún no tienes amigos. ¡Añade amigos para ver quién explora y unirte a sus mazmorras!", fr: "Pas encore d'amis. Ajoutez des amis pour voir qui explore et rejoindre leurs donjons !", de: "Noch keine Freunde. Füge Freunde hinzu, um zu sehen, wer erkundet und tritt ihren Dungeons bei!", it: "Non hai ancora amici. Aggiungi amici per vedere chi esplora e unirti ai loro dungeon!",
    ja: "まだ友達がいません。友達を追加して、誰が探索しているか見てダンジョンに参加しよう！", ko: "아직 친구가 없습니다. 친구를 추가하여 누가 탐험 중인지 보고 던전에 참여하세요!", "zh-hans": "还没有好友。添加好友以查看谁在探索并加入他们的地牢！", "zh-hant": "還沒有好友。新增好友以查看誰在探索並加入他們的地牢！",
  },
  "Join village": {
    en: "Join village", es: "Unirse a la aldea", fr: "Rejoindre le village", de: "Dorf beitreten", it: "Entra nel villaggio",
    ja: "村に参加", ko: "마을 참여", "zh-hans": "加入村庄", "zh-hant": "加入村莊",
  },
  "Same village": {
    en: "Same village", es: "Misma aldea", fr: "Même village", de: "Gleiches Dorf", it: "Stesso villaggio",
    ja: "同じ村", ko: "같은 마을", "zh-hans": "同一村庄", "zh-hant": "同一村莊",
  },
  "In dungeon": {
    en: "In dungeon", es: "En mazmorra", fr: "En donjon", de: "Im Dungeon", it: "Nel dungeon",
    ja: "ダンジョン中", ko: "던전 중", "zh-hans": "地牢中", "zh-hant": "地牢中",
  },
  "Offline": {
    en: "Offline", es: "Desconectado", fr: "Hors ligne", de: "Offline", it: "Offline",
    ja: "オフライン", ko: "오프라인", "zh-hans": "离线", "zh-hant": "離線",
  },
  "Remove": {
    en: "Remove", es: "Eliminar", fr: "Retirer", de: "Entfernen", it: "Rimuovi",
    ja: "削除", ko: "제거", "zh-hans": "移除", "zh-hant": "移除",
  },
  "No pending requests.": {
    en: "No pending requests.", es: "No hay solicitudes pendientes.", fr: "Aucune demande en attente.", de: "Keine ausstehenden Anfragen.", it: "Nessuna richiesta in attesa.",
    ja: "保留中のリクエストはありません。", ko: "대기 중인 요청이 없습니다.", "zh-hans": "没有待处理的请求。", "zh-hant": "沒有待處理的請求。",
  },
  "wants to be friends": {
    en: "wants to be friends", es: "quiere ser tu amigo", fr: "veut être votre ami", de: "möchte befreundet sein", it: "vuole essere tuo amico",
    ja: "友達になりたいと言っている", ko: "친구가 되고 싶어합니다", "zh-hans": "想成为好友", "zh-hant": "想成為好友",
  },
  "(request sent)": {
    en: "(request sent)", es: "(solicitud enviada)", fr: "(demande envoyée)", de: "(Anfrage gesendet)", it: "(richiesta inviata)",
    ja: "（送信済み）", ko: "(요청 보냄)", "zh-hans": "（请求已发送）", "zh-hant": "（請求已發送）",
  },
  "Search by username...": {
    en: "Search by username...", es: "Buscar por usuario...", fr: "Chercher par nom d'utilisateur...", de: "Nach Benutzername suchen...", it: "Cerca per nome utente...",
    ja: "ユーザー名で検索...", ko: "사용자 이름으로 검색...", "zh-hans": "按用户名搜索...", "zh-hant": "按用戶名搜尋...",
  },
  "Search": {
    en: "Search", es: "Buscar", fr: "Rechercher", de: "Suchen", it: "Cerca",
    ja: "検索", ko: "검색", "zh-hans": "搜索", "zh-hant": "搜尋",
  },
  "No accounts found.": {
    en: "No accounts found.", es: "No se encontraron cuentas.", fr: "Aucun compte trouvé.", de: "Keine Konten gefunden.", it: "Nessun account trovato.",
    ja: "アカウントが見つかりません。", ko: "계정을 찾을 수 없습니다.", "zh-hans": "未找到账户。", "zh-hant": "未找到帳戶。",
  },
  "Type at least 2 characters to search.": {
    en: "Type at least 2 characters to search.", es: "Escribe al menos 2 caracteres para buscar.", fr: "Saisissez au moins 2 caractères pour rechercher.", de: "Gib mindestens 2 Zeichen ein, um zu suchen.", it: "Digita almeno 2 caratteri per cercare.",
    ja: "2文字以上入力して検索してください。", ko: "검색하려면 2자 이상 입력하세요.", "zh-hans": "输入至少 2 个字符进行搜索。", "zh-hant": "輸入至少 2 個字元進行搜尋。",
  },
  "You": {
    en: "You", es: "Tú", fr: "Vous", de: "Du", it: "Tu",
    ja: "あなた", ko: "나", "zh-hans": "你", "zh-hant": "你",
  },
  "Sent": {
    en: "Sent", es: "Enviado", fr: "Envoyée", de: "Gesendet", it: "Inviata",
    ja: "送信済み", ko: "보냄", "zh-hans": "已发送", "zh-hant": "已發送",
  },
  "Items you carry can be lost if you faint in a dungeon. Store them to keep them safe!": {
    en: "Items you carry can be lost if you faint in a dungeon. Store them to keep them safe!", es: "Los objetos que llevas pueden perderse si te debilitas en una mazmorra. ¡Guárdalos para mantenerlos a salvo!", fr: "Les objets que vous portez peuvent être perdus si vous tombez K.O. dans un donjon. Stockez-les pour les garder en sécurité !", de: "Gegenstände in deiner Tasche können verloren gehen, wenn du in einem Dungeon fällst. Lagere sie, um sie zu schützen!", it: "Gli oggetti che porti possono andare persi se svieni in un dungeon. Depositali per tenerli al sicuro!",
    ja: "ダンジョンで倒れると持っているアイテムを失うことがあります。保管庫で安全にしまいましょう！", ko: "던전에서 기절하면 소지한 아이템을 잃을 수 있습니다. 보관소에 안전하게 보관하세요!", "zh-hans": "如果你在地牢中倒下，携带的道具可能会丢失。存起来以保安全！", "zh-hant": "如果你在地牢中倒下，攜帶的道具可能會丟失。存起來以保安全！",
  },
  "Carried": {
    en: "Carried", es: "Llevados", fr: "Portés", de: "Getragen", it: "Portati",
    ja: "持っている", ko: "소지품", "zh-hans": "携带", "zh-hant": "攜帶",
  },
  "Stored": {
    en: "Stored", es: "Guardados", fr: "Stockés", de: "Gelagert", it: "Depositati",
    ja: "預けている", ko: "보관됨", "zh-hans": "已存", "zh-hant": "已存",
  },
  "Nothing here yet.": {
    en: "Nothing here yet.", es: "Nada aquí todavía.", fr: "Rien ici pour l'instant.", de: "Noch nichts hier.", it: "Niente qui per ora.",
    ja: "まだ何もありません。", ko: "아직 아무것도 없습니다.", "zh-hans": "这里还没有东西。", "zh-hant": "這裡還沒有東西。",
  },
  "Store": {
    en: "Store", es: "Guardar", fr: "Stocker", de: "Lagern", it: "Deposita",
    ja: "預ける", ko: "보관", "zh-hans": "存放", "zh-hant": "存放",
  },
  "Store All": {
    en: "Store All", es: "Guardar Todo", fr: "Tout Stocker", de: "Alle Lagern", it: "Deposita Tutto",
    ja: "すべて預ける", ko: "전부 보관", "zh-hans": "全部存放", "zh-hant": "全部存放",
  },
  "From Kangaskhan Storage — returns here if declined.": {
    en: "From Kangaskhan Storage — returns here if declined.", es: "De la Consigna Kangaskhan — vuelve aquí si se rechaza.", fr: "Du Stockage Kangourex — revient ici si refusé.", de: "Aus dem Kangama-Lager — kommt hierher zurück, wenn abgelehnt.", it: "Dal Deposito Kangaskhan — torna qui se rifiutato.",
    ja: "ガルーラ保管庫から — 断られたらここに戻ります。", ko: "캥카 보관소에서 — 거절되면 여기로 돌아옵니다.", "zh-hans": "来自袋兽仓库——若被拒绝则返回此处。", "zh-hant": "來自袋獸倉庫——若被拒絕則返回此處。",
  },
  "From your carried items — returns to your bag if declined.": {
    en: "From your carried items — returns to your bag if declined.", es: "De tus objetos llevados — vuelve a tu bolsa si se rechaza.", fr: "De vos objets portés — revient dans votre sac si refusé.", de: "Aus deiner Tasche — kommt in deine Tasche zurück, wenn abgelehnt.", it: "Dai tuoi oggetti portati — torna nella tua borsa se rifiutato.",
    ja: "持っているアイテムから — 断られたらバッグに戻ります。", ko: "소지 아이템에서 — 거절되면 가방으로 돌아옵니다.", "zh-hans": "来自携带的道具——若被拒绝则返回背包。", "zh-hant": "來自攜帶的道具——若被拒絕則返回背包。",
  },
  "Choose a Pokémon to use this item on:": {
    en: "Choose a Pokémon to use this item on:", es: "Elige un Pokémon para usar este objeto:", fr: "Choisissez un Pokémon sur qui utiliser cet objet :", de: "Wähle ein Pokémon, auf dem du das Item benutzt:", it: "Scegli un Pokémon su cui usare questo oggetto:",
    ja: "このアイテムを使うポケモンを選べ：", ko: "이 아이템을 사용할 포켓몬을 선택하세요:", "zh-hans": "选择要使用此道具的宝可梦：", "zh-hant": "選擇要使用此道具的寶可夢：",
  },
  "Wild Pokémon that want to join you wait here — they're safe even if you faint in a dungeon. Choose one to adventure with.": {
    en: "Wild Pokémon that want to join you wait here — they're safe even if you faint in a dungeon. Choose one to adventure with.", es: "Los Pokémon salvajes que quieren unirse a ti esperan aquí — están a salvo aunque te debilites en una mazmorra. Elige uno para tu aventura.", fr: "Les Pokémon sauvages qui veulent vous rejoindre attendent ici — ils sont en sécurité même si vous tombez K.O. dans un donjon. Choisissez-en un pour l'aventure.", de: "Wilde Pokémon, die sich dir anschließen wollen, warten hier — sie sind sicher, auch wenn du in einem Dungeon fällst. Wähle eines für dein Abenteuer.", it: "I Pokémon selvatici che vogliono unirsi a te aspettano qui — sono al sicuro anche se svieni in un dungeon. Scegline uno per l'avventura.",
    ja: "仲間になりたい野生ポケモンがここで待っています — ダンジョンで倒れても安全です。冒険に連れていく1匹を選んでください。", ko: "함께하고 싶은 야생 포켓몬이 여기서 기다립니다 — 던전에서 기절해도 안전합니다. 함께 모험할 포켓몬을 선택하세요.", "zh-hans": "想要加入你的野生宝可梦在此等待——即使你在地牢中倒下它们也是安全的。选择一只一起冒险。", "zh-hant": "想要加入你的野生寶可夢在此等待——即使你在地牢中倒下它們也是安全的。選擇一隻一起冒險。",
  },
  "Active partner": {
    en: "Active partner", es: "Compañero activo", fr: "Partenaire actif", de: "Aktiver Partner", it: "Partner attivo",
    ja: "現在のパートナー", ko: "현재 파트너", "zh-hans": "当前搭档", "zh-hant": "當前搭檔",
  },
  "Club members": {
    en: "Club members", es: "Miembros del club", fr: "Membres du club", de: "Clubmitglieder", it: "Membri del club",
    ja: "クラブメンバー", ko: "클럽 멤버", "zh-hans": "俱乐部成员", "zh-hant": "俱樂部成員",
  },
  "No one here yet. Catch some wild Pokémon in dungeons!": {
    en: "No one here yet. Catch some wild Pokémon in dungeons!", es: "Aún no hay nadie aquí. ¡Captura Pokémon salvajes en mazmorras!", fr: "Personne ici pour l'instant. Attrapez des Pokémon sauvages dans les donjons !", de: "Noch niemand hier. Fang wilde Pokémon in Dungeons!", it: "Nessuno qui ancora. Cattura dei Pokémon selvatici nei dungeon!",
    ja: "まだ誰もいません。ダンジョンで野生ポケモンを捕まえよう！", ko: "아직 아무도 없습니다. 던전에서 야생 포켓몬을 잡으세요!", "zh-hans": "这里还没有人。去地牢里捕捉野生宝可梦吧！", "zh-hant": "這裡還沒有任何人。去地牢裡捕捉野生寶可夢吧！",
  },
  "Make Active": {
    en: "Make Active", es: "Hacer Activo", fr: "Rendre Actif", de: "Aktiv machen", it: "Rendi Attivo",
    ja: "アクティブにする", ko: "활성화", "zh-hans": "设为当前", "zh-hant": "設為當前",
  },
  "Xatu can erase your memory of the starter quiz, letting you choose a new partner.": {
    en: "Xatu can erase your memory of the starter quiz, letting you choose a new partner.", es: "Xatu puede borrar tu memoria del quiz inicial, permitiéndote elegir un nuevo compañero.", fr: "Natu peut effacer votre souvenir du quiz de starter, vous permettant de choisir un nouveau partenaire.", de: "Natu kann deine Erinnerung an den Starter-Quiz löschen und dir so ein neues Partner-Pokémon ermöglichen.", it: "Xatu può cancellare il tuo ricordo del quiz iniziale, permettendoti di scegliere un nuovo partner.",
    ja: "ネイティオは最初のクイズの記憶を消して、新しい相棒を選べるようにしてくれます。", ko: "네이티오가 스타터 퀴즈의 기억을 지워 새로운 파트너를 선택할 수 있게 해줍니다.", "zh-hans": "天然鸟可以抹去你对初始测验的记忆，让你选择新的搭档。", "zh-hant": "天然鳥可以抹去你對初始測驗的記憶，讓你選擇新的搭檔。",
  },
  "Your starter Pokémon will be released. Other Pokémon and items are safe.": {
    en: "Your starter Pokémon will be released. Other Pokémon and items are safe.", es: "Tu Pokémon inicial será liberado. Los demás Pokémon y objetos están a salvo.", fr: "Votre starter sera relâché. Les autres Pokémon et objets sont en sécurité.", de: "Dein Starter-Pokémon wird freigelassen. Andere Pokémon und Items sind sicher.", it: "Il tuo starter verrà rilasciato. Gli altri Pokémon e oggetti sono al sicuro.",
    ja: "スターターポケモンは解放されます。他のポケモンとアイテムは安全です。", ko: "스타터 포켓몬은 방생됩니다. 다른 포켓몬과 아이템은 안전합니다.", "zh-hans": "你的初始宝可梦将被放生。其他宝可梦和道具都是安全的。", "zh-hant": "你的初始寶可夢將被放生。其他寶可夢和道具都是安全的。",
  },
  "Reset Account": {
    en: "Reset Account", es: "Reiniciar Cuenta", fr: "Réinitialiser le Compte", de: "Konto zurücksetzen", it: "Reset dell'Account",
    ja: "アカウントをリセット", ko: "계정 초기화", "zh-hans": "重置账户", "zh-hant": "重置帳戶",
  },
  "Are you sure?": {
    en: "Are you sure?", es: "¿Estás seguro?", fr: "Êtes-vous sûr ?", de: "Bist du sicher?", it: "Sei sicuro?",
    ja: "本当にしますか？", ko: "확실합니까?", "zh-hans": "你确定吗？", "zh-hant": "你確定嗎？",
  },
  "This will delete your starter Pokémon. This cannot be undone.": {
    en: "This will delete your starter Pokémon. This cannot be undone.", es: "Esto eliminará tu Pokémon inicial. No se puede deshacer.", fr: "Cela supprimera votre starter. Cette action est irréversible.", de: "Dies löscht dein Starter-Pokémon. Das kann nicht rückgängig gemacht werden.", it: "Questo eliminerà il tuo starter. Non può essere annullato.",
    ja: "スターターポケモンが削除されます。元に戻せません。", ko: "스타터 포켓몬이 삭제됩니다. 되돌릴 수 없습니다.", "zh-hans": "这将删除你的初始宝可梦。此操作无法撤销。", "zh-hant": "這將刪除你的初始寶可夢。此操作無法撤銷。",
  },
  "Yes, Reset Everything": {
    en: "Yes, Reset Everything", es: "Sí, reiniciar todo", fr: "Oui, tout réinitialiser", de: "Ja, alles zurücksetzen", it: "Sì, resetta tutto",
    ja: "はい、すべてリセットします", ko: "네, 모두 초기화합니다", "zh-hans": "是，重置一切", "zh-hant": "是，重置一切",
  },
  "Friends in dungeons": {
    en: "Friends in dungeons", es: "Amigos en mazmorras", fr: "Amis dans les donjons", de: "Freunde in Dungeons", it: "Amici nei dungeon",
    ja: "ダンジョンにいる友達", ko: "던전에 있는 친구", "zh-hans": "地牢中的好友", "zh-hant": "地牢中的好友",
  },
  "No friends are exploring right now. Ask them to start a dungeon, then come back!": {
    en: "No friends are exploring right now. Ask them to start a dungeon, then come back!", es: "Ningún amigo está explorando ahora. ¡Pídeles que inicien una mazmorra y vuelve!", fr: "Aucun ami n'explore en ce moment. Demandez-leur de lancer un donjon puis revenez !", de: "Gerade erkundet kein Freund einen Dungeon. Bitte sie, einen zu starten, und komm zurück!", it: "Nessun amico sta esplorando ora. Chiedi loro di iniziare un dungeon e torna!",
    ja: "今ダンジョンにいる友達はいません。友達にダンジョンを始めてもらって、また来てください！", ko: "지금 던전을 탐험 중인 친구가 없습니다. 친구에게 던전을 시작해 달라고 하고 다시 오세요!", "zh-hans": "现在没有好友在探索。让他们开始一个地牢再回来吧！", "zh-hant": "現在沒有好友在探索。讓他們開始一個地牢再回來吧！",
  },
  "Refresh": {
    en: "Refresh", es: "Actualizar", fr: "Actualiser", de: "Aktualisieren", it: "Aggiorna",
    ja: "更新", ko: "새로고침", "zh-hans": "刷新", "zh-hant": "刷新",
  },
  "Explore alone, join a friend, or invade someone else's dungeon!": {
    en: "Explore alone, join a friend, or invade someone else's dungeon!", es: "¡Explora solo, únete a un amigo o invade la mazmorra de otro!", fr: "Explorez seul, rejoignez un ami ou envahissez le donjon de quelqu'un d'autre !", de: "Erkunde allein, tritt einem Freund bei oder falle in den Dungeon eines anderen ein!", it: "Esplora da solo, unisciti a un amico o invadi il dungeon di qualcun altro!",
    ja: "ひとりで探索、友達と参加、または他人のダンジョンに侵入！", ko: "혼자 탐험, 친구와 참여, 또는 다른 사람의 던전 침입!", "zh-hans": "独自探索、加入好友，或入侵他人的地牢！", "zh-hant": "獨自探索、加入好友，或入侵他人的地牢！",
  },

  // ─── Change Password dialog ───
  "Current Password": {
    en: "Current Password", es: "Contraseña actual", fr: "Mot de passe actuel", de: "Aktuelles Passwort", it: "Password attuale",
    ja: "現在のパスワード", ko: "현재 비밀번호", "zh-hans": "当前密码", "zh-hant": "當前密碼",
  },
  "New Password": {
    en: "New Password", es: "Nueva contraseña", fr: "Nouveau mot de passe", de: "Neues Passwort", it: "Nuova password",
    ja: "新しいパスワード", ko: "새 비밀번호", "zh-hans": "新密码", "zh-hant": "新密碼",
  },
  "Confirm New Password": {
    en: "Confirm New Password", es: "Confirmar nueva contraseña", fr: "Confirmer le nouveau mot de passe", de: "Neues Passwort bestätigen", it: "Conferma nuova password",
    ja: "新しいパスワード（確認）", ko: "새 비밀번호 확인", "zh-hans": "确认新密码", "zh-hant": "確認新密碼",
  },
  "New password must be at least 4 characters": {
    en: "New password must be at least 4 characters", es: "La nueva contraseña debe tener al menos 4 caracteres", fr: "Le nouveau mot de passe doit contenir au moins 4 caractères", de: "Das neue Passwort muss mindestens 4 Zeichen lang sein", it: "La nuova password deve avere almeno 4 caratteri",
    ja: "新しいパスワードは4文字以上で入力してください", ko: "새 비밀번호는 4자 이상이어야 합니다", "zh-hans": "新密码必须至少 4 个字符", "zh-hant": "新密碼必須至少 4 個字元",
  },
  "Passwords don't match": {
    en: "Passwords don't match", es: "Las contraseñas no coinciden", fr: "Les mots de passe ne correspondent pas", de: "Passwörter stimmen nicht überein", it: "Le password non coincidono",
    ja: "パスワードが一致しません", ko: "비밀번호가 일치하지 않습니다", "zh-hans": "密码不匹配", "zh-hant": "密碼不匹配",
  },
  "Something went wrong": {
    en: "Something went wrong", es: "Algo salió mal", fr: "Quelque chose s'est mal passé", de: "Etwas ist schiefgelaufen", it: "Qualcosa è andato storto",
    ja: "エラーが発生しました", ko: "문제가 발생했습니다", "zh-hans": "出了点问题", "zh-hant": "出了點問題",
  },
  "Password changed successfully": {
    en: "Password changed successfully", es: "Contraseña cambiada con éxito", fr: "Mot de passe changé avec succès", de: "Passwort erfolgreich geändert", it: "Password cambiata con successo",
    ja: "パスワードを変更しました", ko: "비밀번호가 변경되었습니다", "zh-hans": "密码修改成功", "zh-hant": "密碼修改成功",
  },
  "Done": {
    en: "Done", es: "Hecho", fr: "Terminé", de: "Fertig", it: "Fatto",
    ja: "完了", ko: "완료", "zh-hans": "完成", "zh-hant": "完成",
  },
  "Save": {
    en: "Save", es: "Guardar", fr: "Enregistrer", de: "Speichern", it: "Salva",
    ja: "保存", ko: "저장", "zh-hans": "保存", "zh-hant": "儲存",
  },

  // ------------------------------------------------------------------
  // PokéSlots (src/components/PokeSlots.jsx)
  // ------------------------------------------------------------------
  "Pay your debt to Team Rocket or fall into the pit": {
    en: "Pay your debt to Team Rocket or fall into the pit", es: "Paga tu deuda al Equipo Rocket o cae al pozo", fr: "Rembourse ta dette à la Team Rocket ou tombe dans le puits", de: "Zahle deine Schulden an Team Rocket oder stürze in die Grube", it: "Paga il tuo debito al Team Rocket o precipita nella fossa",
    ja: "ロケット団に借金を返せ。さもなくば穴へ落ちる", ko: "로켓단에 빚을 갚아라. 아니면 구멍으로 떨어진다", "zh-hans": "向火箭队还债，否则坠入深渊", "zh-hant": "向火箭隊還債，否則墜入深淵",
  },
  "Coins": {
    en: "Coins", es: "Monedas", fr: "Pièces", de: "Münzen", it: "Monete",
    ja: "コイン", ko: "코인", "zh-hans": "金币", "zh-hant": "金幣",
  },
  "Debt": {
    en: "Debt", es: "Deuda", fr: "Dette", de: "Schulden", it: "Debito",
    ja: "借金", ko: "빚", "zh-hans": "债务", "zh-hant": "債務",
  },
  "quota": {
    en: "quota", es: "cuota", fr: "quote-part", de: "Rate", it: "rata",
    ja: "分割払い", ko: "분할금", "zh-hans": "配额", "zh-hant": "配額",
  },
  "Tickets": {
    en: "Tickets", es: "Tickets", fr: "Tickets", de: "Tickets", it: "Biglietti",
    ja: "チケット", ko: "티켓", "zh-hans": "券", "zh-hant": "券",
  },
  "Round": {
    en: "Round", es: "Ronda", fr: "Manche", de: "Runde", it: "Turno",
    ja: "ラウンド", ko: "라운드", "zh-hans": "回合", "zh-hant": "回合",
  },
  "Pulls left": {
    en: "Pulls left", es: "Tiradas restantes", fr: "Tirages restants", de: "Züge übrig", it: "Slate rimaste",
    ja: "残りレバー回数", ko: "남은 레버 횟수", "zh-hans": "剩余拉杆次数", "zh-hant": "剩餘拉桿次數",
  },
  "PULL": {
    en: "PULL", es: "TIRAR", fr: "TIRER", de: "ZIEHEN", it: "TIRA",
    ja: "回す", ko: "돌리기", "zh-hans": "拉杆", "zh-hant": "拉桿",
  },
  "Shop": {
    en: "Shop", es: "Tienda", fr: "Boutique", de: "Laden", it: "Negozio",
    ja: "ショップ", ko: "상점", "zh-hans": "商店", "zh-hant": "商店",
  },
  "Charms": {
    en: "Charms", es: "Amuletos", fr: "Grigris", de: "Glücksbringer", it: "Amuleti",
    ja: "おまもり", ko: "부적", "zh-hans": "护符", "zh-hant": "護符",
  },
  "Symbols": {
    en: "Symbols", es: "Símbolos", fr: "Symboles", de: "Symbole", it: "Simboli",
    ja: "シンボル", ko: "심볼", "zh-hans": "图案", "zh-hant": "圖案",
  },
  "Patterns": {
    en: "Patterns", es: "Patrones", fr: "Motifs", de: "Muster", it: "Combinazioni",
    ja: "パターン", ko: "패턴", "zh-hans": "牌型", "zh-hant": "牌型",
  },
  "Out of pulls! Pay the quota at the ATM before time runs out": {
    en: "Out of pulls! Pay the quota at the ATM before time runs out", es: "¡Sin tiradas! Paga la cuota en el cajero antes de que acabe el tiempo", fr: "Plus de tirages ! Paie la quote-part au distributeur avant la fin du temps", de: "Keine Züge mehr! Zahle die Rate am Automaten, bevor die Zeit abläuft", it: "Slate esaurite! Paga la rata all'ATM prima che scada il tempo",
    ja: "レバー回数を使い切った！時間切れの前にATMで支払え", ko: "레버 횟수 소진! 시간이 다 되기 전에 ATM에서 분할금을 지불해라", "zh-hans": "拉杆次数用完！在时间结束前到ATM支付配额", "zh-hant": "拉桿次數用完！在時間結束前到ATM支付配額",
  },
  "gone": {
    en: "gone", es: "eliminado", fr: "absent", de: "entfernt", it: "assente",
    ja: "出現しない", ko: "등장 안 함", "zh-hans": "已移除", "zh-hant": "已移除",
  },
  "Rotom Phone Shop": {
    en: "Rotom Phone Shop", es: "Tienda del móvil Rotom", fr: "Boutique du Rotom Phone", de: "Rotom-Handy-Laden", it: "Negozio del Rotom Phone",
    ja: "ロトム携帯ショップ", ko: "로토무폰 상점", "zh-hans": "洛托姆手机商店", "zh-hant": "洛托姆手機商店",
  },
  "Reroll": {
    en: "Reroll", es: "Renovar", fr: "Relancer", de: "Neu ziehen", it: "Ritira",
    ja: "リロール", ko: "다시 뽑기", "zh-hans": "刷新", "zh-hant": "重新整理",
  },
  "Sold out! Come back next round": {
    en: "Sold out! Come back next round", es: "¡Agotado! Vuelve la próxima ronda", fr: "Épuisé ! Reviens à la prochaine manche", de: "Ausverkauft! Komm in der nächsten Runde wieder", it: "Esaurito! Torna al prossimo turno",
    ja: "売り切れ！次のラウンドに来てね", ko: "품절! 다음 라운드에 다시 와라", "zh-hans": "售罄！下回合再来", "zh-hant": "售罄！下回合再來",
  },
  "Your charms": {
    en: "Your charms", es: "Tus amuletos", fr: "Tes grigris", de: "Deine Glücksbringer", it: "I tuoi amuleti",
    ja: "あなたのおまもり", ko: "내 부적", "zh-hans": "你的护符", "zh-hant": "你的護符",
  },
  "sell for": {
    en: "sell for", es: "vender por", fr: "vendre pour", de: "verkaufen für", it: "vendere per",
    ja: "売値", ko: "판매 가격", "zh-hans": "出售价", "zh-hant": "出售價",
  },
  "Click a charm to sell it": {
    en: "Click a charm to sell it", es: "Haz clic en un amuleto para venderlo", fr: "Clique sur un grigri pour le vendre", de: "Klicke einen Glücksbringer an, um ihn zu verkaufen", it: "Clicca un amuleto per venderlo",
    ja: "おまもりをクリックすると売れる", ko: "부적을 클릭하면 판매된다", "zh-hans": "点击护符即可出售", "zh-hant": "點擊護符即可出售",
  },
  "Tray full": {
    en: "Tray full", es: "Bandeja llena", fr: "Plateau plein", de: "Tablett voll", it: "Vassoio pieno",
    ja: "トレイ満杯", ko: "트레이 가득 참", "zh-hans": "托盘已满", "zh-hant": "托盤已滿",
  },
  "QUOTA DEADLINE!": {
    en: "QUOTA DEADLINE!", es: "¡FECHA LÍMITE DE LA CUOTA!", fr: "DATE LIMITE DE LA QUOTE-PART !", de: "RATE FÄLLIG!", it: "SCADENZA DELLA RATA!",
    ja: "分割払いの期限！", ko: "분할금 기한!", "zh-hans": "配额截止！", "zh-hant": "配額截止！",
  },
  "Giovanni": {
    en: "Giovanni", es: "Giovanni", fr: "Giovanni", de: "Giovanni", it: "Giovanni",
    ja: "サカキ", ko: "비주", "zh-hans": "坂木", "zh-hant": "坂木",
  },
  "Pay up, and maybe I'll let you keep pulling.": {
    en: "Pay up, and maybe I'll let you keep pulling.", es: "Paga, y quizá te deje seguir tirando.", fr: "Paie, et je te laisserai peut-être continuer à tirer.", de: "Zahl, und vielleicht darfst du weiterziehen.", it: "Paga, e forse ti lascio continuare a tirare.",
    ja: "払えば、続けさせてやるかもしれない。", ko: "갚으면 계속 돌리게 해줄지도 모르지.", "zh-hans": "付钱，我也许让你继续拉。", "zh-hant": "付錢，我也許讓你繼續拉。",
  },
  "You're short, trainer.": {
    en: "You're short, trainer.", es: "Te falta dinero, entrenador.", fr: "Tu manques d'argent, dresseur.", de: "Dir fehlt Geld, Trainer.", it: "Ti mancano soldi, allenatore.",
    ja: "金が足りないな、トレーナー。", ko: "돈이 모자라군, 트레이너.", "zh-hans": "你钱不够，训练家。", "zh-hant": "你錢不夠，訓練家。",
  },
  "Quota due": {
    en: "Quota due", es: "Cuota a pagar", fr: "Quote-part due", de: "Fällige Rate", it: "Rata dovuta",
    ja: "支払期限", ko: "지불 기한", "zh-hans": "应付配额", "zh-hant": "應付配額",
  },
  "Deposit": {
    en: "Deposit", es: "Depósito", fr: "Dépôt", de: "Einzahlung", it: "Deposito",
    ja: "預け入れ額", ko: "예치금", "zh-hans": "存款", "zh-hant": "存款",
  },
  "Interest (7%)": {
    en: "Interest (7%)", es: "Interés (7%)", fr: "Intérêts (7 %)", de: "Zinsen (7 %)", it: "Interessi (7%)",
    ja: "利息（7%）", ko: "이자 (7%)", "zh-hans": "利息（7%）", "zh-hant": "利息（7%）",
  },
  "Deposits earn 7% interest, paid out after every round.": {
    en: "Deposits earn 7% interest, paid out after every round.", es: "Los depósitos ganan un 7% de interés, pagado tras cada ronda.", fr: "Les dépôts rapportent 7 % d'intérêts, versés après chaque manche.", de: "Einzahlungen bringen 7 % Zinsen, ausgezahlt nach jeder Runde.", it: "I depositi fruttano il 7% di interessi, pagati dopo ogni turno.",
    ja: "預け入れは毎ラウンドの後に7%の利息として払い戻される。", ko: "예치금은 매 라운드 후 7%의 이자로 지급된다.", "zh-hans": "存款每回合后支付7%利息。", "zh-hant": "存款每回合後支付7%利息。",
  },
  "Your coins": {
    en: "Your coins", es: "Tus monedas", fr: "Tes pièces", de: "Deine Münzen", it: "Le tue monete",
    ja: "所持コイン", ko: "보유 코인", "zh-hans": "你的金币", "zh-hant": "你的金幣",
  },
  "Remaining debt": {
    en: "Remaining debt", es: "Deuda restante", fr: "Dette restante", de: "Restschuld", it: "Debito residuo",
    ja: "残りの借金", ko: "남은 빚", "zh-hans": "剩余债务", "zh-hant": "剩餘債務",
  },
  "Interest after payment": {
    en: "Interest after payment", es: "Interés tras el pago", fr: "Intérêts après paiement", de: "Zinsen nach Zahlung", it: "Interessi dopo il pagamento",
    ja: "支払後の利息", ko: "지불 후 이자", "zh-hans": "付款后的利息", "zh-hant": "付款後的利息",
  },
  "MIN": {
    en: "MIN", es: "MIN", fr: "MIN", de: "MIN", it: "MIN",
    ja: "最小", ko: "최소", "zh-hans": "最少", "zh-hant": "最少",
  },
  "MAX": {
    en: "MAX", es: "MAX", fr: "MAX", de: "MAX", it: "MAX",
    ja: "最大", ko: "최대", "zh-hans": "最多", "zh-hant": "最多",
  },
  "Pay": {
    en: "Pay", es: "Pagar", fr: "Payer", de: "Zahlen", it: "Paga",
    ja: "支払う", ko: "지불", "zh-hans": "支付", "zh-hant": "支付",
  },
  "Keep": {
    en: "Keep", es: "Cerrar", fr: "Fermer", de: "Behalten", it: "Chiudi",
    ja: "閉じる", ko: "닫기", "zh-hans": "关闭", "zh-hant": "關閉",
  },
  "Focus Band: wipes the quota for free — your wallet is emptied, but you get 7 pulls": {
    en: "Focus Band: wipes the quota for free — your wallet is emptied, but you get 7 pulls", es: "Banda Focus: borra la cuota gratis; tu monedero se vacía, pero recibes 7 tiradas", fr: "Bandeau Focus : efface la quote-part gratuitement ; ta bourse est vidée, mais tu obtiens 7 tirages", de: "Focus-Band: löscht die Rate kostenlos — dein Beutel wird geleert, aber du erhältst 7 Züge", it: "Fascia Concentrazione: cancella la rata gratis; il portamonete viene svuotato, ma ottieni 7 slate",
    ja: "がんばリバンド：分割払いを無料で消滅。コインは空になるが、レバー7回をもらえる。", ko: "승부밴드: 분할금을 무료로 지워준다. 코인은 모두 사라지지만 레버 7회를 얻는다.", "zh-hans": "气势绑带：免费清除配额——钱包会被清空，但你会获得7次拉杆。", "zh-hant": "氣勢綁帶：免費清除配額——錢包會被清空，但你會獲得7次拉桿。",
  },
  "Each round, buy 3 pulls or 7 — the coin fee grows with every quota. Paying with coins earns tickets (3 pulls earn more). Can't afford a round? It costs 1 ticket (3 pulls) or 2 tickets (7 pulls) instead, earning nothing back. No coins and no tickets? You lose.": {
    en: "Each round, buy 3 pulls or 7 — the coin fee grows with every quota. Paying with coins earns tickets (3 pulls earn more). Can't afford a round? It costs 1 ticket (3 pulls) or 2 tickets (7 pulls) instead, earning nothing back. No coins and no tickets? You lose.",
    es: "Cada ronda, compra 3 tiradas o 7 — la entrada en monedas sube con cada cuota. Pagar con monedas da tickets (3 tiradas dan más). ¿No te alcanza? Cuesta 1 ticket (3 tiradas) o 2 tickets (7 tiradas), sin recompensa. ¿Sin monedas ni tickets? Pierdes.",
    fr: "À chaque manche, achète 3 tirages ou 7 — les frais en pièces augmentent à chaque quote-part. Payer en pièces rapporte des tickets (3 tirages en donnent plus). Pas assez ? Ça coûte 1 ticket (3 tirages) ou 2 tickets (7 tirages), sans rien rapporter. Ni pièces ni tickets ? Perdu.",
    de: "Kaufe jede Runde 3 Züge oder 7 — die Münzgebühr wächst mit jeder Rate. Mit Münzen zahlen bringt Tickets (3 Züge bringen mehr). Nicht genug? Dann kostet es 1 Ticket (3 Züge) oder 2 Tickets (7 Züge), ohne Belohnung. Weder Münzen noch Tickets? Verloren.",
    it: "Ogni turno, compra 3 tirate o 7 — la tariffa in monete cresce a ogni rata. Pagare con monete dà biglietti (3 tirate ne danno di più). Non puoi permettertelo? Costa 1 biglietto (3 tirate) o 2 biglietti (7 tirate), senza ricompensa. Né monete né biglietti? Hai perso.",
    ja: "毎ラウンド、レバー3回か7回を購入する——入場料は分割払いごとに上がる。コインで払うとチケットがもらえる（3回のほうが多い）。払えない場合はチケット1枚（3回）か2枚（7回）で、報酬はなし。コインもチケットもないと負けだ。",
    ko: "매 라운드 레버 3회 또는 7회를 구매한다——입장료는 분할금마다 오른다. 코인으로 내면 티켓을 얻는다(3회가 더 많다). 낼 수 없다면 티켓 1장(3회) 또는 2장(7회)이 들며 보상은 없다. 코인도 티켓도 없으면 패배한다.",
    "zh-hans": "每回合购买3次或7次拉杆——金币费用随每次配额上涨。用金币支付可获得票券（3次拉杆更多）。付不起？改用1张票（3次）或2张票（7次），无任何回报。既无金币也无票？你输了。",
    "zh-hant": "每回合購買3次或7次拉桿——金幣費用隨每次配額上漲。用金幣支付可獲得票券（3次拉桿更多）。付不起？改用1張票（3次）或2張票（7次），無任何回報。既無金幣也無票？你輸了。",
  },
  "Sound volume": {
    en: "Sound volume", es: "Volumen del sonido", fr: "Volume du son", de: "Lautstärke", it: "Volume del suono",
    ja: "効果音の音量", ko: "효과음 볼륨", "zh-hans": "音效音量", "zh-hant": "音效音量",
  },
  "Mute": {
    en: "Mute", es: "Silenciar", fr: "Couper le son", de: "Stumm", it: "Silenzia",
    ja: "ミュート", ko: "음소거", "zh-hans": "静音", "zh-hant": "靜音",
  },
  "How to play": {
    en: "How to play", es: "Cómo jugar", fr: "Comment jouer", de: "Spielanleitung", it: "Come si gioca",
    ja: "遊び方", ko: "플레이 방법", "zh-hans": "玩法说明", "zh-hant": "玩法說明",
  },
  "Charm Codex": {
    en: "Charm Codex", es: "Códice de Amuletos", fr: "Codex des Talismans", de: "Talisman-Kodex", it: "Codice Amuleti",
    ja: "おふだ事典", ko: "부적 사전", "zh-hans": "护符图鉴", "zh-hant": "護符圖鑑",
  },
  "Search": {
    en: "Search", es: "Buscar", fr: "Rechercher", de: "Suchen", it: "Cerca",
    ja: "検索", ko: "검색", "zh-hans": "搜索", "zh-hant": "搜尋",
  },
  "No results": {
    en: "No results", es: "Sin resultados", fr: "Aucun résultat", de: "Keine Ergebnisse", it: "Nessun risultato",
    ja: "結果なし", ko: "결과 없음", "zh-hans": "无结果", "zh-hant": "無結果",
  },
  "Clear a quota early for a bonus: 7% of the quota + 4 tickets, plus 1 extra ticket per round still left. Paying right on the deadline earns no bonus.": {
    en: "Clear a quota early for a bonus: 7% of the quota + 4 tickets, plus 1 extra ticket per round still left. Paying right on the deadline earns no bonus.",
    es: "Liquida una cuota antes de tiempo para una bonificación: 7% de la cuota + 4 tickets, más 1 ticket extra por cada ronda restante. Pagar justo en el plazo final no da bonificación.",
    fr: "Solde une quote-part en avance pour un bonus : 7 % de la quote-part + 4 tickets, plus 1 ticket supplémentaire par manche restante. Payer pile à l'échéance ne rapporte aucun bonus.",
    de: "Zahle eine Rate vorzeitig für einen Bonus: 7 % der Rate + 4 Tickets, dazu 1 Extra-Ticket pro verbleibender Runde. Zahlst du erst am Stichtag, gibt es keinen Bonus.",
    it: "Salda una rata in anticipo per un bonus: 7% della rata + 4 biglietti, più 1 biglietto extra per ogni turno rimasto. Pagare proprio alla scadenza non dà nessun bonus.",
    ja: "分割払いを早めに払い切るとボーナス：分割払いの7%＋チケット4枚、さらに残りラウンド1つにつきチケット1枚追加。期限ちょうどの支払いではボーナスはない。",
    ko: "분할금을 미리 갚으면 보너스: 분할금의 7% + 티켓 4장, 남은 라운드 1개당 티켓 1장 추가. 기한에 정확히 맞춰 내면 보너스는 없다.",
    "zh-hans": "提前清空配额可获得奖励：配额的7% + 4张券，剩余每回合额外+1张券。正好在期限当天支付没有奖励。",
    "zh-hant": "提前清空配額可獲得獎勵：配額的7% + 4張券，剩餘每回合額外+1張券。正好在期限當天支付沒有獎勵。",
  },
  "Patterns pay coins only. Tickets come from clearing quotas — spend them on charms and permanent upgrades.": {
    en: "Patterns pay coins only. Tickets come from clearing quotas — spend them on charms and permanent upgrades.",
    es: "Los patrones pagan solo monedas. Los tickets se consiguen liquidando cuotas: gástalos en amuletos y mejoras permanentes.",
    fr: "Les motifs ne paient qu'en pièces. Les tickets viennent des quote-parts soldées — dépense-les en grigris et améliorations permanentes.",
    de: "Muster zahlen nur Münzen. Tickets gibt es für bezahlte Raten — gib sie für Glücksbringer und permanente Upgrades aus.",
    it: "Le combinazioni pagano solo monete. I biglietti arrivano saldando le rate — spendili per amuleti e potenziamenti permanenti.",
    ja: "パターンが払うのはコインのみ。チケットは分割払いの清算でもらえる——おまもりや永久アップグレードに使おう。",
    ko: "패턴은 코인만 지급한다. 티켓은 분할금을 갚으면 얻는다——부적과 영구 업그레이드에 써라.",
    "zh-hans": "牌型只支付金币。清空配额可获得券——把券花在护符和永久升级上。",
    "zh-hant": "牌型只支付金幣。清空配額可獲得券——把券花在護符和永久升級上。",
  },
  "Deposits earn 7% interest, paid by the ATM after every round.": {
    en: "Deposits earn 7% interest, paid by the ATM after every round.",
    es: "Los depósitos ganan un 7% de interés que el cajero paga tras cada ronda.",
    fr: "Les dépôts rapportent 7 % d'intérêts, versés par le distributeur après chaque manche.",
    de: "Einlagen bringen 7 % Zinsen, ausgezahlt nach jeder Runde.",
    it: "I depositi fruttano il 7%, pagati dal bancomat dopo ogni turno.",
    ja: "預け入れは毎ラウンドの後に7%の利息としてATMから払い戻される。",
    ko: "예치금은 매 라운드 후 ATM이 7% 이자로 지급한다.",
    "zh-hans": "存款每回合后可获得ATM支付的7%利息。",
    "zh-hant": "存款每回合後可獲得ATM支付的7%利息。",
  },
  "Pay off a debt completely and a bigger one takes its place — plus one extra charm slot. How far can you go?": {
    en: "Pay off a debt completely and a bigger one takes its place — plus one extra charm slot. How far can you go?",
    es: "Salda una deuda por completo y ocupará su lugar otra mayor, además de un espacio extra de amuleto. ¿Hasta dónde llegarás?",
    fr: "Rembourse entièrement une dette et une plus grosse prend sa place — avec un emplacement de charme en bonus. Jusqu'où iras-tu ?",
    de: "Zahlst du eine Schuld komplett ab, rückt eine größere nach — plus ein zusätzlicher Amulett-Platz. Wie weit kommst du?",
    it: "Estingui un debito del tutto e ne subentrerà uno più grande — più uno spazio amuleto extra. Fino a dove arriverai?",
    ja: "借金を全額返すと、さらに大きな借金が代わりにやってくる。しかもアミュレット枠が1つ増える。どこまで行ける？",
    ko: "빚을 전액 갚으면 더 큰 빚이 그 자리를 차지한다. 대신 부적 슬롯이 하나 늘어난다. 어디까지 갈 수 있을까?",
    "zh-hans": "还清一笔债务后会有更大的债务取而代之——外加一个额外护符槽。你能走多远？",
    "zh-hant": "還清一筆債務後會有更大的債務取而代之——外加持有一個額外護符欄位。你能走多遠？",
  },
  "Debt cleared! One more charm slot — and a much bigger debt.": {
    en: "Debt cleared! One more charm slot — and a much bigger debt.",
    es: "¡Deuda saldada! Un espacio más de amuleto… y una deuda mucho más grande.",
    fr: "Dette soldée ! Un emplacement de charme en plus — et une bien plus grosse dette.",
    de: "Schuld abbezahlt! Ein Amulett-Platz mehr — und ein viel größerer Schuldenberg.",
    it: "Debito estinto! Uno spazio amuleto in più… e un debito molto più grande.",
    ja: "借金完済！アミュレット枠が1つ増加——そしてもっと巨大な借金が。",
    ko: "빚 완납! 부적 슬롯 하나 추가 — 그리고 훨씬 큰 빚이.",
    "zh-hans": "债务还清！护符槽多一格——以及一笔大得多的新债务。",
    "zh-hant": "債務還清！護符欄位多一格——以及一筆大得多的新債務。",
  },
  "Smaller patterns are swallowed by bigger ones that contain them — chase the big shapes!": {
    en: "Smaller patterns are swallowed by bigger ones that contain them — chase the big shapes!", es: "Los patrones pequeños son absorbidos por los grandes que los contienen; ¡busca las figuras grandes!", fr: "Les petits motifs sont absorbés par les grands qui les contiennent — vise les grandes formes !", de: "Kleine Muster werden von größeren verschluckt, die sie enthalten — jage die großen Formen!", it: "Le combinazioni piccole vengono assorbite da quelle grandi che le contengono — punta alle figure grandi!",
    ja: "小さいパターンはそれを含む大きいパターンに飲み込まれる。大きい形を狙え！", ko: "작은 패턴은 그것을 포함하는 큰 패턴에 삼켜진다. 큰 도형을 노려라!", "zh-hans": "小牌型会被包含它的大牌型吞并——追大形状！", "zh-hant": "小牌型會被包含它的大牌型吞併——追大形狀！",
  },
  "GAME OVER": {
    en: "GAME OVER", es: "FIN DEL JUEGO", fr: "PARTIE TERMINÉE", de: "GAME OVER", it: "GAME OVER",
    ja: "ゲームオーバー", ko: "게임 오버", "zh-hans": "游戏结束", "zh-hant": "遊戲結束",
  },
  "You couldn't pay the quota. Team Rocket repossessed your team AND your shoes.": {
    en: "You couldn't pay the quota. Team Rocket repossessed your team AND your shoes.", es: "No pudiste pagar la cuota. El Equipo Rocket embargó a tu equipo Y tus zapatos.", fr: "Tu n'as pas pu payer la quote-part. La Team Rocket a saisi ton équipe ET tes chaussures.", de: "Du konntest die Rate nicht zahlen. Team Rocket hat dein Team UND deine Schuhe gepfändet.", it: "Non hai potuto pagare la rata. Il Team Rocket ha sequestrato la tua squadra E le tue scarpe.",
    ja: "分割払いが払えなかった。ロケット団はポケモンと靴も差し押さえた。", ko: "분할금을 못 갚았다. 로켓단은 포켓몬과 신발까지 압수했다.", "zh-hans": "你没付起配额。火箭队收走了你的队伍……还有你的鞋。", "zh-hant": "你沒付起配額。火箭隊收走了你的隊伍……還有你的鞋。",
  },
  "Round reached": {
    en: "Round reached", es: "Ronda alcanzada", fr: "Manche atteinte", de: "Erreichte Runde", it: "Turno raggiunto",
    ja: "到達ラウンド", ko: "도달한 라운드", "zh-hans": "到达回合", "zh-hant": "到達回合",
  },
  "Total earned": {
    en: "Total earned", es: "Total ganado", fr: "Total gagné", de: "Insgesamt verdient", it: "Totale guadagnato",
    ja: "獲得コイン総額", ko: "총 획득 코인", "zh-hans": "总收益", "zh-hant": "總收益",
  },
  "Best single pull": {
    en: "Best single pull", es: "Mejor tirada", fr: "Meilleur tirage", de: "Bester Zug", it: "Miglior tirata",
    ja: "最高の1回", ko: "최고의 한 번", "zh-hans": "最佳单次拉杆", "zh-hant": "最佳單次拉桿",
  },
  "Jackpots": {
    en: "Jackpots", es: "Jackpots", fr: "Jackpots", de: "Jackpots", it: "Jackpot",
    ja: "ジャックポット", ko: "잭팟", "zh-hans": "头奖", "zh-hant": "頭獎",
  },
  "Try again": {
    en: "Try again", es: "Intentar de nuevo", fr: "Réessayer", de: "Nochmal versuchen", it: "Riprova",
    ja: "もう一度挑戦", ko: "다시 도전", "zh-hans": "再试一次", "zh-hant": "再試一次",
  },
  "DEBT CLEARED!": {
    en: "DEBT CLEARED!", es: "¡DEUDA SALDADA!", fr: "DETTE SOLDÉE !", de: "SCHULDEN GETILGT!", it: "DEBITO ESTINTO!",
    ja: "借金完済！", ko: "빚 완납!", "zh-hans": "债务清零！", "zh-hant": "債務清零！",
  },
  "The vault door creaks open. You walk out richer than Giovanni — he'll remember this.": {
    en: "The vault door creaks open. You walk out richer than Giovanni — he'll remember this.", es: "La puerta blindada se abre chirriando. Sales más rico que Giovanni; él lo recordará.", fr: "La porte blindée s'ouvre en grinçant. Tu ressors plus riche que Giovanni — il s'en souviendra.", de: "Die Panzertür knarrt auf. Du gehst reicher als Giovanni hinaus — er wird sich das merken.", it: "La porta corazzata si apre cigolando. Esci più ricco di Giovanni — se lo ricorderà.",
    ja: "金庫の扉がきしむ音とともに開く。サカキより金持ちになって脱出成功。奴は忘れないだろう。", ko: "금고 문이 삐걱거리며 열린다. 비주보다 부자가 되어 탈출했다. 녀석은 잊지 않을 거다.", "zh-hans": "金库门吱呀打开。你比坂木还有钱地走了出去——他会记住的。", "zh-hant": "金庫門吱呀打開。你比坂木還有錢地走了出去——他會記住的。",
  },
  "Escaped in": {
    en: "Escaped in", es: "Escapaste en", fr: "Échappé en", de: "Entkommen in", it: "Fuggito in",
    ja: "脱出にかかったラウンド", ko: "탈출한 라운드", "zh-hans": "逃脱用了", "zh-hant": "逃脫用了",
  },
  "rounds": {
    en: "rounds", es: "rondas", fr: "manches", de: "Runden", it: "turni",
    ja: "ラウンド", ko: "라운드", "zh-hans": "回合", "zh-hant": "回合",
  },
  "Play again": {
    en: "Play again", es: "Jugar otra vez", fr: "Rejouer", de: "Nochmal spielen", it: "Rigioca",
    ja: "もう一度遊ぶ", ko: "다시 플레이", "zh-hans": "再玩一局", "zh-hant": "再玩一局",
  },
  "Escapes": {
    en: "Escapes", es: "Escapes", fr: "Évasions", de: "Ausbrüche", it: "Evasioni",
    ja: "脱出回数", ko: "탈출 횟수", "zh-hans": "逃脱次数", "zh-hant": "逃脫次數",
  },
  "Fastest escape": {
    en: "Fastest escape", es: "Escape más rápido", fr: "Évasion la plus rapide", de: "Schnellster Ausbruch", it: "Fuga più veloce",
    ja: "最速脱出", ko: "최고 속도 탈출", "zh-hans": "最快逃脱", "zh-hant": "最快逃脫",
  },
  "round": {
    en: "round", es: "ronda", fr: "manche", de: "Runde", it: "turno",
    ja: "ラウンド", ko: "라운드", "zh-hans": "回合", "zh-hant": "回合",
  },
  "ATM": {
    en: "ATM", es: "Cajero", fr: "Distributeur", de: "Automat", it: "ATM",
    ja: "ATM", ko: "ATM", "zh-hans": "ATM", "zh-hant": "ATM",
  },
  "No one has ever escaped this basement... probably": {
    en: "No one has ever escaped this basement... probably", es: "Nadie ha escapado jamás de este sótano... probablemente", fr: "Personne n'est jamais sorti de ce sous-sol... probablement", de: "Niemand hat diesen Keller je verlassen... wahrscheinlich", it: "Nessuno è mai scappato da questo seminterrato... probabilmente",
    ja: "この地下室から抜け出した者はいない……たぶん", ko: "이 지하실에서 탈출한 자는 없다…… 아마도", "zh-hans": "从没有人从这个地下室逃出去过……大概吧", "zh-hant": "從沒有人從這個地下室逃出去過……大概吧",
  },
  "FULL HOUSE!": {
    en: "FULL HOUSE!", es: "¡PANTALLA COMPLETA!", fr: "GRILLE PLEINE !", de: "VOLLES BILD!", it: "SCHEDE PIENE!",
    ja: "フルハウス！", ko: "풀하우스!", "zh-hans": "满盘通吃！", "zh-hant": "滿盤通吃！",
  },
  "JACKPOT?! ...Enjoy it while it lasts.": {
    en: "JACKPOT?! ...Enjoy it while it lasts.", es: "¿JACKPOT? ...Disfrútalo mientras dure.", fr: "UN JACKPOT ?! ...Profites-en tant que ça dure.", de: "JACKPOT?! ...Genieß es, solange es dauert.", it: "JACKPOT?! ...Goditelo finché dura.",
    ja: "ジャックポット？！…好きなだけ楽しめ。", ko: "잭팟?! …되는 동안 즐겨라.", "zh-hans": "头奖？！……趁还在享受吧。", "zh-hant": "頭獎？！……趁還在享受吧。",
  },
  "You're free... for now.": {
    en: "You're free... for now.", es: "Eres libre... por ahora.", fr: "Tu es libre... pour l'instant.", de: "Du bist frei ... vorerst.", it: "Sei libero... per ora.",
    ja: "自由だ……今のところは。", ko: "자유다… 일단은.", "zh-hans": "你自由了……目前是。", "zh-hant": "你自由了……目前是。",
  },
  "Team Rocket blasted off with YOUR wallet!": {
    en: "Team Rocket blasted off with YOUR wallet!", es: "¡El Equipo Rocket salió volando con TU cartera!", fr: "La Team Rocket s'est envolée avec TON portefeuille !", de: "Team Rocket ist mit DEINEM Portemonnaie davongeflogen!", it: "Il Team Rocket è decollato con IL TUO portafoglio!",
    ja: "ロケット団はおまえの財布を持って飛んでいった！", ko: "로켓단이 네 지갑을 들고 날아가 버렸다!", "zh-hans": "火箭队带着你的钱包飞上了天！", "zh-hant": "火箭隊帶著你的錢包飛上了天！",
  },
  "Symbols Multiplier": {
    en: "Symbols Multiplier", es: "Multiplicador de símbolos", fr: "Multiplicateur de symboles", de: "Symbol-Multiplikator", it: "Moltiplicatore simboli",
    ja: "シンボル倍率", ko: "심볼 배율", "zh-hans": "图案倍率", "zh-hant": "圖案倍率",
  },
  "Patterns Multiplier": {
    en: "Patterns Multiplier", es: "Multiplicador de patrones", fr: "Multiplicateur de motifs", de: "Muster-Multiplikator", it: "Moltiplicatore combinazioni",
    ja: "パターン倍率", ko: "패턴 배율", "zh-hans": "牌型倍率", "zh-hant": "牌型倍率",
  },
  "All payouts": {
    en: "All payouts", es: "Todos los premios", fr: "Tous les gains", de: "Alle Auszahlungen", it: "Tutti i premi",
    ja: "すべての配当", ko: "모든 배당", "zh-hans": "所有派彩", "zh-hant": "所有派彩",
  },
  "value": {
    en: "value", es: "valor", fr: "valeur", de: "Wert", it: "valore",
    ja: "価値", ko: "가치", "zh-hans": "价值", "zh-hant": "價值",
  },
  "multiplier": {
    en: "multiplier", es: "multiplicador", fr: "multiplicateur", de: "Multiplikator", it: "moltiplicatore",
    ja: "倍率", ko: "배율", "zh-hans": "倍数", "zh-hant": "倍數",
  },
  "The boss expects your quota on time. Don't disappoint Team Rocket.": {
    en: "The boss expects your quota on time. Don't disappoint Team Rocket.", es: "El jefe espera su cuota a tiempo. No decepciones al Equipo Rocket.", fr: "Le chef attend ta quote-part à l'heure. Ne déçois pas la Team Rocket.", de: "Der Boss erwartet seine Rate pünktlich. Enttäusche Team Rocket nicht.", it: "Il capo vuole la sua rata in orario. Non deludere il Team Rocket.",
    ja: "ボスは期限どおりの分割払いを待っている。ロケット団を失望させるな。", ko: "보스는 분할금을 제때 기대신다. 로켓단을 실망시키지 마라.", "zh-hans": "老板要求按时交配额。别让火箭队失望。", "zh-hant": "老闆要求按時交配額。別讓火箭隊失望。",
  },
  "Time is money, trainer. Buy your pulls and pay the fee.": {
    en: "Time is money, trainer. Buy your pulls and pay the fee.", es: "El tiempo es dinero, entrenador. Compra tus tiradas y paga la cuota.", fr: "Le temps c'est de l'argent, dresseur. Achète tes tirages et paie.", de: "Zeit ist Geld, Trainer. Kauf deine Züge und zahle die Gebühr.", it: "Il tempo è denaro, allenatore. Compra le tue slate e paga la tariffa.",
    ja: "時は金なりだ、トレーナー。レバー回数を買って料金を払え。", ko: "시간은 돈이다, 트레이너. 레버 횟수를 사고 요금을 지불해라.", "zh-hans": "时间就是金钱，训练家。购买拉杆次数并付费。", "zh-hant": "時間就是金錢，訓練家。購買拉桿次數並付費。",
  },
  "Interest never sleeps. Neither do I.": {
    en: "Interest never sleeps. Neither do I.", es: "Los intereses nunca duermen. Yo tampoco.", fr: "Les intérêts ne dorment jamais. Moi non plus.", de: "Zinsen schlafen nie. Ich auch nicht.", it: "Gli interessi non dormono mai. Nemmeno io.",
    ja: "利息は眠らない。私もだ。", ko: "이자는 잠들지 않지. 나도 마찬가지다.", "zh-hans": "利息从不睡觉。我也一样。", "zh-hant": "利息從不睡覺。我也一樣。",
  },
  "A wise investor pays early. A broke one pays interest.": {
    en: "A wise investor pays early. A broke one pays interest.", es: "El inversionista listo paga temprano. El pelado paga intereses.", fr: "L'investisseur avisé paie tôt. Le fauché paie des intérêts.", de: "Ein kluger Anleger zahlt früh. Ein Pleiter zahlt Zinsen.", it: "L'investitore saggio paga presto. Il squattrinato paga interessi.",
    ja: "賢い投資家は早く払う。破産者は利息を払う。", ko: "현명한 투자자는 일찍 갚는다. 파산한 놈은 이자를 낸다.", "zh-hans": "聪明的投资者早点还。破产的才付利息。", "zh-hant": "聰明的投資者早點還。破產的才付利息。",
  },
  "The machine owes us. Make it pay.": {
    en: "The machine owes us. Make it pay.", es: "La máquina nos debe. Hazla pagar.", fr: "La machine nous doit de l'argent. Fais-la payer.", de: "Die Maschine schuldet uns was. Lass sie zahlen.", it: "La macchina ci deve dei soldi. Falla pagare.",
    ja: "このマシンには貸しがあるんだ。払わせろ。", ko: "저 기계는 우리 빚이 있다. 물어내게 해라.", "zh-hans": "这台机器欠我们的。让它掏钱。", "zh-hant": "這台機器欠我們的。讓它掏錢。",
  },
  "Not bad. The boss loves a productive machine.": {
    en: "Not bad. The boss loves a productive machine.", es: "Nada mal. Al jefe le encantan las máquinas productivas.", fr: "Pas mal. Le chef adore les machines productives.", de: "Nicht schlecht. Der Boss liebt produktive Maschinen.", it: "Niente male. Al capo piacciono le macchine produttive.",
    ja: "悪くない。ボスは実績のあるマシンがお好きでな。", ko: "나쁘지 않군. 보스는 실적 있는 기계를 좋아하신다.", "zh-hans": "不错嘛。老板喜欢多产的机器。", "zh-hant": "不錯嘛。老闆喜歡多產的機器。",
  },

  // PokéSlots — round entry (3 or 7 pulls bought each round)
  "Quota": {
    en: "Quota", es: "Cuota", fr: "Quote-part", de: "Rate", it: "Rata",
    ja: "分割払い", ko: "분할금", "zh-hans": "配额", "zh-hant": "配額",
  },
  "Choose your pulls": {
    en: "Choose your pulls", es: "Elige tus tiradas", fr: "Choisis tes tirages", de: "Wähle deine Züge", it: "Scegli le tue slate",
    ja: "レバー回数を選べ", ko: "레버 횟수를 선택해라", "zh-hans": "选择拉杆次数", "zh-hant": "選擇拉桿次數",
  },
  "Team Rocket charges an entry fee every round.": {
    en: "Team Rocket charges an entry fee every round.", es: "El Equipo Rocket cobra una entrada cada ronda.", fr: "La Team Rocket facture des frais d'entrée à chaque manche.", de: "Team Rocket verlangt jede Runde eine Eintrittsgebühr.", it: "Il Team Rocket chiede un biglietto d'ingresso a ogni turno.",
    ja: "ロケット団は毎ラウンド、入場料金を請求してくる。", ko: "로켓단은 매 라운드 입장료를 요구한다.", "zh-hans": "火箭队每回合都收取入场费。", "zh-hant": "火箭隊每回合都收取入場費。",
  },
  "pulls": {
    en: "pulls", es: "tiradas", fr: "tirages", de: "Züge", it: "slate",
    ja: "回", ko: "회", "zh-hans": "次拉杆", "zh-hant": "次拉桿",
  },
  "per spare pull": {
    en: "per spare pull", es: "por tirada sobrante", fr: "par tirage restant", de: "pro übrigem Zug", it: "per slata avanzata",
    ja: "残り1回につき", ko: "남은 1회당", "zh-hans": "每剩余1次", "zh-hant": "每剩餘1次",
  },
  "added to your debt": {
    en: "added to your debt", es: "añadido a tu deuda", fr: "ajoutés à ta dette", de: "zu deinen Schulden hinzugefügt", it: "aggiunto al tuo debito",
    ja: "借金に上乗せ", ko: "빚에 추가됨", "zh-hans": "计入你的债务", "zh-hant": "計入你的債務",
  },
  "Can't afford the fee? Team Rocket adds the difference to your debt.": {
    en: "Can't afford the fee? Team Rocket adds the difference to your debt.", es: "¿No te alcanza para la entrada? El Equipo Rocket añade la diferencia a tu deuda.", fr: "Pas de quoi payer ? La Team Rocket ajoute la différence à ta dette.", de: "Fee zu teuer? Team Rocket fügt die Differenz deinen Schulden hinzu.", it: "Non puoi permetterti la tariffa? Il Team Rocket aggiunge la differenza al tuo debito.",
    ja: "料金が払えないか？ロケット団が差額を借金に追加してやる。", ko: "요금을 낼 수 없나? 로켓단이 차액을 빚에 더해준다.", "zh-hans": "付不起费用？火箭队会把差额记到你的债务上。", "zh-hant": "付不起費用？火箭隊會把差額記到你的債務上。",
  },

  // PokéSlots charms — names stay as the item proper nouns (EN), the
  // descriptions below are fully translated.
  "charm-silk-scarf": { en: "Silk Scarf" },
  "silk-scarf-desc": {
    en: "Exeggcute and Cherubi are worth +1.", es: "Exeggcute y Cherubi valen +1.", fr: "Noeunoeuf et Ceribou valent +1.", de: "Owei und Kikugi sind +1 wert.", it: "Exeggcute e Cherubi valgono +1.",
    ja: "タマタマとチェリンボの価値+1。", ko: "아라리와 체리버의 가치 +1.", "zh-hans": "蛋蛋与樱花宝价值+1。", "zh-hant": "蛋蛋與櫻花寶價值+1。",
  },
  "charm-lucky-egg": { en: "Lucky Egg" },
  "lucky-egg-desc": {
    en: "Every 3 consecutive pulls scoring Carbink, Gholdengo or Seviper guarantees EYE on the next pull.", es: "Cada 3 tiradas seguidas puntuando Carbink, Gholdengo o Seviper garantizan EYE en la siguiente tirada.", fr: "Tous les 3 tirages consécutifs marquant Strassie, Gromago ou Séviper garantissent EYE au tirage suivant.", de: "Alle 3 aufeinanderfolgenden Züge mit Rocara, Monetigo oder Vipitis garantieren EYE im nächsten Zug.", it: "Ogni 3 tirate consecutive che segnano Carbink, Gholdengo o Seviper garantiscono EYE alla tirata successiva.",
    ja: "メレシー・サーフゴー・ハブネークのいずれかで3回連続成立すると、次のレバーでEYEが保証される。", ko: "멜리시, 타부자고 또는 세비퍼로 3회 연속 당첨되면 다음 레버에서 EYE가 보장된다.", "zh-hans": "连续3次拉杆命中小碎钻、赛富豪或饭匙蛇时，下一次拉杆必出EYE。", "zh-hant": "連續3次拉桿命中小碎鑽、賽富豪或飯匙蛇時，下一次拉桿必出EYE。",
  },
  "charm-choice-specs": { en: "Choice Specs" },
  "choice-specs-desc": {
    en: "If the previous 3 pulls had no patterns, permanently raises every pattern by its base multiplier.", es: "Si las 3 tiradas anteriores no tuvieron patrones, aumenta permanentemente cada patrón en su multiplicador base.", fr: "Si les 3 derniers tirages n'ont eu aucun motif, augmente définitivement chaque motif de son multiplicateur de base.", de: "Hatten die letzten 3 Züge keine Muster, erhöht er jedes Muster dauerhaft um seinen Grund-Multiplikator.", it: "Se le ultime 3 tirate non hanno avuto combinazioni, aumenta permanentemente ogni combinazione del suo moltiplicatore base.",
    ja: "直近3回でパターンが一度も成立しなかった場合、すべてのパターンの倍率を基本倍率ぶん永続的に上げる。", ko: "최근 3회 레버에서 패턴이 없었다면 모든 패턴의 배율을 기본 배율만큼 영구히 올린다.", "zh-hans": "若之前3次拉杆均未触发图案，则所有牌型永久提升其基础倍率。", "zh-hant": "若之前3次拉桿均未觸發圖案，則所有牌型永久提升其基礎倍率。",
  },
  "charm-muscle-band": { en: "Muscle Band" },
  "muscle-band-desc": {
    en: "HOR, HOR-L and HOR-XL multipliers +2.", es: "Los multiplicadores de HOR, HOR-L y HOR-XL +2.", fr: "Multiplicateurs HOR, HOR-L et HOR-XL +2.", de: "HOR-, HOR-L- und HOR-XL-Multiplikatoren +2.", it: "Moltiplicatori HOR, HOR-L e HOR-XL +2.",
    ja: "HOR・HOR-L・HOR-XLの倍率+2。", ko: "HOR·HOR-L·HOR-XL 배율 +2.", "zh-hans": "HOR、HOR-L、HOR-XL倍率+2。", "zh-hant": "HOR、HOR-L、HOR-XL倍率+2。",
  },
  "charm-focus-band": { en: "Focus Band" },
  "focus-band-desc": {
    en: "When you can't pay a quota, wipes it, empties your coins and grants a free 7-pull round (consumed).", es: "Cuando no puedas pagar una cuota, la borra, vacía tus monedas y otorga una ronda gratis de 7 tiradas (se consume).", fr: "Quand une quote-part est impayable, l'efface, vide tes pièces et offre une manche gratuite de 7 tirages (consommé).", de: "Wenn du eine Rate nicht zahlen kannst, löscht er sie, leert deine Münzen und gewährt eine kostenlose Runde mit 7 Zügen (wird verbraucht).", it: "Quando non puoi pagare una rata, la cancella, svuota le tue monete e concede un turno gratuito da 7 slate (consumata).",
    ja: "分割払いを払えないとき、それを消してコインを空にし、レバー7回の無料ラウンドをくれる（消費）。", ko: "분할금을 낼 수 없을 때 이를 지우고 코인을 비운 뒤 레버 7회 무료 라운드를 준다(소모).", "zh-hans": "当你付不起配额时，将其清除、清空你的金币，并赠送一次免费的7次拉杆回合（消耗）。", "zh-hant": "當你付不起配額時，將其清除、清空你的金幣，並贈送一次免費的7次拉桿回合（消耗）。",
  },
  "charm-luck-incense": { en: "Luck Incense" },
  "luck-incense-desc": {
    en: "All payouts ×1.3.", es: "Todos los premios ×1,3.", fr: "Tous les gains ×1,3.", de: "Alle Auszahlungen ×1,3.", it: "Tutti i premi ×1,3.",
    ja: "すべての配当×1.3。", ko: "모든 배당 ×1.3.", "zh-hans": "所有派彩×1.3。", "zh-hant": "所有派彩×1.3。",
  },
  "charm-wide-lens": { en: "Wide Lens" },
  "wide-lens-desc": {
    en: "Carbink, Gholdengo and Seviper appear ~60% more often.", es: "Carbink, Gholdengo y Seviper aparecen ~60% más seguido.", fr: "Strassie, Gromago et Séviper apparaissent ~60% plus souvent.", de: "Rocara, Monetigo und Vipitis erscheinen ~60% häufiger.", it: "Carbink, Gholdengo e Seviper appaiono ~60% più spesso.",
    ja: "メレシー・サーフゴー・ハブネークの出現率が約6割増。", ko: "멜리시·타부자고·세비퍼 등장률 약 60% 증가.", "zh-hans": "小碎钻、赛富豪、饭匙蛇出现率提高约60%。", "zh-hant": "小碎鑽、賽富豪、飯匙蛇出現率提高約60%。",
  },
  "charm-metal-coat": { en: "Metal Coat" },
  "metal-coat-desc": {
    en: "Chimecho and Carbink are worth +2.", es: "Chimecho y Carbink valen +2.", fr: "Éoko et Strassie valent +2.", de: "Palimpalim und Rocara sind +2 wert.", it: "Chimecho e Carbink valgono +2.",
    ja: "チリーンとメレシーの価値+2。", ko: "치렁과 멜리시의 가치 +2.", "zh-hans": "风铃铃与小碎钻价值+2。", "zh-hant": "風鈴鈴與小碎鑽價值+2。",
  },
  "charm-amulet-coin": { en: "Amulet Coin" },
  "amulet-coin-desc": {
    en: "10% chance per spin: refunds the pull and adds +4 Luck to it.", es: "10% de probabilidad por tirada: devuelve la tirada y le añade +4 de suerte.", fr: "10 % de chance par tirage : rembourse le tirage et lui ajoute +4 de Chance.", de: "10% Chance pro Zug: erstattet den Zug und verleiht ihm +4 Glück.", it: "10% di probabilità per tirata: rimborsa la tirata e le aggiunge +4 Fortuna.",
    ja: "スピンごとに10%：その回のレバーを返上し、運+4を与える。", ko: "스핀마다 10% 확률: 해당 레버를 환불하고 행운 +4를 더한다.", "zh-hans": "每次旋转有10%概率：返还该次拉杆，并为它增加+4幸运。", "zh-hant": "每次旋轉有10%機率：返還該次拉桿，並為它增加+4幸運。",
  },
  "charm-super-repel": { en: "Super Repel" },
  "super-repel-desc": {
    en: "Exeggcute stops appearing on the reels entirely.", es: "Exeggcute deja de aparecer por completo.", fr: "Noeunoeuf cesse totalement d'apparaître.", de: "Owei erscheint gar nicht mehr.", it: "Exeggcute smette completamente di apparire.",
    ja: "タマタマが一切出現しなくなる。", ko: "아라리가 아예 등장하지 않게 된다.", "zh-hans": "蛋蛋完全不再出现。", "zh-hant": "蛋蛋完全不再出現。",
  },
  "charm-magnet": { en: "Magnet" },
  "magnet-desc": {
    en: "Each spin converts one cell into the grid's most common symbol.", es: "En cada tirada convierte una casilla en el símbolo más común de la pantalla.", fr: "À chaque tirage, transforme une case en le symbole le plus courant de la grille.", de: "Verwandelt bei jedem Zug eine Zelle in das häufigste Symbol des Bildes.", it: "A ogni tirata converte una cella nel simbolo più comune della schermata.",
    ja: "スピンごとにマスを1つ、画面内で最も多いシンボルに変える。", ko: "스핀마다 칸 하나를 화면에서 가장 흔한 심볼로 바꾼다.", "zh-hans": "每次旋转将一个格子变成屏上最多的图案。", "zh-hant": "每次旋轉將一個格子變成屏上最多的圖案。",
  },
  "charm-gold-bottle-cap": { en: "Gold Bottle Cap" },
  "gold-bottle-cap-desc": {
    en: "Seviper is worth +5.", es: "Seviper vale +5.", fr: "Séviper vaut +5.", de: "Vipitis ist +5 wert.", it: "Seviper vale +5.",
    ja: "ハブネークの価値+5。", ko: "세비퍼의 가치 +5.", "zh-hans": "饭匙蛇价值+5。", "zh-hant": "飯匙蛇價值+5。",
  },
  "charm-big-mushroom": { en: "Big Mushroom" },
  "big-mushroom-desc": {
    en: "Exeggcute, Cherubi and Sprigatito appear ~50% more often.", es: "Exeggcute, Cherubi y Sprigatito aparecen ~50% más seguido.", fr: "Noeunoeuf, Ceribou et Poussacha apparaissent ~50% plus souvent.", de: "Owei, Kikugi und Felori erscheinen ~50% häufiger.", it: "Exeggcute, Cherubi e Sprigatito appaiono ~50% più spesso.",
    ja: "タマタマ・チェリンボ・ニャオハの出現率が約5割増。", ko: "아라리·체리버·나오하 등장률 약 50% 증가.", "zh-hans": "蛋蛋、樱花宝、新叶喵出现率提高约50%。", "zh-hant": "蛋蛋、櫻花寶、新葉喵出現率提高約50%。",
  },
  "charm-pokedoll": { en: "Poké Doll" },
  "pokedoll-desc": {
    en: "When a +3 Pattern triggers, earn money equal to your current Interest.", es: "Cuando se activa un Patrón +3, ganas dinero igual a tu Interés actual.", fr: "Quand un Motif +3 se déclenche, gagne de l'argent égal à ton Intérêt actuel.", de: "Wenn ein +3-Muster auslöst, verdienst du Geld in Höhe deiner aktuellen Zinsen.", it: "Quando si attiva una Combinazione +3, guadagni denaro pari ai tuoi interessi attuali.",
    ja: "+3パターンが発動すると、現在の利息分のコインを得る。", ko: "+3 패턴이 발동되면 현재 이자만큼의 코인을 얻는다.", "zh-hans": "+3图案触发时，获得等于当前利息的金币。", "zh-hant": "+3圖案觸發時，獲得等於當前利息的金幣。",
  },
  "charm-cleanse-tag": { en: "Cleanse Tag" },
  "charm-trait-cleanse-tag": { en: "Symbols Multiplier +1", es: "Multiplicador de Símbolos +1", fr: "Multiplicateur de Symboles +1", de: "Symbol-Multiplikator +1", it: "Moltiplicatore Simboli +1", ja: "シンボル倍率+1", ko: "심볼 배율 +1", "zh-hans": "图案倍率+1", "zh-hant": "圖案倍率+1" },
  "cleanse-tag-desc": {
    en: "Symbols Multiplier adds 1 whenever 5 or more Patterns trigger in a pull.", es: "El Multiplicador de Símbolos suma 1 cuando 5 o más Patrones se activan en una tirada.", fr: "Le Multiplicateur de Symboles ajoute 1 chaque fois que 5 Patterns ou plus se déclenchent dans un tirage.", de: "Symbol-Multiplikator erhöht sich um 1, wenn bei einem Zug 5 oder mehr Muster auslösen.", it: "Il Moltiplicatore Simboli aggiunge 1 ogni volta che 5 o più Pattern si attivano in una tirata.",
    ja: "スピンで5つ以上のパターンが成立するたびにシンボル倍率が+1される。", ko: "한 번의 레버에서 패턴이 5개 이상 발동할 때마다 심볼 배율이 +1된다.", "zh-hans": "每当一次拉杆触发5个以上图案时，图案倍率+1。", "zh-hant": "每當一次拉桿觸發5個以上圖案時，圖案倍率+1。",
  },
  "charm-spell-tag": { en: "Spell Tag" },
  "spell-tag-desc": {
    en: "The last pull of each round gets +7 Luck.", es: "La última tirada de cada ronda recibe +7 de suerte.", fr: "Le dernier tirage de chaque manche reçoit +7 de Chance.", de: "Der letzte Zug jeder Runde erhält +7 Glück.", it: "L'ultima tirata di ogni turno riceve +7 Fortuna.",
    ja: "各ラウンドの最後のレバーに運+7。", ko: "각 라운드의 마지막 레버에 행운 +7.", "zh-hans": "每回合的最后一次拉杆获得+7幸运。", "zh-hant": "每回合的最後一次拉桿獲得+7幸運。",
  },
  "charm-golden-lemon": { en: "Shiny Exeggcute" },
  "golden-lemon-desc": {
    en: "Each Exeggcute has a 20% chance to be Shiny — scoring it permanently raises Exeggcute's base value.", es: "Cada Exeggcute tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Noeunoeuf a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jedes Owei ist mit 20% Chance schillernd — es zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Exeggcute ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "タマタマは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "아라리는 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "蛋蛋有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "蛋蛋有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-golden-cherry": { en: "Shiny Cherubi" },
  "golden-cherry-desc": {
    en: "Each Cherubi has a 20% chance to be Shiny — scoring it permanently raises Cherubi's base value.", es: "Cada Cherubi tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Ceribou a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jedes Kikugi ist mit 20% Chance schillernd — es zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Cherubi ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "チェリンボは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "체리버는 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "樱花宝有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "櫻花寶有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-golden-clover": { en: "Shiny Sprigatito" },
  "golden-clover-desc": {
    en: "Each Sprigatito has a 20% chance to be Shiny — scoring it permanently raises Sprigatito's base value.", es: "Cada Sprigatito tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Poussacha a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jedes Felori ist mit 20% Chance schillernd — es zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Sprigatito ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "ニャオハは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "나오하는 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "新叶喵有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "新葉喵有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-golden-bell": { en: "Shiny Chimecho" },
  "golden-bell-desc": {
    en: "Each Chimecho has a 20% chance to be Shiny — scoring it permanently raises Chimecho's base value.", es: "Cada Chimecho tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Éoko a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jedes Palimpalim ist mit 20% Chance schillernd — es zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Chimecho ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "チリーンは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "치렁은 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "风铃铃有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "風鈴鈴有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-golden-diamond": { en: "Shiny Carbink" },
  "golden-diamond-desc": {
    en: "Each Carbink has a 20% chance to be Shiny — scoring it permanently raises Carbink's base value.", es: "Cada Carbink tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Strassie a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jedes Rocara ist mit 20% Chance schillernd — es zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Carbink ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "メレシーは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "멜리시는 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "小碎钻有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "小碎鑽有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-golden-treasure": { en: "Shiny Gholdengo" },
  "golden-treasure-desc": {
    en: "Each Gholdengo has a 20% chance to be Shiny — scoring it permanently raises Gholdengo's base value.", es: "Cada Gholdengo tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Gromago a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jedes Monetigo ist mit 20% Chance schillernd — es zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Gholdengo ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "サーフゴーは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "타부자고는 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "赛富豪有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "賽富豪有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-golden-seven": { en: "Shiny Seviper" },
  "golden-seven-desc": {
    en: "Each Seviper has a 20% chance to be Shiny — scoring it permanently raises Seviper's base value.", es: "Cada Seviper tiene un 20% de probabilidad de ser Variocolor — puntuarlo aumenta permanentemente su valor base.", fr: "Chaque Séviper a 20 % de chance d'être Chromatique — le marquer augmente définitivement sa valeur de base.", de: "Jeder Vipitis ist mit 20% Chance schillernd — ihn zu treffen erhöht seinen Grundwert dauerhaft.", it: "Ogni Seviper ha il 20% di probabilità di essere cromatico — completarlo ne aumenta permanentemente il valore base.",
    ja: "ハブネークは20%の確率で色違いになる——成立させるとその基本価値が永久に上がる。", ko: "세비퍼는 20% 확률로 색이 다른 포켓몬이 된다——당첨시키면 그 기본 가치가 영구히 오른다.", "zh-hans": "饭匙蛇有20%概率变为异色——命中它时其基础价值永久提升。", "zh-hant": "飯匙蛇有20%機率變為異色——命中它時其基礎價值永久提升。",
  },
  "charm-griseous-orb": { en: "Griseous Orb" },
  "griseous-orb-desc": {
    en: "Carbink, Gholdengo and Seviper have a 12% chance to be Chained — scoring them permanently raises that pattern's multiplier.", es: "Carbink, Gholdengo y Seviper tienen un 12% de probabilidad de ser Encadenados — puntuarlos aumenta permanentemente el multiplicador de ese patrón.", fr: "Strassie, Gromago et Séviper ont 12 % de chance d'être Enchaînés — les marquer augmente définitivement le multiplicateur du motif.", de: "Rocara, Monetigo und Vipitis sind mit 12% Chance Verkettet — sie zu treffen erhöht den Multiplikator dieses Musters dauerhaft.", it: "Carbink, Gholdengo e Seviper hanno il 12% di probabilità di essere Incatenati — completarli aumenta permanentemente il moltiplicatore di quella combinazione.",
    ja: "メレシー・サーフゴー・ハブネークは12%の確率でチェーンになる——成立させるとそのパターンの倍率が永久に上がる。", ko: "멜리시·타부자고·세비퍼는 12% 확률로 체인이 된다——당첨시키면 그 패턴의 배율이 영구히 오른다.", "zh-hans": "小碎钻、赛富豪、饭匙蛇有12%概率变为连锁——命中它们时该牌型倍率永久提升。", "zh-hant": "小碎鑽、賽富豪、飯匙蛇有12%機率變為連鎖——命中它們時該牌型倍率永久提升。",
  },

  // Second wave of charms — Focus Sash, Lagging Tail, Arceus Statue, Black
  // Sludge, Metronome, Heal Powder, Zoom Lens, Guidebook, Star Piece, Odd
  // Keystone, Bright Powder, Deep Sea Tooth, Point Card, Parcel.
  "charm-focus-sash": { en: "Focus Sash" },
  "focus-sash-desc": {
    en: "When you are about to die, grants 2 extra rounds to pay the quota, then discards itself.", es: "Cuando estés a punto de morir, otorga 2 rondas extra para pagar la cuota y luego se descarta.", fr: "Quand vous êtes sur le point de mourir, offre 2 manches de plus pour payer la quote-part, puis se jette.", de: "Wenn du kurz vor dem Aus stehst, gewährt er 2 Extra-Runden zum Zahlen der Rate und wird dann abgelegt.", it: "Quando stai per perdere, concede 2 turni extra per pagare la rata, poi si scarta.",
    ja: "倒れる寸前に、分割払いのための追加2ラウンドを与えてから捨てられる。", ko: "쓰러지기 직전에 분할금을 낼 수 있도록 2라운드를 추가로 얻은 뒤 버려진다.", "zh-hans": "濒死时额外获得2个回合支付配额，随后被丢弃。", "zh-hant": "瀕死時額外獲得2個回合支付配額，隨後被丟棄。",
  },
  "charm-lagging-tail": { en: "Lagging Tail" },
  "lagging-tail-desc": {
    en: "Charms with 'Triggers Randomly' activate twice as often.", es: "Los amuletos con 'Se activa al azar' se activan el doble de veces.", fr: "Les charmes avec « Déclenchement aléatoire » s'activent deux fois plus souvent.", de: "Amulette mit „Löst zufällig aus“ aktivieren sich doppelt so oft.", it: "Gli amuleti con 'Si attiva a caso' si attivano il doppio delle volte.",
    ja: "「ランダム発動」を持つお守りの発動率が2倍になる。", ko: "'무작위 발동' 특성을 가진 아이템이 두 배로 자주 발동한다.", "zh-hans": "带有「随机触发」的护符触发频率翻倍。", "zh-hant": "帶有「隨機觸發」的護符觸發頻率翻倍。",
  },
  "charm-arceus-statue": { en: "Arceus Statue" },
  "arceus-statue-desc": {
    en: "Grants a guaranteed JACKPOT on your next pull, then discards itself.", es: "Garantiza un JACKPOT en tu próxima tirada y luego se descarta.", fr: "Garantit un JACKPOT au prochain tirage, puis se jette.", de: "Garantiert einen JACKPOT beim nächsten Zug und wird dann abgelegt.", it: "Garantisce un JACKPOT alla prossima tirata, poi si scarta.",
    ja: "次のレバーでジャックポットを保証し、その後捨てられる。", ko: "다음 레버에서 잭팟을 보장한 뒤 버려진다.", "zh-hans": "下一次拉杆保底头奖，随后被丢弃。", "zh-hant": "下一次拉桿保底頭獎，隨後被丟棄。",
  },
  "charm-black-sludge": { en: "Black Sludge" },
  "black-sludge-desc": {
    en: "Whenever a charm is discarded (sold or consumed), every symbol permanently gains its own base value.", es: "Cuando se descarta un amuleto (vendido o consumido), cada símbolo gana permanentemente su propio valor base.", fr: "Quand un charme est jeté (vendu ou consommé), chaque symbole gagne définitivement sa propre valeur de base.", de: "Wann immer ein Amulett abgelegt wird (verkauft oder verbraucht), gewinnt jedes Symbol dauerhaft seinen eigenen Grundwert.", it: "Quando un amuleto viene scartato (venduto o consumato), ogni simbolo guadagna permanentemente il proprio valore base.",
    ja: "お守りが捨てられるたび（売却・消費）、すべてのシンボルがその基本価値分だけ永続的に上がる。", ko: "아이템이 버려질 때마다(판매 또는 소모) 모든 심볼이 영구히 자신의 기본 가치만큼 오른다.", "zh-hans": "每当护符被丢弃（出售或消耗）时，所有图案永久获得其基础价值加成。", "zh-hant": "每當護符被丟棄（出售或消耗）時，所有圖案永久獲得其基礎價值加成。",
  },
  "charm-metronome": { en: "Metronome" },
  "metronome-desc": {
    en: "If the last 2 pulls had no patterns, the next pull gets Luck +5. +2 extra Luck for each consecutive activation after the first.", es: "Si las últimas 2 tiradas no tuvieron patrones, la siguiente recibe Suerte +5. +2 de Suerte extra por cada activación consecutiva tras la primera.", fr: "Si les 2 derniers tirages n'ont eu aucun motif, le suivant reçoit Chance +5. +2 de Chance par activation consécutive après la première.", de: "Hatten die letzten 2 Züge keine Muster, erhält der nächste +5 Glück. +2 extra Glück pro aufeinanderfolgender Auslösung nach der ersten.", it: "Se le ultime 2 tirate non hanno avuto combinazioni, la prossima riceve Fortuna +5. +2 Fortuna extra per ogni attivazione consecutiva dopo la prima.",
    ja: "直近2回のレバーでパターンが成立しなかった場合、次のレバーに運+5。初回以降、連続発動ごとにさらに運+2。", ko: "최근 2회 레버에서 패턴이 없었다면 다음 레버에 행운 +5. 첫 발동 이후 연속 발동마다 행운 +2 추가.", "zh-hans": "若最近2次拉杆未触发图案，下一次拉杆获得幸运+5。首次之后每连续触发一次额外+2幸运。", "zh-hant": "若最近2次拉桿未觸發圖案，下一次拉桿獲得幸運+5。首次之後每連續觸發一次額外+2幸運。",
  },
  "charm-heal-powder": { en: "Heal Powder" },
  "heal-powder-desc": {
    en: "If only 1 pattern triggers on a pull, its symbols transform into the most valued symbol.", es: "Si solo 1 patrón acierta en una tirada, sus símbolos se transforman en el símbolo de mayor valor.", fr: "Si un seul motif tombe sur un tirage, ses symboles se transforment en le symbole le plus précieux.", de: "Löst bei einem Zug nur 1 Muster aus, verwandeln sich seine Symbole in das wertvollste Symbol.", it: "Se solo 1 combinazione esce in una tirata, i suoi simboli si trasformano nel simbolo di maggior valore.",
    ja: "1回のレバーでパターンが1つだけ成立した場合、そのシンボルが最も価値の高いシンボルに変化する。", ko: "한 번의 레버에서 패턴이 1개만 당첨되면 그 심볼들이 가장 가치 높은 심볼로 변한다.", "zh-hans": "若一次拉杆只触发1个牌型，其图案将变为价值最高的图案。", "zh-hant": "若一次拉桿只觸發1個牌型，其圖案將變為價值最高的圖案。",
  },
  "charm-zoom-lens": { en: "Zoom Lens" },
  "zoom-lens-desc": {
    en: "Pattern multipliers +1 for every 15 tickets you own.", es: "Los multiplicadores de patrón reciben +1 por cada 15 tickets que tengas.", fr: "Multiplicateurs de motifs +1 pour chaque tranche de 15 tickets possédés.", de: "Muster-Multiplikatoren +1 für je 15 eigene Tickets.", it: "Moltiplicatori delle combinazioni +1 ogni 15 biglietti posseduti.",
    ja: "所持チケット15枚ごとにパターンの倍率+1。", ko: "보유한 티켓 15장마다 패턴 배율 +1.", "zh-hans": "每拥有15张票，牌型倍率+1。", "zh-hant": "每擁有15張票，牌型倍率+1。",
  },
  "charm-guidebook": { en: "Guidebook" },
  "guidebook-desc": {
    en: "Whenever you finish a quota, the Symbols Multiplier rises by 1 per skipped round, plus 1.", es: "Cuando termines una cuota, el Multiplicador de Símbolos sube 1 por cada ronda saltada, más 1.", fr: "Quand une quote-part est terminée, le Multiplicateur de Symboles monte de 1 par manche sautée, plus 1.", de: "Beim Erfüllen einer Rate steigt der Symbol-Multiplikator um 1 pro übersprungener Runde, plus 1.", it: "Quando completi una rata, il Moltiplicatore Simboli sale di 1 per ogni turno saltato, più 1.",
    ja: "分割払いを完了するたび、スキップしたラウンド1つにつき+1、さらに+1だけシンボル倍率が上がる。", ko: "분할금을 완료할 때마다 건너뛴 라운드당 1씩, 추가로 1만큼 심볼 배율이 오른다.", "zh-hans": "每完成一次配额，图案倍率按跳过的回合数每回合+1，并额外+1。", "zh-hant": "每完成一次配額，圖案倍率按跳過的回合數每回合+1，並額外+1。",
  },
  "charm-star-piece": { en: "Star Piece" },
  "star-piece-desc": {
    en: "If the last pull triggered no pattern, the next pull lands a HOR-XL on the center row.", es: "Si la última tirada no activó ningún patrón, la siguiente logra un HOR-XL en la fila central.", fr: "Si le dernier tirage n'a déclenché aucun motif, le suivant place un HOR-XL sur la rangée centrale.", de: "Löste der letzte Zug kein Muster aus, landet der nächste ein HOR-XL in der mittleren Reihe.", it: "Se l'ultima tirata non ha attivato combinazioni, la prossima ottiene un HOR-XL nella riga centrale.",
    ja: "前のレバーでパターンが成立しなかった場合、次のレバーで中央行にHOR-XLが成立する。", ko: "이전 레버에서 패턴이 없었다면 다음 레버에서 중앙 행에 HOR-XL이 완성된다.", "zh-hans": "若上一次拉杆未触发图案，下一次拉杆将在中间行达成HOR-XL。", "zh-hant": "若上一次拉桿未觸發圖案，下一次拉桿將在中間行達成HOR-XL。",
  },
  "charm-odd-keystone": { en: "Odd Keystone" },
  "odd-keystone-desc": {
    en: "Patterns trigger one extra time for this pull.", es: "Los patrones se activan una vez más en esta tirada.", fr: "Les motifs se déclenchent une fois de plus sur ce tirage.", de: "Muster lösen bei diesem Zug einmal zusätzlich aus.", it: "Le combinazioni si attivano una volta in più in questa tirata.",
    ja: "このレバーでパターンがもう1回成立する。", ko: "이번 레버에서 패턴이 한 번 더 당첨된다.", "zh-hans": "本次拉杆的图案额外触发一次。", "zh-hant": "本次拉桿的圖案額外觸發一次。",
  },
  "charm-bright-powder": { en: "Bright Powder" },
  "bright-powder-desc": {
    en: "Whenever 5 charms trigger during a round, the next pull gets Luck +7.", es: "Cuando 5 amuletos se activan durante una ronda, la siguiente tirada recibe Suerte +7.", fr: "Quand 5 charmes se déclenchent durant une manche, le tirage suivant reçoit Chance +7.", de: "Wenn sich in einer Runde 5 Amulette auslösen, erhält der nächste Zug +7 Glück.", it: "Quando 5 amuleti si attivano durante un turno, la prossima tirata riceve Fortuna +7.",
    ja: "1ラウンド中にお守りが5回発動するたび、次のレバーに運+7。", ko: "한 라운드 동안 아이템이 5번 발동하면 다음 레버에 행운 +7.", "zh-hans": "一回合内触发5次护符效果时，下一次拉杆获得幸运+7。", "zh-hant": "一回合內觸發5次護符效果時，下一次拉桿獲得幸運+7。",
  },
  "charm-deep-sea-tooth": { en: "Deep Sea Tooth" },
  "deep-sea-tooth-desc": {
    en: "If no +5 Pattern triggered in the last 3 pulls, the next pull triggers an ABOVE or BELOW.", es: "Si ningún Patrón +5 se activó en las últimas 3 tiradas, la siguiente logra un ABOVE o BELOW.", fr: "Si aucun +5 Pattern ne s'est déclenché sur les 3 derniers tirages, le suivant place un ABOVE ou BELOW.", de: "Wenn in den letzten 3 Zügen kein +5 Pattern auslöste, landet der nächste ein ABOVE oder BELOW.", it: "Se nessun +5 Pattern si è attivato nelle ultime 3 tirate, la prossima ottiene un ABOVE o BELOW.",
    ja: "直近3回のレバーで+5パターンが発動しなかった場合、次のレバーでABOVEかBELOWが発動する。", ko: "최근 3회 레버에서 +5 패턴이 발동하지 않았다면 다음 레버에서 ABOVE 또는 BELOW가 발동한다.", "zh-hans": "若最近3次拉杆未触发+5图案，下一次拉杆将达成ABOVE或BELOW。", "zh-hant": "若最近3次拉桿未觸發+5圖案，下一次拉桿將達成ABOVE或BELOW。",
  },
  "charm-point-card": { en: "Point Card" },
  "point-card-desc": {
    en: "Symbols Multiplier +1 for every reroll performed at the shop during the run.", es: "El Multiplicador de Símbolos recibe +1 por cada reroll realizado en la tienda durante la partida.", fr: "Multiplicateur de Symboles +1 pour chaque relance de la boutique durant la partie.", de: "Symbol-Multiplikator +1 für jeden Reroll im Shop während des Laufs.", it: "Moltiplicatore Simboli +1 per ogni reroll fatto nel negozio durante la run.",
    ja: "このラン中にショップで行ったリロール1回ごとにシンボル倍率+1。", ko: "이번 런 동안 상점에서 리롤할 때마다 심볼 배율 +1.", "zh-hans": "本局中每次在商店重掷，图案倍率+1。", "zh-hant": "本局中每次在商店重擲，圖案倍率+1。",
  },
  "charm-parcel": { en: "Parcel" },
  "parcel-desc": {
    en: "On pulls with no patterns, every symbol permanently gains its own base value.", es: "En tiradas sin patrones, cada símbolo gana permanentemente su propio valor base.", fr: "Sur les tirages sans motif, chaque symbole gagne définitivement sa propre valeur de base.", de: "Bei Zügen ohne Muster gewinnt jedes Symbol dauerhaft seinen eigenen Grundwert.", it: "Nelle tirate senza combinazioni, ogni simbolo guadagna permanentemente il proprio valore base.",
    ja: "パターンなしのレバー限定：すべてのシンボルがその基本価値分だけ永続的に上がる。", ko: "패턴 없는 레버 한정: 모든 심볼이 영구히 자신의 기본 가치만큼 오른다.", "zh-hans": "仅限无图案的拉杆：所有图案永久获得其基础价值加成。", "zh-hant": "僅限無圖案的拉桿：所有圖案永久獲得其基礎價值加成。",
  },
  "charm-poffin-case": { en: "Poffin Case" },
  "poffin-case-desc": {
    en: "Does not take tray space. Adds +1 charm slot. Offered only once per run.", es: "No ocupa espacio. Añade +1 hueco de amuleto. Solo se ofrece una vez por partida.", fr: "Ne prend pas de place. Ajoute +1 emplacement de charme. Proposé une seule fois par partie.", de: "Belegt keinen Platz. Gibt +1 Amulett-Platz. Nur einmal pro Lauf angeboten.", it: "Non occupa spazio. Aggiunge +1 spazio amuleto. Offerto una sola volta per run.",
    ja: "トレー枠を使わない。お守り枠+1。1ランにつき1回だけ出現する。", ko: "트레이 공간을 쓰지 않는다. 부적 칸 +1. 런당 한 번만 등장한다.", "zh-hans": "不占用托盘。护符栏+1。每局仅出现一次。", "zh-hant": "不佔用托盤。護符欄+1。每局僅出現一次。",
  },
  "charm-douse-drive": { en: "Douse Drive" },
  "douse-drive-desc": {
    en: "Every 7 pulls, all patterns trigger one extra time.", es: "Cada 7 tiradas, todos los patrones se activan una vez más.", fr: "Tous les 7 tirages, tous les motifs se déclenchent une fois de plus.", de: "Alle 7 Züge lösen alle Muster einmal zusätzlich aus.", it: "Ogni 7 tirate, tutte le combinazioni si attivano una volta in più.",
    ja: "7回ごとに、すべてのパターンがもう1回成立する。", ko: "7회마다 모든 패턴이 한 번 더 당첨된다.", "zh-hans": "每7次拉杆，所有牌型额外触发一次。", "zh-hant": "每7次拉桿，所有牌型額外觸發一次。",
  },
  "charm-shock-drive": { en: "Shock Drive" },
  "shock-drive-desc": {
    en: "Every 7 pulls, grants Luck +7 for that pull.", es: "Cada 7 tiradas, otorga Suerte +7 en esa tirada.", fr: "Tous les 7 tirages, donne Chance +7 sur ce tirage.", de: "Alle 7 Züge gibt es +7 Glück für diesen Zug.", it: "Ogni 7 tirate, dà Fortuna +7 in quella tirata.",
    ja: "7回ごとに、そのレバーに運+7。", ko: "7회마다 그 레버에 행운 +7.", "zh-hans": "每7次拉杆，该次拉杆获得幸运+7。", "zh-hant": "每7次拉桿，該次拉桿獲得幸運+7。",
  },
  "charm-burn-drive": { en: "Burn Drive" },
  "burn-drive-desc": {
    en: "Every 7 pulls, ZIG and ZAG are guaranteed to appear.", es: "Cada 7 tiradas, ZIG y ZAG están garantizados.", fr: "Tous les 7 tirages, ZIG et ZAG sont garantis.", de: "Alle 7 Züge sind ZIG und ZAG garantiert.", it: "Ogni 7 tirate, ZIG e ZAG sono garantiti.",
    ja: "7回ごとにZIGとZAGの成立が保証される。", ko: "7회마다 ZIG와 ZAG이 보장으로 등장한다.", "zh-hans": "每7次拉杆，必定出现ZIG与ZAG。", "zh-hant": "每7次拉桿，必定出現ZIG與ZAG。",
  },
  "charm-chill-drive": { en: "Chill Drive" },
  "chill-drive-desc": {
    en: "+2 pulls on every bought round.", es: "+2 tiradas en cada ronda comprada.", fr: "+2 tirages à chaque manche achetée.", de: "+2 Züge pro gekaufter Runde.", it: "+2 tirate per ogni turno acquistato.",
    ja: "購入したラウンドは毎回レバー+2回になる。", ko: "구매한 라운드마다 레버 +2회.", "zh-hans": "每次购买的回合额外+2次拉杆。", "zh-hant": "每次購買的回合額外+2次拉桿。",
  },
  "charm-choice-scarf": { en: "Choice Scarf" },
  "choice-scarf-desc": {
    en: "If the previous 3 pulls had no patterns, every symbol permanently gains its base value.", es: "Si las 3 tiradas anteriores no tuvieron patrones, cada símbolo gana permanentemente su valor base.", fr: "Si les 3 derniers tirages n'ont eu aucun motif, chaque symbole gagne définitivement sa valeur de base.", de: "Hatten die letzten 3 Züge keine Muster, gewinnt jedes Symbol dauerhaft seinen Grundwert.", it: "Se le ultime 3 tirate non hanno avuto combinazioni, ogni simbolo guadagna permanentemente il suo valore base.",
    ja: "直近3回でパターンが一度も成立しなかった場合、すべてのシンボルの価値が基本価値ぶん永続的に上がる。", ko: "최근 3회 레버에서 패턴이 없었다면 모든 심볼의 가치가 기본 가치만큼 영구히 오른다.", "zh-hans": "若之前3次拉杆均未触发图案，所有图案永久提升其基础价值。", "zh-hant": "若之前3次拉桿均未觸發圖案，所有圖案永久提升其基礎價值。",
  },
  "charm-modest-mint": { en: "Modest Mint" },
  "modest-mint-desc": {
    en: "At the end of every quota, gain 1 ticket for every X tickets held, where X is the quota number.", es: "Al final de cada cuota, ganas 1 ticket por cada X tickets que tengas, donde X es el número de cuota.", fr: "À la fin de chaque quote-part, gagnez 1 ticket pour X tickets possédés, où X est le numéro de la quote-part.", de: "Am Ende jeder Rate erhältst du 1 Ticket pro X Tickets im Besitz, wobei X die Raten-Nummer ist.", it: "Alla fine di ogni rata, ottieni 1 biglietto ogni X biglietti posseduti, dove X è il numero della rata.",
    ja: "分割払い完了ごとに、所持チケットX枚につきチケット+1（Xはその分割払いの番号）。", ko: "분할금 완료 시마다 보유한 티켓 X장당 티켓 +1(X는 그 분할금의 번호).", "zh-hans": "每完成一次配额，每拥有X张票就获得1张票，X为当次配额编号。", "zh-hant": "每完成一次配額，每擁有X張票就獲得1張票，X為當次配額編號。",
  },
  "charm-bold-mint": { en: "Bold Mint" },
  "bold-mint-desc": {
    en: "Symbols Multiplier +1 level per 5 tickets held.", es: "+1 nivel de Multiplicador de símbolos por cada 5 tickets en mano.", fr: "Multiplicateur de symboles +1 niveau pour 5 tickets possédés.", de: "Symbol-Multiplikator +1 Stufe pro 5 Tickets im Besitz.", it: "Moltiplicatore simboli +1 livello ogni 5 biglietti posseduti.",
    ja: "所持チケット5枚ごとにシンボル倍率レベル+1。", ko: "보유한 티켓 5장마다 심볼 배율 레벨 +1.", "zh-hans": "每拥有5张票，图案倍率等级+1。", "zh-hant": "每擁有5張票，圖案倍率等級+1。",
  },
  "charm-adamant-mint": { en: "Adamant Mint" },
  "adamant-mint-desc": {
    en: "On every pull, for each pattern beyond the 2nd, every symbol gains its base value. Resets at round end.", es: "En cada tirada, por cada patrón después del 2º, cada símbolo gana su valor base. Se reinicia al final de la ronda.", fr: "À chaque tirage, pour chaque motif au-delà du 2e, chaque symbole gagne sa valeur de base. Se réinitialise en fin de manche.", de: "Bei jedem Zug gewinnt pro Muster jenseits des 2. jedes Symbol seinen Grundwert. Wird am Rundenende zurückgesetzt.", it: "A ogni tirata, per ogni combinazione oltre la 2ª, ogni simbolo guadagna il suo valore base. Si azzera a fine turno.",
    ja: "レバーごとに、2つ目を超えたパターン1つにつき全シンボルが基本価値ぶん上がる。ラウンド終了時にリセット。", ko: "레버마다 2번째를 넘는 패턴 1개당 모든 심볼이 기본 가치만큼 오른다. 라운드 종료 시 리셋.", "zh-hans": "每次拉杆，超出第2个后的每个牌型都会使所有图案获得其基础价值。回合结束时重置。", "zh-hant": "每次拉桿，超出第2個後的每個牌型都會使所有圖案獲得其基礎價值。回合結束時重置。",
  },
  "charm-sassy-mint": { en: "Sassy Mint" },
  "sassy-mint-desc": {
    en: "Whenever 5+ patterns trigger in a pull, double the value of all symbols until round end.", es: "Cuando 5+ patrones aciertan en una tirada, duplica el valor de todos los símbolos hasta el final de la ronda.", fr: "Quand 5 motifs ou plus tombent sur un tirage, double la valeur de tous les symboles jusqu'à la fin de la manche.", de: "Wenn bei einem Zug 5 oder mehr Muster auslösen, verdoppelt sich der Wert aller Symbole bis zum Rundenende.", it: "Quando 5 o più combinazioni escono in una tirata, raddoppia il valore di tutti i simboli fino a fine turno.",
    ja: "1回のレバーで5つ以上のパターンが成立すると、ラウンド終了まで全シンボルの価値が2倍になる。", ko: "한 번의 레버에서 5개 이상 패턴이 당첨되면 라운드가 끝날 때까지 모든 심볼의 가치가 두 배가 된다.", "zh-hans": "一次拉杆触发5个以上牌型时，所有图案价值翻倍直到回合结束。", "zh-hant": "一次拉桿觸發5個以上牌型時，所有圖案價值加倍直到回合結束。",
  },
  "charm-electric-seed": { en: "Electric Seed" },
  "electric-seed-desc": {
    en: "Whenever a +4 Pattern lands, every pattern gains its base multiplier until round end.", es: "Cuando cae un Patrón +4, cada patrón gana su multiplicador base hasta el final de la ronda.", fr: "Quand un Motif +4 tombe, chaque motif gagne son multiplicateur de base jusqu'à la fin de la manche.", de: "Wenn ein +4-Muster landet, gewinnt jedes Muster seinen Grund-Multiplikator bis zum Rundenende.", it: "Quando cade una Combinazione +4, ogni combinazione guadagna il suo moltiplicatore base fino a fine turno.",
    ja: "+4パターンが成立するたび、ラウンド終了まで全パターンの倍率が基本倍率ぶん上がる。", ko: "+4 패턴이 당첨될 때마다 라운드가 끝날 때까지 모든 패턴의 배율이 기본 배율만큼 오른다.", "zh-hans": "每当打出+4图案，所有牌型获得其基础倍率直到回合结束。", "zh-hant": "每當打出+4圖案，所有牌型獲得其基礎倍率直到回合結束。",
  },
  "charm-psychic-seed": { en: "Psychic Seed" },
  "psychic-seed-desc": {
    en: "Whenever a +5 Pattern triggers, double the multiplier of every pattern until round end.", es: "Cuando se activa un Patrón +5, duplica el multiplicador de todos los patrones hasta el final de la ronda.", fr: "Quand un Motif +5 se déclenche, double le multiplicateur de tous les motifs jusqu'à la fin de la manche.", de: "Wenn ein +5-Muster auslöst, verdoppelt sich der Multiplikator aller Muster bis zum Rundenende.", it: "Quando si attiva una Combinazione +5, raddoppia il moltiplicatore di tutte le combinazioni fino a fine turno.",
    ja: "+5パターンが発動するたび、ラウンド終了まで全パターンの倍率が2倍になる。", ko: "+5 패턴이 발동될 때마다 라운드가 끝날 때까지 모든 패턴의 배율이 두 배가 된다.", "zh-hans": "每当+5图案触发，所有牌型倍率翻倍直到回合结束。", "zh-hant": "每當+5圖案觸發，所有牌型倍率加倍直到回合結束。",
  },
  "charm-misty-seed": { en: "Misty Seed" },
  "misty-seed-desc": {
    en: "When EYE lands alone, double the multiplier of every pattern permanently.", es: "Cuando EYE cae solo, duplica permanentemente el multiplicador de todos los patrones.", fr: "Quand EYE tombe seul, double définitivement le multiplicateur de tous les motifs.", de: "Wenn EYE allein landet, verdoppelt sich der Multiplikator aller Muster dauerhaft.", it: "Quando EYE esce da solo, raddoppia permanentemente il moltiplicatore di tutte le combinazioni.",
    ja: "EYEが単独で成立すると、全パターンの倍率が永続的に2倍になる。", ko: "EYE가 단독으로 당첨되면 모든 패턴의 배율이 영구히 두 배가 된다.", "zh-hans": "当EYE单独触发时，所有牌型倍率永久翻倍。", "zh-hant": "當EYE單獨觸發時，所有牌型倍率永久加倍。",
  },
  "charm-grassy-seed": { en: "Grassy Seed" },
  "grassy-seed-desc": {
    en: "At the end of every quota, +1 to Symbols or Patterns Multiplier, alternating.", es: "Al final de cada cuota, +1 al Multiplicador de Símbolos o de Patrones, alternando.", fr: "À la fin de chaque quote-part, +1 au Multiplicateur de Symboles ou de Motifs, en alternance.", de: "Am Ende jeder Rate +1 auf Symbol- oder Muster-Multiplikator, abwechselnd.", it: "Alla fine di ogni rata, +1 al Moltiplicatore Simboli o Combinazioni, alternando.",
    ja: "分割払い完了ごとに、シンボル倍率とパターン倍率に交互に+1。", ko: "분할금 완료 시마다 심볼 배율과 패턴 배율에 번갈아 +1.", "zh-hans": "每完成一次配额，图案倍率与牌型倍率交替+1。", "zh-hant": "每完成一次配額，圖案倍率與牌型倍率交替+1。",
  },
  "charm-leftovers": { en: "Leftovers" },
  "leftovers-desc": {
    en: "Exeggcute and Cherubi patterns trigger one extra time. Discards itself after 10 rounds.", es: "Los patrones de Exeggcute y Cherubi se activan una vez más. Se descarta tras 10 rondas.", fr: "Les motifs Noeunoeuf et Ceribou se déclenchent une fois de plus. Se jette après 10 manches.", de: "Owei- und Kikugi-Muster lösen einmal zusätzlich aus. Legt sich nach 10 Runden ab.", it: "Le combinazioni di Exeggcute e Cherubi si attivano una volta in più. Si scarta dopo 10 turni.",
    ja: "タマタマとチェリンボのパターンがもう1回成立する。10ラウンド後に捨てられる。", ko: "아라리와 체리버 패턴이 한 번 더 당첨된다. 10라운드 뒤 버려진다.", "zh-hans": "蛋蛋与樱花宝的牌型额外触发一次。10回合后自行丢弃。", "zh-hant": "蛋蛋與櫻花寶的牌型額外觸發一次。10回合後自行丟棄。",
  },
  "charm-poison-barb": { en: "Poison Barb" },
  "poison-barb-desc": {
    en: "If you see 7 Sevipers on a pull, they all turn into Shiny Sevipers.", es: "Si ves 7 Seviper en una tirada, todos se vuelven Seviper variocolor.", fr: "Si tu vois 7 Séviper sur un tirage, ils deviennent tous des Séviper chromatiques.", de: "Wenn du bei einem Zug 7 Vipitis siehst, werden sie alle zu schillernden Vipitis.", it: "Se vedi 7 Seviper in una tirata, diventano tutti Seviper cromatici.",
    ja: "1回のレバーでハブネークが7体出ると、すべてが色違いになる。", ko: "한 번의 레버에서 세비퍼가 7마리 나오면 모두 색이 다른 포켓몬이 된다.", "zh-hans": "一次拉杆出现7只饭匙蛇时，全部变为异色饭匙蛇。", "zh-hant": "一次拉桿出現7隻飯匙蛇時，全部變為異色飯匙蛇。",
  },
  "charm-twisted-spoon": { en: "Twisted Spoon" },
  "twisted-spoon-desc": {
    en: "When only one pattern of Carbink or Gholdengo triggers, it triggers 2 more times; the last pays double.", es: "Cuando solo un patrón de Carbink o Gholdengo acierta, se activa 2 veces más; la última paga el doble.", fr: "Quand un seul motif Strassie ou Gromago tombe, il se déclenche 2 fois de plus ; le dernier paie le double.", de: "Wenn nur ein Rocara- oder Monetigo-Muster auslöst, löst es 2-mal zusätzlich aus; das letzte zahlt doppelt.", it: "Quando solo una combinazione di Carbink o Gholdengo esce, si attiva altre 2 volte; l'ultima paga il doppio.",
    ja: "メレシーかサーフゴーのパターンが1つだけ成立したとき、さらに2回成立する。最後の1回は配当が2倍になる。", ko: "멜리시 또는 타부자고 패턴이 1개만 당첨되면 2번 더 당첨되며 마지막은 두 배를 지불한다.", "zh-hans": "当小碎钻或赛富豪的单个牌型触发时，额外再触发2次，最后一次派彩翻倍。", "zh-hant": "當小碎鑽或賽富豪的單個牌型觸發時，額外再觸發2次，最後一次派彩加倍。",
  },
  "charm-red-scarf": { en: "Red Scarf" },
  "red-scarf-desc": {
    en: "Luck +5 for this pull. Discards after 12 activations.", es: "Suerte +5 en esta tirada. Se descarta tras 12 activaciones.", fr: "Chance +5 sur ce tirage. Se jette après 12 activations.", de: "+5 Glück für diesen Zug. Legt sich nach 12 Auslösungen ab.", it: "Fortuna +5 in questa tirata. Si scarta dopo 12 attivazioni.",
    ja: "このレバーに運+5。12回発動で捨てられる。", ko: "이번 레버에 행운 +5. 12번 발동 뒤 버려진다.", "zh-hans": "本次拉杆幸运+5。触发12次后丢弃。", "zh-hant": "本次拉桿幸運+5。觸發12次後丟棄。",
  },
  "charm-blue-scarf": { en: "Blue Scarf" },
  "blue-scarf-desc": {
    en: "Luck +7 for this pull. Discards after 9 activations.", es: "Suerte +7 en esta tirada. Se descarta tras 9 activaciones.", fr: "Chance +7 sur ce tirage. Se jette après 9 activations.", de: "+7 Glück für diesen Zug. Legt sich nach 9 Auslösungen ab.", it: "Fortuna +7 in questa tirata. Si scarta dopo 9 attivazioni.",
    ja: "このレバーに運+7。9回発動で捨てられる。", ko: "이번 레버에 행운 +7. 9번 발동 뒤 버려진다.", "zh-hans": "本次拉杆幸运+7。触发9次后丢弃。", "zh-hant": "本次拉桿幸運+7。觸發9次後丟棄。",
  },
  "charm-pink-scarf": { en: "Pink Scarf" },
  "pink-scarf-desc": {
    en: "Luck +0 for this pull. Grows +2 per reroll this quota, until the quota ends.", es: "Suerte +0 en esta tirada. Crece +2 por reroll en esta cuota, hasta que termine.", fr: "Chance +0 sur ce tirage. Gagne +2 par relance de cette quote-part, jusqu'à sa fin.", de: "+0 Glück für diesen Zug. Wächst +2 pro Reroll dieser Rate, bis sie endet.", it: "Fortuna +0 in questa tirata. Cresce +2 per ogni reroll di questa rata, fino alla sua fine.",
    ja: "このレバーに運+0。この分割払い中のリロール1回ごとに+2、分割払い終了まで。", ko: "이번 레버에 행운 +0. 이 분할금 중 리롤 1회당 +2, 분할금이 끝날 때까지.", "zh-hans": "本次拉杆幸运+0。本配额内每次重掷+2，直到配额结束。", "zh-hant": "本次拉桿幸運+0。本配額內每次重擲+2，直到配額結束。",
  },
  "charm-green-scarf": { en: "Green Scarf" },
  "green-scarf-desc": {
    en: "Grants Luck equal to the bonus. When it fires, each +3 Pattern scored increases the bonus +3 until the end of the Quota.", es: "Otorga Suerte igual al bono. Cuando se activa, cada Patrón +3 anotado aumenta el bono +3 hasta el final de la cuota.", fr: "Accorde une Chance égale au bonus. Quand il se déclenche, chaque Motif +3 marqué augmente le bonus de +3 jusqu'à la fin de la quote-part.", de: "Verleiht Glück gleich dem Bonus. Wenn er auslöst, erhöht jedes erzielte +3-Muster den Bonus um +3 bis zum Ende der Rate.", it: "Concede Fortuna pari al bonus. Quando si attiva, ogni Combinazione +3 segnata aumenta il bonus di +3 fino a fine rata.",
    ja: "ボーナス分の運を付与。発動時、成立した+3パターン1つにつき分割払い終了までボーナス+3。", ko: "보너스만큼 행운을 부여. 발동 시 당첨된 +3 패턴 1개당 분할금 종료까지 보너스 +3.", "zh-hans": "赋予等同于加成的幸运。触发时，每命中一个+3图案，加成+3直到配额结束。", "zh-hant": "賦予等同於加成的幸運。觸發時，每命中一個+3圖案，加成+3直到配額結束。",
  },
  "charm-yellow-scarf": { en: "Yellow Scarf" },
  "yellow-scarf-desc": {
    en: "Luck +0 for this pull. Grows +4 per round skipped on the previous quota, until the quota ends.", es: "Suerte +0 en esta tirada. Crece +4 por ronda saltada en la cuota anterior, hasta que termine la cuota.", fr: "Chance +0 sur ce tirage. Grandit de +4 par manche sautée sur la quote-part précédente, jusqu'à la fin de la quote-part.", de: "+0 Glück für diesen Zug. Wächst +4 pro übersprungener Runde der vorherigen Rate, bis diese Rate endet.", it: "Fortuna +0 in questa tirata. Cresce +4 per ogni turno saltato nella rata precedente, fino a fine rata.",
    ja: "このレバーに運+0。前の分割払いでスキップしたラウンド1つにつき+4、分割払い終了まで。", ko: "이번 레버에 행운 +0. 이전 분할금에서 건너뛴 라운드 1개당 +4, 분할금이 끝날 때까지.", "zh-hans": "本次拉杆幸运+0。上次配额每跳过一回合+4，直到配额结束。", "zh-hant": "本次拉桿幸運+0。上次配額每跳過一回合+4，直到配額結束。",
  },
  "charm-dragon-fang": { en: "Dragon Fang" },
  "dragon-fang-desc": {
    en: "Whenever a Giratina appears on the grid, +10 Luck on the next spin of the same round.", es: "Cuando aparece un Giratina en la cuadrícula, +10 Suerte en la siguiente tirada de la misma ronda.", fr: "Quand un Giratina apparaît sur la grille, +10 Chance sur le prochain tirage de la même manche.", de: "Erscheint Giratina auf dem Spielfeld, +10 Glück beim nächsten Zug derselben Runde.", it: "Quando Giratina apparece sulla griglia, +10 Fortuna nella prossima tirata dello stesso turno.",
    ja: "フィールドにギラティナが出现した時、同じラウンドの次のレバーに運+10。", ko: "그리드에 기라티나가 나타나면 같은 라운드의 다음 레버에 행운 +10.", "zh-hans": "网格上出现骑拉帝纳时，本回合下一次拉杆幸运+10。", "zh-hant": "網格上出現騎拉帝納時，本回合下一次拉桿幸運+10。",
  },
  "charm-red-card": { en: "Red Card" },
  "red-card-desc": {
    en: "If a Giratina pattern is going to trigger, transform it into normal symbols. Then 50% chance of discarding itself.", es: "Si un patrón Giratina va a activarse, lo transforma en símbolos normales. Luego 50% de probabilidad de descartarse.", fr: "Si un motif Giratina est sur le point de se déclencher, le transforme en symboles normaux. Puis 50 % de chance de s'auto-détruire.", de: "Wenn ein Giratina-Muster auslösen würde, verwandelt es es in normale Symbole. Danach 50 % Chance, sich selbst zu verbrauchen.", it: "Se un pattern Giratina sta per attivarsi, lo trasforma in simboli normali. Poi 50% di possibilità di scartarsi.",
    ja: "ギラティナのパターンが発動する場合、通常のシンボルに変換。その後50%の確率で自身を捨てる。", ko: "기라티나 패턴이 발동하려 하면 일반 심볼로 변환. 그 후 50% 확률로 자기 자신을 버린다.", "zh-hans": "如果骑拉帝纳牌型即将触发，将其变为普通图案。之后有50%几率自身被弃置。", "zh-hant": "如果騎拉帝納牌型即將觸發，將其變為普通圖案。之後有50%機率自身被棄置。",
  },
  "charm-comet-shard": { en: "Comet Shard" },
  "comet-shard-desc": {
    en: "Patterns Multiplier +2 and +3% chance of seeing a Giratina.", es: "Multiplicador de Patrones +2 y +3% de probabilidad de ver un Giratina.", fr: "Multiplicateur de Motifs +2 et +3 % de chances de voir un Giratina.", de: "Muster-Multiplikator +2 und +3 % chance, Giratina zu sehen.", it: "Moltiplicatore Pattern +2 e +3% di probabilità di vedere Giratina.",
    ja: "パターン倍率+2、ギラティナが出現する確率+3%。", ko: "패턴 배율 +2, 기라티나가 등장할 확률 +3%.", "zh-hans": "牌型倍率+2，见到骑拉帝纳的几率+3%。", "zh-hant": "牌型倍率+2，見到騎拉帝納的機率+3%。",
  },
  "charm-dragon-skull": { en: "Dragon Skull" },
  "dragon-skull-desc": {
    en: "When you see a Giratina on the grid, permanently double the pattern multiplier for ABOVE and BELOW.", es: "Cuando ves un Giratina en la cuadrícula, duplica permanentemente el multiplicador de patrones para ARRIBA y ABAJO.", fr: "Quand un Giratina apparaît sur la grille, double définitivement le multiplicateur de motifs pour AU-DESSUS et EN-DESSOUS.", de: "Erscheint Giratina auf dem Spielfeld, verdoppelt dauerhaft den Muster-Multiplikator für OBEN und UNTEN.", it: "Quando vedi Giratina sulla griglia, raddoppia permanentemente il moltiplicatore dei pattern SOPRA e SOTTO.",
    ja: "フィールドにギラティナが出現した時、ABOVEとBELOWのパターン倍率を永久に倍増。", ko: "그리드에 기라티나가 나타나면 ABOVE와 BELOW의 패턴 배율을 영구적으로 2배.", "zh-hans": "网格上出现骑拉帝纳时，永久加倍ABOVE和BELOW的牌型倍率。", "zh-hant": "網格上出現騎拉帝納時，永久加倍ABOVE和BELOW的牌型倍率。",
  },
  "charm-pearl-string": { en: "Pearl String" },
  "pearl-string-desc": {
    en: "Triggers Randomly (35%). If a Giratina pattern is going to trigger, transform it into normal symbols.", es: "Se activa al azar (35%). Si un patrón Giratina va a activarse, lo transforma en símbolos normales.", fr: "Déclenchement aléatoire (35 %). Si un motif Giratina est sur le point de se déclencher, le transforme en symboles normaux.", de: "Löst zufällig aus (35 %). Wenn ein Giratina-Muster auslösen würde, verwandelt es es in normale Symbole.", it: "Si attiva a caso (35%). Se un pattern Giratina sta per attivarsi, lo trasforma in simboli normali.",
    ja: "ランダム発動（35%）。ギラティナのパターンが発動する場合、通常のシンボルに変換。", ko: "무작위 발동 (35%). 기라티나 패턴이 발동하려 하면 일반 심볼로 변환.", "zh-hans": "随机触发（35%）。如果骑拉帝纳牌型即将触发，将其变为普通图案。", "zh-hant": "隨機觸發（35%）。如果騎拉帝納牌型即將觸發，將其變為普通圖案。",
  },
  "charm-dark-stone": { en: "Dark Stone" },
  "dark-stone-desc": {
    en: "+1.5% chance of seeing a Giratina. When you see one, gain +3, +2, +1, +0 bonus spins per round (resets at round end).", es: "+1,5% de probabilidad de ver un Giratina. Cuando ves uno, ganas +3, +2, +1, +0 giros extra por ronda (se reinicia al final).", fr: "+1,5 % de chances de voir un Giratina. Quand tu en vois un, gagnes +3, +2, +1, +0 tours bonus par manche (réinitialisé en fin de manche).", de: "+1,5 % chance, Giratina zu sehen. Bei Sicht: +3, +2, +1, +0 Bonus-Züge pro Runde (setzt sich am Rundenende zurück).", it: "+1,5% di probabilità di vedere Giratina. Quando ne vedi uno, ottieni +3, +2, +1, +0 tiri extra per turno (si resetta a fine turno).",
    ja: "ギラティナが出現する確率+1.5%。出現時、ラウンドごとに+3、+2、+1、+0のボーナスレバーを獲得（ラウンド終了時にリセット）。", ko: "기라티나 등장 확률 +1.5%. 기라티나를 보면 라운드당 +3, +2, +1, +0 보너스 레버 획득 (라운드 종료 시 리셋).", "zh-hans": "见到骑拉帝纳的几率+1.5%。见到时获得+3、+2、+1、+0额外拉杆（每回合结束重置）。", "zh-hant": "見到騎拉帝納的機率+1.5%。見到時獲得+3、+2、+1、+0額外拉桿（每回合結束重置）。",
  },
  "charm-god-stone": { en: "God Stone" },
  "god-stone-desc": {
    en: "When you see a Giratina on the grid, Symbols Multiplier ×2 until the end of the round.", es: "Cuando ves un Giratina en la cuadrícula, Multiplicador de Símbolos ×2 hasta el final de la ronda.", fr: "Quand un Giratina apparaît sur la grille, Multiplicateur de Symboles ×2 jusqu'à la fin de la manche.", de: "Erscheint Giratina auf dem Spielfeld, Symbole-Multiplikator ×2 bis Rundenende.", it: "Quando vedi Giratina sulla griglia, Moltiplicatore Simboli ×2 fino alla fine del turno.",
    ja: "フィールドにギラティナが出現した時、ラウンド終了までシンボル倍率×2。", ko: "그리드에 기라티나가 나타나면 라운드 종료까지 심볼 배율 ×2.", "zh-hans": "网格上出现骑拉帝纳时，本回合图案倍率×2。", "zh-hant": "網格上出現騎拉帝納時，本回合圖案倍率×2。",
  },
  "Triggers Randomly": {
    en: "Triggers Randomly", es: "Se activa al azar", fr: "Déclenchement aléatoire", de: "Löst zufällig aus", it: "Si attiva a caso",
    ja: "ランダム発動", ko: "무작위 발동", "zh-hans": "随机触发", "zh-hant": "隨機觸發",
  },
  "rounds left": {
    en: "rounds left", es: "rondas restantes", fr: "manches restantes", de: "Runden übrig", it: "turni rimasti",
    ja: "ラウンド残り", ko: "라운드 남음", "zh-hans": "回合剩余", "zh-hant": "回合剩餘",
  },
  "pulls left": {
    en: "pulls left", es: "tiradas restantes", fr: "tirages restants", de: "Züge übrig", it: "tirate rimaste",
    ja: "残り回数", ko: "남은 횟수", "zh-hans": "剩余次数", "zh-hant": "剩餘次數",
  },
  "The Focus Sash shatters — two extra rounds to pay the quota!": {
    en: "The Focus Sash shatters — two extra rounds to pay the quota!", es: "¡La Banda Focus se rompe: dos rondas extra para pagar la cuota!", fr: "La Ceinture Pro se brise — deux manches de plus pour payer la quote-part !", de: "Der Fokusgurt zersplittert — zwei Extra-Runden, um die Rate zu zahlen!", it: "Il Focalnastro va in frantumi — due turni extra per pagare la rata!",
    ja: "きあいのタスキが砕け散る——分割払いのために2ラウンド追加！", ko: "기합의띠가 산산조각난다——분할금을 낼 수 있도록 2라운드 추가!", "zh-hans": "气势披带碎裂了——额外获得2个回合支付配额！", "zh-hant": "氣勢披帶碎裂了——額外獲得2個回合支付配額！",
  },
  "The Arceus Statue glows — the reels obey.": {
    en: "The Arceus Statue glows — the reels obey.", es: "La Estatua de Arceus brilla: los rodillos obedecen.", fr: "La Statue d'Arceus rayonne — les rouleaux obéissent.", de: "Die Arceus-Statue leuchtet — die Walzen gehorchen.", it: "La Statua di Arceus risplende — i rulli obbediscono.",
    ja: "アルセウス像が輝き、リールが従う。", ko: "아르세우스 조각상이 빛나며 릴이 복종한다.", "zh-hans": "阿尔宙斯像发光了——转盘听从号令。", "zh-hant": "阿爾宙斯像發光了——轉盤聽從號令。",
  },
  "The Parcel bursts — every symbol gains its base value!": {
    en: "The Parcel bursts — every symbol gains its base value!", es: "¡El Paquete estalla: cada símbolo gana su valor base!", fr: "Le Colis éclate — chaque symbole gagne sa valeur de base !", de: "Das Paket platzt auf — jedes Symbol gewinnt seinen Grundwert!", it: "Il Pacco esplode — ogni simbolo guadagna il suo valore base!",
    ja: "おとどけものがはじける——すべてのシンボルが基本価値分アップ！", ko: "소포가 터진다——모든 심볼이 기본 가치만큼 오른다!", "zh-hans": "包裹炸开了——每个图案获得其基础价值加成！", "zh-hant": "包裹炸開了——每個圖案獲得其基礎價值加成！",
  },
  "The Focus Band shatters! Quota wiped — seven pulls on the house.": {
    en: "The Focus Band shatters! Quota wiped — seven pulls on the house.", es: "¡La Banda Focus se rompe! Cuota borrada: siete tiradas por la casa.", fr: "Le Bandeau Focus se brise ! Quote-part effacée — sept tirages offerts.", de: "Das Focus-Band zersplittert! Rate gelöscht — sieben Züge gehen auf das Haus.", it: "La Fascia Concentrazione va in frantumi! Rata cancellata — sette slate offerte.",
    ja: "がんばリバンドが砕け散る！分割払いは消滅——レバー7回はサービスだ。", ko: "승부밴드가 산산조각난다! 분할금 소멸——레버 7회는 서비스다.", "zh-hans": "气势绑带碎裂了！配额被清除——7次拉杆由本店请客。", "zh-hant": "氣勢綁帶碎裂了！配額被清除——7次拉桿由本店請客。",
  },
  "The Pokédoll sells your interest on the spot.": {
    en: "The Pokédoll sells your interest on the spot.", es: "El Muñeco Poké vende tu interés al instante.", fr: "La Poupée Pokémon vend tes intérêts sur place.", de: "Die Poké-Puppe verkauft deine Zinsen sofort.", it: "La Poké Bambola vende i tuoi interessi sul posto.",
    ja: "ポケ人形が利息をその場で換金する。", ko: "포켓몬 인형이 이자를 그 자리에서 현금으로 바꾼다.", "zh-hans": "宝可梦玩偶当场把你的利息变现。", "zh-hant": "寶可夢玩偶當場把你的利息變現。",
  },
  "The Cleanse Tag hums — every symbol is worth more!": {
    en: "The Cleanse Tag hums — every symbol is worth more!", es: "El amuleto purificador vibra: ¡todos los símbolos valen más!", fr: "Le talisman purifiant vibre — tous les symboles valent plus !", de: "Der Reinigungstalisman summt — alle Symbole sind mehr wert!", it: "L'amuleto purificante vibra: tutti i simboli valgono di più!",
    ja: "おふだが低く鳴る——すべてのシンボルの価値が上がる！", ko: "부적이 울린다——모든 심볼의 가치가 올라간다!", "zh-hans": "洁净护符嗡嗡作响——所有图案都更值钱了！", "zh-hant": "潔淨護符嗡嗡作響——所有圖案都更值錢了！",
  },
  "Giratina pulled you to the Distortion World!": {
    en: "Giratina dragged you into the Distortion World — round earnings lost!", es: "¡Giratina te ha encerrado en el Mundo Distorsión — ¡ganancias de la ronda perdidas!", fr: "Giratina t'a entraîné dans le Monde Distorsion — gains de la manche perdus !", de: "Giratina hat dich in die Verdrehte Welt gezerrt — Rundenverdienst verloren!", it: "Giratina ti ha trascinato nel Mondo Distorsione — guadagni del turno persi!",
    ja: "ギラティナが扭曲世界に引きずり込んだ——ラウンド中の収入が消えた！", ko: "기라티나가 왜곡의 세계로 끌고 갔다——라운드 수익이 사라졌다!", "zh-hans": "骑拉帝纳把你拉进了反转世界——本回合收益清零！", "zh-hant": "騎拉帝納把你拉進了反轉世界——本回合收益清零！",
  },
  "Restart": {
    en: "Restart", es: "Reiniciar", fr: "Recommencer", de: "Neustart", it: "Ricomincia",
    ja: "やり直す", ko: "다시 시작", "zh-hans": "重新开始", "zh-hant": "重新開始",
  },
  "Restart the run? All progress will be lost.": {
    en: "Restart the run? All progress will be lost.", es: "¿Reiniciar la partida? Se perderá todo el progreso.", fr: "Recommencer la partie ? Toute progression sera perdue.", de: "Lauf neustarten? Jeglicher Fortschritt geht verloren.", it: "Ricominciare la run? Tutti i progressi andranno persi.",
    ja: "ランをやり直しますか？進行状況はすべて失われます。", ko: "런을 다시 시작할까요? 모든 진행 상황이 사라집니다.", "zh-hans": "重新开始本局？所有进度将丢失。", "zh-hant": "重新開始本局？所有進度將丟失。",
  },
};

// Looks up a translation key for the given language.
// Falls back to English, then to the key itself if no translation exists.
// Used by every component via `import { t } from "../stores/translations"`.
export function t(key, language) {
  return ui[key]?.[language] || ui[key]?.en || key;
}
