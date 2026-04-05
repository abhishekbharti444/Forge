#!/usr/bin/env node
// Fix mismatched keys and add remaining bodies
import { readFileSync, writeFileSync } from 'fs'

const fixes = {}
function b(taskId, primary, body) { fixes[taskId + '::' + primary] = body }

// gp-068: Octave shapes (correct primary values)
b('gp-068', 'E string fret 5 → D string fret 7', "From any note on the low E string, the same note one octave higher is 2 frets up and 2 strings over (on the D string). Example: E at fret 0 → E at fret 2 on D string. This shape is incredibly useful for finding notes quickly. Practice this shape until it's automatic — it's one of the most practical fretboard navigation tools.")
b('gp-068', 'A string fret 3 → G string fret 5', "Same shape works from the A string to the G string: 2 frets up, 2 strings over. Playing a note and its octave together creates a full, powerful sound. The Red Hot Chili Peppers' bassist Flea uses octave shapes constantly. This is also how you verify you've found the right note — if the octave sounds 'the same but higher,' you're correct.")
b('gp-068', 'E string fret 3 → D string fret 5', "Another example of the 2-frets-up, 2-strings-over pattern. G at fret 3 on E string → G at fret 5 on D string. Notice fret 5 on D is also the open G string — three ways to play the same note! The fretboard is full of these equivalences. Learning octave shapes helps you see them and choose the most convenient position for any musical context.")
b('gp-068', 'D string fret 5 → B string fret 8', "Here's the exception: because of the G-to-B tuning irregularity, this octave shape is 3 frets up and 2 strings over (not 2 frets like before). Any shape that crosses the G-B string boundary shifts up by one fret. This catches many guitarists off guard. Memorize it: E/A string octaves = 2 frets up; when crossing G-B = 3 frets up.")

// gp-096: Fingerpicking (correct primary values)
b('gp-096', 'p (pulgar/thumb)', "The thumb handles the three bass strings: E, A, and D. It moves differently from the fingers — pushing downward and away from the palm. The thumb provides the bass line and rhythm foundation in fingerpicking. Common mistake: letting the thumb collapse inward instead of staying extended. In classical technique, the thumb should be slightly ahead of the fingers, creating a stable 'shelf.'")
b('gp-096', 'i (indice/index)', "The index finger is assigned to the G string (3rd string). It's your most controlled finger and often carries the melody. The motion should come from the last knuckle — curl the fingertip toward the palm to pluck. Avoid pulling the string away from the guitar body; instead, push through and rest on the next string. This 'rest stroke' produces a fuller tone.")
b('gp-096', 'm (medio/middle)', "The middle finger handles the B string (2nd string). It's typically your strongest finger and alternates with the index for fast passages. The i-m alternation is the foundation of classical guitar speed technique. Many fingerpicking patterns use a 'pinch' where thumb and middle finger play simultaneously, creating a bass-melody combination.")
b('gp-096', 'a (anular/ring)', "The ring finger is assigned to the high E string (1st string). It's the weakest picking finger and needs the most practice. A common exercise: hold a chord and play p-i-m-a in sequence, making each note equally loud. The ring finger tends to move with the middle finger — developing independence between 'm' and 'a' is one of fingerpicking's biggest challenges.")

