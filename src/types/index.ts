export interface TextEntry {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  opacity: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export type AspectRatio = '9:16' | '1:1';

export interface ProjectData {
  aspectRatio: AspectRatio;
  textEntries: TextEntry[];
}

export const DEFAULT_TEXT_ENTRY: Omit<TextEntry, 'id'> = {
  text: '字幕テキスト',
  startTime: 0,
  endTime: 3,
  x: 50,
  y: 80,
  fontSize: 24,
  fontFamily: 'sans-serif',
  color: '#ffffff',
  backgroundColor: 'rgba(0,0,0,0.5)',
  opacity: 1,
  fontWeight: 'bold',
  textAlign: 'center',
};

export const FONT_FAMILIES = [
  { label: 'ゴシック体', value: 'sans-serif' },
  { label: '明朝体', value: 'serif' },
  { label: '等幅', value: 'monospace' },
  { label: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
];
