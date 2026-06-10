// ─────────────────────────────────────────────────────────────────────────────
// data.js — educational content, characters, scenes, schedules, hotspots
// All quotes are from Shakespeare's Hamlet (public domain).
// Castle facts refer to Kronborg Castle, Helsingør, Denmark (UNESCO 2000).
// ─────────────────────────────────────────────────────────────────────────────

window.EC = window.EC || {};

EC.CHAR_INFO = {
  hamlet: {
    name: 'Hamlet', title: 'Prince of Denmark',
    colors: { robe: 0x16161d, trim: 0x2c2c38, hair: 0x4a3320, hat: null, prop: 'book' },
    bio: 'Son of the late King Hamlet and Queen Gertrude. A student of Wittenberg called home for his father’s funeral — and his mother’s hasty remarriage to his uncle Claudius. The Ghost’s revelation of “murder most foul” sets him on a path of feigned madness, doubt, and revenge.',
    facts: 'Hamlet is Shakespeare’s longest play (≈30,000 words). The prince speaks almost 40% of its lines. His “antic disposition” — pretended madness — lets Shakespeare ask whether performance and reality can be told apart.',
    quotes: ['To be, or not to be: that is the question.', 'There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy.', 'The play’s the thing wherein I’ll catch the conscience of the king.'],
  },
  claudius: {
    name: 'Claudius', title: 'King of Denmark',
    colors: { robe: 0x6e1220, trim: 0xc9a227, hair: 0x55402a, hat: 'crown', prop: null },
    bio: 'Brother of the late king. He poured poison into his sleeping brother’s ear in the orchard, took the crown, and married the widowed queen — all within two months. A capable politician with a guilty conscience he cannot pray away.',
    facts: 'Claudius is one of literature’s great studies of guilt: in Act III he admits his crime in soliloquy (“O, my offence is rank”) yet cannot give up “my crown, mine own ambition and my queen.”',
    quotes: ['Though yet of Hamlet our dear brother’s death the memory be green…', 'My words fly up, my thoughts remain below: words without thoughts never to heaven go.'],
  },
  gertrude: {
    name: 'Gertrude', title: 'Queen of Denmark',
    colors: { robe: 0x7d3c98, trim: 0xc9a227, hair: 0x6b4e2e, hat: 'crown', prop: null },
    bio: 'Hamlet’s mother. Her marriage to Claudius barely two months after her husband’s death (“The funeral baked meats did coldly furnish forth the marriage tables”) torments her son. Whether she knew of the murder is one of the play’s open questions.',
    facts: 'Gertrude dies drinking the poisoned cup intended for Hamlet in the final duel — her last words a warning: “The drink, the drink! I am poison’d.”',
    quotes: ['The lady doth protest too much, methinks.', 'Good Hamlet, cast thy nighted colour off.'],
  },
  ophelia: {
    name: 'Ophelia', title: 'Daughter of Polonius',
    colors: { robe: 0xa8c8e8, trim: 0xe8e0d0, hair: 0xc09050, hat: null, prop: 'flowers' },
    bio: 'In love with Hamlet, obedient to her father. Used as bait to spy on the prince, rejected in the “nunnery” scene, and shattered by her father’s death, she descends into real madness — a mirror of Hamlet’s feigned kind — and drowns beneath a willow.',
    facts: 'Ophelia’s flowers each carry Elizabethan meanings: rosemary (remembrance), pansies (thoughts), fennel (flattery), columbine (faithlessness), rue (regret), daisy (innocence), violets (faithfulness — “they withered all when my father died”).',
    quotes: ['There’s rosemary, that’s for remembrance.', 'O, what a noble mind is here o’erthrown!'],
  },
  polonius: {
    name: 'Polonius', title: 'Lord Chamberlain',
    colors: { robe: 0x3a4a5a, trim: 0x8a8a78, hair: 0xbababa, hat: 'cap', prop: 'scroll' },
    bio: 'Father of Laertes and Ophelia; the king’s long-winded counsellor. He spies for Claudius — and dies for it, stabbed through the arras (a wall tapestry) in Gertrude’s chamber when Hamlet mistakes him for the king.',
    facts: 'His advice to Laertes (“This above all: to thine own self be true”) is among the most quoted passages in English — ironic, from the play’s busiest schemer.',
    quotes: ['Brevity is the soul of wit.', 'Though this be madness, yet there is method in ’t.'],
  },
  laertes: {
    name: 'Laertes', title: 'Son of Polonius',
    colors: { robe: 0x1e5631, trim: 0xc9a227, hair: 0x2e2018, hat: 'cap', prop: 'sword' },
    bio: 'Ophelia’s brother, a fiery foil to Hamlet. He leaves for France, storms back at his father’s death, and is drawn into Claudius’ plot: a “friendly” fencing match with a sharpened, poisoned foil.',
    facts: 'Laertes and Hamlet are deliberate mirrors: each loses a father and seeks revenge — but where Hamlet hesitates, Laertes acts instantly, and both die by the same poisoned blade.',
    quotes: ['To cut his throat i’ the church.', 'The treacherous instrument is in thy hand, unbated and envenom’d.'],
  },
  horatio: {
    name: 'Horatio', title: 'Hamlet’s friend',
    colors: { robe: 0x5a4632, trim: 0x8a7a5a, hair: 0x3a2a1a, hat: null, prop: 'book' },
    bio: 'A poor scholar of Wittenberg and the one person Hamlet wholly trusts — “more an antique Roman than a Dane.” He survives to tell the story, as Hamlet begs with his dying breath.',
    facts: 'Horatio is the play’s witness and the audience’s anchor: sceptical of the Ghost until he sees it, steady while everyone else schemes.',
    quotes: ['Now cracks a noble heart. Good night, sweet prince, and flights of angels sing thee to thy rest!'],
  },
  ghost: {
    name: 'The Ghost', title: 'Spirit of King Hamlet',
    colors: { robe: 0x9ad0e8, trim: 0xbfe6f5, hair: 0xbfe6f5, hat: 'helmet', prop: null, ghost: true },
    bio: 'The late king, “doom’d for a certain term to walk the night,” appearing in the armour he wore against Norway. He walks the gun platform between midnight and cock-crow, and charges his son: “Revenge his foul and most unnatural murder.”',
    facts: 'Tradition says Shakespeare himself played the Ghost. Elizabethans debated whether ghosts were souls from Purgatory or devils in disguise — exactly Hamlet’s doubt, and why he stages “The Mousetrap” to test the story.',
    quotes: ['I am thy father’s spirit, doom’d for a certain term to walk the night.', 'Murder most foul, as in the best it is.', 'Adieu, adieu! Hamlet, remember me.'],
  },
  rosencrantz: {
    name: 'Rosencrantz', title: 'Courtier',
    colors: { robe: 0x8a6d3b, trim: 0x5a4a2a, hair: 0x6a5030, hat: 'cap', prop: null },
    bio: 'Hamlet’s school friend, summoned with Guildenstern to spy on the prince. The inseparable pair end up escorting Hamlet to England carrying — unknowingly — the order for his execution. Hamlet rewrites it with their names.',
    facts: 'Tom Stoppard’s 1966 play “Rosencrantz and Guildenstern Are Dead” retells Hamlet from this pair’s baffled point of view.',
    quotes: ['My honoured lord!'],
  },
  guildenstern: {
    name: 'Guildenstern', title: 'Courtier',
    colors: { robe: 0x7a5a8a, trim: 0x4a3a5a, hair: 0x4a3525, hat: 'cap', prop: null },
    bio: 'The other half of the pair — even the king and queen mix their names up. Their fate gives the English ambassador one of the play’s last lines: “Rosencrantz and Guildenstern are dead.”',
    facts: 'Both names were real Danish noble families; several Rosenkrantzes and Gyldenstiernes actually attended the Danish court at Kronborg.',
    quotes: ['Heavens make our presence and our practices pleasant and helpful to him!'],
  },
  marcellus: {
    name: 'Marcellus', title: 'Officer of the Watch',
    colors: { robe: 0x44505c, trim: 0x96a0aa, hair: 0x3a3a3a, hat: 'helmet', prop: 'spear' },
    bio: 'A sentinel on the castle platform who twice sees the Ghost and fetches Horatio — then Hamlet. He speaks one of the most famous lines in drama as the prince follows the spirit into the dark.',
    facts: 'It is Marcellus, not Hamlet, who says “Something is rotten in the state of Denmark” (Act I, scene iv).',
    quotes: ['Something is rotten in the state of Denmark.'],
  },
  barnardo: {
    name: 'Barnardo', title: 'Sentinel',
    colors: { robe: 0x3c4854, trim: 0x8a949e, hair: 0x2a2a2a, hat: 'helmet', prop: 'spear' },
    bio: 'A guard of the night watch. The whole play opens with his nervous challenge in the freezing dark — “Who’s there?” — the wrong way round, since Francisco is the one on duty.',
    facts: 'Hamlet opens at midnight in “bitter cold” — on a bare Elizabethan stage in daylight, the dialogue alone had to build the dark.',
    quotes: ['Who’s there?', 'Last night of all, when yond same star that’s westward from the pole had made his course…'],
  },
  francisco: {
    name: 'Francisco', title: 'Sentinel',
    colors: { robe: 0x4a5662, trim: 0x9aa4ae, hair: 0x4a3a2a, hat: 'helmet', prop: 'spear' },
    bio: 'The soldier Barnardo relieves at midnight in the play’s first moments. He has only a handful of lines, but one sets the whole mood of Elsinore.',
    facts: '“’Tis bitter cold, and I am sick at heart” — before anything has happened, Denmark already feels wrong.',
    quotes: ['’Tis bitter cold, and I am sick at heart.'],
  },
  gravedigger: {
    name: 'First Gravedigger', title: 'Sexton & Clown',
    colors: { robe: 0x6b5a3e, trim: 0x4a3a26, hair: 0x8a7a5a, hat: 'cap', prop: 'shovel' },
    bio: 'A cheerful sexton who has dug graves “since that very day that young Hamlet was born.” He sings at his work, jokes about gallows-makers, and turns up the skull of Yorick, the old king’s jester.',
    facts: 'The graveyard scene (Act V, scene i) gave the world its most iconic stage image: Hamlet holding Yorick’s skull. (He says “Alas, poor Yorick!” — not “I knew him well”; the real line is “I knew him, Horatio.”)',
    quotes: ['In youth, when I did love, did love, methought it was very sweet…'],
  },
  sexton2: {
    name: 'Second Gravedigger', title: 'The Other Clown',
    colors: { robe: 0x5e5036, trim: 0x3e3422, hair: 0x5a4a30, hat: 'cap', prop: 'shovel' },
    bio: 'The first gravedigger’s straight man, sent off to fetch “a stoup of liquor.” Their riddling debate about Ophelia’s burial smuggles real Elizabethan law into comedy.',
    facts: 'Their argument parodies a famous real lawsuit (Hales v. Petit, 1554) about whether a suicide could receive Christian burial.',
    quotes: ['Who builds stronger than a mason, a shipwright, or a carpenter?'],
  },
  playerking: {
    name: 'Player King', title: 'Travelling actor',
    colors: { robe: 0xb8860b, trim: 0x8a5a1a, hair: 0x6a5a4a, hat: 'crown', prop: null },
    bio: 'Leader of the travelling tragedians of the city. At Hamlet’s request the troupe performs “The Murder of Gonzago” with sixteen inserted lines — a trap to make Claudius betray his guilt.',
    facts: 'Touring companies really visited Danish castles: English actors — including William Kempe, later Shakespeare’s clown — performed at Elsinore for the Danish court in 1585–86. Some scholars think their stories of Kronborg reached Shakespeare directly.',
    quotes: ['For us, and for our tragedy, here stooping to your clemency, we beg your hearing patiently.'],
  },
  playerqueen: {
    name: 'Player Queen', title: 'Travelling actor',
    colors: { robe: 0xc06080, trim: 0xe0c0d0, hair: 0x3a2a1a, hat: null, prop: null },
    bio: 'On Elizabethan stages women’s parts were played by boys — Hamlet teases this actor about his voice “cracking.” In the Mousetrap the Player Queen vows never to remarry… which is exactly the point.',
    facts: 'Gertrude’s dry review of this performance — “The lady doth protest too much, methinks” — is now an everyday English idiom.',
    quotes: ['Both here and hence pursue me lasting strife, if once a widow, ever I be wife!'],
  },
  lucianus: {
    name: 'Lucianus', title: 'Travelling actor',
    colors: { robe: 0x303030, trim: 0x5a1a1a, hair: 0x1a1a1a, hat: null, prop: 'vial' },
    bio: 'The villain of “The Murder of Gonzago” — “nephew to the king” — who pours poison into the sleeping player-king’s ear, re-enacting Claudius’ real crime before his face.',
    facts: 'The poison-in-the-ear murder echoes a real scandal: the 1538 murder of the Duke of Urbino, allegedly via poison poured into his ear.',
    quotes: ['Thoughts black, hands apt, drugs fit, and time agreeing…'],
  },
};

