import { atom } from 'jotai';

export const unreadCountsAtom = atom<{ [key: string]: number }>({});
