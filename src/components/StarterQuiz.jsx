import { useState, useMemo } from "react";
import { getLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { getStartersForTrait, getMovesAtLevel, cumulativeExp } from "../lib/moves";
import { computeStats, pickNature } from "../lib/pokedex";
import PokeTypeBadge from "./PokeTypeBadge";
import { addTeamMember, saveProfile } from "../lib/auth";

const QUESTIONS = [
  {
    text: { en: "You're walking through a dark forest. A strange noise echoes from the trees. What do you do?", es: "Estás caminando por un bosque oscuro. Un ruido extraño resuena entre los árboles. ¿Qué haces?", fr: "Vous marchez dans une forêt sombre. Un bruit étrange résonne entre les arbres. Que faites-vous ?", de: "Du gehst durch einen dunklen Wald. Ein seltsames Geräusch hallt zwischen den Bäumen. Was tust du?", it: "Stai camminando in una foresta buia. Uno strano rumore riecheggia tra gli alberi. Cosa fai?", ja: "暗い森を歩いている。木々から不思議な音が響いてくる。どうする？", ko: "어두운 숲을 걷고 있다. 나무 사이에서 이상한 소리가 울려 퍼진다. 어떻게 할까?", "zh-hans": "你正走在黑暗的森林里。树木间传来奇怪的回声。你会怎么做？", "zh-hant": "你正走在黑暗的森林裡。樹木間傳來奇怪的回聲。你會怎麼做？" },
    answers: [
      { text: { en: "Charge toward the noise to investigate", es: "Corre hacia el ruido para investigar", fr: "Foncez vers le bruit pour enquêter", de: "Stürme auf das Geräusch zu, um es zu untersuchen", it: "Carica verso il rumore per indagare", ja: "音の方に向かって走り出す", ko: "소리를 향해 달려가 조사한다", "zh-hans": "冲向声音去查看", "zh-hant": "衝向聲音去查看" }, trait: "brave" },
      { text: { en: "Wait quietly and listen carefully", es: "Espera en silencio y escucha con atención", fr: "Attendez tranquillement et écoutez attentivement", de: "Warte ruhig und höre genau hin", it: "Aspetta in silenzio e ascolta con attenzione", ja: "静かに待って注意深く聞く", ko: "조용히 기다리며 주의 깊게 듣는다", "zh-hans": "安静等待，仔细聆听", "zh-hant": "安靜等待，仔細聆聽" }, trait: "clever" },
      { text: { en: "Climb a tree to get a better view", es: "Sube a un árbol para tener mejor vista", fr: "Grimpez à un arbre pour mieux voir", de: "Klettere auf einen Baum, um besser zu sehen", it: "Sali su un albero per vedere meglio", ja: "木に登って様子を見る", ko: "나무에 올라가 더 잘 보려 한다", "zh-hans": "爬上树看个究竟", "zh-hant": "爬上樹看個究竟" }, trait: "quick" },
      { text: { en: "Find a sturdy stick and stand your ground", es: "Encuentra un palo resistente y mantente firme", fr: "Trouvez un bâton solide et tenez bon", de: "Finde einen stabilen Stock und bleib standhaft", it: "Trova un bastone robusto e resta fermo", ja: "丈夫な枝を見つけてその場に構える", ko: "튼튼한 막대기를 찾아 자리를 지킨다", "zh-hans": "找一根结实的棍子，原地戒备", "zh-hant": "找一根結實的棍子，原地戒備" }, trait: "tough" },
      { text: { en: "Call out gently to see if anyone needs help", es: "Llama suavemente para ver si alguien necesita ayuda", fr: "Appelez doucement pour voir si quelqu'un a besoin d'aide", de: "Rufe sanft, um zu sehen, ob jemand Hilfe braucht", it: "Chiama dolcemente per vedere se qualcuno ha bisogno di aiuto", ja: "誰か助けてほしいっていないか優しく声をかける", ko: "부드럽게 소리쳐 도움이 필요한 사람이 있는지 확인한다", "zh-hans": "轻声呼唤，看看是否有人需要帮助", "zh-hant": "輕聲呼喚，看看是否有人需要幫助" }, trait: "gentle" },
    ],
  },
  {
    text: { en: "A wild Pidgey is caught in a thorny bush, struggling. What do you do?", es: "Un Pidgey salvaje está atrapado en un arbusto espinoso, luchando. ¿Qué haces?", fr: "Un Pidgey sauvage est pris dans un buisson épineux et se débat. Que faites-vous ?", de: "Ein wildes Pidgey steckt in einem dornigen Busch und wehrt sich. Was tust du?", it: "Un Pidgey selvatico è intrappolato in un cespuglio spinoso e si dibatte. Cosa fai?", ja: "野生のポッポがトゲのある茂みに絡まってもがいている。どうする？", ko: "야생의 구구가 가시덤불에 걸려 발버둥치고 있다. 어떻게 할까?", "zh-hans": "一只野生的波波被荆棘丛缠住，正在挣扎。你会怎么做？", "zh-hant": "一隻野生的波波被荊棘叢纏住，正在掙扎。你會怎麼做？" },
    answers: [
      { text: { en: "Rush in and pull it free without hesitation", es: "Entra corriendo y libéralo sin dudar", fr: "Précipitez-vous pour le dégager sans hésiter", de: "Stürme hinein und ziehe es ohne Zögern frei", it: "Entra di corsa e liberalo senza esitare", ja: "迷わずに突っ込んで引っ張り出す", ko: "망설임 없이 달려가 꺼내준다", "zh-hans": "毫不犹豫地冲进去把它救出来", "zh-hant": "毫不猶豫地衝進去把牠救出來" }, trait: "brave" },
      { text: { en: "Carefully cut the thorns away one by one", es: "Corta con cuidado las espinas una a una", fr: "Coupez soigneusement les épines une à une", de: "Schneide die Dornen vorsichtig eine nach der anderen ab", it: "Taglia le spine con attenzione una alla volta", ja: "丁寧にトゲを一本ずつ切りながら助ける", ko: "가시를 하나씩 조심스럽게 잘라준다", "zh-hans": "小心地一根根剪掉荆棘", "zh-hant": "小心地一根根剪掉荊棘" }, trait: "gentle" },
      { text: { en: "Look for the safest way to free it quickly", es: "Busca la forma más segura de liberarlo rápido", fr: "Cherchez la façon la plus sûre de le libérer rapidement", de: "Suche den sichersten Weg, es schnell zu befreien", it: "Cerca il modo più sicuro per liberarlo rapidamente", ja: "最も安全で速い方法を考える", ko: "가장 안전하고 빠른 방법을 찾는다", "zh-hans": "寻找最快最安全的方法解救它", "zh-hant": "尋找最快最安全的方法解救牠" }, trait: "clever" },
      { text: { en: "Grab it firmly and pull hard", es: "Agárralo con firmeza y tira con fuerza", fr: "Attrapez-le fermement et tirez fort", de: "Pack es fest und ziehe kräftig", it: "Afferralo saldamente e tira con forza", ja: "しっかり掴んで力いっぱい引く", ko: "단단히 잡고 힘껏 잡아당긴다", "zh-hans": "牢牢抓住，用力拉扯", "zh-hant": "牢牢抓住，用力拉扯" }, trait: "tough" },
      { text: { en: "Sprint to find help from someone experienced", es: "Corre a buscar ayuda de alguien con experiencia", fr: "Courez chercher de l'aide auprès de quelqu'un d'expérimenté", de: "Lauf los, um Hilfe von jemand Erfahrenem zu holen", it: "Corri a cercare aiuto da qualcuno di esperto", ja: "経験者を頼りに素早く走り出す", ko: "경험자를 찾아 도움을 청하러 달려간다", "zh-hans": "跑去向有经验的人求助", "zh-hant": "跑去向有經驗的人求助" }, trait: "quick" },
    ],
  },
  {
    text: { en: "You find a mysterious orb glowing on the ground. What's your first instinct?", es: "Encuentras un orbe misterioso que brilla en el suelo. ¿Cuál es tu primer instinto?", fr: "Vous trouvez un orbe mystérieux qui brille sur le sol. Quel est votre premier instinct ?", de: "Du findest eine mysteriöse Kugel, die auf dem Boden leuchtet. Was ist dein erster Instinkt?", it: "Trovi un misterioso orbe che brilla a terra. Qual è il tuo primo istinto?", ja: "地面に謎の輝くオーブを見つけた。第一の直感は？", ko: "땅에서 빛나는 신비한 구슬을 발견했다. 첫 번째 직감은?", "zh-hans": "你发现地上有一颗发光的神秘宝珠。你的第一直觉是什么？", "zh-hant": "你發現地上有一顆發光的奧秘寶珠。你的第一直覺是什麼？" },
    answers: [
      { text: { en: "Pick it up immediately — finders keepers!", es: "Recógelo de inmediato — ¡el que lo encuentra se lo queda!", fr: "Ramassez-le immédiatement — qui le trouve le garde !", de: "Heb es sofort auf — wer es findet, behält es!", it: "Raccoglilo subito — chi lo trova se lo tiene!", ja: "すぐに拾う — 見つけた物は自分の物！", ko: "즉시 집어든다 — 발견한 사람이 임자!", "zh-hans": "马上捡起来——谁捡到就是谁的！", "zh-hant": "馬上撿起來——誰撿到就是誰的！" }, trait: "brave" },
      { text: { en: "Observe it from a distance first", es: "Obsérvalo desde la distancia primero", fr: "Observez-le d'abord à distance", de: "Beobachte es zuerst aus der Ferne", it: "Prima osservalo da lontano", ja: "距離を保ってまず観察する", ko: "먼저 멀리서 관찰한다", "zh-hans": "先在远处观察", "zh-hant": "先在遠處觀察" }, trait: "clever" },
      { text: { en: "Roll it with a stick to see what happens", es: "Hazlo rodar con un palo para ver qué pasa", fr: "Faites-le rouler avec un bâton pour voir ce qui se passe", de: "Rolle es mit einem Stock, um zu sehen, was passiert", it: "Fallalo con un bastone per vedere cosa succede", ja: "棒で転がして何が起きるか確認する", ko: "막대기로 굴려 뭐가 일어나는지 본다", "zh-hans": "用棍子戳它，看看会发生什么", "zh-hant": "用棍子戳它，看看會發生什麼" }, trait: "tough" },
      { text: { en: "Try to sense if it has good energy", es: "Intenta sentir si tiene buena energía", fr: "Essayez de sentir s'il a une bonne énergie", de: "Versuche zu spüren, ob es gute Energie hat", it: "Cerca di percepire se ha una buona energia", ja: "いいエネルギーを持っていないか感じる", ko: "좋은 에너지를 가졌는지 느껴본다", "zh-hans": "试着感受它是否带着好能量", "zh-hant": "試著感受它是否帶著好能量" }, trait: "gentle" },
      { text: { en: "Grab it and run before someone else does", es: "Agárralo y corre antes de que otro lo haga", fr: "Attrapez-le et courez avant que quelqu'un d'autre le fasse", de: "Schnapp es dir und lauf, bevor es jemand anderes tut", it: "Afferralo e scappa prima che qualcun altro lo faccia", ja: "誰かに取られる前に掴んで走る", ko: "다른 사람이 가져가기 전에 집어 들고 달린다", "zh-hans": "趁别人发现前捡起来就跑", "zh-hant": "趁別人發現前撿起來就跑" }, trait: "quick" },
    ],
  },
  {
    text: { en: "Your team is split on which path to take. The left is dark and dangerous, the right is long but safe. What do you suggest?", es: "Tu equipo está dividido sobre qué camino tomar. El izquierdo es oscuro y peligroso, el derecho es largo pero seguro. ¿Qué sugieres?", fr: "Votre équipe est divisée sur le chemin à prendre. La gauche est sombre et dangereuse, la droite est longue mais sûre. Que suggérez-vous ?", de: "Dein Team ist sich uneinig, welchen Weg es nehmen soll. Links ist es dunkel und gefährlich, rechts lang, aber sicher. Was schlägst du vor?", it: "La tua squadra è divisa su quale strada prendere. La sinistra è buia e pericolosa, la destra è lunga ma sicura. Cosa suggerisci?", ja: "チームが分かれた。左は暗くて危ない、右は遠いけど安全。どう提案する？", ko: "팀이 어떤 길로 갈지 의견이 갈렸다. 왼쪽은 어둡고 위험하고, 오른쪽은 멀지만 안전하다. 어떻게 제안할까?", "zh-hans": "队伍对走哪条路产生了分歧。左边黑暗危险，右边漫长但安全。你会建议走哪条？", "zh-hant": "隊伍對走哪條路產生了分歧。左邊黑暗危險，右邊漫長但安全。你會建議走哪條？" },
    answers: [
      { text: { en: "Take the left — fortune favors the bold", es: "Toma la izquierda — la fortuna favorece a los valientes", fr: "Prenez la gauche — la fortune sourit aux audacieux", de: "Nimm links — das Glück begünstigt die Mutigen", it: "Prendi la sinistra — la fortuna aiuta gli audaci", ja: "左へ — 運は冒険者に味方する", ko: "왼쪽으로 간다 — 용기 있는 자에게 행운이 따른다", "zh-hans": "走左边——勇者自有天助", "zh-hant": "走左邊——勇者自有天助" }, trait: "brave" },
      { text: { en: "Go right — everyone needs to get home safe", es: "Ve a la derecha — todos necesitan llegar a casa sanos", fr: "Allez à droite — tout le monde doit rentrer sain et sauf", de: "Geh rechts — alle müssen sicher nach Hause kommen", it: "Vai a destra — tutti devono tornare a casa sani e salvi", ja: "右へ — 全員が無事に帰ることが大事", ko: "오른쪽으로 간다 — 모두 무사히 집에 돌아가는 것이 중요하다", "zh-hans": "走右边——大家都要平安回家", "zh-hant": "走右邊——大家都要平安回家" }, trait: "gentle" },
      { text: { en: "Look for a hidden third option", es: "Busca una tercera opción oculta", fr: "Cherchez une troisième option cachée", de: "Suche nach einer versteckten dritten Option", it: "Cerca una terza opzione nascosta", ja: "隠された第三の選択肢を探す", ko: "숨겨진 제3의 선택지를 찾아본다", "zh-hans": "寻找隐藏的第三条路", "zh-hant": "尋找隱藏的第三條路" }, trait: "clever" },
      { text: { en: "Volunteer to scout the left alone", es: "Ofrécete a explorar la izquierda solo", fr: "Proposez-vous pour éclaireur sur la gauche seul", de: "Melde dich freiwillig, um links allein zu erkunden", it: "Offriti volontario per esplorare la sinistra da solo", ja: "一人で左を偵察する", ko: "자원해서 혼자 왼쪽을 정찰한다", "zh-hans": "自告奋勇独自去左边侦察", "zh-hant": "自告奮勇獨自去左邊偵察" }, trait: "quick" },
      { text: { en: "Take the left and power through whatever comes", es: "Toma la izquierda y abre paso pase lo que pase", fr: "Prenez la gauche et forcez le passage quoi qu'il arrive", de: "Nimm links und kämpfe dich durch, was auch kommt", it: "Prendi la sinistra e affronta qualsiasi cosa venga", ja: "左へ向かって何が来ても力で乗り切る", ko: "왼쪽으로 가서 무슨 일이 와도 힘으로 돌파한다", "zh-hans": "走左边，无论遇到什么都硬闯过去", "zh-hant": "走左邊，無論遇到什麼都硬闖過去" }, trait: "tough" },
    ],
  },
  {
    text: { en: "A Magikarp is flopping helplessly on dry land. What do you do?", es: "Un Magikarp salta sin fuerzas en tierra seca. ¿Qué haces?", fr: "Un Magicarpe se débat sans force sur la terre sèche. Que faites-vous ?", de: "Ein Karpador zappelt hilflos auf trockenem Boden. Was tust du?", it: "Un Magikarp guizza senza forze sulla terra asciutta. Cosa fai?", ja: "コイキングが乾いた地面でもがいている。どうする？", ko: "건조한 땅에서 잉어킹이 힘없이 발버둥치고 있다. 어떻게 할까?", "zh-hans": "一只鲤鱼王在干涸的地上无助地扑腾。你会怎么做？", "zh-hant": "一隻鯉魚王在乾涸的地上無助地撲騰。你會怎麼做？" },
    answers: [
      { text: { en: "Pick it up and carry it to water as fast as possible", es: "Recógelo y llévalo al agua lo más rápido posible", fr: "Ramassez-le et portez-le jusqu'à l'eau le plus vite possible", de: "Heb es auf und trag es so schnell wie möglich zum Wasser", it: "Raccoglilo e portalo all'acqua il più velocemente possibile", ja: "素早く持ち上げて水まで運ぶ", ko: "재빨리 들어 올려 물가로 데려간다", "zh-hans": "把它捡起来，尽快送到水里", "zh-hant": "把牠撿起來，盡快送到水裡" }, trait: "quick" },
      { text: { en: "Gently scoop it up and cradle it to the water", es: "Recógelo con suavidad y llévalo con cuidado al agua", fr: "Soulevez-le avec douceur et portez-le avec soin jusqu'à l'eau", de: "Nimm es sanft auf und trage es behutsam zum Wasser", it: "Raccoglilo con delicatezza e portalo con cura all'acqua", ja: "優しくすくい上げてそっと水に返す", ko: "부드럽게 받쳐 들어 물가로 조심히 옮긴다", "zh-hans": "轻轻捧起它，小心翼翼送到水里", "zh-hant": "輕輕捧起牠，小心翼翼送到水裡" }, trait: "gentle" },
      { text: { en: "Roll it toward the water — it can handle it", es: "Hazlo rodar hacia el agua — puede soportarlo", fr: "Faites-le rouler vers l'eau — il peut encaisser", de: "Rolle es Richtung Wasser — es hält das aus", it: "Fallalo verso l'acqua — può sopportarlo", ja: "水の方に転がす — 大丈夫だろ", ko: "물가 쪽으로 굴려 보낸다 — 그 정도는 견딜 거야", "zh-hans": "把它滚向水边——它扛得住", "zh-hant": "把牠滾向水邊——牠扛得住" }, trait: "tough" },
      { text: { en: "Check if the water source is safe first", es: "Primero comprueba si la fuente de agua es segura", fr: "Vérifiez d'abord si la source d'eau est sûre", de: "Prüfe zuerst, ob das Wasser sicher ist", it: "Prima controlla se la fonte d'acqua è sicura", ja: "まず水源が安全か確認する", ko: "먼저 물이 안전한지 확인한다", "zh-hans": "先确认水源是否安全", "zh-hant": "先確認水源是否安全" }, trait: "clever" },
      { text: { en: "Dive in headfirst to bring water back to it", es: "Zambúllete de cabeza para llevarle agua", fr: "Plongez tête la première pour lui ramener de l'eau", de: "Spring kopfüber hinein, um ihm Wasser zu bringen", it: "Tuffati a testa in giù per portargli l'acqua", ja: "頭から突っ込んで水を持ってくる", ko: "맨몸으로 뛰어들어 물을 가져온다", "zh-hans": "一头扎进去，把水带回来给它", "zh-hant": "一頭扎進去，把水帶回來給牠" }, trait: "brave" },
    ],
  },
  {
    text: { en: "You discover an abandoned camp with supplies still inside. What do you think?", es: "Descubres un campamento abandonado con suministros dentro. ¿Qué piensas?", fr: "Vous découvrez un camp abandonné avec des provisions à l'intérieur. Qu'en pensez-vous ?", de: "Du entdeckst ein verlassenes Lager mit Vorräten darin. Was denkst du?", it: "Scopri un accampamento abbandonato con provviste ancora dentro. Cosa pensi?", ja: "放棄されたキャンプと中の物資を発見した。どう思う？", ko: "버려진 야영지와 안에 남아 있는 보급품을 발견했다. 어떻게 생각할까?", "zh-hans": "你发现一个被遗弃的营地，里面还有物资。你怎么想？", "zh-hant": "你發現一個被遺棄的營地，裡面還有物資。你怎麼想？" },
    answers: [
      { text: { en: "We should set up camp here — perfect spot!", es: "Deberíamos acampar aquí — ¡lugar perfecto!", fr: "Nous devrions camper ici — un endroit parfait !", de: "Wir sollten hier campen — perfekter Platz!", it: "Dovremmo accamparci qui — posto perfetto!", ja: "ここでキャンプを張ろう — 最高の場所！", ko: "여기서 야영을 하자 — 최고의 장소야!", "zh-hans": "我们就在这里扎营吧——绝佳的地点！", "zh-hant": "我們就在這裡紮營吧——絕佳的地點！" }, trait: "brave" },
      { text: { en: "Whoever left this might come back for it", es: "Quien dejó esto podría volver a buscarlo", fr: "Celui qui a laissé tout ça pourrait revenir le chercher", de: "Wer das hier gelassen hat, könnte wiederkommen", it: "Chi ha lasciato tutto questo potrebbe tornare a prenderlo", ja: "ここを去った人が戻ってくるかもしれない", ko: "여기를 떠난 사람이 돌아올 수도 있다", "zh-hans": "留下这些的人可能会回来取", "zh-hant": "留下這些的人可能會回來拿" }, trait: "gentle" },
      { text: { en: "Check if anything is booby-trapped first", es: "Primero comprueba si hay trampas", fr: "Vérifiez d'abord s'il y a des pièges", de: "Prüfe zuerst, ob etwas mit Fallen gesichert ist", it: "Prima controlla se c'è qualche trappola", ja: "まず罠がないか確認する", ko: "먼저 함정이 있는지 확인한다", "zh-hans": "先检查有没有陷阱", "zh-hant": "先檢查有沒有陷阱" }, trait: "clever" },
      { text: { en: "We don't need handouts, let's keep moving", es: "No necesitamos limosnas, sigamos avanzando", fr: "Nous n'avons pas besoin de charité, continuons", de: "Wir brauchen keine Almosen, wir ziehen weiter", it: "Non ci servono regali, continuiamo a camminare", ja: "物乞いはしない、前行こう", ko: "남의 도움은 필요 없어, 계속 가자", "zh-hans": "我们不需要施舍，继续赶路", "zh-hant": "我們不需要施捨，繼續趕路" }, trait: "tough" },
      { text: { en: "Quickly take what we need and move on", es: "Toma rápido lo que necesitamos y sigamos", fr: "Prenons rapidement ce qu'il nous faut et poursuivons", de: "Nimm schnell, was wir brauchen, und weiter", it: "Prendi in fretta ciò che ci serve e proseguiamo", ja: "必要な物を素早く取って先へ進む", ko: "필요한 것만 재빨리 챙겨서 이동한다", "zh-hans": "迅速拿走需要的物资，继续赶路", "zh-hant": "迅速拿走需要的物資，繼續趕路" }, trait: "quick" },
    ],
  },
  {
    text: { en: "A storm is approaching. You see a cave and a sturdy tree. Where do you shelter?", es: "Se acerca una tormenta. Ves una cueva y un árbol robusto. ¿Dónde te refugias?", fr: "Un orage approche. Vous voyez une grotte et un arbre robuste. Où vous abritez-vous ?", de: "Ein Sturm zieht auf. Du siehst eine Höhle und einen stabilen Baum. Wo suchst du Schutz?", it: "Si avvicina una tempesta. Vedi una grotta e un albero robusto. Dove ti rifugi?", ja: "嵐が近づいている。洞窟と丈夫な木が見える。どこで避難する？", ko: "폭풍이 다가오고 있다. 동굴과 튼튼한 나무가 보인다. 어디로 대피할까?", "zh-hans": "暴风雨即将来临。你看到一座洞穴和一棵粗壮的树。你在哪里避雨？", "zh-hant": "暴風雨即將來臨。你看到一座洞穴和一棵粗壯的樹。你在哪裡避雨？" },
    answers: [
      { text: { en: "The cave — explore it while waiting out the storm", es: "La cueva — explórala mientras esperas a que pase la tormenta", fr: "La grotte — explorez-la en attendant la fin de l'orage", de: "Die Höhle — erkunde sie, während du den Sturm abwartest", it: "La grotta — esplorala mentre aspetti che passi la tempesta", ja: "洞窟 — 嵐を待つ間に探索しよう", ko: "동굴 — 폭풍이 지나가는 동안 탐험하자", "zh-hans": "洞穴——等暴风雨过去的同时探索一下", "zh-hant": "洞穴——等暴風雨過去的同時探索一下" }, trait: "brave" },
      { text: { en: "The tree — make a shelter for everyone", es: "El árbol — haz un refugio para todos", fr: "L'arbre — faites un abri pour tout le monde", de: "Der Baum — baue einen Unterschlupf für alle", it: "L'albero — costruisci un riparo per tutti", ja: "木 — 全員の為にシェルターを作ろう", ko: "나무 — 모두를 위한 대피소를 만들자", "zh-hans": "树下——为大家搭个避雨棚", "zh-hant": "樹下——為大家搭個避雨棚" }, trait: "gentle" },
      { text: { en: "The cave — but check deep inside for dangers first", es: "La cueva — pero primero revisa si hay peligros en el interior", fr: "La grotte — mais vérifiez d'abord les dangers au fond", de: "Die Höhle — aber prüfe zuerst, ob es drinnen Gefahren gibt", it: "La grotta — ma prima controlla i pericoli nel fondo", ja: "洞窟 — まず奥に危険がないか確認", ko: "동굴 — 하지만 먼저 안쪽에 위험이 없는지 확인한다", "zh-hans": "洞穴——但先确认深处有没有危险", "zh-hant": "洞穴——但先確認深處有沒有危險" }, trait: "clever" },
      { text: { en: "The tree — I can weather any storm", es: "El árbol — puedo resistir cualquier tormenta", fr: "L'arbre — je peux survivre à n'importe quel orage", de: "Der Baum — ich überstehe jeden Sturm", it: "L'albero — posso resistere a qualsiasi tempesta", ja: "木 — どんな嵐でも耐えられる", ko: "나무 — 어떤 폭풍도 견딜 수 있어", "zh-hans": "树下——任何风雨我都能扛", "zh-hant": "樹下——任何風雨我都能扛" }, trait: "tough" },
      { text: { en: "Sprint to whichever is closer", es: "Corre a toda velocidad hacia el que esté más cerca", fr: "Foncez vers celui qui est le plus proche", de: "Sprint zu dem, was näher ist", it: "Scatta verso quello più vicino", ja: "より近い方に全力で走る", ko: "더 가까운 쪽으로 전력 질주한다", "zh-hans": "全速冲向离你更近的那个", "zh-hant": "全速衝向離你更近的那個" }, trait: "quick" },
    ],
  },
  {
    text: { en: "You find a baby Pokémon crying alone. It looks scared of you. What do you do?", es: "Encuentras un Pokémon bebé llorando solo. Parece asustado de ti. ¿Qué haces?", fr: "Vous trouvez un bébé Pokémon qui pleure seul. Il a l'air effrayé par vous. Que faites-vous ?", de: "Du findest ein Baby-Pokémon, das allein weint. Es wirkt ängstlich vor dir. Was tust du?", it: "Trovi un cucciolo di Pokémon che piange da solo. Sembra spaventato da te. Cosa fai?", ja: "一人で泣いている子ポケモンを見つけた。あなたを見て怯えている。どうする？", ko: "혼자 울고 있는 아기 포켓몬을 발견했다. 너를 보고 겁먹은 것 같다. 어떻게 할까?", "zh-hans": "你发现一只宝可梦宝宝独自哭泣。它看起来很怕你。你会怎么做？", "zh-hant": "你發現一隻寶可夢寶寶獨自哭泣。牠看起來很怕你。你會怎麼做？" },
    answers: [
      { text: { en: "Sit nearby and wait for it to come to you", es: "Siéntate cerca y espera a que se acerque", fr: "Asseyez-vous à proximité et attendez qu'il vienne à vous", de: "Setz dich in die Nähe und warte, bis es zu dir kommt", it: "Siediti vicino e aspetta che venga da te", ja: "近くに座ってこちらに来るのを待つ", ko: "가까이 앉아 스스로 다가오기를 기다린다", "zh-hans": "坐在附近，等它自己靠近", "zh-hant": "坐在附近，等牠自己靠近" }, trait: "gentle" },
      { text: { en: "Offer food from your bag gently", es: "Ofrécele comida de tu bolsa con suavidad", fr: "Proposez-lui doucement de la nourriture de votre sac", de: "Biete ihm sanft etwas zu essen aus deiner Tasche an", it: "Offrigli del cibo dalla tua borsa con dolcezza", ja: "バッグから食べ物を優しく差し出す", ko: "가방에서 먹이를 부드럽게 내민다", "zh-hans": "从包里轻轻拿出食物递给它", "zh-hant": "從包裡輕輕拿出食物遞給牠" }, trait: "gentle" },
      { text: { en: "Look around for its parents", es: "Busca a sus padres alrededor", fr: "Cherchez ses parents autour de vous", de: "Suche in der Umgebung nach seinen Eltern", it: "Cerca i suoi genitori in giro", ja: "親を探して周りを見回す", ko: "주변에서 부모를 찾아본다", "zh-hans": "环顾四周，寻找它的父母", "zh-hant": "環顧四周，尋找牠的父母" }, trait: "clever" },
      { text: { en: "Pick it up — it needs to come with us", es: "Recógelo — tiene que venir con nosotros", fr: "Prenez-le — il doit venir avec nous", de: "Heb es auf — es muss mit uns kommen", it: "Prendilo — deve venire con noi", ja: "抱き上げる — 一緒に来てもらう", ko: "안아 올린다 — 우리와 함께 가야 해", "zh-hans": "把它抱起来——它得跟我们走", "zh-hant": "把牠抱起來——牠得跟我們走" }, trait: "brave" },
      { text: { en: "Stay alert — its parents might be dangerous", es: "Mantente alerta — sus padres podrían ser peligrosos", fr: "Restez sur vos gardes — ses parents pourraient être dangereux", de: "Bleib wachsam — seine Eltern könnten gefährlich sein", it: "Resta in allerta — i suoi genitori potrebbero essere pericolosi", ja: "警戒する — 親が危ないかもしれない", ko: "경계를 늦추지 않는다 — 부모가 위험할 수도 있어", "zh-hans": "保持警惕——它的父母可能有危险", "zh-hant": "保持警惕——牠的父母可能有危險" }, trait: "tough" },
    ],
  },
  {
    text: { en: "You're racing against time to reach a destination. A river blocks your path. What do you do?", es: "Corres contra el tiempo para llegar a un destino. Un río bloquea tu camino. ¿Qué haces?", fr: "Vous êtes pressé par le temps pour atteindre une destination. Une rivière bloque votre chemin. Que faites-vous ?", de: "Du bist in Zeitnot, um ein Ziel zu erreichen. Ein Fluss versperrt dir den Weg. Was tust du?", it: "Stai correndo contro il tempo per raggiungere una destinazione. Un fiume blocca il tuo cammino. Cosa fai?", ja: "目的地に急いでいる。川が道を塞いでいる。どうする？", ko: "목적지까지 시간이 촉박하다. 강이 길을 막고 있다. 어떻게 할까?", "zh-hans": "你在争分夺秒赶往目的地。一条河流挡住了去路。你会怎么做？", "zh-hant": "你在爭分奪秒趕往目的地。一條河流擋住了去路。你會怎麼做？" },
    answers: [
      { text: { en: "Dive in and swim across immediately", es: "Zambúllete y cruza a nado de inmediato", fr: "Plongez et traversez à la nage immédiatement", de: "Spring hinein und schwimm sofort hinüber", it: "Tuffati e attraversa a nuoto immediatamente", ja: "即座に飛び込んで泳ぎ切る", ko: "즉시 뛰어들어 헤엄쳐 건넌다", "zh-hans": "立刻跳下去游过去", "zh-hant": "立刻跳下去游過去" }, trait: "brave" },
      { text: { en: "Find the shallowest point and cross carefully", es: "Encuentra el punto menos profundo y cruza con cuidado", fr: "Trouvez l'endroit le moins profond et traversez prudemment", de: "Finde die flachste Stelle und überquere sie vorsichtig", it: "Trova il punto meno profondo e attraversa con cautela", ja: "最も浅い場所を探して慎重に渡る", ko: "가장 얕은 지점을 찾아 신중하게 건넌다", "zh-hans": "找到最浅的地方小心蹚过去", "zh-hant": "找到最淺的地方小心蹚過去" }, trait: "clever" },
      { text: { en: "Run along the bank at full speed looking for a bridge", es: "Corre por la orilla a toda velocidad buscando un puente", fr: "Longez la rive à toute vitesse à la recherche d'un pont", de: "Lauf am Ufer entlang auf der Suche nach einer Brücke", it: "Corri lungo la riva a tutta velocità cercando un ponte", ja: "橋を探すため岸を全力で走る", ko: "다리를 찾아 강둑을 따라 전력으로 달린다", "zh-hans": "沿着河岸全速奔跑寻找桥梁", "zh-hant": "沿著河岸全速奔跑尋找橋樑" }, trait: "quick" },
      { text: { en: "Wade through — no river stops me", es: "Cruza a pie — ningún río me detiene", fr: "Traversez à pied — aucune rivière ne m'arrête", de: "Wat hindurch — kein Fluss hält mich auf", it: "Guada attraverso — nessun fiume mi ferma", ja: "ずぶぬれで渡る — どんな川も止まれない", ko: "걸어서 건넌다 — 어떤 강도 나를 막을 수 없어", "zh-hans": "直接蹚过去——没有河流能拦住我", "zh-hant": "直接蹚過去——沒有河流能攔住我" }, trait: "tough" },
      { text: { en: "Call out to see if any Water Pokémon can help", es: "Llama para ver si algún Pokémon de agua puede ayudar", fr: "Appelez pour voir si un Pokémon Eau peut aider", de: "Rufe, um zu sehen, ob ein Wasser-Pokémon helfen kann", it: "Chiama per vedere se qualche Pokémon d'acqua può aiutare", ja: "水ポケモンに協力を頼んでみる", ko: "물 포켓몬이 도와줄 수 있는지 소리쳐 물어본다", "zh-hans": "出声呼唤，看看有没有水属性宝可梦能帮忙", "zh-hant": "出聲呼喚，看看有沒有水屬性寶可夢能幫忙" }, trait: "gentle" },
    ],
  },
  {
    text: { en: "You reach the end of the dungeon. A powerful Pokémon blocks the exit. It looks angry but tired. What's your approach?", es: "Llegas al final de la mazmorra. Un poderoso Pokémon bloquea la salida. Parece enojado pero cansado. ¿Cuál es tu estrategia?", fr: "Vous atteignez le bout du donjon. Un puissant Pokémon bloque la sortie. Il a l'air en colère mais fatigué. Quelle est votre approche ?", de: "Du erreichst das Ende des Verlieses. Ein mächtiges Pokémon versperrt den Ausgang. Es wirkt wütend, aber müde. Wie gehst du vor?", it: "Raggiungi la fine del dungeon. Un potente Pokémon blocca l'uscita. Sembra arrabbiato ma stanco. Qual è il tuo approccio?", ja: "ダンジョンの終わりに到着した。強いポケモンが出口を塞いでいる。怒っているが疲れている。どうする？", ko: "던전 끝에 도착했다. 강한 포켓몬이 출구를 막고 있다. 화가 났지만 지쳐 보인다. 어떻게 접근할까?", "zh-hans": "你到达了迷宫尽头。一只强大的宝可梦挡住了出口。它看起来很愤怒但也很疲惫。你会采取什么策略？", "zh-hant": "你到達了迷宮盡頭。一隻強大的寶可夢擋住了出口。牠看起來很憤怒但也很疲憊。你會採取什麼策略？" },
    answers: [
      { text: { en: "Challenge it head-on — this is what I trained for", es: "Rétalo de frente — para esto me entrené", fr: "Affrontez-le de front — c'est pour ça que je me suis entraîné", de: "Fordere es direkt heraus — dafür habe ich trainiert", it: "Sfidalo a viso aperto — è per questo che mi sono allenato", ja: "正面から挑む — これが修行の成果を見せる時", ko: "정면으로 덤빈다 — 이때를 위해 훈련해 왔어", "zh-hans": "正面挑战它——这就是我训练的意义", "zh-hant": "正面挑戰牠——這就是我訓練的意義" }, trait: "brave" },
      { text: { en: "Try to talk it down and find a peaceful solution", es: "Intenta calmarlo y encuentra una solución pacífica", fr: "Essayez de l'apaiser et trouvez une solution pacifique", de: "Versuche, es zu beruhigen und finde eine friedliche Lösung", it: "Cerca di calmarlo e trova una soluzione pacifica", ja: "落ち着かせて平和的な解決策を探す", ko: "진정시키고 평화로운 해결책을 찾아본다", "zh-hans": "试着安抚它，寻找和平的解决办法", "zh-hant": "試著安撫牠，尋找和平的解決辦法" }, trait: "gentle" },
      { text: { en: "Look for another way around it", es: "Busca otra forma de rodearlo", fr: "Cherchez un autre chemin pour le contourner", de: "Suche einen anderen Weg daran vorbei", it: "Cerca un altro modo per aggirarlo", ja: "迂回路がないか探す", ko: "우회할 다른 길을 찾아본다", "zh-hans": "寻找绕过它的其他路", "zh-hant": "尋找繞過牠的其他路" }, trait: "clever" },
      { text: { en: "Outlast it — it's tired, I just need to hold on", es: "Resístelo — está cansado, solo tengo que aguantar", fr: "Endurez sa fatigue — il est fatigué, je n'ai qu'à tenir bon", de: "Überdauere es — es ist müde, ich muss nur durchhalten", it: "Resisti più a lungo — è stanco, devo solo resistere", ja: "持久戦に持ち込む — 相手は疲れている", ko: "지구력으로 승부한다 — 상대는 지쳐 있으니 버티기만 하면 돼", "zh-hans": "比它更持久——它累了，我只要撑住", "zh-hant": "比牠更持久——牠累了，我只要撐住" }, trait: "tough" },
      { text: { en: "Dash past it before it can react", es: "Pasa corriendo antes de que pueda reaccionar", fr: "Foncez devant lui avant qu'il ne réagisse", de: "Schnell daran vorbei, bevor es reagieren kann", it: "Sfreccia oltre prima che possa reagire", ja: "反応する前に素早く通り抜ける", ko: "반응하기 전에 재빨리 지나간다", "zh-hans": "趁它反应过来之前冲过去", "zh-hant": "趁牠反應過來之前衝過去" }, trait: "quick" },
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
      const nature = pickNature(accountId + '-' + starter.pokemonId);
      const [stats, moves] = await Promise.all([
        computeStats(starter.pokemonId, 5, nature),
        getMovesAtLevel(starter.pokemonId, 5),
      ]);

      await saveProfile(accountId, {
        quiz_result: trait,
        starter_id: starter.pokemonId,
      });

      await addTeamMember(accountId, {
        pokemon_id: starter.pokemonId,
        nickname: starter.name,
        level: 5,
        // Seed lifetime EXP to the cost of reaching level 5 so the EXP bar
        // starts at 0 progress (matches handleEnemyDefeated's fallback).
        exp: cumulativeExp(5),
        hp: stats.hp,
        max_hp: stats.maxHp,
        nature,
        moves,
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
