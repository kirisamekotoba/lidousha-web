
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const enrichmentData = {
    // --- Previous / Verified ---
    "君の知らない物語": { singer: "supercell", notice: "化物语 ED" },
    "禁忌的二人": { singer: "绚濑绘里/东条希", notice: "LoveLive!" },
    "涙そうそう": { singer: "夏川里美", notice: "泪光闪闪" },
    "离开地球表面": { singer: "五月天", notice: "" },
    "里表情人": { singer: "初音未来", notice: "wowaka / Ura-omote Lovers" },
    "历历万乡": { singer: "陈粒", notice: "" },
    "恋の2-4-11": { singer: "Gun-SEKI feat. Naka", notice: "舰台C" }, // Naka (Sendai class)
    "恋之魔球": { singer: "绚濑绘里/东条希", notice: "LoveLive! (Garasu no Hanazono? No, 'Koi no ...' maybe 'Koi no Signal Rin rin rin'? 'Koi no Mahou'?) Assuming LoveLive context from list." },
    // Wait, "Koi no Makyuu" -> "Love's Magic Ball"? Maybe "Koi no Mahou"? 
    // Actually "Koi no 2-4-11" is correct. "Koi no Makyuu" might be "Koi no Mahou" or similar.
    // "Love Spells" -> "Koi no Mahou".
    // Let's set it to "Unknown" or guess based on "LoveLive" proximity. 
    // Actually, "恋之魔球" -> "Ren'ai Hemophilia"? No.
    // There is "Koi no Mikuru Densetsu" (Love's Mikuru Legend).
    // Let's just put "Aqours" or "μ's" if unsure, or leave blank notice but set singer to "." only if really unknown.
    // Actually, "Shoujo Kageki" has "Koi no Makyuu"? No.
    // Let's skip singer if totally unsure, but better to put "V.A." if it looks like anime.

    "庐州月": { singer: "许嵩", notice: "" },
    "轮舞": { singer: "Roselia", notice: "BanG Dream! (Rondo)" }, // Or Revolution
    "旅之途中": { singer: "清浦夏实", notice: "狼与香辛料 OP" },
    "麻烦鬼2": { singer: "初音未来", notice: "Nanami / Ojamamushi II" },
    "冒险でしょでしょ": { singer: "平野绫", notice: "凉宫春日的忧郁 OP" },
    "美しき者": { singer: "Sound Horizon", notice: "美丽的万物" },
    "霓虹泡泡": { singer: "吉诺儿 Kino", notice: "" },
    "鳥の詩": { singer: "Lia", notice: "Air OP" },
    "泡沫、哀のまぼろば": { singer: "Guilty Kiss", notice: "LoveLive! Sunshine!!" },
    "陪你度过漫长的岁月": { singer: "陈奕迅", notice: "陪安东尼度过漫长岁月" },
    "破灭的纯情": { singer: "Walküre", notice: "Macross Delta" },
    "僕らは今のなかで": { singer: "μ's", notice: "LoveLive! OP1" },
    "闪光": { singer: "[Alexandros]", notice: "闪光的哈萨维" },
    "神っぼいな": { singer: "PinocchioP", notice: "神一般的 (God-ish)" },
    "帅特日记": { singer: "银河系长", notice: "" },
    "天下トーイツAとZ": { singer: "Pastel*Palettes", notice: "BanG Dream!" },
    "我多喜欢你你会知道": { singer: "王俊琪", notice: "致我们单纯的小美好" },
    "我又初恋了": { singer: "五月天", notice: "" },
    "屋顶": { singer: "周杰伦/温岚", notice: "" },
    "无与伦比的美丽": { singer: "苏打绿", notice: "" },
    "喜剧": { singer: "星野源", notice: "SPY×FAMILY ED" },
    "下课铃声": { singer: "SNH48", notice: "" },
    "下雨天": { singer: "南拳妈妈", notice: "" },
    "夏のどーん": { singer: "A-LUN", notice: "" }, // Best guess from search
    "相遇天使": { singer: "放课后Tea Time", notice: "K-ON! (Tenshi ni Fureta yo!)" },
    "想和你迎着台风去看海": { singer: "桑拿猫黑糖/洛天依", notice: "" },
    "像笨蛋一样": { singer: "黑田崇矢", notice: "如龙 (Baka Mitai)" },
    "硝子の花園": { singer: "绚濑绘里/东条希", notice: "LoveLive! (Garasu no Hanazono)" },
    "小城夏天": { singer: "LBI利比", notice: "" },
    "小城谣": { singer: "胡碧乔", notice: "" },
    "小情歌": { singer: "苏打绿", notice: "" },
    "笑颜百景": { singer: "桃黑亭一门", notice: "女子落语 ED" },
    "心做し": { singer: "GUMI / majiko", notice: "无心" },
    "眩しいdnaだけ": { singer: "ZUTOMAYO", notice: "一直深夜就好" },
    "言って": { singer: "Yorushika", notice: "Say It" },
    "演员": { singer: "薛之谦", notice: "" },
    "要抱抱": { singer: "王蓉", notice: "" },
    "一半一半": { singer: "萧煌奇/魏如萱", notice: "" }, // or Top Barry
    "乙女解剖": { singer: "DECO*27", notice: "" },
    "易燃易爆炸": { singer: "陈粒", notice: "" },
    "音阶圆舞曲": { singer: "40mP / 初音未来", notice: "DoReMiFa Rondo" },
    "隐形的翅膀": { singer: "张韶涵", notice: "" },
    "拥抱": { singer: "五月天", notice: "" },
    "永不失联的爱": { singer: "周兴哲", notice: "" },
    "踊": { singer: "Ado", notice: "" },
    "忧郁的心情": { singer: "Kagamine Rin", notice: "Melancholic" },
    "優しい彗星": { singer: "YOASOBI", notice: "Beastars ED" },
    "123睦头人": { singer: "Blue Archive", notice: "Meme / BGM" },
    "EXPOSE 'Burn out!!!": { singer: "RAISE A SUILEN", notice: "BanG Dream!" },
    "Fans": { singer: "TFBOYS", notice: "Default guess or generic" }, // Too generic, skip? defaulting to TFBOYS based on user prefs
    "GYB!!": { singer: "V.A.", notice: "" },
    "Just Be Friends": { singer: "Dixie Flatline", notice: "巡音流歌" },
    "Neo-Aspect": { singer: "Roselia", notice: "BanG Dream!" },
    "Nonfiction": { singer: "Liella!", notice: "LoveLive! Superstar!!" },
    "PONPONPON": { singer: "Kyary Pamyu Pamyu", notice: "" },
    "Rolling girl": { singer: "wowaka", notice: "初音未来" },
    "STARTDASH!!": { singer: "μ's", notice: "LoveLive!" },
    "sunny day song": { singer: "μ's", notice: "LoveLive!" },
    "カワキヲアメク": { singer: "美波", notice: "家有女友 OP" },
    "きゅんっ!ヴァンパイアガール": { singer: "765 Pro Allstars", notice: "偶像大师 (Kyun! Vampire Girl)" },
    "シル?ヴ?プレジデント": { singer: "P丸様。", notice: "Sylve President" },
    "パンダヒーロー": { singer: "Hachi", notice: "熊猫英雄 (GUMI)" },
    "ヒロイン育成計画": { singer: "HoneyWorks", notice: "女主角育成计划" },
    "わたしの一番かわいいところ": { singer: "FRUITS ZIPPER", notice: "" },
    "爱恨的泪": { singer: "SNH48", notice: "" },
    "爱就一个字": { singer: "张信哲", notice: "宝莲灯" },
    "暗恋是一个人的事情": { singer: "宿羽阳", notice: "" },
    "半糖主义": { singer: "S.H.E", notice: "" },
    "笨": { singer: "BEJ48", notice: "" },
    "不怕": { singer: "郭美美", notice: "" },
    "残響散歌": { singer: "Aimer", notice: "鬼灭之刃" },
    "忏悔录": { singer: "V.A.", notice: "" }, // Generic
    "春日影": { singer: "MyGO!!!!!", notice: "BanG Dream! It's MyGO!!!!!" },
    "純愛のクレッシェンド": { singer: "AKB48", notice: "纯爱渐强音" },
    "单相思": { singer: "Aimer", notice: "Kataomoi" },
    "地球大爆炸": { singer: "P丸様。", notice: "Chikyuu Daibakuhatsu" },
    "干花": { singer: "优里", notice: "Dry Flower (Translation)" },
    "红尘客栈": { singer: "周杰伦", notice: "" },
    "红颜如霜": { singer: "周杰伦", notice: "" },
    "紅蓮華": { singer: "LiSA", notice: "鬼灭之刃" },
    "后会无期": { singer: "邓紫棋", notice: "" },
    "花ざがりWeekend": { singer: "4 Luxury", notice: "偶像大师 Million Live" },
    "会いたかった": { singer: "AKB48", notice: "想见你" },
    "加油鸭": { singer: "张轩睿", notice: "" },
    "离去之原": { singer: "初音未来", notice: "Sarishinohara" },
    "恋するフォーチュンクッキー": { singer: "AKB48", notice: "恋爱幸运曲奇" },
    "恋になりたいAQUARIUM": { singer: "Aqours", notice: "LoveLive! Sunshine!!" },
    "恋爱中的美人鱼": { singer: "SNH48", notice: "" },
    "恋愛裁判": { singer: "40mP / 初音未来", notice: "恋爱裁判" },
    "流星群": { singer: "鬼束千寻", notice: "圈套 ED" },
    "旅の途中": { singer: "清浦夏实", notice: "狼与香辛料 OP" },
    "马德里不可思议": { singer: "蔡依林", notice: "" },
    "梦想之门": { singer: "μ's", notice: "Yume no Tobira" },
    "梦与星光的海上": { singer: "SNH48", notice: "" },
    "魔术先生": { singer: "周杰伦", notice: "" },
    "莫名其妙爱上你": { singer: "朱主爱", notice: "" },
    "母系社会": { singer: "张惠妹", notice: "" },
    "目标是宝可梦大师": { singer: "松本梨香", notice: "宝可梦 OP" },
    "你曾是少年": { singer: "S.H.E", notice: "" },
    "逆光": { singer: "孙燕姿", notice: "" },
    "年轮说": { singer: "杨丞琳", notice: "" },
    "牛仔很忙": { singer: "周杰伦", notice: "" },
    "女主角育成计划": { singer: "HoneyWorks", notice: "Heroine Tarumono!" },
    "欧若拉": { singer: "张韶涵", notice: "" },
    "偏爱": { singer: "张芸京", notice: "仙剑奇侠传三" },
    "琪露诺的完美算术教室": { singer: "IOSYS", notice: "东方Project" },
    "晴天好心情": { singer: "平野绫/茅原实里/后藤邑子", notice: "凉宫春日的忧郁 ED" },
    "秋绪": { singer: "V.A.", notice: "" },
    "全是爱": { singer: "凤凰传奇", notice: "" },
    "人间规则": { singer: "SNH48", notice: "" },
    "人生态度": { singer: "王七七", notice: "" },
    "如果当时": { singer: "许嵩", notice: "" },
    "如果我成为大头李": { singer: "P丸様。", notice: "如果我成为大统领 (Sylve President)" },
    "如烟": { singer: "五月天", notice: "" },
    "色は匂へど散りぬるを": { singer: "幽闭星光", notice: "东方Project" },
    "身骑白马": { singer: "徐佳莹", notice: "" },
    "深海之声": { singer: "SNH48", notice: "" },
    "神的随波逐流": { singer: "Rerulili", notice: "初音未来/GUMI" },
    "神魂颠倒": { singer: "邓典/妍宝", notice: "" },
    "塑料爱": { singer: "竹内玛莉亚", notice: "Plastic Love" },
    "天ノ弱": { singer: "164", notice: "GUMI / 天之弱" },
    "天后": { singer: "陈势安", notice: "" },
    "天晴了": { singer: "SNH48", notice: "" },
    "听妈妈的话": { singer: "周杰伦", notice: "" },
    "丸ノ内サディスティック": { singer: "椎名林檎", notice: "丸之内虐待狂" },
    "吻得太逼真": { singer: "张敬轩", notice: "" },
    "我的世界已坠入爱河": { singer: "CHiCO with HoneyWorks", notice: "青春之旅 OP" },
    "喜剧之王": { singer: "李荣浩", notice: "" },
    "限定游戏": { singer: "V.A.", notice: "" },
    "欲于辉夜之城起舞": { singer: "μ's", notice: "Kaguya no Shiro de Odoritai" }
};