// gp-120: Intervals on low E (correct primary values)
b('gp-120', '1 fret', "A minor second — the smallest interval. This is the 'Jaws' theme: that creeping half-step. Play fret 5 (A) then fret 6 (Bb). The tension is palpable. Minor seconds create dissonance and unease, which is why they're used in horror scores. On guitar, any two adjacent frets produce this interval.")
b('gp-120', '2 frets', "A major second — a whole step. Play fret 5 (A) then fret 7 (B). This is the interval between most adjacent notes in a major scale (do-re). It sounds neutral and stepwise. The first two notes of 'Happy Birthday' form a major second. This is the most common distance you'll move when playing scales.")
b('gp-120', '3 frets', "A minor third — the sad interval. Play fret 5 (A) then fret 8 (C). This melancholy sound is what makes A minor sad. The opening of 'Greensleeves' uses a minor third. Minor thirds are the building blocks of minor chords. Compare with 4 frets (major third) to hear the happy/sad difference.")
b('gp-120', '4 frets', "A major third — the happy interval. Play fret 5 (A) then fret 9 (C#). Bright and cheerful. The first two notes of 'When the Saints Go Marching In.' The difference between major and minor — between happy and sad — is literally this one fret: 3 frets (minor) vs 4 frets (major). Train your ear to hear this.")
b('gp-120', '5 frets', "A perfect fourth. Play fret 5 (A) then fret 10 (D). This is the 'Here Comes the Bride' interval. It's also the tuning interval between most adjacent strings. The fourth has a strong, open quality — not tense, not resolved, just... suspended. It's one of the easiest intervals to recognize by ear.")
b('gp-120', '6 frets', "A tritone — the 'devil's interval.' Play fret 5 (A) then fret 11 (Eb). Medieval musicians called it 'diabolus in musica' because of its unsettling sound. The tritone divides the octave exactly in half. It's the opening of 'The Simpsons' theme and the tension note in dominant 7th chords. It wants desperately to resolve.")
b('gp-120', '7 frets', "A perfect fifth. Play fret 5 (A) then fret 12 (E). The 'Star Wars' opening. The most consonant interval after the octave — stable, powerful, complete. This is the basis of power chords. The fifth is so fundamental it appears in virtually every musical tradition worldwide.")

// gp-123: Chords in key of G (correct primary values)
b('gp-123', 'I', "The I chord (G major) is 'home' — the tonic. Songs begin and end here. It feels resolved and stable. When you hear a song end on the I chord, your ear relaxes. The I chord defines the key: if a song keeps returning to G major, you're in the key of G. About 90% of pop songs end on the I chord.")
b('gp-123', 'ii', "The ii chord (A minor) adds gentle tension. It has a softer, contemplative quality. The ii-V-I progression is one of the most common in jazz and pop — 'Autumn Leaves' and countless standards use it. On guitar, Am is one of the first chords you learn, making ii-V-I accessible early.")
b('gp-123', 'iii', "The iii chord (B minor) is the most mysterious chord in a major key. It's used less frequently than I, IV, V, or vi, which makes it stand out. Radiohead and art-rock bands love the iii chord for its unexpected emotional color. It shares two notes with the I chord, so it can sometimes substitute for it.")
b('gp-123', 'IV', "The IV chord (C major) creates gentle forward motion away from home. The I-IV movement is the most common two-chord change in popular music. 'Let It Be,' 'No Woman No Cry,' and thousands of folk songs use I-IV as their foundation. It feels like taking a step forward — not tense, but not home either.")
b('gp-123', 'V', "The V chord (D major) creates the strongest pull back to home. The V-I movement is the most powerful resolution in Western music — the 'authentic cadence.' The V chord contains F# which desperately wants to resolve up to G. This tension-and-release is what makes music feel like it's going somewhere.")
b('gp-123', 'vi', "The vi chord (E minor) is the 'sad relative' of I. It shares two notes with G major, which is why they sound related but emotionally different. The I-V-vi-IV progression (G-D-Em-C) is the most common in pop: 'Let It Be,' 'With or Without You,' 'Someone Like You' all use it.")
b('gp-123', 'vii°', "The vii° chord (F# diminished) is the rarest and most unstable chord in a major key. It sounds tense and desperately wants to resolve to I. Most pop and rock songs avoid it, substituting V instead. But in jazz and classical, it appears as a passing chord. Think of it as a musical cliffhanger.")

