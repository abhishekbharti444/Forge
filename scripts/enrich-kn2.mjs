#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
const b = {}
function add(tid, p, body) { b[tid+'::'+p] = body }

// kn-008 food remaining
add('kn-008','ಹಣ್ಣಿನ ರಸ',"Pronounced HUN-ni-na RA-sa. Literally 'fruit juice.' 'Hannina' = of fruit, 'rasa' = juice/essence. Fresh juice stalls are everywhere in Karnataka — 'mosambhi rasa' (sweet lime juice) is the most popular. 'Rasa' also means 'taste' or 'essence' in a poetic sense.")
add('kn-008','ಉಪ್ಪಿನಕಾಯಿ',"Pronounced UP-pi-na-KAA-yi. Literally 'salt-fruit' — pickled vegetables/fruits preserved in salt, oil, and spices. Every Karnataka household has homemade uppinakayi. Mango pickle ('maavina uppinakayi') is the most common. It's served as a side with every meal and is a point of family pride.")

// kn-015 body parts remaining
add('kn-015','ಬಾಯಿ',"Pronounced BAA-yi. Mouth. 'Baayi muchchu' = shut your mouth (rude). 'Baayi ruchi' = tasty (literally 'mouth taste'). The idiom 'baayi bittkondu' means 'with mouth open' — expressing surprise. In polite speech, 'baayi' is used in food contexts: 'baayi-ge hittide' = it suits the mouth/palate.")
add('kn-015','ಕಿವಿ',"Pronounced KI-vi. Ear. 'Kivi kodu' = listen (literally 'give ear'). 'Kivi matu' = whispered words/gossip. Kannada has a rich set of ear-related idioms: 'kivi hinde' = behind the ear (secretly), 'kivi tumbide' = ears are full (tired of hearing something).")
add('kn-015','ಕೈ',"Pronounced KAI (rhymes with 'eye'). Hand. One of the most versatile words — 'kai kodu' = give a hand/help, 'kai bidu' = let go, 'kai haaku' = put your hand (touch). Eating with hands is traditional: 'kai-inda tinnu' = eat with hands. 'Kai' also means 'arm' in casual usage.")
add('kn-015','ಕಾಲು',"Pronounced KAA-lu. Leg/foot. 'Kaalu novu' = leg pain. Touching elders' feet ('kaalu mutthu') is a sign of deep respect in Karnataka. 'Kaalu haaku' = step in/enter. The word covers both 'leg' and 'foot' — context makes it clear which is meant.")
add('kn-015','ಬೆರಳ',"Pronounced BE-ra-la. Finger. 'Kai beralu' = hand finger, 'kaalu beralu' = toe (foot finger). 'Beralu torshu' = point (show finger). Counting on fingers is universal, and Kannada has specific words for each finger, though 'beralu' is the general term used most often.")
add('kn-015','ಹೊಟ್ಟೆ',"Pronounced HOT-te. Stomach/belly. 'Hotte hasivu' = hungry (stomach hunger). 'Hotte tumba' = stomach full. One of the most useful words for daily life — 'hotte novu' = stomachache. The idiom 'hotte urityde' = stomach is burning (very hungry or jealous).")
add('kn-015','ಬೆನ್ನ',"Pronounced BEN-na. Back (body part). 'Benna novu' = back pain. 'Benna hinde' = behind someone's back. 'Benna thattu' = pat on the back (encouragement). In Karnataka's agricultural communities, 'benna' is associated with hard work — 'benna mugidu' = back is broken (exhausted from labor).")

