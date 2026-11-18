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
  pokeread: { file: 'pokeread-reading', label: 'iPad reading lesson', description: 'Squirtle introduces the sh sound. The reader joins sh, i and p beside Eevee to spell ship.', width: 720, height: 540, seconds: 8 },
  'forty-at-the-plate': { file: 'birthday-tournament', label: 'Tournament demo', description: 'The birthday tournament scoreboard and field guide show the standings and how to grip a Wiffle ball.', width: 480, height: 640, seconds: 9 },
  spark: { file: 'spark-native', label: 'iPhone demo', description: 'Browse the SPARK discovery feed, open an attributed idea, and save it.', width: 540, height: 720, seconds: 6 },
  vectorfield: { file: 'vectorfield-native', label: 'iPhone demo', description: 'Move from an AI curriculum module to a worked lesson and director case in Vectorfield.', width: 540, height: 720, seconds: 8 },
  tend: { file: 'tend-capture', label: 'iPhone demo · sample data', description: 'Tend opens the evidence behind a proposed school-form follow-up using sample messages.', width: 560, height: 756, seconds: 7 },
  'family-os': { file: 'family-demo', label: 'Sample walkthrough', description: 'A recording of the public Family OS walkthrough approving a sample school note and handling missing context.', width: 444, height: 456, seconds: 6 },
  '49ers': { file: 'injury-demo', label: 'Interactive study', description: 'San Francisco and Seattle’s injury indices change as the season slider moves.', width: 444, height: 524, seconds: 6 },
};

export const movieUrl = (recording: Recording) => '/feed/media/' + recording.file + '.mp4';
export const posterUrl = (recording: Recording) => '/feed/media/' + recording.file + '.webp';
