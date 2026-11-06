// Local, silent captures of the actual apps and portfolio walkthroughs.
// Dimensions also reserve the poster's space before a recording is requested.
export type Recording = {
  file: string;
  label: string;
  description: string;
  width: number;
  height: number;
  seconds: number;
};

export const recordings: Record<string, Recording | undefined> = {
  pokeread: { file: 'pokeread-native', label: 'iPhone demo', description: 'An Eevee pack opens to reveal a card in PokéRead.', width: 540, height: 720, seconds: 7 },
  spark: { file: 'spark-native', label: 'iPhone demo', description: 'Browse the SPARK discovery feed, open an attributed idea, and save it.', width: 540, height: 720, seconds: 6 },
  vectorfield: { file: 'vectorfield-native', label: 'iPhone demo', description: 'Move from an AI curriculum module to a worked lesson and director case in Vectorfield.', width: 540, height: 720, seconds: 8 },
  tend: { file: 'tend-capture', label: 'iPhone demo · sample data', description: 'Tend opens the evidence behind a proposed school-form follow-up using sample messages.', width: 560, height: 756, seconds: 7 },
  'family-os': { file: 'family-demo', label: 'Sample walkthrough', description: 'A recording of the public Family OS walkthrough approving a sample school note and handling missing context.', width: 444, height: 456, seconds: 6 },
  '49ers': { file: 'injury-demo', label: 'Interactive study', description: 'San Francisco and Seattle’s injury indices change as the season slider moves.', width: 444, height: 524, seconds: 6 },
  'interest-boards': { file: 'stack-demo', label: 'Web demo', description: 'Open a card, browse the Sports collection, and mark a card as wanted in STACK.', width: 480, height: 592, seconds: 7 },
};

export const movieUrl = (recording: Recording) => '/feed/media/' + recording.file + '.mp4';
export const posterUrl = (recording: Recording) => '/feed/media/' + recording.file + '.webp';