// kn-016 household remaining
add('kn-016','ಕಿಟಿಕಿ',"Pronounced KI-ta-ki. Window. A fun, rhythmic word. 'Kitaki tegeyi' = open the window. 'Kitaki hakko' = close the window. In traditional Karnataka homes, windows were small to keep out heat; modern apartments have larger ones.")
add('kn-016','ಕುರ್ಚಿ',"Pronounced KUR-chi. Chair — borrowed from Urdu/Hindi. 'Kurchi mele kootko' = sit on the chair. In traditional Karnataka homes, sitting on the floor was common; 'kurchi' represents modern furniture. 'Kurchi kodu' = give a chair (offer a seat to a guest).")
add('kn-016','ಮೇಜ',"Pronounced MAY-ja. Table — borrowed from Portuguese 'mesa' via Hindi. 'Meja mele ittu' = put it on the table. Like 'kurchi,' this is a borrowed word reflecting how furniture culture came to India. Traditional meals are served on the floor on banana leaves.")
add('kn-016','ಹಾಸಿ',"Pronounced HAA-si. Bed/mattress. 'Haasi haasu' = spread the bed. In many Karnataka homes, beds are rolled-up mattresses spread on the floor at night. 'Haasi mele malako' = lie down on the bed. The word also means 'to spread' — 'haasi' is both the noun and related to the verb.")
add('kn-016','ದೀಪ',"Pronounced DEE-pa. Lamp/light. 'Deepa hachu' = light the lamp. Lighting a lamp is central to Karnataka culture — every puja (prayer) begins with it. 'Deepavali' (Diwali) literally means 'row of lamps.' 'Deepa' carries spiritual significance beyond just illumination.")
add('kn-016','ಬಟ್ಟೆ',"Pronounced BUT-te. Clothes/cloth. 'Batte ogeyodu' = wash clothes. 'Hosa batte' = new clothes. Buying new clothes for festivals is a major tradition — 'habba batte' = festival clothes. 'Batte angadi' = cloth shop. The word covers both the material and the garment.")
add('kn-016','ಚೀಲ',"Pronounced CHEE-la. Bag. 'Cheela togo' = take the bag. 'Shaale cheela' = school bag. After Karnataka's plastic bag ban, 'batte cheela' (cloth bag) became common. The word is straightforward with no tricky pronunciation — one of the easier vocabulary items.")
add('kn-016','ಗುಡಿಸಲು',"Pronounced GU-di-sa-lu. Broom. 'Gudisalu kodu' = give the broom. 'Gudisu' is the verb 'to sweep.' In many households, sweeping is the first morning chore. 'Mane gudisu' = sweep the house. The broom is traditionally made from coconut palm fronds in coastal Karnataka.")

// kn-023 remaining directions
add('kn-023','ಮುಂದೆ',"Pronounced MUN-dhe. Front/ahead. 'Mundhe hogi' = go forward. 'Mundhe nodu' = look ahead. 'Mundhina' = next (the one ahead). Very useful in navigation: 'mundhina cross hattira' = near the next crossing. Also used for time: 'mundhina vaara' = next week.")
add('kn-023','ಹಿಂದೆ',"Pronounced HIN-dhe. Behind/back. 'Hinde nodu' = look behind. 'Hinde banni' = come back. Opposite of 'mundhe.' 'Hindhina' = previous. 'Hinde-mundhina' = back and forth. In traffic: 'hinde vehicle ide' = there's a vehicle behind.")
add('kn-023','ಮಧ್ಯ',"Pronounced MAD-hya. Middle/center. 'Madhya-dalli' = in the middle. 'Road madhya' = middle of the road. Also used figuratively: 'madhyastha' = mediator (one who stands in the middle). 'Madhya Pradesh' (the Indian state) literally means 'middle province.'")

// kn-024 time words
add('kn-024','ಇವತ್ತು',"Pronounced I-vat-tu. Today. 'Ivattu enu maadona?' = what shall we do today? One of the most common time words. 'Ivattu raatre' = tonight. The double 't' is important — hold it slightly longer. In casual speech, often shortened to 'ivattu' or even 'ivatt.'")
add('kn-024','ನಿನ್ನೆ',"Pronounced NIN-ne. Yesterday. 'Ninne enu aaytu?' = what happened yesterday? Simple and frequently used. 'Ninne raatre' = last night. 'Monne' = day before yesterday — Kannada has a specific word for this, unlike English which needs three words.")
add('kn-024','ನಾಳೆ',"Pronounced NAA-le. Tomorrow. 'Naale sigona' = see you tomorrow. 'Naale dina' = tomorrow's day. 'Naaliddu' = day after tomorrow — again, Kannada has a single word where English needs three. These time words (ninne, ivattu, naale) are among the first you should memorize.")

