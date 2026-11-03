/**
 * Hero Animation Timing Configuration
 *
 * HERO_SPEED: Master speed factor (1.05 = exactly 5% faster).
 * To tune the speed across all hero text animations, adjust this single number.
 * Baseline speeds are divided by HERO_SPEED and rounded to the nearest whole millisecond.
 */
export const HERO_SPEED = 1.05;

// Baseline values in milliseconds (pre-scaling)
const BASE_TYPING_MS = 75;
const BASE_DELETE_MS = 35;
const BASE_HOLD_MS = 2200;
const BASE_PAUSE_BEFORE_NEXT_MS = 50;
const BASE_REVEAL_STAGGER_MS = 80;
const BASE_REVEAL_DURATION_MS = 600;

// Scaled timings (divided by HERO_SPEED and rounded to nearest whole millisecond)
export const HERO_TYPING_MS = Math.round(BASE_TYPING_MS / HERO_SPEED); // 71ms
export const HERO_DELETE_MS = Math.round(BASE_DELETE_MS / HERO_SPEED); // 33ms
export const HERO_HOLD_MS = Math.round(BASE_HOLD_MS / HERO_SPEED); // 2095ms
export const HERO_PAUSE_BEFORE_NEXT_MS = Math.round(BASE_PAUSE_BEFORE_NEXT_MS / HERO_SPEED); // 48ms
export const HERO_REVEAL_STAGGER_MS = Math.round(BASE_REVEAL_STAGGER_MS / HERO_SPEED); // 76ms
export const HERO_REVEAL_DURATION_MS = Math.round(BASE_REVEAL_DURATION_MS / HERO_SPEED); // 571ms
export const HERO_REVEAL_DURATION_S = (HERO_REVEAL_DURATION_MS / 1000).toFixed(2) + 's'; // 0.57s

