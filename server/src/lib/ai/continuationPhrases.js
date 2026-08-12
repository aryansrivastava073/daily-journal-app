export const CONTINUATION_BANK = [
  {
    test: (s) => /\?\s*$/.test(s),
    phrases: [
      "I think the honest answer is that I'm still figuring it out.",
      'Maybe the answer will come if I stop forcing it and just keep writing.',
      "Part of me already knows, I just haven't said it out loud yet.",
      "I'm not sure, but I want to sit with that question a little longer.",
    ],
  },
  {
    test: (s) => /\b(tired|exhaust|drain|sleepy|worn out)\b/i.test(s),
    phrases: [
      'and I think what I really need is permission to slow down.',
      "but underneath the tiredness there's something I haven't let myself feel yet.",
      "and maybe that's okay — not every day has to be full.",
      'and I want to be gentler with myself about that.',
    ],
  },
  {
    test: (s) => /\b(grateful|thankful|blessed|thank)\b/i.test(s),
    phrases: [
      "and it's the small things that keep adding up lately.",
      'and I want to remember this feeling on the harder days.',
      'even if the day was ordinary, that still counts for something.',
      "and I don't say that enough, even to myself.",
    ],
  },
  {
    test: (s) => /\b(anxious|worried|nervous|scared|afraid|overwhelm)\b/i.test(s),
    phrases: [
      'but naming it like this already makes it feel a little smaller.',
      'and I know this feeling has passed before, so it can pass again.',
      "and I don't need to solve it tonight — just notice it.",
      'and maybe the next step is just one small, steady breath.',
    ],
  },
  {
    test: (s) => /\b(excited|happy|joy|thrilled|can'?t wait)\b/i.test(s),
    phrases: [
      'and I want to hold onto this feeling for a while.',
      'and it reminds me why I keep showing up for the things I care about.',
      "and it's nice to feel this light for once.",
      'and I hope more days feel like this one.',
    ],
  },
  {
    test: (s) => /\b(sad|down|low|heavy|hurt|lonely)\b/i.test(s),
    phrases: [
      "and that's allowed too — not every day has to feel light.",
      'and I want to be as kind to myself as I would be to a friend feeling this.',
      "and I trust that this won't last forever, even if it feels that way now.",
      'and writing it down already feels like putting some of the weight down.',
    ],
  },
  {
    test: (s) => /\b(uncertain|confus|unsure|don'?t know)\b/i.test(s),
    phrases: [
      "and maybe I don't need to know the whole picture yet.",
      'and that uncertainty is uncomfortable, but it might also be room to grow.',
      "and I'll trust that clarity comes with time, not force.",
      'and for now, sitting with the not-knowing is enough.',
    ],
  },
]

export const GENERIC_CONTINUATIONS = [
  'and I want to keep exploring this thought a little further.',
  "and there's more here than I realized when I started writing.",
  "and I'm noticing how much better it feels just to put this into words.",
  'and maybe that is the real thing I needed to say today.',
  "and I'll let myself sit with that for a moment.",
  "and I'm curious where this thought leads if I keep going.",
  'and that feels like something worth remembering.',
  "and I think that's the truest thing I've written today.",
]
