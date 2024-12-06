// src/atoms/userAtoms.ts
import { atom } from 'jotai';
import { User } from '../types/types';

export const userAtom = atom<User | null>(null);