// Ambient one-liners characters say near the player during free time.
EC.BARKS = {
  hamlet: ['O, that this too too solid flesh would melt…', 'Denmark’s a prison.', 'The time is out of joint: O cursed spite, that ever I was born to set it right!', 'What a piece of work is a man!'],
  claudius: ['Madness in great ones must not unwatch’d go.', 'When sorrows come, they come not single spies, but in battalions.'],
  gertrude: ['One woe doth tread upon another’s heel, so fast they follow.'],
  ophelia: ['There’s rosemary, that’s for remembrance; pray, love, remember.', 'And there is pansies, that’s for thoughts.', 'We know what we are, but know not what we may be.'],
  polonius: ['Brevity is the soul of wit.', 'Give every man thy ear, but few thy voice.', 'What do you read, my lord?'],
  laertes: ['Best safety lies in fear.', 'The Sound air sharpens the sword-arm.'],
  horatio: ['So have I heard and do in part believe it.', 'There needs no ghost, my lord, come from the grave to tell us this.'],
  rosencrantz: ['My most dear lord!', 'We were sent for, ’tis true.'],
  guildenstern: ['What should we say, my lord?'],
  marcellus: ['Thus twice before, and jump at this dead hour, with martial stalk hath he gone by our watch.', 'Hold the watch. Keep your eyes on the platform.'],
  barnardo: ['Long live the king!', '’Tis now struck twelve; get thee to bed.'],
  francisco: ['For this relief much thanks: ’tis bitter cold.', 'Not a mouse stirring.'],
  gravedigger: ['But age, with his stealing steps, hath claw’d me in his clutch…', 'A pick-axe, and a spade, a spade, for and a shrouding sheet…'],
  sexton2: ['The gallows does well; but how does it well?'],
  playerking: ['We shall express our duty in his eye.', 'Full thirty times hath Phoebus’ cart gone round…'],
  playerqueen: ['So many journeys may the sun and moon make us again count o’er ere love be done!'],
  lucianus: ['Confederate season, else no creature seeing…'],
};