// kn-031 colors remaining
add('kn-031','ಹಳದಿ',"Pronounced HA-la-di. Yellow — related to 'haladi' (turmeric), which is yellow. Turmeric is sacred in Karnataka — 'haladi kumkuma' is a women's ceremony. 'Haladi banna' = yellow color. The connection between the spice and the color is built into the language.")
add('kn-031','ಬಿಳಿ',"Pronounced BI-li. White. 'Bili batte' = white clothes. White is associated with mourning in Karnataka (unlike Western culture where it's black). 'Bili akki' = white rice. 'Bili moda' = white cloud. A simple, common word with no tricky pronunciation.")
add('kn-031','ಕಪ್ಪು',"Pronounced KAP-pu. Black. 'Kappu kaafi' = black coffee. 'Kappu banna' = black color. The doubled 'p' is important. 'Kappu' can also describe dark complexion, though this usage is becoming less common as awareness of colorism grows.")
add('kn-031','ಕಿತ್ತಳೆ',"Pronounced KIT-ta-le. Orange — literally the name of the orange fruit. Like English, the color is named after the fruit. 'Kittale hannu' = orange fruit. 'Kittale banna' = orange color. The doubled 't' is characteristic of Kannada.")
add('kn-031','ನೇರಳೆ',"Pronounced NAY-ra-le. Purple — related to 'nerale' (jamun/java plum), a dark purple fruit common in Karnataka. The fruit gives its name to the color, similar to how 'orange' works in English. 'Nerale hannu' is a beloved seasonal fruit in Karnataka.")
add('kn-031','ಗುಲಾಬಿ',"Pronounced GU-laa-bi. Pink — literally 'rose' (from the rose flower). 'Gulaabi banna' = pink color. Borrowed from Persian/Urdu. 'Gulaabi' is used for both the flower and the color. 'Gulaabi jamoon' is a popular sweet — rose-colored milk dumplings.")
add('kn-031','ಬೂದು',"Pronounced BOO-dhu. Grey — related to 'boodi' (ash). 'Boodhu banna' = grey color. 'Boodhu aakaasha' = grey sky (overcast). Less commonly used than primary colors but useful for describing weather, hair ('boodhu koodalu' = grey hair), and clothing.")

// kn-032 weather
add('kn-032','ಮಳೆ',"Pronounced MA-zhe. Rain — one of the most important words in Karnataka, where monsoons define the agricultural calendar. 'Mazhe bartide' = it's raining (rain is coming). 'Mazhe kaala' = rainy season. Bangalore's famous pleasant weather is described as 'mazhe haava' (rainy climate).")
add('kn-032','ಬಿಸಿಲು',"Pronounced BI-si-lu. Sun/heat/sunshine. 'Bisilu jaasti' = too much sun. 'Bisilu hotta' = sunstroke. In summer, 'bisilu' is the most-discussed topic. 'Bisilu kudure' = mirage (literally 'sun horse'). 'Bisilu-mazzhe' = sun and rain together — considered auspicious.")
add('kn-032','ಗಾಳಿ',"Pronounced GAA-li. Wind/air. 'Gaali bartide' = wind is blowing. 'Tanna gaali' = cool breeze. 'Gaali pata' = kite (wind kite). Also means 'air' in general: 'gaali illade' = no air/stuffy. 'Gaali maatu' = empty talk (just wind/air).")

// kn-043 emotions
add('kn-043','ಖುಷಿ',"Pronounced KHU-shi. Happy/happiness. 'Tumba khushi' = very happy. Borrowed from Urdu/Hindi but fully naturalized in Kannada. 'Khushi aaytu' = became happy. Used constantly: 'nimage khushi aagide?' = are you happy? A warm, expressive word.")
add('kn-043','ದುಃಖ',"Pronounced DUH-kha. Sad/sorrow. A Sanskrit-origin word used across Indian languages. 'Dukha aagide' = feeling sad. 'Dukha pattkondu' = don't feel sad. More formal than casual speech — in everyday Kannada, people might say 'bejaar' (upset) instead.")
add('kn-043','ಕೋಪ',"Pronounced KO-pa. Angry/anger. 'Kopa bartide' = getting angry. 'Kopa maadkobedi' = don't get angry. 'Kopa-tapa' = anger and frustration (a common pairing). 'Kopishta' = angry person. A very useful word for understanding emotional conversations.")

