// Opening quotes ("fortune cookies") from Star Wars: The Clone Wars.
export interface CloneWarsQuote {
  text: string;
  season: string;
  episode: string;
}

export const cloneWarsQuotes: CloneWarsQuote[] = [
  { text: 'Easy is the path to wisdom for those not blinded by ego.', season: '1', episode: '3' },
  { text: 'The best confidence builder is experience.', season: '1', episode: '5' },
  { text: 'If you ignore the past, you jeopardize your future.', season: '2', episode: '11' },
  { text: 'In war, truth is the first casualty.', season: '2', episode: '13' },
  { text: 'The most dangerous beast is the beast within.', season: '2', episode: '18' },
  { text: 'Friendship shows us who we really are.', season: '4', episode: '14' },
  { text: 'The young are often underestimated.', season: '5', episode: '7' },
  { text: 'Never give up hope, no matter how dark things seem.', season: '5', episode: '20' },
  { text: 'The truth about yourself is the hardest to accept.', season: '6', episode: '1' },
  { text: "The popular belief isn't always the correct one.", season: '6', episode: '4' },
  { text: 'What is lost is often found.', season: '6', episode: '10' },
  { text: 'Facing all that you fear will free you from yourself.', season: '6', episode: '13' },
];

export const randomCloneWarsQuote = (): CloneWarsQuote =>
  cloneWarsQuotes[Math.floor(Math.random() * cloneWarsQuotes.length)];