// gp-147: Circle of fifths (correct primary values)
b('gp-147', 'C major', "C major is the 'white keys' key — no sharps, no flats. It's the starting point of the circle of fifths and the default key for learning theory. On guitar, C major uses one of the first chord shapes you learn. Every other key is defined by how many sharps or flats it adds relative to C.")
b('gp-147', 'G major', "Moving clockwise, G major adds one sharp: F#. This is the most popular key for acoustic guitar because open chord shapes (G, C, D, Em, Am) fall naturally under the fingers. Knowing G has F# helps when figuring out melodies by ear — avoid natural F, use F# instead.")
b('gp-147', 'D major', "D major adds C# to G's F#. It's a bright, ringing key — the open D and A strings resonate naturally. Many country and folk songs use D major. When soloing, avoid natural F and C — they'll clash with D major chords. The D major scale has a comfortable box shape starting at fret 2.")
b('gp-147', 'A major', "A major has three sharps: F#, C#, G#. Popular for rock and blues — AC/DC's 'Back in Black' is in A. The open A string provides a powerful bass foundation. The A major pentatonic scale (A-B-C#-E-F#) is one of the most useful for soloing over A major progressions.")
b('gp-147', 'F major', "F major has one flat: Bb. Moving counter-clockwise on the circle adds flats instead of sharps. F major is common in jazz and R&B. On guitar, F major requires a barre chord at fret 1 — one of the first barre chords beginners tackle. The Bb means every B in the key is lowered by one fret.")
b('gp-147', 'Bb major', "Bb major has two flats: Bb and Eb. It's a common key for brass instruments (trumpet, trombone) and appears frequently in jazz and New Orleans music. On guitar, Bb requires a barre chord. Many guitarists use a capo on fret 1 and play A-shaped chords to avoid the barre. Two flats means B and E are both lowered.")

// gp-058: A string remaining notes
b('gp-058', 'Fret 7', "E on the seventh fret of the A string. This is the same note as the open high E string (two octaves lower) and the open low E string (one octave higher). The 7th fret is a perfect fifth above the open string — this relationship is the basis of power chords. Knowing E lives here helps you build E-rooted chords and riffs in higher positions.")
b('gp-058', 'Fret 8', "F on the eighth fret. F is a tricky note on guitar because there's no open F string. Knowing where F lives on each string is essential for playing in the key of F major or for finding F-rooted chords. The 8th fret of the A string is also where you'd root an F power chord or F barre chord in the A-string barre shape.")
b('gp-058', 'Fret 10', "G on the tenth fret. This is the same note as the open G string (3rd string) — one octave lower. This equivalence is useful for checking your fretboard knowledge: 10th fret of A should sound like the open G string. When playing bass lines, this G position connects smoothly to notes on the D string above.")
b('gp-058', 'Fret 12', "A on the twelfth fret — full circle, one octave above the open A string. The 12th fret always equals the open string plus one octave, on every string. This is marked with double dots on the fretboard. Everything above fret 12 repeats the 0-11 pattern. If you know the first 12 frets of the A string, you know all of them.")

// gp-060: All notes on low E (remaining — these have different primary format)
// Let me check the actual primaries first

// gp-060: All frets on low E string
b('gp-060', 'Fret 0', "Open E — the lowest standard note on guitar. Home base for the low E string. Many iconic riffs start here. Learn to hear this pitch and you can always orient yourself on the fretboard.")
b('gp-060', 'Fret 1', "F — one half step up. The E-F half step is one of only two natural half steps in music (the other is B-C). No sharp or flat between them. This is why the F chord sits at fret 1.")
b('gp-060', 'Fret 2', "F#/Gb — the first sharp note. F# is the same pitch as Gb; which name you use depends on the key. In the key of G major, it's F#. In the key of Db major, it's Gb. Same fret, same sound, two names.")
b('gp-060', 'Fret 3', "G — root of G major, one of the most common keys. The 3rd fret is where G power chords start. The E-to-G distance (3 frets = minor third) gives blues its characteristic dark sound.")
b('gp-060', 'Fret 4', "G#/Ab — another enharmonic pair. G# appears in the key of A major and E major. Ab appears in keys with flats like Eb major. On guitar you don't need to worry about the name — just know the sound and position.")
b('gp-060', 'Fret 5', "A — crucial reference point. This should sound exactly like the open A string. The 5th-fret tuning method starts here. A is the universal tuning reference (A440). Power chords rooted here are A5.")
b('gp-060', 'Fret 6', "A#/Bb — the note between A and B. Bb is extremely common in jazz and R&B. On the low E string, this position is useful for Bb power chords and for walking bass lines that pass through Bb.")
b('gp-060', 'Fret 7', "B — the fifth of E. Playing E and B together sounds powerful and stable — that's the root-fifth relationship behind every power chord. B is also the second natural half step destination: B to C (fret 7 to 8) has no sharp between them.")
b('gp-060', 'Fret 8', "C — the 'home base' of music theory. C major has no sharps or flats. On the low E string, C at fret 8 is useful for walking bass lines. The B-to-C half step (fret 7 to 8) is the second natural half step.")
b('gp-060', 'Fret 9', "C#/Db — common in keys like A major (C#) and Db major (Db). Getting into higher fret territory now. The frets are closer together up here, which makes fingering easier but reading position harder.")
b('gp-060', 'Fret 10', "D — same note as the open D string, one octave lower. This equivalence helps verify your fretboard knowledge. D at fret 10 is where D-rooted power chords live in this position.")
b('gp-060', 'Fret 11', "D#/Eb — the last note before the octave. Eb is common in jazz, blues, and brass-heavy music. On the low E string, this position is rarely used for chord roots but appears in chromatic runs and bass lines.")
b('gp-060', 'Fret 12', "E — full circle, one octave above open E. The 12th fret always equals the open string one octave higher. Double dots mark this on most guitars. Everything above fret 12 repeats the 0-11 pattern.")