// ─── Educational hotspots: [x, z, y] — floating ⓘ markers ───────────────────
EC.HOTSPOTS = [
  {
    pos: [-47, 0, 3], title: 'The Dark Gate (Mørkeport)',
    text: 'Kronborg is entered from the land side through a single guarded passage. The real castle’s approach winds through the Dark Gate and across two moats — a deliberate funnel so no army (and few smugglers) could rush the fortress. In the play, Elsinore is just as hard to leave: Hamlet calls Denmark itself “a prison.”',
  },
  {
    pos: [0, 6.5, 2.5], title: 'The Courtyard & Fountain',
    text: 'King Frederik II rebuilt a medieval fortress called Krogen into this Dutch-Renaissance palace (1574–1585), with sandstone facades and copper roofs. A magnificent gilded fountain stood here until 1658, when Swedish troops looted it during the Dano-Swedish War. Court life filled this yard — the natural stage for Hamlet’s “words, words, words.”',
  },
  {
    pos: [4, 18, 2.5], title: 'The Chapel (1582)',
    text: 'The chapel was consecrated in 1582 and is the only interior to survive the great fire of 1629 — its carved oak pews and gallery are original. In the play, a chapel like this is where Claudius tries to pray (“My words fly up, my thoughts remain below”) and Hamlet, sword drawn, decides not to kill him — the play’s great moment of fatal hesitation (Act III, sc. iii).',
  },
  {
    pos: [-4, -18, 2.5], title: 'The Great Hall (Ballroom)',
    text: 'At 62 metres, Kronborg’s ballroom was the longest hall in Northern Europe when finished in 1582 — in reality it occupies the upper floor of the south wing (placed at ground level here so everyone can walk in). Banquets here used trumpet fanfares and cannon salutes for every royal toast — exactly the custom Hamlet despises: “The king doth wake to-night and takes his rouse.” Here the court watches “The Mousetrap,” and here the final duel ends the play.',
  },
  {
    pos: [19, 5.2, 2.2], title: 'Stairs to the Casemates',
    text: 'Beneath Kronborg run the casemates — dark vaulted cellars where up to 1,000 soldiers could shelter with supplies for six weeks during a siege. Cold, damp and pitch-black, they were also used as storerooms, stables and a prison. Mind the steps.',
  },
  {
    pos: [32, -2, -1.5], title: 'Holger Danske (Ogier the Dane)',
    text: 'Legend says the hero Holger Danske sleeps in Kronborg’s casemates, his beard grown into the stone table — and will wake to save Denmark in its darkest hour. The famous statue (H.P. Pedersen-Dan, 1907) sits here in the dark. During WWII, the largest Danish resistance group named itself “Holger Danske” after him.',
  },
  {
    pos: [78, 0, 9], title: 'The Gun Battery — the Ghost’s platform',
    text: 'Cannons on the seaward rampart face the Øresund, the strait between Denmark and Sweden — the Swedish coast at Helsingborg is barely 4 km away. Shakespeare sets the Ghost scenes on “the platform”: this windswept battery is where the spirit walks between midnight and cock-crow (Act I). Return at night…',
  },
  {
    pos: [60, -60, 8.5], title: 'The Sound Dues — why Kronborg is rich',
    text: 'From 1429 to 1857 every ship passing through the Øresund paid a toll to the Danish crown — the Sound Dues, once a third of Denmark’s state income. Kronborg’s guns were the toll-booth’s enforcement. That wealth paid for the castle’s splendour — and made “Elsinore” a name every European sailor knew, probably including Shakespeare’s informants.',
  },
  {
    pos: [-39.5, 38, 6], title: 'The Trumpeter’s Tower',
    text: 'The tallest spire of Kronborg, about 62 m. Trumpeters sounded fanfares from here over the Sound — royal Danish pomp Shakespeare wrote into the play: trumpets and “ordnance shot off” accompany the king’s toasts, and again at the duel: “Give me the cups; and let the kettle to the trumpet speak.”',
  },
  {
    pos: [39.5, -38, 6], title: 'The Telegraph Tower & the Flag',
    text: 'The flat-topped corner tower flies the Dannebrog — by legend the flag that fell from the sky in 1219, the oldest continuously used national flag in the world. In the 1800s the tower carried an optical telegraph relaying signals across the Sound.',
  },
  {
    pos: [0, 78, 9], title: 'Ramparts, Bastions & Moats',
    text: 'After Swedish forces stormed and looted Kronborg in 1658, Denmark ringed it with some of Europe’s strongest star-shaped fortifications: angled bastions, dry and wet moats, and crownworks. The result is the layered fortress you walk today — palace inside, war-machine outside. UNESCO listed Kronborg as a World Heritage Site in 2000.',
  },
  {
    pos: [10, 50, 2.5], title: 'The Queen’s Garden',
    text: 'Renaissance castles kept formal herb and pleasure gardens within the walls. Ophelia’s world is told in plants: rosemary, pansies, fennel, columbine, rue, daisies, violets — and the willow by the brook where she drowns, “her clothes spread wide, and, mermaid-like, awhile they bore her up” (Act IV, sc. vii).',
  },
  {
    pos: [-62, 110, 3], title: 'The Churchyard',
    text: 'Act V opens here: two gravediggers joke and sing while digging Ophelia’s grave, and Hamlet, just returned to Denmark, lifts the skull of Yorick — the jester who carried him as a boy — and stares mortality in the face. “Alexander died, Alexander was buried, Alexander returneth into dust.”',
  },
  {
    pos: [-48, 99, 2.5], title: 'The Willow by the Water',
    text: '“There is a willow grows aslant a brook, that shows his hoar leaves in the glassy stream.” Gertrude’s lyrical report of Ophelia’s drowning (Act IV, sc. vii) is one of the most painted passages in literature — most famously by John Everett Millais (1851–52).',
  },
  {
    pos: [-95, -8, 3], title: 'Shakespeare at Elsinore?',
    text: 'Shakespeare almost certainly never visited Denmark — but actors from his world did. English players performed for the Danish court at Elsinore in 1585–86, and Frederik II’s brand-new Kronborg was famous across Europe. Hamlet (written ≈1600) is based on the medieval Danish legend of Amleth, told by Saxo Grammaticus ≈1200. Since 1816 the play has been staged at the real castle again and again — with Hamlets including Laurence Olivier, John Gielgud, Christopher Plummer and Jude Law.',
  },
  {
    pos: [39.5, 38, 6], title: 'Royal Apartments & the King’s Tower',
    text: 'The king’s and queen’s chambers occupied separate wings, linked by galleries — in the play Gertrude’s “closet” is where Hamlet confronts his mother and kills the eavesdropping Polonius through the arras (wall tapestry): “How now! a rat? Dead, for a ducat, dead!” (Act III, sc. iv).',
  },
];

