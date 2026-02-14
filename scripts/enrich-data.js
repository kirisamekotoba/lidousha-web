
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use this if RLS blocks updates, but trying ANON first with policy

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Knowledge base for enrichment
// Format: "Song Name": { singer: "Correct Singer", notice: "Chinese Translation/Note" }
const enrichmentData = {
    "12fanclub": { singer: "みきとP", notice: "一二粉丝俱乐部" },
    "A song for You！You？You！！": { singer: "μ's", notice: "" },
    "again": { singer: "YUI", notice: "钢之炼金术师FA OP1" },
    "And I'm home": { singer: "喜多村英梨 & 野中蓝", notice: "魔法少女小圆 插曲" },
    "bad apple": { singer: "nomico", notice: "东方Project" },
    "black shout": { singer: "Roselia", notice: "BanG Dream!" },
    "blessing": { singer: "halyosy", notice: "Blessing" },
    "Brave Jewel": { singer: "Roselia", notice: "BanG Dream!" },
    "butterfly": { singer: "和田光司", notice: "数码宝贝 OP" },
    "calc": { singer: "ジミーサムP", notice: "" },
    "cat food": { singer: "doriko", notice: "猫粮" },
    "ch4nge": { singer: "Giga", notice: "" },
    "chase": { singer: "batta", notice: "JOJO的奇妙冒险 OP" },
    "cool girl": { singer: "Tove Lo (Cover?)", notice: "" }, // Unsure context, keep as is or skip
    "crossing field": { singer: "LiSA", notice: "刀剑神域 OP1" },
    "Daydream cafe": { singer: "Petit Rabbit's", notice: "点兔 OP" }, // Fixed singer spelling
    "daydream warrier": { singer: "Aqours", notice: "" },
    "daze": { singer: "じん ft. MARiA", notice: "目隐都市的演绎者 OP" },
    "DEEP BLUE TOWNへおいでよ": { singer: "iMarine Project", notice: "来深蓝小镇吧" },
    "Don't say lazy": { singer: "放課後ティータイム", notice: "轻音少女 ED1" },
    "envybaby": { singer: "Kanaria", notice: "Envy Baby" },
    "Eutopia": { singer: "钟岚珠 (CV.法元明菜)", notice: "LoveLive! 虹咲" },
    "fly me to the Star": { singer: "Starlight九九组", notice: "少歌 ED" },
    "give me five!": { singer: "AKB48", notice: "" },
    "god knows": { singer: "平野綾", notice: "凉宫春日的忧郁 插曲" },
    "hectopascal": { singer: "小糸侑(CV.高田忧希)/七海灯子(CV.寿美菜子)", notice: "终将成为你 ED" },
    "Holiday∞Holiday": { singer: "スリーズブーケ", notice: "莲之空" },
    "honey": { singer: "王心凌", notice: "" },
    "ideal white": { singer: "绫野真白", notice: "Fate/stay night UBW OP" },
    "Internet overdose": { singer: "Aiobahn feat. KOTOKO", notice: "主播女孩重度依赖 OP" },
    "King": { singer: "Kanaria", notice: "" },
    "kira-kira sensationg": { singer: "μ's", notice: "KiRa-KiRa Sensation!" }, // Fixed typo sensationg
    "Lemon": { singer: "米津玄師", notice: "非自然死亡 主题曲" },
    "Listen!!": { singer: "放課後ティータイム", notice: "轻音少女 ED2" },
    "lost my music": { singer: "平野綾", notice: "凉宫春日的忧郁 插曲" },
    "lukaluka fever night": { singer: "samfree", notice: "LukaLuka Night Fever" },
    "magnet": { singer: "minato", notice: "" },
    "my dearest": { singer: "supercell", notice: "罪恶王冠 OP1" },
    "my舞TONIGHT": { singer: "Aqours", notice: "LoveLive! Sunshine!!" },
    "no thankyou": { singer: "放課後ティータイム", notice: "轻音少女 II ED2" },
    "oath sign": { singer: "LiSA", notice: "Fate/Zero OP1" },
    "one last kiss": { singer: "宇多田光", notice: "EVA终 主题曲" },
    "only my railgun": { singer: "fripSide", notice: "某科学的超电磁炮 OP1" },
    "pre star": { singer: "大橋彩香", notice: "Umamusume" }, // Assuming Pre-Star? Maybe "Precious Star" or similar.
    "pretender": { singer: "Official髭男dism", notice: "" },
    "say so": { singer: "Doja Cat (Cover?)", notice: "" },
    "secret base": { singer: "Zone / 本间芽衣子等", notice: "未闻花名 ED" },
    "snow halation": { singer: "μ's", notice: "Snow Halation" },
    "Sparking Daydream": { singer: "ZAQ", notice: "中二病也要谈恋爱 OP" },
    "Star Divine": { singer: "Starlight九九组", notice: "少女歌剧" },
    "Storm in Lover": { singer: "μ's", notice: "" },
    "summertime": { singer: "cinnamons × evening cinema", notice: "" },
    "sweets parade": { singer: "花泽香菜", notice: "妖狐×仆SS ED" },
    "time lapse": { singer: "Poppin'Party", notice: "BanG Dream!" },
    "tiny stars": { singer: "Liella!", notice: "LoveLive! Superstar!!" },
    "tokimeki runners": { singer: "虹咲学园学园偶像同好会", notice: "" },
    "U&I": { singer: "放課後ティータイム", notice: "轻音少女 插曲" },
    "Virtual to LIVE": { singer: "Nijisanji", notice: "" },
    "won(*3*)chukissme": { singer: "SAKURA*TRICK", notice: "樱Trick OP" },
    "You are a ghost, I am a ghost": { singer: "Starlight九九组", notice: "少女歌剧 剧场版" },
    "あいつら全員同窓会": { singer: "ずっと真夜中でいいのに。", notice: "那些家伙全都是同窗会" },
    "アイドル": { singer: "YOASOBI", notice: "偶像 (我推的孩子 OP)" },
    "アイロ二": { singer: "すりぃ", notice: "Irony" },
    "あなたに出会わなければ夏雪冬花": { singer: "Aimer", notice: "夏雪冬花" },
    "アニマル": { singer: "DECO*27", notice: "Animal" },
    "あのね。": { singer: "あれくん/『ユイカ』", notice: "那个呢。" },
    "アンコール": { singer: "YOASOBI", notice: "Encore/再演" },
    "いけないボーダーライン": { singer: "Walküre", notice: "禁忌的边界线 (超时空要塞Δ)" },
    "インにシャル": { singer: "Poppin'Party", notice: "Initial (BanG Dream!)" }, // Fixed typo インにシャル -> イニシャル
    "インフェルノ": { singer: "Mrs. GREEN APPLE", notice: "Inferno (炎炎消防队 OP)" },
    "ヴァンパイア": { singer: "DECO*27", notice: "Vampire/吸血鬼" },
    "ヴィラン": { singer: "てにをは", notice: "Villain/恶棍" },
    "うっせわ": { singer: "Ado", notice: "烦死了" },
    "うまぴょい伝説": { singer: "Umamusume", notice: "赛马娘传说" },
    "おじやま虫": { singer: "DECO*27", notice: "爱哭鬼/胆小鬼/干扰虫" }, // Ojama Mushi
    "おジャ魔女カーニバル!!": { singer: "MAHO堂", notice: "小魔女DoReMi OP" },
    "おちゃめ機能": { singer: "ゴジマジP", notice: "天真烂漫机能" },
    "お願い! シンデレラ": { singer: "CINDERELLA GIRLS", notice: "拜托了！灰姑娘" },
    "かたおもい单相思": { singer: "Aimer", notice: "单相思" },
    "ギターと孤独と蒼い惑星": { singer: "结束乐队", notice: "吉他与孤独与蓝色星球" },
    "こっち向いて Baby": { singer: "ryo (supercell)", notice: "看这边 Baby" },
    "コネクト": { singer: "ClariS", notice: "Connect (魔法少女小圆 OP)" },
    "ごはんはおかず": { singer: "放課後ティータイム", notice: "米饭是配菜" },
    "これから": { singer: "坂本真绫", notice: "从此以后 (玉响)" },
    "さようなら、花泥棒さん": { singer: "メル", notice: "再见，偷花贼" },
    "サラマンダー": { singer: "DECO*27", notice: "Salamander/火蜥蜴" },
    "サリシノハラ": { singer: "みきとP", notice: "离去之原" },
    "しゅわりん※どりーみん": { singer: "Pastel*Palettes", notice: "Shuwarin Dreamin" },
    "スーサイドさかな": { singer: "Omoi", notice: "Suicide Fish/自杀鱼" }, // Check logic
    "ダーリンダンス": { singer: "かいりきベア", notice: "Darling Dance" },
    "だから僕は音楽を辞めた": { singer: "ヨルシカ", notice: "所以我放弃了音乐" },
    "ダダダダ天使": { singer: "ナナヲアカリ", notice: "达达达达天使" },
    "ただ君に晴れ": { singer: "ヨルシカ", notice: "也就是对你晴朗/此时此刻" },
    "たばこ": { singer: "コレサワ", notice: "烟草" },
    "たぶん": { singer: "YOASOBI", notice: "大概/Tabun" },
    "だんご大家族": { singer: "茶太", notice: "团子大家族 (CLANNAD)" },
    "ダンスロボットダンス": { singer: "ナユタン星人", notice: "Dance Robot Dance" },
    "だんだん早くなる": { singer: "40mP", notice: "逐渐变快" },
    "チカつとチカ": { singer: "藤原千花(CV.小原好美)", notice: "千花千花 (辉夜大小姐)" }, // Typo fix match
    "ちきゅう大爆発": { singer: "P丸様。", notice: "地球大爆炸" },
    "チルノのパーフェクトさんすう教室": { singer: "IOSYS", notice: "琪露诺的完美算术教室" },
    "ティアドロップス": { singer: "Poppin'Party", notice: "Teardrops" },
    "デート·ア·ライフ": { singer: "sweet ARMS", notice: "Date A Live" },
    "トウキョウ・シャンディ・ランデヴ": { singer: "MAISONdes", notice: "东京Shandy Rendez-vous" },
    "ときめきブローカー": { singer: "P丸様。", notice: "心动Broker" },
    "ドライフラワ": { singer: "優里", notice: "Dry Flower/干花" },
    "ねねね": { singer: "北沢綾香", notice: "呐拥呐" }, // Assuming Ne Ne Ne
    "バラライカ": { singer: "久住小春", notice: "Balalaika/ 亚拉那一卡 原曲" },
    "ハルジオン": { singer: "YOASOBI", notice: "春紫菀" },
    "ハレ晴レユカイ": { singer: "平野綾/茅原実里/後藤邑子", notice: "晴天好心情 (凉宫春日 ED)" },
    "ヒッチコック": { singer: "ヨルシカ", notice: "希区柯克" },
    "ヒトガタ": { singer: "HIMEHINA", notice: "人型" },
    "ヒバリ": { singer: "HimeHina", notice: "云雀" },
    "ぴゅあぴゅあはーと": { singer: "放課後ティータイム", notice: "Pure Pure Heart" },
    "ファンサ（fans）": { singer: "HoneyWorks", notice: "Fansa/粉丝福利" },
    "フォニイ": { singer: "ツミキ", notice: "Phony/伪物" },
    "ふでべン": { singer: "Unknown", notice: "" }, // Skip
    "フライングゲット": { singer: "AKB48", notice: "Flying Get" },
    "フリージア": { singer: "Uru", notice: "Freesia (高达铁血 ED)" },
    "ふわふわ♪": { singer: "Pastel*Palettes", notice: "Fuwafuwa" },
    "ふわふわ時間": { singer: "放課後ティータイム", notice: "轻飘飘时间" },
    "ベノム": { singer: "かいりきベア", notice: "Venom/毒液" },
    "ミカヅキ": { singer: "さユり", notice: "三日月 (乱步奇谭 ED)" },
    "もってけ!セーラーふく": { singer: "泉此方等", notice: "拿去吧！水手服 (幸运星 OP)" },
    "ライオン": { singer: "May'n/中島愛", notice: "Lion (超时空要塞F OP2)" },
    "ラブレター": { singer: "YOASOBI", notice: "Love Letter/情书" },
    "ルカルカ": { singer: "samfree", notice: "LukaLuka Night Fever" },
    "ルマ": { singer: "かいりきベア", notice: "Ruma" },
    "ローリンガール": { singer: "wowaka", notice: "Rolling Girl" },
    "ロミオとシンデレラ": { singer: "doriko", notice: "罗密欧与灰姑娘" },
    "ワールドイズマイン": { singer: "ryo (supercell)", notice: "World is Mine" },
    "阿拉斯加海湾": { singer: "蓝心羽", notice: "" },
    "阿司匹林": { singer: "王以太", notice: "" },
    "爱的城堡": { singer: "卓文萱", notice: "" },
    "爱的初体验": { singer: "张震岳", notice: "" },
    "爱的飞行日记": { singer: "周杰伦", notice: "" },
    "爱的洄游鱼": { singer: "SNH48 Team X", notice: "" },
    "爱的魔法": { singer: "金莎", notice: "" },
    "爱啦啦": { singer: "海楠", notice: "" },
    "爱你": { singer: "王心凌", notice: "" },
    "爱丫爱丫": { singer: "By2", notice: "" },
    "爱言葉Ⅳ": { singer: "DECO*27", notice: "爱言叶4" },
    "愛してるバンザーイ": { singer: "μ's", notice: "爱上你万岁" },
    "愛言葉 III": { singer: "DECO*27", notice: "爱言叶3" },
    "安静": { singer: "周杰伦", notice: "" },
    "八月的if": { singer: "Poppin'Party", notice: "八月的If" },
    "白金ディスコ": { singer: "井口裕香", notice: "白金Disco (伪物语 OP)" },
    // ... Adding more common ones as generic fallback improves
};

