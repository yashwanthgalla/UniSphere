const adjectives = [
  'Anonymous', 'Shadow', 'Silent', 'Phantom', 'Cosmic',
  'Mystic', 'Stealth', 'Ghost', 'Neon', 'Void',
  'Rogue', 'Cipher', 'Hidden', 'Secret', 'Masked',
];

const nouns = [
  'Falcon', 'Phoenix', 'Wolf', 'Tiger', 'Raven',
  'Cobra', 'Hawk', 'Panther', 'Viper', 'Dragon',
  'Bear', 'Eagle', 'Lynx', 'Fox', 'Shark',
];

export const generateUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const truncateText = (text, maxLen = 200) => {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
};

export const formatKarma = (karma) => {
  if (!karma) return '0';
  if (karma >= 1000000) return `${(karma / 1000000).toFixed(1)}M`;
  if (karma >= 1000) return `${(karma / 1000).toFixed(1)}K`;
  return karma.toString();
};
