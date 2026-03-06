/**
 * Content data for "The Things They Carried" Literary Quest
 *
 * Structure: Zones > Challenges > Questions
 * Each zone represents a major theme from the novel.
 * Questions have multiple difficulty tiers for adaptive difficulty.
 */

const GAME_CONTENT = {
    title: "The Things They Carried",
    subtitle: "A Literary Quest",
    author: "Tim O'Brien",

    // Zone definitions - each is an area on the map
    zones: [
        {
            id: "weight",
            name: "The Weight of War",
            description: "Explore the literal and figurative burdens the soldiers carry — from physical gear to emotional weight.",
            mapPosition: { x: 200, y: 350 },
            color: "#e94560",
            unlocked: true, // First zone always unlocked
            challenges: [
                {
                    id: "weight_mc1",
                    type: "multiple-choice",
                    difficulty: { easy: 0, medium: 1, hard: 2 },
                    representations: {
                        text: {
                            prompt: "In the opening chapter, O'Brien meticulously lists the physical items each soldier carries. What is the primary literary purpose of this cataloging technique?",
                            passage: "The things they carried were largely determined by necessity. Among the necessities or near-necessities were P-38 can openers, pocket knives, heat tabs, wristwatches, dog tags, mosquito repellent, chewing gum, candy, cigarettes, salt tablets, packets of Kool-Aid, lighters, matches, sewing kits, Military Payment Certificates, C rations, and two or three canteens of water."
                        },
                        visual: {
                            prompt: "Look at how O'Brien builds his list. Each item tells us something. What is the MAIN literary purpose of listing all these items?",
                            description: "[Imagine a soldier's rucksack, overflowing — each item labeled with its weight in pounds. The physical load is visible, tangible, measurable. But notice: the list keeps growing...]"
                        },
                        audio: "O'Brien reads a long list of items soldiers carry: can openers, knives, dog tags, cigarettes, Kool-Aid, lighters, canteens. The list goes on and on — each item precise, each weight measured. The rhythm of the list is almost hypnotic, relentless, like the weight itself."
                    },
                    tiers: [
                        {
                            // Easy
                            options: [
                                { text: "To show how heavy their packs were", correct: false },
                                { text: "To establish the physical AND emotional weight soldiers bear", correct: true },
                                { text: "To provide historical accuracy about Vietnam War equipment", correct: false },
                                { text: "To fill space in the opening chapter", correct: false }
                            ],
                            feedback: {
                                correct: "Exactly! The cataloging serves as a metaphor — the physical items parallel the emotional burdens each soldier carries. O'Brien uses concrete details to make abstract feelings tangible.",
                                incorrect: "Think about why O'Brien includes BOTH physical items (like ammunition) and personal items (like letters from a girlfriend). What might that contrast suggest about what soldiers really 'carry'?"
                            }
                        },
                        {
                            // Medium
                            options: [
                                { text: "It creates a catalog that blurs the line between physical necessities and emotional burdens, showing war's total weight", correct: true },
                                { text: "It demonstrates O'Brien's journalistic background and attention to factual detail", correct: false },
                                { text: "It slows down the narrative pace to build suspense about upcoming combat", correct: false },
                                { text: "It provides readers with historical context about standard military equipment in Vietnam", correct: false }
                            ],
                            feedback: {
                                correct: "Strong analysis! The catalog technique is central to O'Brien's method — by interweaving tangible objects with intangible emotions, he shows that the 'things they carried' were never just physical.",
                                incorrect: "Consider how the list transitions from standard military gear to very personal items. What does that shift in the catalog tell us about O'Brien's deeper purpose?"
                            }
                        },
                        {
                            // Hard
                            options: [
                                { text: "The repetitive structure mirrors the monotony of war while the evolving content of each 'carry' reveals the soldiers' inner lives", correct: true },
                                { text: "The catalog creates narrative distance that prevents readers from emotionally connecting with the soldiers", correct: false },
                                { text: "The technique is primarily borrowed from Hemingway's iceberg theory to hide meaning beneath simple prose", correct: false },
                                { text: "The listing format is O'Brien's way of avoiding traditional character development", correct: false }
                            ],
                            feedback: {
                                correct: "Excellent literary analysis! You've identified how form mirrors content — the repetitive structure of carrying IS the experience of war, and each item cataloged adds another layer to our understanding of these soldiers as complete human beings.",
                                incorrect: "Think about the FORM of the list itself (its rhythm, its repetition) alongside its CONTENT (what's being listed). How does the way it's written mirror the experience it describes?"
                            }
                        }
                    ],
                    hints: [
                        "Notice that O'Brien doesn't just list military gear. He also lists personal items. Why both?",
                        "Think about the word 'carried.' Can you carry something that isn't physical? What might soldiers 'carry' emotionally?",
                        "The title of the book IS the answer — 'The Things They Carried' refers to both physical weight and emotional burdens. The catalog makes this dual meaning concrete."
                    ]
                },
                {
                    id: "weight_drag1",
                    type: "drag-and-drop",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "Match each item from the novel to whether it represents a PHYSICAL burden or an EMOTIONAL burden carried by the soldiers.",
                        },
                        visual: {
                            prompt: "Sort these items into two categories: things that weigh down the body vs. things that weigh down the mind and heart.",
                            description: "[Two rucksacks side by side — one labeled 'Body' filled with gear, one labeled 'Soul' filled with memories and feelings]"
                        },
                        audio: "You'll hear items from the story. Decide if each one weighs on the soldiers' bodies or on their hearts and minds. Some might seem tricky — trust your instincts about what kind of weight each one really is."
                    },
                    items: [
                        { text: "Twenty-pound mine detector", category: "Physical Burden" },
                        { text: "Grief over Ted Lavender's death", category: "Emotional Burden" },
                        { text: "M-16 ammunition", category: "Physical Burden" },
                        { text: "Jimmy Cross's guilt about his leadership", category: "Emotional Burden" },
                        { text: "Poncho and poncho liner", category: "Physical Burden" },
                        { text: "Letters from Martha", category: "Emotional Burden" },
                        { text: "C rations and canteens", category: "Physical Burden" },
                        { text: "Fear of being seen as a coward", category: "Emotional Burden" }
                    ],
                    categories: ["Physical Burden", "Emotional Burden"],
                    feedback: {
                        correct: "Well done! Notice how O'Brien weaves these two types of burdens together throughout the narrative. The physical weight is measurable in pounds; the emotional weight is immeasurable but far heavier.",
                        partial: "You're on the right track! Remember: letters from Martha aren't just paper — they represent Jimmy Cross's longing, distraction, and eventually his guilt. Think about what each item MEANS to the soldiers.",
                        incorrect: "Let's reconsider. Think about each item: could you put it on a scale and weigh it? If yes, it's physical. If it's a feeling, memory, or psychological state, it's emotional."
                    },
                    hints: [
                        "If you can measure it in pounds or hold it in your hands, it's a physical burden.",
                        "Emotional burdens are things like guilt, fear, grief, and longing — you can't put them in a rucksack, but they weigh heavily.",
                        "The letters from Martha might seem physical (they're paper), but in the context of the story, what do they REPRESENT for Jimmy Cross? Think about the emotional weight they carry."
                    ]
                },
                {
                    id: "weight_typed1",
                    type: "typed-response",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "After Ted Lavender is shot, Lieutenant Jimmy Cross burns Martha's letters and photographs. In 3-5 sentences, analyze what this act of burning symbolizes about Cross's internal conflict between love and duty.",
                            passage: "He burned the two photographs. He was in a full day's march and it felt like more. He felt shame. He hated himself. He had loved Martha more than his men, and as a consequence Lavender was now dead, and this was something he would have to carry like a stone in his stomach for the rest of the war."
                        },
                        visual: {
                            prompt: "Jimmy Cross burns Martha's letters after Lavender dies. In 3-5 sentences, explain what this burning symbolizes about his struggle between love and duty.",
                            description: "[A campfire at night in the jungle. A lieutenant feeds letters and photographs into the flames. His face shows both determination and grief. The smoke rises, but the weight remains.]"
                        },
                        audio: "After Ted Lavender is killed, Jimmy Cross blames himself. He was thinking about Martha — a girl back home — when it happened. That night, Cross burns all of Martha's letters and photos. He tells himself he will become a better leader. Analyze: what does this burning symbolize about Cross's conflict between love and responsibility?"
                    },
                    minWords: 30,
                    reflectionPrompts: [
                        "Did you address what the BURNING specifically symbolizes (not just that he's sad)?",
                        "Did you connect Cross's action to the larger theme of emotional vs. physical burdens?",
                        "Did you consider whether burning the letters actually relieves Cross of his emotional burden, or does it add a new one?"
                    ],
                    rubricGuidance: "Look for: (1) Understanding that burning = attempting to shed emotional weight, (2) Recognition that it represents choosing duty over personal attachment, (3) Deeper insight that the guilt remains despite the symbolic act — the 'stone in his stomach' persists.",
                    hints: [
                        "Think about fire as a symbol. What does burning something usually represent? Destruction? Purification? A fresh start?",
                        "Cross burns the letters BECAUSE Lavender died. What does he believe the connection is between Martha's letters and Lavender's death?",
                        "Here's the key tension: Cross burns the letters to become a 'better leader,' but O'Brien tells us he carries the guilt 'like a stone in his stomach.' Does the burning actually work? What does that tell us?"
                    ]
                }
            ]
        },
        {
            id: "truth",
            name: "Story-Truth vs. Happening-Truth",
            description: "Examine O'Brien's revolutionary concept of truth in war stories — when does fiction become more real than fact?",
            mapPosition: { x: 500, y: 200 },
            color: "#3498db",
            unlocked: false,
            challenges: [
                {
                    id: "truth_mc1",
                    type: "multiple-choice",
                    difficulty: { easy: 0, medium: 1, hard: 2 },
                    representations: {
                        text: {
                            prompt: "O'Brien writes: 'I want you to feel what I felt. I want you to know why story-truth is truer sometimes than happening-truth.' What does he mean by 'story-truth'?",
                            passage: "I can look at things I never looked at. I can attach faces to grief and love and pity and God. I can be brave. I can make myself feel again... Story-truth is truer sometimes than happening-truth."
                        },
                        visual: {
                            prompt: "O'Brien says 'story-truth is truer than happening-truth.' What does he mean?",
                            description: "[Two paths diverge: one labeled 'What Actually Happened' (dry, factual, clinical) and another labeled 'What It Felt Like' (vivid, emotional, alive). The second path glows with color while the first is in gray.]"
                        },
                        audio: "O'Brien tells us directly: story-truth can be MORE true than what actually happened. He says through fiction he can look at things he never looked at, feel things again, be brave. Think about it — sometimes a made-up story captures the FEELING of an experience better than a factual report."
                    },
                    tiers: [
                        {
                            options: [
                                { text: "Stories that are completely made up but entertaining", correct: false },
                                { text: "Fictional stories that capture the emotional reality of an experience more accurately than facts alone", correct: true },
                                { text: "The true version of events as the author remembers them", correct: false },
                                { text: "Stories told by soldiers that have been verified as accurate", correct: false }
                            ],
                            feedback: {
                                correct: "Yes! 'Story-truth' means that sometimes fiction captures the EMOTIONAL reality of war more powerfully than a strict factual account ever could. O'Brien argues that how something FELT can be more important than what literally happened.",
                                incorrect: "Think about the difference between a news report about a battle and a novel about a battle. Which one helps you FEEL what the soldiers felt? That's the key to 'story-truth.'"
                            }
                        },
                        {
                            options: [
                                { text: "Story-truth uses narrative techniques like imagery and emotion to convey experiential reality that transcends factual accuracy", correct: true },
                                { text: "Story-truth is O'Brien's term for unreliable narration, showing how memory distorts events", correct: false },
                                { text: "Story-truth refers to the moral lessons embedded in fictional war narratives", correct: false },
                                { text: "Story-truth is the author's way of admitting his accounts are fictional, not autobiographical", correct: false }
                            ],
                            feedback: {
                                correct: "Sophisticated reading! O'Brien's concept of story-truth challenges the traditional hierarchy of fact over fiction, suggesting that narrative truth — conveyed through imagery, emotion, and craft — can access a deeper reality than factual reporting.",
                                incorrect: "Story-truth isn't about memory distortion or moral lessons. It's about how NARRATIVE TECHNIQUES (imagery, emotion, sensory detail) can sometimes capture reality more powerfully than facts alone."
                            }
                        },
                        {
                            options: [
                                { text: "O'Brien's metafictional framework positions story-truth as an epistemological argument: lived experience is better represented through constructed narrative than through empirical recounting", correct: true },
                                { text: "Story-truth functions as postmodern deconstruction that ultimately undermines all claims to truth in war literature", correct: false },
                                { text: "Story-truth is O'Brien's defense of confessional autobiography disguised as fiction to protect real people's identities", correct: false },
                                { text: "Story-truth represents O'Brien's belief that all war narratives are equally valid regardless of factual basis", correct: false }
                            ],
                            feedback: {
                                correct: "Outstanding analysis! You've grasped the epistemological dimension — O'Brien isn't just telling war stories, he's making an argument about how we can KNOW and COMMUNICATE lived experience. Story-truth is his answer: craft and emotion bridge the gap between experience and understanding.",
                                incorrect: "O'Brien isn't deconstructing all truth or protecting identities. His argument is constructive: narrative craft can ACCESS truth that factual reporting misses. It's about how we communicate and understand experience, not about undermining truth."
                            }
                        }
                    ],
                    hints: [
                        "Think about the difference between reading statistics about a war and reading a powerful story about one soldier's experience. Which helps you UNDERSTAND war better?",
                        "O'Brien says he can 'make myself feel again' through story-truth. The key word is FEEL. Story-truth captures emotional and experiential reality.",
                        "Story-truth = a crafted narrative that makes you feel the reality of an experience. Happening-truth = factual account of what literally occurred. O'Brien argues the first can be MORE true because it conveys what facts alone cannot."
                    ]
                },
                {
                    id: "truth_mc2",
                    type: "multiple-choice",
                    difficulty: { easy: 0, medium: 1, hard: 2 },
                    representations: {
                        text: {
                            prompt: "In 'How to Tell a True War Story,' O'Brien writes that a true war story is never moral and never seems to end. What literary technique is O'Brien primarily using throughout this chapter?",
                            passage: "In any war story, but especially a true one, it's difficult to separate what happened from what seemed to happen. What seems to happen becomes its own happening and has to be told that way."
                        },
                        visual: {
                            prompt: "O'Brien keeps redefining what a 'true war story' is, contradicting himself, telling and retelling the same events. What technique is this?",
                            description: "[A spiral of text, each layer telling the same story slightly differently. The narrator's voice appears both inside and outside the story, commenting on its own telling.]"
                        },
                        audio: "In this chapter, O'Brien tells a story, then says it might not have happened that way. He tells it again differently. He talks about what makes a war story 'true' while actively constructing a war story. He's writing about writing — fiction about fiction."
                    },
                    tiers: [
                        {
                            options: [
                                { text: "Flashback — telling events out of chronological order", correct: false },
                                { text: "Metafiction — writing that is self-aware and reflects on its own storytelling", correct: true },
                                { text: "Stream of consciousness — unfiltered thoughts flowing freely", correct: false },
                                { text: "Allegory — using the story as a symbol for something else entirely", correct: false }
                            ],
                            feedback: {
                                correct: "Right! O'Brien uses metafiction — fiction that draws attention to its own fictional status. He's simultaneously telling a war story AND examining what it means to tell a war story. This self-awareness is central to the book.",
                                incorrect: "The key clue is that O'Brien is writing ABOUT the act of writing. He's telling stories while questioning what stories are and whether they can be 'true.' What do we call fiction that examines itself?"
                            }
                        },
                        {
                            options: [
                                { text: "Metafiction — the narrative self-consciously examines its own construction, blurring the line between author, narrator, and character", correct: true },
                                { text: "Magical realism — the narrative incorporates impossible elements presented as ordinary to convey emotional truth", correct: false },
                                { text: "Epistolary technique — the story is told through a collection of documents and letters from the war", correct: false },
                                { text: "Dramatic irony — the reader knows more about events than the narrator reveals", correct: false }
                            ],
                            feedback: {
                                correct: "Excellent! The metafiction in this chapter operates on multiple levels — O'Brien the author creates a narrator named 'Tim O'Brien' who writes about writing about war. This layering IS the point: truth in war stories is always constructed, always mediated.",
                                incorrect: "Focus on how the narrator is writing about writing. He tells a story, then questions it, then retells it. The fiction is examining ITSELF. This self-reflective quality is the hallmark of which technique?"
                            }
                        },
                        {
                            options: [
                                { text: "O'Brien's metafiction creates an infinite regression where the act of storytelling becomes both subject and method, arguing that war's truth can only be approached obliquely through self-aware narrative", correct: true },
                                { text: "The technique is primarily unreliable narration designed to make readers distrust all war narratives and question veteran testimony", correct: false },
                                { text: "O'Brien uses dramatic monologue in the tradition of Browning, revealing character through the narrator's unintentional self-exposure", correct: false },
                                { text: "The chapter employs Brechtian alienation to prevent readers from emotionally engaging with the war content", correct: false }
                            ],
                            feedback: {
                                correct: "Brilliant! You've identified the recursive nature of O'Brien's metafiction — it's not just that he writes about writing, but that this self-awareness IS the only honest way to approach war's truth. The technique and the theme are inseparable.",
                                incorrect: "O'Brien's goal isn't to create distrust or emotional distance — it's the opposite. By being transparent about the limits and powers of storytelling, he argues that self-aware fiction is the most HONEST approach to communicating war's reality."
                            }
                        }
                    ],
                    hints: [
                        "O'Brien is writing a story about... how to write a story. What do we call that?",
                        "When a novel or story draws attention to the fact that it IS a story — when fiction examines fiction — that's a specific literary technique. It starts with 'meta-'...",
                        "Metafiction = fiction about fiction. O'Brien writes a war story while simultaneously examining what makes a war story 'true.' The chapter is both the story and the analysis of the story at the same time."
                    ]
                },
                {
                    id: "truth_typed1",
                    type: "typed-response",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "O'Brien deliberately blurs the line between fiction and autobiography — the narrator shares his name, yet the book is labeled fiction. In 3-5 sentences, argue whether this blurring strengthens or weakens the book's exploration of truth. Use at least one specific example from the text.",
                            passage: "By telling stories, you objectify your own experience. You separate it from yourself. You pin down certain truths."
                        },
                        visual: {
                            prompt: "The author Tim O'Brien writes a 'fictional' book with a narrator named Tim O'Brien. Does this blurring of fiction and reality make the book's message about truth STRONGER or WEAKER? Argue your position in 3-5 sentences.",
                            description: "[A mirror reflecting a man writing — but the reflection shows a soldier. Are they the same person? Different people? The mirror's frame is labeled 'FICTION' but the images feel completely real.]"
                        },
                        audio: "Here's something strange about this book: the author is Tim O'Brien. The narrator is also named Tim O'Brien. But the book says it's fiction. O'Brien deliberately makes you wonder: is this real? Is this made up? Does it matter? In 3-5 sentences, argue whether this blurring makes the book's exploration of truth stronger or weaker."
                    },
                    minWords: 40,
                    reflectionPrompts: [
                        "Did you take a clear position (strengthens OR weakens) and argue for it?",
                        "Did you include at least one specific example or reference from the text?",
                        "Did you connect your argument back to the book's larger theme about truth and storytelling?"
                    ],
                    rubricGuidance: "Look for: (1) A clear argumentative position, (2) At least one textual reference, (3) Connection to the truth/fiction theme, (4) Reasoning that goes beyond surface-level observation.",
                    hints: [
                        "Start by deciding your position: does the blurring make the book stronger or weaker? There's no single right answer — what matters is how well you argue it.",
                        "Think about a specific moment in the book where you couldn't tell if something was 'real' or 'fiction.' How did that uncertainty make you feel? Did it enhance or diminish the experience?",
                        "Consider: if O'Brien had written a straightforward memoir, would it have the same power? Or does the deliberate confusion between fact and fiction actually FORCE the reader to think about what truth means?"
                    ]
                }
            ]
        },
        {
            id: "memory",
            name: "Memory & Trauma",
            description: "Investigate how memory, trauma, and storytelling intertwine — why do the soldiers keep returning to the same moments?",
            mapPosition: { x: 750, y: 400 },
            color: "#9b59b6",
            unlocked: false,
            challenges: [
                {
                    id: "memory_mc1",
                    type: "multiple-choice",
                    difficulty: { easy: 0, medium: 1, hard: 2 },
                    representations: {
                        text: {
                            prompt: "Throughout the book, O'Brien returns to certain events multiple times, telling them differently each time. What does this repetition-with-variation suggest about the relationship between memory and trauma?",
                        },
                        visual: {
                            prompt: "O'Brien tells the same stories over and over, but each telling is different. What does this say about memory and trauma?",
                            description: "[A series of photographs of the same event, but each photo is slightly different — different colors, different angles, different details emphasized. Some are sharp, some are blurred. All are of the same moment.]"
                        },
                        audio: "O'Brien tells us about certain events — like Kiowa's death — multiple times throughout the book. But each time, the details shift. The story changes. Is his memory failing? Or is something deeper happening? What does this repetition tell us about how trauma affects memory?"
                    },
                    tiers: [
                        {
                            options: [
                                { text: "O'Brien has a bad memory and can't remember events accurately", correct: false },
                                { text: "Trauma causes memories to be relived and reprocessed, and each retelling is an attempt to understand and cope", correct: true },
                                { text: "He's showing that all war memoirs are unreliable and shouldn't be trusted", correct: false },
                                { text: "The repetition is just a structural choice to fill more pages in the book", correct: false }
                            ],
                            feedback: {
                                correct: "Exactly! The repetition mirrors how trauma actually works in the mind — traumatic memories aren't stored neatly, they're revisited, reprocessed, and retold as the person tries to make sense of what happened. Each retelling is an act of survival.",
                                incorrect: "Think about why someone might tell the same story multiple times. Have you ever had an experience so powerful you kept coming back to it, trying to understand it? That's what trauma does — it demands to be processed."
                            }
                        },
                        {
                            options: [
                                { text: "The compulsive retelling reflects trauma's fragmentation of memory, where each iteration attempts to reconstruct wholeness from shattered experience", correct: true },
                                { text: "The variations demonstrate postmodern skepticism about narrative authority and the impossibility of objective truth", correct: false },
                                { text: "The repetition is an editing flaw that O'Brien retained to preserve the raw authenticity of his draft", correct: false },
                                { text: "Each retelling targets a different audience, showing O'Brien's versatility as a writer", correct: false }
                            ],
                            feedback: {
                                correct: "Insightful! The fragmentation in the retellings mirrors psychological research on traumatic memory — trauma shatters linear narrative, and the mind returns again and again to the fragments, trying to reassemble meaning from broken pieces.",
                                incorrect: "The key is in the word 'compulsive.' The narrator doesn't CHOOSE to retell — he's DRIVEN to. Think about what psychological force would cause someone to return to the same painful moment repeatedly."
                            }
                        },
                        {
                            options: [
                                { text: "O'Brien's spiral narrative structure enacts the psychological mechanism of traumatic memory, where repetition functions as both symptom and therapy — the retelling is simultaneously the wound and the attempt to heal it", correct: true },
                                { text: "The multiple versions create a Rashomon effect that primarily serves to question eyewitness reliability in combat situations", correct: false },
                                { text: "The narrative loops represent O'Brien's formal experiment with cyclical time, influenced by Nietzsche's concept of eternal recurrence", correct: false },
                                { text: "The repetitions function as oral storytelling conventions, reflecting the communal nature of soldiers' narratives around campfires", correct: false }
                            ],
                            feedback: {
                                correct: "Exceptional analysis! You've identified the paradox at the heart of the book — the repetitive telling IS the trauma (the mind stuck in a loop), but it's also the therapy (each telling processes a bit more, heals a bit more). The form of the narrative IS its content.",
                                incorrect: "While those are interesting frameworks, consider how the repetition functions psychologically for the narrator. It's not primarily about philosophical concepts or oral tradition — it's about a mind trying to heal itself through the act of storytelling."
                            }
                        }
                    ],
                    hints: [
                        "Think about what happens after a really intense experience. Do you think about it once and move on, or does your mind keep returning to it?",
                        "Trauma therapists know that traumatic memories often need to be revisited and retold many times before they can be processed. Each retelling is part of healing.",
                        "The repetition in the book mirrors how trauma works: the mind returns to the same moment compulsively, each time processing it differently. The retelling is both the symptom (being stuck) and the cure (working through it)."
                    ]
                },
                {
                    id: "memory_drag1",
                    type: "drag-and-drop",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "Match each character's coping mechanism to the character who uses it in the novel.",
                        },
                        visual: {
                            prompt: "Each soldier copes with trauma differently. Match the coping mechanism to the right character.",
                            description: "[Silhouettes of soldiers, each with a different posture — one hunched writing, one standing rigid with fists clenched, one with head bowed holding a photograph, one laughing wildly]"
                        },
                        audio: "Different soldiers deal with the horror of war in different ways. Some tell jokes, some withdraw, some become obsessive. Match each coping mechanism you see to the character from the book who uses it."
                    },
                    items: [
                        { text: "Burns personal mementos and vows to be a better leader", category: "Jimmy Cross" },
                        { text: "Uses dark humor and mockery to deflect from horror", category: "Azar" },
                        { text: "Retreats into storytelling and narrative as a way to process", category: "Tim O'Brien (narrator)" },
                        { text: "Carries his girlfriend's stockings as a protective talisman", category: "Henry Dobbins" },
                        { text: "Goes AWOL to escape the unbearable reality of war", category: "Rat Kiley" },
                        { text: "Dances with grace amidst destruction, transcending the war mentally", category: "Norman Bowker" }
                    ],
                    categories: ["Jimmy Cross", "Azar", "Tim O'Brien (narrator)", "Henry Dobbins", "Rat Kiley", "Norman Bowker"],
                    feedback: {
                        correct: "Excellent! Each character's coping mechanism reveals something profound about them. O'Brien shows that trauma doesn't have a single response — each soldier finds their own way to carry the psychological weight.",
                        partial: "Good effort! Some of these are tricky. Remember: each character's way of coping is deeply personal and tells us about their inner world. Think about what each mechanism MEANS for that character.",
                        incorrect: "Let's reconsider. Think about each character's personality and what we know about them. Jimmy Cross is the lieutenant burdened by guilt. Azar is the one always making dark jokes. The narrator processes through writing."
                    },
                    hints: [
                        "Think about who is in a leadership position and feels responsible for deaths. That's the character who tries to become 'harder' by burning personal items.",
                        "Which character is the writer? Who tells us this story? That character copes through narrative and storytelling.",
                        "Henry Dobbins is described as superstitious and gentle. He carries something belonging to his girlfriend. What does he carry, and why?"
                    ]
                },
                {
                    id: "memory_typed1",
                    type: "typed-response",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "In 'Speaking of Courage,' Norman Bowker drives endlessly around a lake after returning home, unable to communicate his war experiences to anyone. In 3-5 sentences, analyze what the circular driving symbolizes and connect it to one other character's experience of being unable to escape the past.",
                        },
                        visual: {
                            prompt: "Norman Bowker drives in circles around a lake, going nowhere, unable to talk about the war. What does this symbolize? Connect it to another character who is also trapped by the past. Write 3-5 sentences.",
                            description: "[An aerial view of a car driving around and around a lake, tracing the same path over and over. The road forms a perfect circle. There is no exit ramp. The sun sets and rises and the car is still circling.]"
                        },
                        audio: "Norman Bowker comes home from Vietnam. He drives around and around a lake in his hometown, all day, all night. He wants to talk about what happened, but he can't. He drives in circles. Think about what this endless circling means symbolically, and connect it to another character who is also stuck in a loop."
                    },
                    minWords: 40,
                    reflectionPrompts: [
                        "Did you explain what the circular driving SYMBOLIZES (not just describe it)?",
                        "Did you connect Bowker's experience to at least one other character?",
                        "Did you consider why the inability to communicate makes the trauma worse?"
                    ],
                    rubricGuidance: "Look for: (1) Understanding of circular driving as symbol (trapped in memories, going nowhere, repetition of trauma), (2) Connection to another character (narrator's repetitive retelling, Cross's ongoing guilt, Kiley's breakdown), (3) Insight about communication and isolation in trauma.",
                    hints: [
                        "Think about the SHAPE of Bowker's journey — a circle. What does going in circles mean? What's the opposite of a circle (a straight line forward)?",
                        "Bowker wants to talk about the war but can't find the words or the right listener. Which other character also keeps circling back to the same traumatic moments?",
                        "The narrator himself retells stories repeatedly — isn't that also a form of 'driving in circles'? But there's a key difference between Bowker and the narrator: one finds words, one doesn't. What does that difference mean?"
                    ]
                }
            ]
        },
        {
            id: "courage",
            name: "Identity & Courage",
            description: "Question what it really means to be brave — is it charging into battle, or is it something far more complicated?",
            mapPosition: { x: 400, y: 550 },
            color: "#f39c12",
            unlocked: false,
            challenges: [
                {
                    id: "courage_mc1",
                    type: "multiple-choice",
                    difficulty: { easy: 0, medium: 1, hard: 2 },
                    representations: {
                        text: {
                            prompt: "In 'On the Rainy River,' the narrator considers fleeing to Canada to avoid the draft. He ultimately goes to war — not out of courage, but because he was 'embarrassed not to.' What does this reveal about O'Brien's concept of courage?",
                            passage: "I was a coward. I went to the war."
                        },
                        visual: {
                            prompt: "O'Brien says: 'I was a coward. I went to the war.' This seems like a paradox — going to war seems brave. Why does he call it cowardice?",
                            description: "[Two doors: one leads to Canada (labeled 'follow your conscience'), the other to Vietnam (labeled 'follow expectations'). A young man stands frozen between them. The Vietnam door has a crowd of faces watching — family, friends, community.]"
                        },
                        audio: "O'Brien stands at the Canadian border, fishing with an old man. He could cross and avoid the war he believes is wrong. But he doesn't. He goes to Vietnam. And he says: 'I was a coward. I went to the war.' Think about that — he calls going to WAR an act of cowardice. What does this reveal about his understanding of courage?"
                    },
                    tiers: [
                        {
                            options: [
                                { text: "He was actually brave for going to war and is just being modest", correct: false },
                                { text: "True courage would have been following his own beliefs, but he lacked the courage to face social judgment", correct: true },
                                { text: "He's saying that all soldiers are cowards because war is meaningless", correct: false },
                                { text: "He was a coward because he was afraid during combat", correct: false }
                            ],
                            feedback: {
                                correct: "Exactly! O'Brien redefines courage: it's not about facing bullets, it's about facing yourself. He went to war not out of bravery but out of fear — fear of embarrassment, of disappointing his family and community. True courage would have been risking their disapproval.",
                                incorrect: "Read the line again: 'I was a coward. I went to the war.' He's not being modest — he genuinely sees going to war as the COWARDLY choice. Why? What was he afraid of that made him go?"
                            }
                        },
                        {
                            options: [
                                { text: "O'Brien argues that social pressure and fear of shame are more powerful motivators than personal conviction, and that conforming to expectations despite moral objections is a form of cowardice", correct: true },
                                { text: "O'Brien uses irony to highlight the absurdity of labeling any wartime action as either courageous or cowardly", correct: false },
                                { text: "O'Brien suggests that courage is irrelevant in wartime because soldiers have no real choice — the draft eliminates agency", correct: false },
                                { text: "O'Brien implies that physical courage in combat is inferior to the intellectual courage needed to question the war", correct: false }
                            ],
                            feedback: {
                                correct: "Strong analysis! O'Brien exposes how social conformity masquerades as courage. The entire town, his family, the idea of 'America' — their imagined judgment was more terrifying than enemy fire. He went to war to avoid a different kind of battle: one against social expectations.",
                                incorrect: "The key isn't irony, lack of agency, or physical vs. intellectual courage. It's about what MOTIVATED his choice. He went to war because he was afraid — not of the enemy, but of what people would think. What does that say about courage?"
                            }
                        },
                        {
                            options: [
                                { text: "O'Brien deconstructs the cultural mythology of wartime courage, revealing that the decision to fight was driven not by valor but by the unbearable weight of communal expectation — making conformity itself the ultimate act of cowardice", correct: true },
                                { text: "O'Brien's statement is primarily a literary device — an unreliable narrator's attempt to retroactively justify his participation in a war he now opposes politically", correct: false },
                                { text: "The paradox reflects Sartrean existentialism: all choices are equally valid, and O'Brien labels his 'cowardice' only because he later attached different meaning to it", correct: false },
                                { text: "O'Brien's self-accusation of cowardice is performed humility that actually reinforces traditional masculine valor by showing he went to war despite his doubts", correct: false }
                            ],
                            feedback: {
                                correct: "Masterful analysis! You've identified how O'Brien dismantles the entire cultural framework of 'brave soldier' — revealing that for many, military service was motivated not by courage but by the crushing weight of communal expectation. The true brave act would have been to say 'no' and bear the consequences alone.",
                                incorrect: "O'Brien isn't being unreliable, performing humility, or applying philosophy retroactively. His self-accusation is sincere and structural to the book's argument. He genuinely believes that going along with what was expected — despite his own moral conviction — was the cowardly path."
                            }
                        }
                    ],
                    hints: [
                        "O'Brien believed the Vietnam War was wrong. So why did he go? He tells us: he was afraid of what people would think if he didn't.",
                        "Think about two kinds of fear: fear of danger (going to war) and fear of judgment (not going to war). Which fear won? And what does it mean that social pressure was scarier than actual combat?",
                        "O'Brien's point: true courage = acting on your beliefs even when everyone around you disapproves. He didn't do that. He caved to social pressure. Going to war was the EASY choice, because everyone expected it. Running away would have required real bravery."
                    ]
                },
                {
                    id: "courage_drag1",
                    type: "drag-and-drop",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "Sort the following actions from the novel into whether they represent 'Conventional Courage' (what society typically considers brave) or 'O'Brien's Courage' (what the book argues real courage is).",
                        },
                        visual: {
                            prompt: "Sort these actions: which ones are brave by society's standards, and which are brave by O'Brien's redefined standards?",
                            description: "[Two columns: a medal of honor on one side (Conventional Courage) and a single person standing against a crowd on the other (O'Brien's Courage)]"
                        },
                        audio: "Society has one definition of courage — typically involving physical bravery in battle. But O'Brien argues for a different kind of courage. Sort these actions into which type of courage they represent."
                    },
                    items: [
                        { text: "Going to war because your community expects it", category: "Conventional Courage" },
                        { text: "Admitting you went to war because you were afraid to say no", category: "O'Brien's Courage" },
                        { text: "Charging into battle under fire", category: "Conventional Courage" },
                        { text: "Telling the truth about feeling afraid during combat", category: "O'Brien's Courage" },
                        { text: "Choosing exile in Canada to follow your conscience", category: "O'Brien's Courage" },
                        { text: "Displaying stoicism and never showing emotion about war", category: "Conventional Courage" }
                    ],
                    categories: ["Conventional Courage", "O'Brien's Courage"],
                    feedback: {
                        correct: "Excellent! You've grasped how O'Brien redefines courage. Conventional courage is about outward action and appearing strong. O'Brien's courage is about honesty, vulnerability, and following your conscience even when it's socially unacceptable.",
                        partial: "You're getting there! Remember: O'Brien's version of courage is about inner honesty and moral conviction, while conventional courage is about outward displays of bravery and toughness.",
                        incorrect: "Think about what O'Brien values: honesty, vulnerability, following your own moral compass. Things society calls 'brave' (going to war, being stoic) are actually conformity. Things O'Brien calls brave (admitting fear, telling the truth) require inner strength."
                    },
                    hints: [
                        "Conventional courage is what gets medals: fighting, appearing fearless, doing what's expected. O'Brien's courage is what gets you judged: being honest, being vulnerable, going against the crowd.",
                        "Ask yourself: does this action require going ALONG with what society expects, or going AGAINST it? Going along = conventional. Going against = O'Brien's redefinition.",
                        "O'Brien's courage = moral honesty + vulnerability + standing alone. Conventional courage = physical bravery + stoicism + conformity."
                    ]
                },
                {
                    id: "courage_typed1",
                    type: "typed-response",
                    difficulty: { easy: 0, medium: 0, hard: 0 },
                    representations: {
                        text: {
                            prompt: "O'Brien writes: 'I was a coward. I went to the war.' Think about a time in your own life when you did what was EXPECTED rather than what you believed was RIGHT. In 3-5 sentences, describe that experience and connect it to O'Brien's concept of courage. (You can keep this as personal or general as you're comfortable with.)",
                        },
                        visual: {
                            prompt: "Have you ever done what was expected instead of what you believed was right? In 3-5 sentences, share that experience and connect it to O'Brien's idea of courage. Be as personal or general as you wish.",
                            description: "[A crossroads. One path is paved, well-lit, and crowded with people walking together. The other is unpaved, dark, but has a faint glow at the end. A sign on the first reads 'EXPECTED.' A sign on the second reads 'RIGHT.']"
                        },
                        audio: "Think about your own life. Have you ever gone along with the crowd even though you disagreed? Maybe at school, with friends, or in your family? O'Brien says he went to war because he was too embarrassed not to. In 3-5 sentences, share a time you did what was expected instead of what you believed, and connect it to O'Brien's idea of courage."
                    },
                    minWords: 40,
                    reflectionPrompts: [
                        "Did you describe a specific experience (not just a vague idea)?",
                        "Did you explain the tension between what was expected and what you believed?",
                        "Did you make a clear connection to O'Brien's concept of courage — the idea that real courage is following your convictions despite social pressure?"
                    ],
                    rubricGuidance: "Look for: (1) A specific personal connection (even if kept somewhat general for privacy), (2) Clear identification of the tension between expectation and conviction, (3) Meaningful connection to O'Brien's argument, (4) Self-reflection and honesty. Note: this is a personal response — grade for depth of thought, not 'correctness.'",
                    hints: [
                        "This could be anything: going along with a group decision you disagreed with, not speaking up when you saw something wrong, choosing a safe path over a risky one that felt more authentic.",
                        "The connection to O'Brien is about SOCIAL PRESSURE overriding personal conviction. When have you felt that weight of expectation?",
                        "You don't have to share anything deeply personal. Even a school or social situation works. The key is showing you understand what O'Brien means when he says conformity can be a form of cowardice."
                    ]
                }
            ]
        }
    ]
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.GAME_CONTENT = GAME_CONTENT;
}