// ─── Teleport destinations (menu “Visit”) ────────────────────────────────────
// face: camera yaw — 0 looks north (−z), −π/2 east, π south, π/2 west
EC.PLACES = [
  { id: 'bridge',    name: 'Castle approach & bridge', pos: [-108, 0],  face: -Math.PI / 2 },
  { id: 'courtyard', name: 'The Courtyard',            pos: [-14, 0],   face: -Math.PI / 2 },
  { id: 'hall',      name: 'The Great Hall',           pos: [0, -15],   face: 0 },
  { id: 'chapel',    name: 'The Chapel',               pos: [8, 15],    face: Math.PI },
  { id: 'casemates', name: 'The Casemates (stairs down)', pos: [13, 8], face: -Math.PI / 2 },
  { id: 'battery',   name: 'Gun Battery (sea view)',   pos: [74, 0],    face: -Math.PI / 2 },
  { id: 'ramparts',  name: 'North Rampart walk',       pos: [20, -77],  face: Math.PI / 2 },
  { id: 'garden',    name: 'The Queen’s Garden',       pos: [10, 47],   face: Math.PI },
  { id: 'graveyard', name: 'The Churchyard',           pos: [-62, 105], face: Math.PI },
];

// ─── Scheduled scenes (gameHour) ─────────────────────────────────────────────
// who/marks reference nav nodes (see nav.js). Lines run in real time.
EC.SCENES = [
  {
    id: 'watch', hour: 0.5, title: 'The Watch', ref: 'Act I, scene i — the platform',
    place: 'rampN',
    marks: { barnardo: ['rampN', 0, 0], francisco: ['rampN', 3, 1], marcellus: ['rampN', -3, 1], horatio: ['rampN', -1.5, 2.5], ghost: ['rampNE', 0, 0] },
    lines: [
      { who: 'barnardo', text: 'Who’s there?' },
      { who: 'francisco', text: 'Nay, answer me: stand, and unfold yourself.' },
      { who: 'barnardo', text: 'Long live the king!' },
      { who: 'francisco', text: 'You come most carefully upon your hour. ’Tis bitter cold, and I am sick at heart.' },
      { who: 'marcellus', text: 'Horatio says ’tis but our fantasy, and will not let belief take hold of him.' },
      { who: 'horatio', text: 'Tush, tush, ’twill not appear.' },
      { who: 'barnardo', text: 'Last night of all, when yond same star that’s westward from the pole had made his course… the bell then beating one—' },
      { who: 'marcellus', text: 'Peace, break thee off; look, where it comes again!', action: 'ghostWalk' },
      { who: 'barnardo', text: 'In the same figure, like the king that’s dead.' },
      { who: 'horatio', text: 'Most like: it harrows me with fear and wonder.' },
      { who: 'horatio', text: 'Stay! speak, speak! I charge thee, speak!' },
      { who: 'marcellus', text: '’Tis gone, and will not answer.', action: 'ghostFade' },
      { who: 'horatio', text: 'This bodes some strange eruption to our state. Let us impart what we have seen to-night unto young Hamlet.' },
    ],
  },
  {
    id: 'ghosttale', hour: 1.4, title: 'The Ghost’s Tale', ref: 'Act I, scenes iv–v — the battery',
    place: 'rampE',
    marks: { hamlet: ['rampE', -2, 1], horatio: ['rampE', -5, 3], marcellus: ['rampE', -5, -2], ghost: ['rampE', 3, 0] },
    lines: [
      { who: 'hamlet', text: 'The air bites shrewdly; it is very cold.' },
      { who: 'horatio', text: 'Look, my lord, it comes!', action: 'ghostShow' },
      { who: 'hamlet', text: 'Angels and ministers of grace defend us! … I’ll call thee Hamlet, King, father, royal Dane: O, answer me!' },
      { who: 'ghost', text: 'Mark me. My hour is almost come, when I to sulphurous and tormenting flames must render up myself.' },
      { who: 'ghost', text: 'I am thy father’s spirit, doom’d for a certain term to walk the night.' },
      { who: 'ghost', text: 'If thou didst ever thy dear father love — revenge his foul and most unnatural murder.' },
      { who: 'hamlet', text: 'Murder!' },
      { who: 'ghost', text: 'Murder most foul, as in the best it is; but this most foul, strange and unnatural.' },
      { who: 'ghost', text: 'The serpent that did sting thy father’s life now wears his crown.' },
      { who: 'hamlet', text: 'O my prophetic soul! My uncle!' },
      { who: 'ghost', text: 'Sleeping within my orchard, thy uncle stole with juice of cursed hebenon in a vial, and in the porches of my ears did pour the leperous distilment…' },
      { who: 'ghost', text: 'The glow-worm shows the matin to be near. Adieu, adieu! Hamlet, remember me.', action: 'ghostFade' },
      { who: 'hamlet', text: 'Remember thee! Ay, thou poor ghost, while memory holds a seat in this distracted globe.' },
      { who: 'marcellus', text: 'Something is rotten in the state of Denmark.' },
      { who: 'hamlet', text: 'There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy.' },
      { who: 'hamlet', text: 'The time is out of joint: O cursed spite, that ever I was born to set it right!' },
    ],
  },
  {
    id: 'court', hour: 9, title: 'The Court Assembles', ref: 'Act I, scene ii — the Great Hall',
    place: 'hallE',
    marks: { claudius: ['hallE', 0, 0], gertrude: ['hallE', 2, 0.5], polonius: ['hallE', -3, 2], laertes: ['hallE', -5, 3], hamlet: ['hallE', -7, 4.5], horatio: ['hallE', -10, 4] },
    lines: [
      { who: 'claudius', text: 'Though yet of Hamlet our dear brother’s death the memory be green… yet so far hath discretion fought with nature that we with wisest sorrow think on him, together with remembrance of ourselves.' },
      { who: 'claudius', text: 'Therefore our sometime sister, now our queen… have we, as ’twere with a defeated joy, taken to wife.' },
      { who: 'laertes', text: 'My dread lord, your leave and favour to return to France.' },
      { who: 'claudius', text: 'Take thy fair hour, Laertes; time be thine. But now, my cousin Hamlet, and my son—' },
      { who: 'hamlet', text: '(aside) A little more than kin, and less than kind.' },
      { who: 'claudius', text: 'How is it that the clouds still hang on you?' },
      { who: 'hamlet', text: 'Not so, my lord; I am too much i’ the sun.' },
      { who: 'gertrude', text: 'Good Hamlet, cast thy nighted colour off. Do not for ever with thy vailed lids seek for thy noble father in the dust.' },
      { who: 'hamlet', text: 'Seems, madam! nay it is; I know not “seems.” … I have that within which passeth show; these but the trappings and the suits of woe.' },
      { who: 'claudius', text: '’Tis sweet and commendable in your nature, Hamlet, to give these mourning duties to your father… but to persever in obstinate condolement is a course of impious stubbornness.' },
      { who: 'gertrude', text: 'Let not thy mother lose her prayers, Hamlet: I pray thee, stay with us; go not to Wittenberg.' },
      { who: 'hamlet', text: 'I shall in all my best obey you, madam.' },
    ],
  },
  {
    id: 'advice', hour: 10.5, title: 'Polonius’ Advice', ref: 'Act I, scene iii — before the gate',
    place: 'courtW',
    marks: { polonius: ['courtW', 0, -1.5], laertes: ['courtW', 2, 1], ophelia: ['courtW', -2, 1.5] },
    lines: [
      { who: 'laertes', text: 'My necessaries are embark’d: farewell. And, sister… do not sleep, but let me hear from you.' },
      { who: 'polonius', text: 'Yet here, Laertes! aboard, aboard, for shame! … And these few precepts in thy memory see thou character.' },
      { who: 'polonius', text: 'Give thy thoughts no tongue, nor any unproportioned thought his act.' },
      { who: 'polonius', text: 'Neither a borrower nor a lender be; for loan oft loses both itself and friend.' },
      { who: 'polonius', text: 'This above all: to thine own self be true, and it must follow, as the night the day, thou canst not then be false to any man.' },
      { who: 'laertes', text: 'Most humbly do I take my leave, my lord. Farewell, Ophelia; and remember well what I have said to you.', action: 'laertesExit' },
      { who: 'ophelia', text: '’Tis in my memory lock’d, and you yourself shall keep the key of it.' },
      { who: 'polonius', text: 'What is’t, Ophelia, he hath said to you? … Lord Hamlet? Affection! pooh! you speak like a green girl.' },
      { who: 'ophelia', text: 'I shall obey, my lord.' },
    ],
  },
  {
    id: 'words', hour: 12, title: '“Words, words, words”', ref: 'Act II, scene ii — the lobby',
    place: 'cyE',
    marks: { hamlet: ['cyE', 0, 0], polonius: ['cyE', -3, 1] },
    lines: [
      { who: 'polonius', text: 'How does my good Lord Hamlet?' },
      { who: 'hamlet', text: 'Well, God-a-mercy.' },
      { who: 'polonius', text: 'Do you know me, my lord?' },
      { who: 'hamlet', text: 'Excellent well; you are a fishmonger.' },
      { who: 'polonius', text: 'Not I, my lord.' },
      { who: 'hamlet', text: 'Then I would you were so honest a man.' },
      { who: 'polonius', text: 'What do you read, my lord?' },
      { who: 'hamlet', text: 'Words, words, words.' },
      { who: 'polonius', text: '(aside) Though this be madness, yet there is method in ’t. — Will you walk out of the air, my lord?' },
      { who: 'hamlet', text: 'Into my grave.' },
      { who: 'polonius', text: '(aside) How pregnant sometimes his replies are!' },
      { who: 'hamlet', text: 'You cannot, sir, take from me any thing that I will more willingly part withal: except my life, except my life, except my life.' },
    ],
  },
  {
    id: 'players', hour: 13.5, title: 'The Players Arrive', ref: 'Act II, scene ii — the courtyard',
    place: 'cyC',
    marks: { playerking: ['cyC', 0, 0], playerqueen: ['cyC', 2, 1], lucianus: ['cyC', -2, 1], hamlet: ['cyC', 0, -3.5], rosencrantz: ['cyC', 4, -2], guildenstern: ['cyC', -4, -2], polonius: ['cyC', 6, 1] },
    lines: [
      { who: 'polonius', text: 'The actors are come hither, my lord. The best actors in the world, either for tragedy, comedy, history, pastoral… these are the only men.' },
      { who: 'hamlet', text: 'You are welcome, masters; welcome, all. O, my old friend! thy face is valanced since I saw thee last.' },
      { who: 'hamlet', text: 'We’ll hear a play to-morrow. Can you play the Murder of Gonzago? — and could you study a speech of some dozen or sixteen lines, which I would set down and insert in’t?' },
      { who: 'playerking', text: 'Ay, my lord.' },
      { who: 'hamlet', text: 'Very well. Follow that lord; and look you mock him not.' },
      { who: 'hamlet', text: '(alone) I have heard that guilty creatures sitting at a play have by the very cunning of the scene been struck so to the soul that presently they have proclaim’d their malefactions.' },
      { who: 'hamlet', text: 'The play’s the thing wherein I’ll catch the conscience of the king.' },
    ],
  },
  {
    id: 'tobe', hour: 15, title: '“To be, or not to be”', ref: 'Act III, scene i — the soliloquy',
    place: 'rampE',
    marks: { hamlet: ['rampE', 0, 0] },
    lines: [
      { who: 'hamlet', text: 'To be, or not to be: that is the question:' },
      { who: 'hamlet', text: 'Whether ’tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them?' },
      { who: 'hamlet', text: 'To die: to sleep; no more; and by a sleep to say we end the heart-ache and the thousand natural shocks that flesh is heir to.' },
      { who: 'hamlet', text: 'To die, to sleep; to sleep: perchance to dream: ay, there’s the rub; for in that sleep of death what dreams may come… must give us pause.' },
      { who: 'hamlet', text: 'But that the dread of something after death, the undiscover’d country from whose bourn no traveller returns, puzzles the will…' },
      { who: 'hamlet', text: 'Thus conscience does make cowards of us all; and thus the native hue of resolution is sicklied o’er with the pale cast of thought.' },
    ],
  },
  {
    id: 'nunnery', hour: 15.75, title: 'The Nunnery Scene', ref: 'Act III, scene i — the lobby',
    place: 'chapelDoorOut',
    marks: { ophelia: ['chapelDoorOut', 0, 0], hamlet: ['chapelDoorOut', -3, -1], claudius: ['chapelDoorOut', 8, -2], polonius: ['chapelDoorOut', 10, -1] },
    lines: [
      { who: 'ophelia', text: 'Good my lord, how does your honour for this many a day?' },
      { who: 'hamlet', text: 'I humbly thank you; well, well, well.' },
      { who: 'ophelia', text: 'My lord, I have remembrances of yours, that I have longed long to re-deliver; I pray you, now receive them.' },
      { who: 'hamlet', text: 'No, not I; I never gave you aught.' },
      { who: 'hamlet', text: 'I did love you once.' },
      { who: 'ophelia', text: 'Indeed, my lord, you made me believe so.' },
      { who: 'hamlet', text: 'You should not have believed me… I loved you not.' },
      { who: 'ophelia', text: 'I was the more deceived.' },
      { who: 'hamlet', text: 'Get thee to a nunnery: why wouldst thou be a breeder of sinners? I am myself indifferent honest; but yet I could accuse me of such things that it were better my mother had not borne me.' },
      { who: 'hamlet', text: 'I say, we will have no more marriages: those that are married already, all but one, shall live. To a nunnery, go.' },
      { who: 'ophelia', text: 'O, what a noble mind is here o’erthrown! … O, woe is me, to have seen what I have seen, see what I see!' },
      { who: 'claudius', text: '(to Polonius) Love! his affections do not that way tend… There’s something in his soul o’er which his melancholy sits on brood.' },
      { who: 'claudius', text: 'He shall with speed to England… Madness in great ones must not unwatch’d go.' },
    ],
  },
  {
    id: 'flowers', hour: 17, title: 'Ophelia’s Flowers', ref: 'Act IV, scene v — the garden',
    place: 'gardenA',
    marks: { ophelia: ['gardenA', 0, 0], gertrude: ['gardenA', 2.5, 1], laertes: ['gardenA', -2.5, 1] },
    lines: [
      { who: 'ophelia', text: '(sings) How should I your true love know from another one? By his cockle hat and staff, and his sandal shoon.' },
      { who: 'gertrude', text: 'Alas, sweet lady, what imports this song?' },
      { who: 'ophelia', text: 'Say you? nay, pray you, mark. (sings) He is dead and gone, lady, he is dead and gone; at his head a grass-green turf, at his heels a stone.' },
      { who: 'laertes', text: 'O heat, dry up my brains! … Dear maid, kind sister, sweet Ophelia! O heavens! is’t possible, a young maid’s wits should be as mortal as an old man’s life?' },
      { who: 'ophelia', text: 'There’s rosemary, that’s for remembrance; pray, love, remember: and there is pansies, that’s for thoughts.' },
      { who: 'ophelia', text: 'There’s fennel for you, and columbines: there’s rue for you; and here’s some for me… there’s a daisy: I would give you some violets, but they withered all when my father died.' },
      { who: 'laertes', text: 'Thought and affliction, passion, hell itself, she turns to favour and to prettiness.' },
      { who: 'ophelia', text: '(sings) And will he not come again? No, no, he is dead: go to thy death-bed: he never will come again.' },
    ],
  },
  {
    id: 'mousetrap', hour: 19, title: 'The Mousetrap', ref: 'Act III, scene ii — the Great Hall',
    place: 'hallW',
    marks: {
      playerking: ['hallW', 0, -1.5], playerqueen: ['hallW', 2, -1.5], lucianus: ['hallW', -2.5, -1.5],
      claudius: ['hallW', 2, 3.5], gertrude: ['hallW', 4.5, 3.5], hamlet: ['hallW', -3, 4.3], ophelia: ['hallW', -5, 4.3],
      polonius: ['hallW', 7, 4.3], horatio: ['hallW', -8, 3.5], rosencrantz: ['hallW', 9, 5], guildenstern: ['hallW', 11, 5], laertes: ['hallW', -8, 5],
    },
    lines: [
      { who: 'hamlet', text: 'Speak the speech, I pray you, as I pronounced it to you, trippingly on the tongue… Suit the action to the word, the word to the action.' },
      { who: 'hamlet', text: '(to Horatio) There is a play to-night before the king; one scene of it comes near the circumstance of my father’s death. Observe mine uncle.' },
      { who: 'claudius', text: 'How fares our cousin Hamlet?' },
      { who: 'hamlet', text: 'Excellent, i’ faith; of the chameleon’s dish: I eat the air, promise-crammed.' },
      { who: 'playerking', text: '(performing) Full thirty times hath Phoebus’ cart gone round Neptune’s salt wash and Tellus’ orbed ground… since love our hearts and Hymen did our hands unite.' },
      { who: 'playerqueen', text: '(performing) Both here and hence pursue me lasting strife, if once a widow, ever I be wife!' },
      { who: 'hamlet', text: 'Madam, how like you this play?' },
      { who: 'gertrude', text: 'The lady doth protest much, methinks.' },
      { who: 'claudius', text: 'Have you heard the argument? Is there no offence in ’t?' },
      { who: 'hamlet', text: 'No, no, they do but jest, poison in jest; no offence i’ the world. The play is the image of a murder done in Vienna… ’tis a knavish piece of work: but what o’ that?' },
      { who: 'lucianus', text: '(performing) Thoughts black, hands apt, drugs fit, and time agreeing… thy natural magic and dire property on wholesome life usurp immediately.', action: 'poison' },
      { who: 'hamlet', text: 'He poisons him i’ the garden for’s estate… you shall see anon how the murderer gets the love of Gonzago’s wife.' },
      { who: 'ophelia', text: 'The king rises.' },
      { who: 'hamlet', text: 'What, frighted with false fire!' },
      { who: 'gertrude', text: 'How fares my lord?' },
      { who: 'polonius', text: 'Give o’er the play.' },
      { who: 'claudius', text: 'Give me some light: away!', action: 'kingFlees' },
      { who: 'hamlet', text: 'Why, let the stricken deer go weep, the hart ungalled play… O good Horatio, I’ll take the ghost’s word for a thousand pound. Didst perceive?' },
      { who: 'horatio', text: 'Very well, my lord… I did very well note him.' },
    ],
  },
  {
    id: 'prayer', hour: 21, title: 'The Prayer Scene', ref: 'Act III, scene iii — the chapel',
    place: 'altar',
    marks: { claudius: ['altar', 0, 0], hamlet: ['altar', -6, 0] },
    lines: [
      { who: 'claudius', text: 'O, my offence is rank, it smells to heaven; it hath the primal eldest curse upon’t, a brother’s murder.' },
      { who: 'claudius', text: 'What if this cursed hand were thicker than itself with brother’s blood, is there not rain enough in the sweet heavens to wash it white as snow?' },
      { who: 'claudius', text: 'But, O, what form of prayer can serve my turn? “Forgive me my foul murder”? That cannot be; since I am still possess’d of those effects for which I did the murder — my crown, mine own ambition and my queen.' },
      { who: 'hamlet', text: '(unseen) Now might I do it pat, now he is praying; and now I’ll do’t. And so he goes to heaven; and so am I revenged. That would be scann’d.' },
      { who: 'hamlet', text: 'A villain kills my father; and for that, I, his sole son, do this same villain send to heaven. O, this is hire and salary, not revenge.' },
      { who: 'hamlet', text: 'Up, sword; and know thou a more horrid hent… when he is drunk asleep, or in his rage — then trip him, that his heels may kick at heaven.' },
      { who: 'claudius', text: '(rising) My words fly up, my thoughts remain below: words without thoughts never to heaven go.' },
    ],
  },
  {
    id: 'duel', hour: 22, title: 'The Duel', ref: 'Act V, scene ii — the Great Hall',
    place: 'hallC',
    marks: {
      hamlet: ['hallC', -3, -3], laertes: ['hallC', 3, -3], claudius: ['hallC', 3, 3.5], gertrude: ['hallC', 0.5, 3.5],
      horatio: ['hallC', -6, 3], polonius: null, ophelia: null,
      rosencrantz: null, guildenstern: null,
    },
    lines: [
      { who: 'hamlet', text: 'Give me your pardon, sir: I’ve done you wrong… Was’t Hamlet wrong’d Laertes? Never Hamlet. His madness is poor Hamlet’s enemy.' },
      { who: 'laertes', text: 'I am satisfied in nature… I do receive your offer’d love like love, and will not wrong it.' },
      { who: 'hamlet', text: 'Give us the foils. Come on.', action: 'fence' },
      { who: 'claudius', text: 'Set me the stoups of wine upon that table. If Hamlet give the first or second hit… the king shall drink to Hamlet’s better breath; and in the cup an union shall he throw.' },
      { who: 'hamlet', text: 'One.' },
      { who: 'laertes', text: 'No.' },
      { who: 'hamlet', text: 'Judgment. — A hit, a very palpable hit.' },
      { who: 'gertrude', text: 'The queen carouses to thy fortune, Hamlet. (drinks)' },
      { who: 'claudius', text: '(aside) It is the poison’d cup: it is too late.' },
      { who: 'laertes', text: 'Have at you now!', action: 'fence2' },
      { who: 'gertrude', text: 'No, no, the drink, the drink — O my dear Hamlet — the drink, the drink! I am poison’d.', action: 'gertrudeFalls' },
      { who: 'laertes', text: '(falling) Hamlet, thou art slain… the treacherous instrument is in thy hand, unbated and envenom’d… the king, the king’s to blame.', action: 'laertesFalls' },
      { who: 'hamlet', text: 'The point envenom’d too! Then, venom, to thy work.', action: 'kingFalls' },
      { who: 'laertes', text: 'He is justly served… Exchange forgiveness with me, noble Hamlet: mine and my father’s death come not upon thee, nor thine on me!' },
      { who: 'hamlet', text: 'Heaven make thee free of it! I follow thee… I am dead, Horatio. Wretched queen, adieu!' },
      { who: 'hamlet', text: 'O, I could tell you — but let it be. Horatio, I am dead; thou livest; report me and my cause aright to the unsatisfied.' },
      { who: 'hamlet', text: 'The rest is silence.', action: 'hamletFalls' },
      { who: 'horatio', text: 'Now cracks a noble heart. Good night, sweet prince, and flights of angels sing thee to thy rest!' },
      { who: 'horatio', text: 'And let me speak to the yet unknowing world how these things came about… All this can I truly deliver.' },
    ],
  },
  {
    id: 'graves', hour: 11, title: 'The Gravediggers', ref: 'Act V, scene i — the churchyard',
    place: 'graveyard',
    marks: { gravedigger: ['graveyard', 0, 0], sexton2: ['graveyard', 2.5, 0.5], hamlet: null, horatio: null },
    optional: true,
    lines: [
      { who: 'gravedigger', text: 'Is she to be buried in Christian burial that wilfully seeks her own salvation?' },
      { who: 'sexton2', text: 'I tell thee she is: and therefore make her grave straight: the crowner hath sat on her, and finds it Christian burial.' },
      { who: 'gravedigger', text: 'How can that be, unless she drowned herself in her own defence? … Here lies the water; good: here stands the man; good.' },
      { who: 'sexton2', text: 'Who builds stronger than a mason, a shipwright, or a carpenter?' },
      { who: 'gravedigger', text: 'A grave-maker: the houses that he makes last till doomsday. (sings) In youth, when I did love, did love, methought it was very sweet…' },
      { who: 'gravedigger', text: 'Here’s a skull now; this skull has lain in the earth three and twenty years… This same skull, sir, was Yorick’s skull, the king’s jester.' },
    ],
  },
];