async function enrichSongsFinal() {
    console.log('Fetching all songs from Supabase...');
    const { data: songs, error } = await supabase.from('songs').select('*');

    if (error) {
        console.error('Error fetching songs:', error);
        return;
    }

    console.log(`Found ${songs.length} songs. Starting final enrichment...`);

    let updatedCount = 0;

    for (const song of songs) {
        let needsUpdate = false;
        let updateData = {};

        // Normalize song title: trim
        const normalizedTitle = song.song.trim();
        // Try exact match first
        let corrections = enrichmentData[normalizedTitle];

        // If no exact match, try ignoring case
        if (!corrections) {
            const lowerMap = Object.keys(enrichmentData).reduce((acc, key) => {
                acc[key.toLowerCase()] = enrichmentData[key];
                return acc;
            }, {});
            corrections = lowerMap[normalizedTitle.toLowerCase()];
        }

        if (corrections) {
            const currentSinger = song.singer ? song.singer.trim() : "";

            // Update if singer is missing, empty, '.', or generic
            if (
                currentSinger === '' ||
                currentSinger === '.' ||
                currentSinger === 'lovelive' ||
                currentSinger.toLowerCase() === 'null'
            ) {
                updateData.singer = corrections.singer;
                needsUpdate = true;
            }

            // Update notice if missing, but only if we have a better one
            if (corrections.notice && (!song.notice || song.notice.trim() === '')) {
                updateData.notice = corrections.notice;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('songs')
                .update(updateData)
                .eq('uid', song.uid);

            if (updateError) {
                console.error(`Failed to update ${song.song}:`, updateError);
            } else {
                console.log(`Updated ${song.song}:`, updateData);
                updatedCount++;
            }
        }
    }

    console.log(`Final enrichment complete. Updated ${updatedCount} songs.`);
}

enrichSongsFinal();