// gp-074: remaining interval
b('gp-074', 'Perfect 4th', "A perfect fourth is 5 frets up — and this is the tuning interval. Each string is a perfect fourth above the one below it (except G to B). The fourth has a 'suspended' quality — it wants to resolve. The opening of 'Here Comes the Bride' is a perfect fourth. In guitar terms, the fourth is your tuning interval and appears everywhere in chord voicings.")

// Remaining Kannada vocabulary items — generate bodies for common patterns
const kannadaVocab = {
  // kn-008 food (remaining 7)
  'kn-008::ಹುಳಿ': "Pronounced HU-li. Means 'sour/tamarind dish.' Huli is a thick, tangy curry made with tamarind — a Karnataka staple served with rice. 'Huli anna' (tamarind rice) is comfort food. The word also means 'sour' as an adjective: 'ee hannu huli' = this fruit is sour.",
  'kn-008::ಮೊಸರು': "Pronounced MO-sa-ru. Curd/yogurt — essential in Karnataka cuisine. 'Mosaru anna' (curd rice) is the traditional last course of a meal, believed to cool the stomach. 'Mosaru bajji' is a popular snack. Curd is so important that 'mosaru kodthini' (I'll give you curd) is a common hospitality phrase.",
  'kn-008::ನೀರು': "Pronounced NEE-ru with a long 'ee'. Water — one of the first words you need. 'Swalpa neeru kodi' = please give some water. 'Neeru' appears in place names: Shivanasamudra (Shiva's sea of water). In restaurants, just saying 'neeru' gets you a glass of water.",
  'kn-008::ಕಾಫಿ': "Pronounced KAA-fi, borrowed from English 'coffee.' Karnataka is India's largest coffee producer, and filter coffee is a cultural institution. 'Ondu kaafi kodi' = give one coffee. Bangalore's coffee culture predates the Starbucks era by decades — every street has a 'kaafi' stall.",
  'kn-008::ಚಹಾ': "Pronounced CHA-haa. Tea — though many Kannadigas also use 'tea' directly from English. 'Chaha beku?' = do you want tea? Karnataka's Malnad region produces excellent tea. In most offices and homes, 'chaha time' is a social ritual, not just a beverage break.",
  'kn-008::ಉಪ್ಪು': "Pronounced UP-pu with a doubled 'p'. Salt — a basic kitchen word. 'Uppu jaasti' = too much salt. 'Uppu illade' = without salt. The word appears in the idiom 'uppu tinda mele neeru kudibeku' = after eating salt, you must drink water (meaning: face the consequences of your actions).",
  'kn-008::ಬೆಲ್ಲ': "Pronounced BEL-la with a doubled 'l'. Jaggery — unrefined cane sugar used extensively in Karnataka sweets and cooking. 'Bella payasa' (jaggery pudding) is a festival favorite. Jaggery is considered healthier than white sugar, and 'bella kaafi' (jaggery coffee) is a traditional drink in rural Karnataka.",
}