// ─── Daily schedules (outside scenes). Activities by [startHour, endHour) ────
// type: idle | wander | patrol | off ; nodes are nav-node ids
EC.SCHEDULES = {
  hamlet: [
    [0, 3, { type: 'wander', nodes: ['rampE', 'rampNE', 'rampN'] }],
    [3, 8.5, { type: 'off' }],
    [8.5, 10.5, { type: 'idle', node: 'hallE' }],
    [10.5, 13.5, { type: 'wander', nodes: ['cyE', 'cyC', 'cyS'] }],
    [13.5, 16.5, { type: 'wander', nodes: ['cyC', 'rampE', 'chapelDoorOut'] }],
    [16.5, 18.5, { type: 'wander', nodes: ['rampE', 'rampSE', 'battery2'] }],
    [18.5, 21, { type: 'idle', node: 'hallW' }],
    [21, 23, { type: 'wander', nodes: ['altar', 'chapelIn', 'hallC'] }],
    [23, 24, { type: 'wander', nodes: ['rampN', 'rampE'] }],
  ],
  claudius: [
    [0, 8, { type: 'off' }],
    [8, 11, { type: 'idle', node: 'hallE' }],
    [11, 14, { type: 'wander', nodes: ['hallE', 'hallC', 'cyW'] }],
    [14, 17, { type: 'wander', nodes: ['chapelDoorOut', 'cyS', 'gardenB'] }],
    [17, 19, { type: 'wander', nodes: ['gardenA', 'gardenB', 'cyS'] }],
    [19, 21, { type: 'idle', node: 'hallW' }],
    [21, 22, { type: 'idle', node: 'altar' }],
    [22, 24, { type: 'idle', node: 'hallC' }],
  ],
  gertrude: [
    [0, 8.5, { type: 'off' }],
    [8.5, 11, { type: 'idle', node: 'hallE' }],
    [11, 14, { type: 'wander', nodes: ['cyW', 'cyC', 'cyN'] }],
    [14, 16.5, { type: 'wander', nodes: ['gardenA', 'gardenB'] }],
    [16.5, 18.5, { type: 'wander', nodes: ['gardenA', 'cyS', 'gardenB'] }],
    [18.5, 22.5, { type: 'idle', node: 'hallW' }],
    [22.5, 24, { type: 'off' }],
  ],
  ophelia: [
    [0, 8, { type: 'off' }],
    [8, 10, { type: 'wander', nodes: ['gardenA', 'gardenB'] }],
    [10, 12, { type: 'wander', nodes: ['cyW', 'cyS', 'chapelDoorOut'] }],
    [12, 14, { type: 'idle', node: 'chapelIn' }],
    [14, 16.5, { type: 'wander', nodes: ['chapelDoorOut', 'cyS'] }],
    [16.5, 18.5, { type: 'wander', nodes: ['gardenA', 'gardenB', 'willow'] }],
    [18.5, 20.5, { type: 'idle', node: 'hallW' }],
    [20.5, 24, { type: 'off' }],
  ],
  polonius: [
    [0, 7.5, { type: 'off' }],
    [7.5, 10.5, { type: 'wander', nodes: ['hallE', 'hallC', 'cyN'] }],
    [10.5, 13, { type: 'wander', nodes: ['courtW', 'cyC', 'cyE'] }],
    [13, 16.5, { type: 'wander', nodes: ['cyC', 'chapelDoorOut', 'cyS'] }],
    [16.5, 19, { type: 'wander', nodes: ['hallC', 'cyN', 'cyW'] }],
    [19, 21.5, { type: 'idle', node: 'hallW' }],
    [21.5, 24, { type: 'off' }],
  ],
  laertes: [
    [0, 8, { type: 'off' }],
    [8, 10.5, { type: 'patrol', nodes: ['cyC', 'cyS', 'cyC', 'cyN'] }],
    [10.5, 11.2, { type: 'idle', node: 'courtW' }],
    [11.2, 16.5, { type: 'off' }],
    [16.5, 18.5, { type: 'wander', nodes: ['gardenA', 'gardenB'] }],
    [18.5, 23, { type: 'idle', node: 'hallW' }],
    [23, 24, { type: 'off' }],
  ],
  horatio: [
    [0, 2.5, { type: 'wander', nodes: ['rampN', 'rampE', 'rampNE'] }],
    [2.5, 8.5, { type: 'off' }],
    [8.5, 12, { type: 'wander', nodes: ['hallE', 'cyN', 'cyE'] }],
    [12, 16, { type: 'wander', nodes: ['cyE', 'cyC', 'rampE'] }],
    [16, 18.5, { type: 'wander', nodes: ['rampE', 'battery2'] }],
    [18.5, 23, { type: 'idle', node: 'hallW' }],
    [23, 24, { type: 'wander', nodes: ['rampN', 'rampNE'] }],
  ],
  ghost: [
    [0, 2.5, { type: 'patrol', nodes: ['rampN', 'rampNE', 'rampE'], ghost: true }],
    [2.5, 23.5, { type: 'off' }],
    [23.5, 24, { type: 'patrol', nodes: ['rampN', 'rampNE'], ghost: true }],
  ],
  rosencrantz: [
    [0, 9, { type: 'off' }],
    [9, 18, { type: 'patrol', nodes: ['cyN', 'cyE', 'cyS', 'cyW'] }],
    [18, 22.5, { type: 'idle', node: 'hallW' }],
    [22.5, 24, { type: 'off' }],
  ],
  guildenstern: [
    [0, 9, { type: 'off' }],
    [9, 18, { type: 'patrol', nodes: ['cyE', 'cyS', 'cyW', 'cyN'] }],
    [18, 22.5, { type: 'idle', node: 'hallW' }],
    [22.5, 24, { type: 'off' }],
  ],
  marcellus: [
    [0, 3, { type: 'patrol', nodes: ['rampN', 'rampNE'] }],
    [3, 9, { type: 'off' }],
    [9, 15, { type: 'patrol', nodes: ['gateOut', 'apronW', 'rampGapW'] }],
    [15, 21, { type: 'patrol', nodes: ['rampSE', 'rampE', 'rampNE'] }],
    [21, 24, { type: 'patrol', nodes: ['rampN', 'rampNE'] }],
  ],
  barnardo: [
    [0, 3, { type: 'patrol', nodes: ['rampNE', 'rampN', 'rampNW'] }],
    [3, 10, { type: 'off' }],
    [10, 16, { type: 'idle', node: 'gateOut' }],
    [16, 22, { type: 'patrol', nodes: ['rampN', 'rampNW'] }],
    [22, 24, { type: 'patrol', nodes: ['rampN', 'rampNE'] }],
  ],
  francisco: [
    [0, 1, { type: 'idle', node: 'rampN' }],
    [1, 8, { type: 'off' }],
    [8, 14, { type: 'patrol', nodes: ['rampE', 'rampSE', 'rampS'] }],
    [14, 20, { type: 'idle', node: 'gateMid' }],
    [20, 24, { type: 'patrol', nodes: ['rampS', 'rampSE'] }],
  ],
  gravedigger: [
    [0, 8, { type: 'off' }],
    [8, 17.5, { type: 'idle', node: 'graveyard', anim: 'dig' }],
    [17.5, 24, { type: 'off' }],
  ],
  sexton2: [
    [0, 8.5, { type: 'off' }],
    [8.5, 17, { type: 'wander', nodes: ['graveyard', 'gyB'], anim: 'dig' }],
    [17, 24, { type: 'off' }],
  ],
  playerking: [
    [0, 13.2, { type: 'off' }],
    [13.2, 13.5, { type: 'idle', node: 'bridgeW' }],
    [13.5, 18.5, { type: 'wander', nodes: ['cyC', 'cyN'] }],
    [18.5, 20.5, { type: 'idle', node: 'hallW' }],
    [20.5, 24, { type: 'off' }],
  ],
  playerqueen: [
    [0, 13.2, { type: 'off' }],
    [13.2, 13.5, { type: 'idle', node: 'bridgeW' }],
    [13.5, 18.5, { type: 'wander', nodes: ['cyN', 'cyC'] }],
    [18.5, 20.5, { type: 'idle', node: 'hallW' }],
    [20.5, 24, { type: 'off' }],
  ],
  lucianus: [
    [0, 13.2, { type: 'off' }],
    [13.2, 13.5, { type: 'idle', node: 'bridgeW' }],
    [13.5, 18.5, { type: 'wander', nodes: ['cyC', 'cyS'] }],
    [18.5, 20.5, { type: 'idle', node: 'hallW' }],
    [20.5, 24, { type: 'off' }],
  ],
};