// kn-048 workplace
add('kn-048','ಕೆಲಸ',"Pronounced KE-la-sa. Work/job. 'Kelsa maadu' = do work. 'Kelsa-kke hogbeku' = need to go to work. 'Kelsa illa' = no work/unemployed. One of the most common words in daily conversation. 'Enu kelsa?' = what work? (what do you do for a living?).")
add('kn-048','ಸಂಬಳ',"Pronounced SAM-ba-la. Salary/wages. 'Sambala bandide' = salary has come. 'Yeshtu sambala?' = how much salary? A practical word for professional contexts. 'Sambala dina' = payday. In casual conversation, asking about salary is more acceptable in India than in Western cultures.")
add('kn-048','ಚುಟ್ಟಿ',"Pronounced CHUT-ti. Holiday/leave. 'Chutti beku' = need a holiday. 'Chutti dina' = holiday/day off. 'Chutti haaku' = take leave. Borrowed from Hindi. 'Yeshtu dina chutti?' = how many days off? Essential for workplace conversations.")

// kn-051 animals
add('kn-051','ನಾಯಿ',"Pronounced NAA-yi. Dog. 'Nayi bega bartide' = the dog is coming fast. Street dogs are common in Karnataka — 'beedhi nayi' = street dog. 'Nayi mari' = puppy. The word is simple but important for daily life, especially for navigating streets where dogs are everywhere.")
add('kn-051','ಬೆಕ್ಕು',"Pronounced BEK-ku. Cat. 'Bekku bandide' = the cat has come. 'Bekku-nayi' = cat and dog (used like 'cats and dogs' in English for fighting). 'Bekku mari' = kitten. Less common as pets than dogs in Karnataka, but the word appears in many proverbs.")
add('kn-051','ಹಸು',"Pronounced HA-su. Cow — sacred in Hindu culture and very present in Karnataka life. 'Haasu haalu' = cow's milk. Cows wandering streets is common. 'Haasu' is treated with reverence — 'go-puja' (cow worship) is practiced in rural areas. 'Haasu mane' = cowshed.")
add('kn-051','ಆನೆ',"Pronounced AA-ne. Elephant — Karnataka's state animal. 'Aane savari' = elephant ride. Mysore Dasara features a famous elephant procession. 'Aane bala' = elephant strength (very strong). Karnataka has the highest elephant population in India. 'Aane haavabhava' = elephant's grace.")

// kn-052 fruits/vegetables
add('kn-052','ಆಲೂ',"Pronounced AA-loo. Potato — borrowed from Hindi. 'Aalu palya' = potato curry. 'Aalu bonda' = potato fritter (a popular snack). Potatoes are used in almost every Karnataka dish. 'Aalu gedde' = potato tuber. Simple word, essential for ordering food.")
add('kn-052','ಈರುಳ್ಳಿ',"Pronounced EE-rul-li. Onion. The retroflex 'ḷḷ' is tricky — curl your tongue back. 'Eerulli sambar' = onion sambar. Onion prices are a major political issue in India — 'eerulli rate' is frequently discussed. 'Eerulli dose' = onion dosa, a breakfast staple.")
add('kn-052','ಬಾಳೆಹಣ್ಣು',"Pronounced BAA-le-HUN-nu. Banana — literally 'banana fruit.' 'Baale' = banana plant, 'hannu' = fruit. Karnataka is India's largest banana producer. 'Baale ele' = banana leaf (used as plates for meals). 'Baale hannu' is offered in temples and is part of every festival meal.")

// kn-061 adjectives
add('kn-061','ದೊಡ್ಡ',"Pronounced DOD-da. Big/large. 'Dodda mane' = big house. 'Dodda manusha' = important person (big person). The doubled 'd' is important. 'Doddavaru' = elders/seniors (big people — a respectful term). One of the first adjectives to learn — pairs with 'chikka' (small).")
add('kn-061','ಚಿಕ್ಕ',"Pronounced CHIK-ka. Small/little. 'Chikka magu' = small child. 'Chikkavaru' = younger ones. Opposite of 'dodda.' 'Chikka-dodda' = big and small (everyone). 'Chikka Bangalore' = old/small Bangalore (the historic city center). A fundamental adjective used constantly.")
add('kn-061','ಬಿಸಿ',"Pronounced BI-si. Hot (temperature). 'Bisi neeru' = hot water. 'Bisi anna' = hot rice. 'Bisi bisi' = very hot. Don't confuse with 'bisilu' (sunshine). 'Bisi bele bath' = hot lentil rice, a famous Karnataka dish. Opposite is 'tanna' (cold/cool).")

