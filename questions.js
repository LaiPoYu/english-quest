// Question bank: CEFR A1–C2 × Vocabulary / Grammar.
// Format: [prompt, [options...], correctIndex, explanation]
// "___" in the prompt marks the blank.
(function () {
  const BANK = {
    A1: {
      vocab: [
        ["Which place do you go to buy food?", ["supermarket", "library", "hospital", "station"], 0, "A supermarket is a large shop that sells food and household goods."],
        ["The opposite of \"hot\" is ___.", ["cold", "big", "fast", "happy"], 0, "Hot ↔ cold."],
        ["I drink ___ every morning.", ["coffee", "bread", "chair", "pen"], 0, "You drink liquids like coffee, tea or water."],
        ["What do you use to write?", ["a pen", "a spoon", "a cup", "a bed"], 0, "You write with a pen or a pencil."],
        ["My mother's brother is my ___.", ["uncle", "aunt", "cousin", "nephew"], 0, "Your parent's brother is your uncle; your parent's sister is your aunt."],
        ["Monday, Tuesday, ___ …", ["Wednesday", "Friday", "Sunday", "Thursday"], 0, "Monday → Tuesday → Wednesday → Thursday → Friday."],
        ["Which one is an animal?", ["dog", "table", "window", "shirt"], 0, "A dog is an animal. The others are things."],
        ["You sleep in a ___.", ["bed", "kitchen", "car", "garden"], 0, "People sleep in a bed."],
        ["Which word is a color?", ["green", "tall", "quick", "soft"], 0, "Green is a color. Tall, quick and soft describe size, speed and feel."],
        ["It's raining. Take an ___.", ["umbrella", "apple", "orange", "egg"], 0, "An umbrella keeps you dry in the rain."],
      ],
      grammar: [
        ["She ___ a teacher.", ["is", "are", "am", "be"], 0, "He / she / it + is."],
        ["I ___ coffee every day.", ["drink", "drinks", "drinking", "am drink"], 0, "Present simple with I / you / we / they: base verb (drink)."],
        ["___ you like pizza?", ["Do", "Does", "Are", "Is"], 0, "Questions in the present simple with you: Do you …?"],
        ["There ___ two cats in the garden.", ["are", "is", "be", "am"], 0, "There are + plural noun (two cats)."],
        ["He doesn't ___ meat.", ["eat", "eats", "eating", "ate"], 0, "After doesn't, use the base verb: doesn't eat."],
        ["I have ___ apple and a banana.", ["an", "a", "many", "much"], 0, "Use an before a vowel sound: an apple."],
        ["My birthday is ___ May.", ["in", "on", "at", "to"], 0, "Use in with months: in May. Use on with dates: on May 5th."],
        ["They ___ from Japan.", ["are", "is", "am", "be"], 0, "They + are."],
        ["Where ___ he live?", ["does", "do", "is", "are"], 0, "Questions with he / she / it in the present simple: Where does he live?"],
        ["I can ___ English.", ["speak", "speaks", "speaking", "to speak"], 0, "After can, use the base verb without to: can speak."],
      ],
    },
    A2: {
      vocab: [
        ["I'm ___. Can I have something to eat?", ["hungry", "thirsty", "tired", "bored"], 0, "Hungry = you want food. Thirsty = you want a drink."],
        ["The train was late, so I ___ the start of the meeting.", ["missed", "lost", "forgot", "left"], 0, "Miss = not be there for something (miss a meeting / a bus)."],
        ["A person who repairs cars is a ___.", ["mechanic", "chef", "dentist", "pilot"], 0, "A mechanic fixes cars and machines."],
        ["Please ___ the light when you leave.", ["turn off", "turn up", "look after", "give up"], 0, "Turn off = stop a light or machine."],
        ["This jacket is too expensive. Do you have something ___?", ["cheaper", "richer", "higher", "longer"], 0, "The opposite of expensive is cheap → cheaper."],
        ["Can you ___ me your pen for a minute?", ["lend", "borrow", "take", "keep"], 0, "Lend = give for a short time. Borrow = take for a short time. \"Lend me\" / \"Can I borrow\"."],
        ["We need to ___ a table at the restaurant.", ["book", "write", "read", "pay"], 0, "Book a table = reserve it in advance."],
        ["She is very ___. She always helps other people.", ["kind", "lazy", "rude", "angry"], 0, "Kind = friendly and helpful."],
        ["The flight ___ at 9 a.m., so we must be at the airport by 7.", ["takes off", "gets up", "puts on", "runs out"], 0, "A plane takes off (leaves the ground)."],
        ["The opposite of \"cheap\" is ___.", ["expensive", "easy", "early", "empty"], 0, "Cheap ↔ expensive."],
      ],
      grammar: [
        ["I ___ to Paris last year.", ["went", "go", "have gone", "going"], 0, "\"Last year\" is finished time → past simple: went."],
        ["She is ___ than her sister.", ["taller", "tallest", "more tall", "tall"], 0, "Comparative of short adjectives: adjective + -er + than."],
        ["We ___ dinner when the phone rang.", ["were having", "have", "are having", "has had"], 0, "Past continuous for an action in progress when another happened."],
        ["Have you ever ___ sushi?", ["eaten", "ate", "eat", "eating"], 0, "Present perfect: have + past participle (eaten)."],
        ["I'm going ___ my friends tonight.", ["to meet", "meet", "meeting", "met"], 0, "be going to + base verb for plans."],
        ["There isn't ___ milk in the fridge.", ["any", "some", "many", "a"], 0, "Use any in negatives and questions; milk is uncountable."],
        ["You ___ wear a seatbelt. It's the law.", ["must", "mustn't", "don't have to", "can't"], 0, "Must = it is necessary / an obligation."],
        ["This is the ___ movie I've ever seen.", ["best", "better", "good", "most good"], 0, "Superlative of good is best."],
        ["If it rains tomorrow, we ___ at home.", ["will stay", "stayed", "would stay", "staying"], 0, "First conditional: If + present, will + verb."],
        ["He has lived here ___ 2015.", ["since", "for", "from", "at"], 0, "Since + a point in time (2015). For + a period (ten years)."],
      ],
    },
    B1: {
      vocab: [
        ["Could you ___ my bag while I go to the restroom?", ["keep an eye on", "look forward to", "get rid of", "make up for"], 0, "Keep an eye on = watch something so it stays safe."],
        ["The meeting was ___ until next week because the manager was sick.", ["postponed", "prevented", "promoted", "predicted"], 0, "Postpone = move to a later time."],
        ["She has a lot of ___ in teaching. She's done it for 15 years.", ["experience", "experiment", "expression", "expectation"], 0, "Experience = knowledge or skill from doing something."],
        ["Prices have ___ sharply this year.", ["risen", "raised", "arisen", "lifted"], 0, "Rise (intransitive): prices rise. Raise needs an object: they raised prices."],
        ["He ___ the job offer because the salary was too low.", ["turned down", "turned up", "took off", "put up"], 0, "Turn down = refuse or reject."],
        ["It's ___ to drive without a license.", ["illegal", "unlucky", "unfair", "impossible"], 0, "Illegal = against the law."],
        ["I'm looking for a ___ job, not just something for the summer.", ["permanent", "temporary", "casual", "brief"], 0, "Permanent = lasting a long time, with no end date."],
        ["Can you ___ me to call Mom tonight?", ["remind", "remember", "recall", "repeat"], 0, "Remind someone to do something = help them remember."],
        ["The hotel room had a beautiful ___ of the sea.", ["view", "sight", "scene", "look"], 0, "A view of something = what you can see from a place."],
        ["We ran ___ of milk, so I went to the shop.", ["out", "off", "away", "over"], 0, "Run out of = have none left."],
      ],
      grammar: [
        ["If I ___ more money, I would travel the world.", ["had", "have", "will have", "would have"], 0, "Second conditional (imaginary): If + past simple, would + verb."],
        ["The book ___ by millions of people.", ["has been read", "has read", "is reading", "reads"], 0, "Passive (present perfect): has been + past participle."],
        ["I'm used to ___ up early.", ["getting", "get", "got", "be getting"], 0, "Be used to + -ing = be accustomed to."],
        ["She asked me where I ___.", ["lived", "do live", "did I live", "am living"], 0, "Reported question: past tense and statement word order (where I lived)."],
        ["By the time we arrived, the film ___.", ["had started", "has started", "was starting", "starts"], 0, "Past perfect for the earlier of two past actions."],
        ["This is the man ___ car was stolen.", ["whose", "who", "which", "whom"], 0, "Whose shows possession (his car)."],
        ["You ___ have told me earlier! I could have helped.", ["should", "must", "can", "will"], 0, "Should have + past participle = criticism of a past action."],
        ["I've been waiting here ___ two hours.", ["for", "since", "during", "while"], 0, "For + a length of time."],
        ["He suggested ___ to the beach.", ["going", "to go", "go", "we going"], 0, "Suggest + -ing (or suggest that we go)."],
        ["Neither John nor his friends ___ coming.", ["are", "is", "was", "be"], 0, "With neither … nor, the verb agrees with the nearer subject (friends → are)."],
      ],
    },
    B2: {
      vocab: [
        ["The new policy had a significant ___ on employee morale.", ["impact", "affect", "effort", "input"], 0, "Have an impact on = have an effect on. Affect is a verb."],
        ["She's very ___. She always finishes tasks before the deadline.", ["reliable", "reluctant", "relevant", "remote"], 0, "Reliable = can be trusted to do what is expected."],
        ["The two companies decided to ___ to reduce costs.", ["merge", "emerge", "submerge", "converge"], 0, "Merge = combine into one organization."],
        ["His argument was so ___ that nobody could disagree with it.", ["convincing", "confusing", "controversial", "conscious"], 0, "Convincing = making you believe it is true."],
        ["We need to ___ the problem before it gets worse.", ["address", "adapt", "admit", "adopt"], 0, "Address a problem = start dealing with it."],
        ["The results were ___ with our expectations.", ["consistent", "constant", "content", "convenient"], 0, "Consistent with = in agreement with."],
        ["I can't ___ such an expensive car.", ["afford", "offer", "provide", "award"], 0, "Afford = have enough money for."],
        ["The manager ___ the importance of teamwork in her speech.", ["emphasized", "estimated", "eliminated", "evaluated"], 0, "Emphasize = give special importance to."],
        ["Despite the bad weather, the event was a huge ___.", ["success", "succeed", "successful", "successfully"], 0, "After a + adjective (huge) you need a noun: success."],
        ["He tends to ___ details, so please double-check his work.", ["overlook", "oversee", "overtake", "overhear"], 0, "Overlook = fail to notice."],
      ],
      grammar: [
        ["I wish I ___ harder when I was at school.", ["had studied", "studied", "would study", "have studied"], 0, "Wish + past perfect = regret about the past."],
        ["Not only ___ late, but he also forgot the documents.", ["was he", "he was", "did he", "he did"], 0, "Not only at the start → inversion: was he."],
        ["If she had left earlier, she ___ the train.", ["would have caught", "would catch", "had caught", "will catch"], 0, "Third conditional: If + past perfect, would have + past participle."],
        ["The report needs ___ by Friday.", ["to be finished", "to finish", "be finished", "finished"], 0, "Need + passive infinitive: to be finished."],
        ["Hardly ___ the house when it started to rain.", ["had I left", "I had left", "did I leave", "I left"], 0, "Hardly … when with inversion + past perfect."],
        ["She denied ___ the money.", ["taking", "to take", "take", "to have take"], 0, "Deny + -ing."],
        ["It's high time we ___ a decision.", ["made", "make", "will make", "have made"], 0, "It's (high) time + past simple, with present meaning."],
        ["The more you practice, ___ you'll become.", ["the better", "better", "the best", "more better"], 0, "The + comparative …, the + comparative."],
        ["He is said ___ a fortune in the stock market.", ["to have made", "to make", "making", "that he made"], 0, "Be said + perfect infinitive for a past action."],
        ["I'd rather you ___ smoke in here.", ["didn't", "don't", "won't", "not"], 0, "Would rather + subject + past simple."],
      ],
    },
    C1: {
      vocab: [
        ["The CEO's comments were deliberately ___, leaving everyone unsure of her real plans.", ["ambiguous", "explicit", "transparent", "unanimous"], 0, "Ambiguous = open to more than one interpretation."],
        ["The scandal seriously ___ public trust in the government.", ["undermined", "underlined", "undertook", "underwent"], 0, "Undermine = gradually weaken."],
        ["His ___ attitude toward safety rules caused the accident.", ["complacent", "compliant", "complimentary", "competent"], 0, "Complacent = too satisfied to notice risks."],
        ["The proposal was rejected on the ___ that it was too costly.", ["grounds", "reasons", "causes", "motives"], 0, "On the grounds that = for the reason that."],
        ["We must take ___ of this opportunity.", ["advantage", "benefit", "profit", "use"], 0, "Take advantage of = make good use of."],
        ["The company is trying to ___ its losses by cutting costs.", ["offset", "outset", "onset", "upset"], 0, "Offset = balance one thing against another."],
        ["Her speech was so ___ that many people in the audience cried.", ["poignant", "pungent", "pedantic", "pragmatic"], 0, "Poignant = causing strong sadness."],
        ["Without more funding, the project is ___ to fail.", ["bound", "bond", "bind", "bent"], 0, "Bound to = certain to."],
        ["There is a ___ between what politicians promise and what they deliver.", ["discrepancy", "dilemma", "disposition", "deficiency"], 0, "Discrepancy = a difference between things that should match."],
        ["He was ___ about his past and refused to answer any questions.", ["reticent", "resilient", "relentless", "redundant"], 0, "Reticent = unwilling to share information or feelings."],
      ],
      grammar: [
        ["Had I known about the problem, I ___ something.", ["would have done", "would do", "had done", "will have done"], 0, "Inverted third conditional: Had I known = If I had known."],
        ["Little ___ that his life was about to change.", ["did he know", "he knew", "he did know", "knew he"], 0, "Negative adverbial (Little) at the start → inversion with did."],
        ["It was not until midnight ___ home.", ["that she came", "she came", "when she came", "did she come"], 0, "Cleft structure: It was not until X that …"],
        ["___ the bad weather, the match went ahead.", ["Notwithstanding", "Although", "However", "Even though"], 0, "Notwithstanding (= despite) + noun phrase. Although / even though need a clause."],
        ["The board insisted that the report ___ by Monday.", ["be completed", "will be completed", "was completing", "completing"], 0, "Formal subjunctive after insist that: base form (be completed)."],
        ["Were the government ___ taxes, there would be protests.", ["to raise", "raise", "raising", "raised"], 0, "Were + subject + to-infinitive = If the government were to raise …"],
        ["She is the last person ___ such a thing.", ["to do", "doing", "does", "did"], 0, "The last person + to-infinitive = very unlikely to."],
        ["___ he may be talented, he lacks discipline.", ["While", "Despite", "However", "Unless"], 0, "While (= although) introduces a contrasting clause."],
        ["Such ___ the demand that tickets sold out in minutes.", ["was", "were", "is being", "had"], 0, "Such + be + subject + that … (inversion for emphasis); demand is singular."],
        ["I'd sooner he ___ the truth now than later.", ["told", "tells", "will tell", "has told"], 0, "Would sooner + subject + past simple."],
      ],
    },
    C2: {
      vocab: [
        ["Her ___ remarks offended almost everyone at the dinner.", ["tactless", "tactful", "tactical", "tacit"], 0, "Tactless = careless about people's feelings."],
        ["The author's style is notoriously ___, full of long, obscure words.", ["verbose", "succinct", "terse", "laconic"], 0, "Verbose = using more words than needed. The others mean brief."],
        ["The government's response to the crisis was ___ at best.", ["lackluster", "luminous", "lucrative", "lucid"], 0, "Lackluster = dull, lacking energy."],
        ["Once dismissed, his theory has since been ___ by new evidence.", ["vindicated", "vindictive", "vicarious", "vacillated"], 0, "Vindicate = prove right after doubt."],
        ["She spoke with such ___ that no one doubted her sincerity.", ["candor", "clamor", "rancor", "torpor"], 0, "Candor = openness and honesty."],
        ["The negotiations reached an ___, with neither side willing to compromise.", ["impasse", "impetus", "impulse", "imprint"], 0, "Impasse = deadlock."],
        ["He has a ___ for exaggeration, so take his stories with a pinch of salt.", ["penchant", "pendant", "pennant", "penance"], 0, "Penchant = a strong liking or tendency."],
        ["The minister ___ the question by changing the subject.", ["sidestepped", "overstepped", "outstripped", "upended"], 0, "Sidestep = avoid dealing with."],
        ["It would be ___ to assume the market will recover quickly.", ["presumptuous", "prestigious", "precocious", "prosperous"], 0, "Presumptuous = assuming too much without good reason."],
        ["The novel offers a ___ critique of modern consumer culture.", ["trenchant", "truculent", "tremulous", "transient"], 0, "Trenchant = sharp, incisive, and forceful."],
      ],
      grammar: [
        ["Under no circumstances ___ the door to strangers.", ["should you open", "you should open", "you open", "open you"], 0, "Negative phrase at the start → inversion: should you open."],
        ["___ it not for your help, I would have failed.", ["Were", "Had", "Was", "If"], 0, "Were it not for = If it were not for (fixed inverted form)."],
        ["So intense ___ the heat that we stayed indoors.", ["was", "did", "had", "it was"], 0, "So + adjective + be + subject + that (inversion)."],
        ["Only after the investigation ___ the extent of the fraud.", ["did they realize", "they realized", "they did realize", "realized they"], 0, "Only after … at the start → auxiliary inversion."],
        ["The proposal, ___ merits are debatable, was approved.", ["whose", "which", "of which", "that"], 0, "Whose = possession in a non-defining clause (its merits)."],
        ["Come what ___, I will finish this project.", ["may", "might", "will", "can"], 0, "Fixed subjunctive expression: come what may."],
        ["Much ___ I admire her work, I can't support this decision.", ["as", "though", "that", "while"], 0, "Much as = although (fixed concessive)."],
        ["The suspect is believed ___ the country last week.", ["to have left", "to leave", "having left", "that he left"], 0, "Be believed + perfect infinitive for a past event."],
        ["Scarcely ___ sat down when the alarm went off.", ["had we", "we had", "did we", "we have"], 0, "Scarcely … when + inversion with past perfect."],
        ["Not a single word ___ during the entire meeting.", ["did she utter", "she uttered", "she did utter", "uttered she"], 0, "Negative object fronted → inversion with did."],
      ],
    },
  };

  const out = [];
  for (const level of Object.keys(BANK)) {
    for (const skill of Object.keys(BANK[level])) {
      BANK[level][skill].forEach((row, i) => {
        out.push({
          id: `${level}-${skill[0]}${i + 1}`,
          level, skill,
          prompt: row[0], options: row[1], answer: row[2], explain: row[3],
        });
      });
    }
  }
  window.QUESTIONS = out;
})();