EC.ABOUT_HTML = `
<h2>Elsinore — Kronborg Castle</h2>
<p><b>Kronborg</b> stands at Helsingør (“Elsinore” in English), on the narrowest point of the
Øresund — the strait between Denmark and Sweden, barely 4&nbsp;km wide. A fortress called
<i>Krogen</i> (“the Hook”) was built here by King Erik of Pomerania in the 1420s to enforce the
<b>Sound Dues</b>: a toll on every ship entering or leaving the Baltic, for over 400 years one of
Denmark’s main sources of income.</p>
<p>King <b>Frederik II</b> rebuilt Krogen into a magnificent Dutch-Renaissance palace
(1574–1585) and renamed it <b>Kronborg</b> — “castle of the crown.” Its sandstone facades,
copper-green roofs, the 62-metre <b>Great Hall</b> (then the longest in Northern Europe), the
chapel of 1582, and the casemates beneath made it famous across Europe. The castle burned in
1629 (all but the chapel), was rebuilt by Christian IV, stormed and looted by Swedish troops in
1658, and afterwards ringed with the massive star-shaped ramparts you can walk today. From 1739
to the 1900s it served as barracks and a prison. It became a <b>UNESCO World Heritage Site</b>
in 2000.</p>
<h2>Hamlet at Elsinore</h2>
<p>Shakespeare set <i>The Tragedie of Hamlet, Prince of Denmarke</i> (written ≈1600) at
“Elsinore,” drawing on the medieval Danish legend of <b>Amleth</b> recorded by Saxo
Grammaticus around 1200. He almost certainly never saw the castle — but English actors
(including Will Kempe, later the clown of Shakespeare’s own company) performed at Elsinore in
1585–86, when Kronborg was brand new and the talk of Europe. Since 1816 the play has returned
home: Hamlet is regularly staged in the castle courtyard, with Hamlets including Laurence
Olivier (1937), John Gielgud, Richard Burton, Christopher Plummer, Derek Jacobi and Jude Law.</p>
<h2>This replica</h2>
<p>The model is laid out at <b>true scale</b>: a four-winged palace around a 50×40&nbsp;m
courtyard, the 62&nbsp;m Great Hall, the Trumpeter’s Tower (≈62&nbsp;m), ramparts, moat,
gun battery facing the Sound — and Sweden on the horizon. It is a faithful <i>impression</i>,
not a survey model; one liberty is marked on its plaque (the Great Hall is shown at courtyard
level — in reality it is on the upper floor of the south wing). Around the grounds,
<b>fifteen ⓘ markers</b> tell the castle’s history, and the residents of Elsinore play out
<b>twelve scenes from Hamlet</b> on a daily cycle — open the <b>Playbill</b> to jump to any of
them. All dialogue is Shakespeare’s text.</p>
<h2>Tips</h2>
<p>Time runs fast (one castle day ≈ 12 minutes; use ⏸/1×/3× or the Playbill’s
“Go” buttons). The Ghost only walks between midnight and cock-crow. You cannot swim in the
moat or the Sound — Ophelia’s fate is warning enough.</p>`;