// kn-067 verbs
add('kn-067','ಮಾಡು',"Pronounced MAA-du. Do/make — the most versatile verb in Kannada. 'Enu maadtiddira?' = what are you doing? 'Kelsa maadu' = do work. 'Aduge maadu' = cook (do cooking). Combined with nouns, it creates hundreds of compound verbs. Master this one word and you can express almost any action.")
add('kn-067','ಹೋಗು',"Pronounced HO-gu. Go. 'Mane-ge hogu' = go home. 'Hogona?' = shall we go? 'Hogi banni' = go and come (goodbye — implying you'll return). One of the most essential verbs. Conjugation changes by person: 'naanu hogtini' (I go), 'neenu hogtiya' (you go).")
add('kn-067','ಬಾ',"Pronounced BAA. Come — short and sweet, just one syllable. 'Illi baa' = come here. 'Banni' = come (formal/respectful). 'Baa' is informal — use with friends and children. 'Banni' with elders and strangers. The formal/informal distinction in verbs is crucial in Kannada.")
add('kn-067','ತಿನ್ನು',"Pronounced TIN-nu. Eat. 'Oota tinnu' = eat food. 'Enu tintira?' = what are you eating? 'Tinnu' is informal; 'tinniri' is respectful. Eating is central to Karnataka culture — 'oota aayita?' (have you eaten?) is a common greeting, showing care for the other person.")
add('kn-067','ನೋಡು',"Pronounced NO-du. See/look. 'Illi nodu' = look here. 'Nodona' = let's see. 'Nodu' is also used as a filler word in conversation, like 'see' or 'look' in English: 'nodu, naanu heLtini...' = see, I'm telling you... Very common in everyday speech.")

// kn-075 places
add('kn-075','ಅಂಗಡಿ',"Pronounced AN-ga-di. Shop/store. 'Angadi-ge hogbeku' = need to go to the shop. 'Batte angadi' = cloth shop. 'Angadi beedhi' = market street. In Bangalore, 'Commercial Street' is still called 'angadi beedhi' by locals. A fundamental word for daily errands.")
add('kn-075','ಆಸ್ಪತ್ರೆ',"Pronounced AAS-pat-re. Hospital. 'Aaspathre-ge hogbeku' = need to go to hospital. Borrowed from English 'hospital' but fully Kannadized. 'Aaspathre-yalli' = in the hospital. Knowing this word is important for emergencies — 'hattira aaspathre yelli?' = where is the nearest hospital?")
add('kn-075','ಶಾಲೆ',"Pronounced SHAA-le. School. 'Shaale-ge hogu' = go to school. 'Shaale magu' = school child. 'Shaale chutti' = school holiday. Education is highly valued in Karnataka — 'shaale' is one of the first words children learn to write. 'Shaale master' = school teacher.")

// kn-087 adverbs
add('kn-087','ತುಂಬಾ',"Pronounced TUM-baa. Very/much — the most common intensifier. 'Tumba chennagide' = very good. 'Tumba dhanyavaada' = thank you very much. Used constantly in conversation. 'Tumba' can modify adjectives, verbs, and even other adverbs. Essential for expressing degree.")
add('kn-087','ಸ್ವಲ್ಪ',"Pronounced SWAL-pa. A little/some. 'Swalpa neeru kodi' = give some water. 'Swalpa time' = a little time. Opposite of 'tumba.' 'Swalpa swalpa' = little by little. One of the most polite and useful words — adding 'swalpa' to any request makes it softer and more polite.")
add('kn-087','ಬೇಗ',"Pronounced BAY-ga. Quickly/fast. 'Bega baa' = come quickly. 'Bega maadu' = do it fast. 'Bega bega' = hurry hurry. Opposite is 'nidhaanakke' (slowly). In Bangalore traffic, 'bega hogakke aagalla' = can't go fast — a daily reality.")

// kn-112 kitchen
add('kn-112','ಉಪ್ಪು',"Pronounced UP-pu. Salt. 'Uppu haaku' = add salt. 'Uppu jaasti' = too much salt. 'Uppu illade' = without salt. A basic kitchen word used daily. The idiom 'uppu tinda mele neeru kudibeku' = after eating salt, drink water (face consequences).")
add('kn-112','ಸಕ್ಕರೆ',"Pronounced SAK-ka-re. Sugar. 'Sakkare haaku' = add sugar. 'Sakkare kaafi' = sugar coffee. 'Sakkare illade' = without sugar. In Karnataka, jaggery ('bella') is often preferred over refined sugar. 'Sakkare khaayle' = sugar disease (diabetes).")
add('kn-112','ಎಣ್ಣೆ',"Pronounced EN-ne. Oil. 'Enne haaku' = add oil. 'Kobbari enne' = coconut oil (most common in Karnataka). 'Enne snana' = oil bath (a weekly tradition of applying oil before bathing). 'Enne' is essential for cooking — 'enne illade aduge illa' = no cooking without oil.")