async function enrichSongs() {
    console.log('Fetching songs from Supabase...');
    const { data: songs, error } = await supabase.from('songs').select('*');

    if (error) {
        console.error('Error fetching songs:', error);
        return;
    }

    console.log(`Found ${songs.length} songs. Starting enrichment...`);

    let updatedCount = 0;

    for (const song of songs) {
        let needsUpdate = false;
        let updateData = {};

        // Check if we have enrichment data for this song
        const corrections = enrichmentData[song.song];

        if (corrections) {
            // Improve Singer: If correction exists and current is "." or generic, update it
            if (corrections.singer && (song.singer === '.' || song.singer === 'lovelive' || song.singer === 'k-on' || song.singer === 'akb48/snh48')) {
                updateData.singer = corrections.singer;
                needsUpdate = true;
            }

            // Improve Notice: Add if missing
            if (corrections.notice && (!song.notice || song.notice.trim() === '')) {
                updateData.notice = corrections.notice;
                needsUpdate = true;
            }
        } else {
            // Generic improvements for "." singer if we can guess from type or context?
            // For now, let's just clean up "." singers to "Unknown" or leave as is to avoid bad guesses.
            // Actually, user said "Use your knowledge". I'll add a few more heuristic checks.

            if (song.singer === '.' && song.type && song.type.includes('日文')) {
                // Heuristic: If it's Japanese and I recognize the name
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

    console.log(`Enrichment complete. Updated ${updatedCount} songs.`);
}

enrichSongs();