// kn-023: Directions
const kannadaDirections = {
  'kn-023::ಬಲ': "Pronounced BA-la. Right (direction). 'Bala pakka tiru' = turn right side. Memory aid: 'bala' also means 'strength' — your right hand is usually your strong hand. In auto-rickshaw navigation: 'mundina bala tiru' = take the next right.",
  'kn-023::ಎಡಕ್ಕೆ': "Pronounced E-dak-ke. Left (direction). 'Edakke tiru' = turn left. The '-kke' suffix indicates direction/toward. Without it, 'eda' just means 'left side.' Kannada directions are simpler than English — no 'take a left' vs 'turn left' distinction.",
  'kn-023::ನೇರ': "Pronounced NAY-ra. Straight ahead. 'Nera hogi' = go straight. One of the most useful navigation words. Auto drivers understand 'nera, nera' (straight, straight) even with imperfect pronunciation. Also means 'direct' or 'honest' — 'nera manusha' = straightforward person.",
  'kn-023::ಮೇಲೆ': "Pronounced MAY-le. Up/above/on top. 'Mele hogi' = go up. 'Table mele' = on the table. The '-le' suffix indicates location. 'Mele mane' = upstairs house/upper floor. In Bangalore's hilly terrain, 'mele' and 'kelage' (below) are essential for giving directions.",
  'kn-023::ಕೆಳಗೆ': "Pronounced KE-la-ge. Down/below. 'Kelage banni' = come down. 'Kelage idu' = put it down. Opposite of 'mele.' In multi-story buildings: 'kelage hogi' = go downstairs. The word also means 'under' — 'table kelage' = under the table.",
  'kn-023::ಹತ್ತಿರ': "Pronounced HAT-ti-ra. Near/close. 'Hattira ide' = it's nearby. 'Yeshtu hattira?' = how near? Very useful for asking about distances. 'Hattira banni' = come closer. In Bangalore, 'hattira' is relative — '10 minutes hattira' could mean 30 minutes in traffic.",
  'kn-023::ದೂರ': "Pronounced DOO-ra. Far/distant. 'Tumba doora' = very far. 'Yeshtu doora?' = how far? Essential for auto-rickshaw negotiations — knowing if something is 'hattira' or 'doora' helps you judge if the fare is reasonable. 'Doora-darshana' = television (literally 'far-seeing').",
  'kn-023::ಒಳಗೆ': "Pronounced O-la-ge. Inside. 'Olage banni' = come inside. 'Mane olage' = inside the house. The '-ge' suffix indicates direction. 'Olage enu ide?' = what's inside? A welcoming phrase: 'olage banni, kootko' = come inside, sit down.",
  'kn-023::ಹೊರಗೆ': "Pronounced HO-ra-ge. Outside. 'Horage hogi' = go outside. Opposite of 'olage.' 'Horage mazhe bartide' = it's raining outside. 'Horage kaaytiri' = wait outside. In summer: 'horage tumba bisilu' = it's very hot outside.",
  'kn-023::ಪಕ್ಕ': "Pronounced PAK-ka. Next to/beside. 'Nanna pakka kootko' = sit next to me. 'Angadi pakka' = next to the shop. Also means 'side' — 'bala pakka' = right side, 'eda pakka' = left side. Very useful for describing locations relative to landmarks.",
}

Object.entries({...kannadaVocab, ...kannadaDirections}).forEach(([key, body]) => {
  const [taskId, primary] = key.split('::')
  b(taskId, primary, body)
})

// ============================================================
// MERGE
// ============================================================
function enrichFile(filePath) {
  const data = JSON.parse(readFileSync(new URL(filePath, import.meta.url), 'utf-8'))
  let enriched = 0
  data.forEach(task => {
    if (task.reference?.type !== 'structured_list') return
    task.reference.items.forEach(item => {
      const key = task.id + '::' + item.primary
      if (fixes[key] && !item.body) {
        item.body = fixes[key]
        enriched++
      }
    })
  })
  writeFileSync(new URL(filePath, import.meta.url), JSON.stringify(data, null, 2), 'utf-8')
  console.log(`${filePath}: ${enriched} newly enriched`)
}

console.log(`Fix entries: ${Object.keys(fixes).length}`)
enrichFile('../data/guitar_practice.json')
enrichFile('../data/learn_kannada.json')