// kn-117 relationships
add('kn-117','ಸ್ನೇಹಿತ',"Pronounced SNAY-hi-ta. Friend. 'Nanna snehita' = my friend. More formal than 'guru' or 'machha' (informal buddy terms). 'Snehita-ru' = friends (plural). 'Sneha' = friendship/affection. In formal introductions: 'ivaru nanna snehitaru' = this is my friend.")
add('kn-117','ಮದುವೆ',"Pronounced MA-du-ve. Wedding/marriage. 'Maduve aagide' = got married. 'Maduve-ge banni' = come to the wedding. Karnataka weddings are elaborate multi-day affairs. 'Maduve mantapa' = wedding hall. 'Maduve oota' = wedding feast — often the highlight for guests.")
add('kn-117','ಹಬ್ಬ',"Pronounced HUB-ba. Festival. 'Habba bandide' = festival has come. Karnataka celebrates many festivals: Dasara, Ugadi, Sankranti. 'Habba habba' = festive atmosphere. 'Habba oota' = festival meal (special dishes). 'Habbada shubhaashaya' = festival greetings.")

// kn-122 nature/geography
add('kn-122','ಕಾಡು',"Pronounced KAA-du. Forest/jungle. 'Kaadu praani' = wild animal. Karnataka has rich forests in the Western Ghats. 'Kaadu-mele' = on the forest/hill. 'Kaadina madhya' = in the middle of the forest. Nagarhole and Bandipur are famous 'kaadu' areas in Karnataka.")
add('kn-122','ಜಲಪಾತ',"Pronounced JA-la-PAA-ta. Waterfall — literally 'water-fall.' 'Jala' = water, 'paata' = fall. Karnataka has stunning waterfalls: Jog Falls (Jogada Jalapaata) is India's second highest. 'Jalapaata nodakke hogona' = shall we go see the waterfall? A useful word for tourism.")
add('kn-122','ಮಲೆನಾಡು',"Pronounced MA-le-NAA-du. Hill country — specifically the Western Ghats region of Karnataka. 'Male' = rain/hill, 'naadu' = land/country. Malnad is known for coffee plantations, dense forests, and heavy rainfall. 'Malenaadina haava' = Malnad climate. It's both a geographic term and a cultural identity — Malnad people have distinct food, customs, and dialect.")

// kn-131 verbs set 2
add('kn-131','ಕೂತ್ಕೊ',"Pronounced KOOT-ko. Sit (informal). 'Illi kootko' = sit here. The formal version is 'kootkolri' or 'kootkondi.' 'Kootko' is used with friends and children. In Karnataka hospitality, the first thing you say to a guest is 'banni, kootko' = come, sit down. Sitting is the beginning of every social interaction.")
add('kn-131','ನಿಲ್ಲು',"Pronounced NIL-lu. Stop/stand. 'Illi nillu' = stop here (useful for auto-rickshaws). 'Nillu, nillu!' = stop, stop! 'Nillisu' = make it stop. Dual meaning of stop and stand: 'ninta nodu' = stand and look. One of the most practical verbs for navigation and daily commands.")
add('kn-131','ಮಲಕೊ',"Pronounced MA-la-ko. Lie down/sleep (informal). 'Hogi malako' = go lie down. 'Malako' is casual; 'malakkondi' is more respectful. 'Malkondu idya?' = are you lying down/sleeping? Used for both the act of lying down and sleeping. 'Nidde malako' = sleep (literally 'sleep lie-down').")

// ============================================================
// MERGE
// ============================================================
const data = JSON.parse(readFileSync(new URL('../data/learn_kannada.json', import.meta.url), 'utf-8'))
let enriched = 0
data.forEach(task => {
  if (task.reference?.type !== 'structured_list') return
  task.reference.items.forEach(item => {
    const key = task.id + '::' + item.primary
    if (b[key] && !item.body) { item.body = b[key]; enriched++ }
  })
})
writeFileSync(new URL('../data/learn_kannada.json', import.meta.url), JSON.stringify(data, null, 2), 'utf-8')
console.log(`Kannada: ${enriched} newly enriched`)
