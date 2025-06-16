export interface DailyQuote {
  text: string;
  author: string;
}

export const quotes: DailyQuote[] = [
  { 
    text: "Water is life's matter and matrix, mother and medium. There is no life without water.", 
    author: "Albert Szent-Györgyi" 
  },
  { 
    text: "Thousands have lived without love, not one without water.", 
    author: "W.H. Auden" 
  },
  { 
    text: "Water is the driving force of all nature.", 
    author: "Leonardo da Vinci" 
  },
  { 
    text: "Pure water is the world's first and foremost medicine.", 
    author: "Slovakian Proverb" 
  },
  { 
    text: "Water is the most perfect traveller because when it travels it becomes the path itself!", 
    author: "Mehmet Murat ildan" 
  },
  {
    text: "In one drop of water are found all the secrets of all the oceans.",
    author: "Kahlil Gibran"
  },
  {
    text: "Water is fluid, soft, and yielding. But water will wear away rock, which cannot yield.",
    author: "Lao Tzu"
  },
  {
    text: "When the well is dry, we know the worth of water.",
    author: "Benjamin Franklin"
  },
  {
    text: "Water is the soul of the Earth.",
    author: "W.H. Auden"
  },
  {
    text: "Nothing is softer or more flexible than water, yet nothing can resist it.",
    author: "Lao Tzu"
  }
];

export function getDailyQuote(): DailyQuote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
}
