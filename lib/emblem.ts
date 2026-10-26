// lib/emblem.ts
// 오행 엠블럼(초상권 없는 자체 제작 SVG). 문자열을 돌려주므로
// 화면에서는 dangerouslySetInnerHTML 로, 스토리 카드(canvas)에서는 이미지로 그릴 때 둘 다 쓸 수 있어요.
// 음(陰)은 초승달, 양(陽)은 둥근 해/보름달 배경으로 구분됩니다.
import type { Element } from './saju';

export interface Palette {
  main: string;
  light: string;
  deep: string;
}

/** 오행별 대표 색. 화면의 막대·태그·스토리 카드 색도 여기서 가져옵니다. */
export const PALETTE: Record<Element, Palette> = {
  fire: { main: '#ff9a4d', light: '#ffe29a', deep: '#ff5d3a' },
  water: { main: '#6aa7ff', light: '#bfd8ff', deep: '#4d7fe0' },
  wood: { main: '#79e0a4', light: '#d6ffe6', deep: '#2fae6f' },
  earth: { main: '#e6c36a', light: '#fff0c2', deep: '#b5873a' },
  metal: { main: '#c4cbea', light: '#ffffff', deep: '#8c98c9' },
};

function sparkle(x: number, y: number, s: number, fill: string): string {
  const a = s * 0.3;
  const b = s * 0.7;
  return `<path d="M${x} ${y - s} l${a} ${b} ${b} ${a} ${-b} ${a} ${-a} ${b} ${-a} ${-b} ${-b} ${-a} ${b} ${-a} ${-a} ${-b}z" fill="${fill}"/>`;
}

function foreground(el: Element, uid: string, p: Palette): string {
  const grad = `url(#fg${uid})`;
  switch (el) {
    case 'fire':
      return (
        `<rect x="106" y="190" width="28" height="20" rx="6" fill="#ddd5ff" fill-opacity=".85"/>` +
        `<path d="M120 52 C126 82 156 104 156 144 C156 172 140 190 120 190 C100 190 84 172 84 144 C84 118 100 104 108 84 C112 96 116 100 120 52 Z" fill="${grad}"/>` +
        `<path d="M120 112 C124 130 140 140 140 160 C140 174 131 182 120 182 C109 182 100 174 100 160 C100 142 114 132 120 112 Z" fill="#fff1c9"/>`
      );
    case 'water':
      return (
        `<path d="M120 56 C120 56 86 100 86 130 C86 150 101 164 120 164 C139 164 154 150 154 130 C154 100 120 56 120 56 Z" fill="${grad}"/>` +
        `<path d="M106 128 C106 138 112 146 120 148" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M52 182 q17 -14 34 0 t34 0 t34 0 t34 0" fill="none" stroke="${p.light}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M72 202 q14 -12 28 0 t28 0 t28 0" fill="none" stroke="${p.deep}" stroke-opacity=".9" stroke-width="5" stroke-linecap="round"/>`
      );
    case 'wood':
      return (
        `<ellipse cx="120" cy="198" rx="46" ry="9" fill="${p.deep}" fill-opacity=".55"/>` +
        `<path d="M120 198 C120 160 120 130 120 92" fill="none" stroke="${p.deep}" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M120 140 C86 142 70 118 72 92 C98 94 118 112 120 140 Z" fill="${grad}"/>` +
        `<path d="M120 114 C154 114 172 92 168 64 C142 66 122 84 120 114 Z" fill="${grad}"/>` +
        `<path d="M120 92 C112 76 114 62 122 50 C130 62 130 78 120 92 Z" fill="${p.light}"/>`
      );
    case 'earth':
      return (
        `<path d="M44 196 L100 104 L128 150 L156 118 L206 196 Z" fill="${grad}"/>` +
        `<path d="M100 104 L116 130 L100 138 L86 128 Z" fill="${p.light}" fill-opacity=".75"/>` +
        `<path d="M156 118 L170 140 L156 146 L146 134 Z" fill="${p.light}" fill-opacity=".6"/>` +
        `<rect x="44" y="196" width="162" height="10" rx="5" fill="${p.deep}" fill-opacity=".7"/>`
      );
    case 'metal':
      return (
        `<path d="M120 54 L162 92 L150 172 L120 196 L90 172 L78 92 Z" fill="${grad}"/>` +
        `<path d="M78 92 L162 92 M120 54 L120 196 M78 92 L120 128 L162 92 M90 172 L120 128 L150 172" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linejoin="round"/>`
      );
  }
}

/**
 * @param uid  같은 화면에 엠블럼이 여러 개일 때 gradient id 충돌을 막는 짧은 식별자(예: 'hero', 'match')
 */
export function emblemSvg(el: Element, yin: boolean, uid: string, size: number): string {
  const p = PALETTE[el];
  const moon = yin
    ? // 초승달: 큰 원에서 오른쪽 위 원을 마스크로 도려냄
      `<mask id="cm${uid}"><rect width="240" height="240" fill="#fff"/><circle cx="148" cy="106" r="70" fill="#000"/></mask>` +
      `<circle cx="108" cy="118" r="82" fill="url(#mg${uid})" mask="url(#cm${uid})" opacity=".92"/>`
    : // 해/보름달: 둥근 원판과 은은한 후광
      `<circle cx="120" cy="112" r="70" fill="url(#mg${uid})" opacity=".34"/>` +
      `<circle cx="120" cy="112" r="56" fill="none" stroke="${p.light}" stroke-opacity=".5" stroke-width="2"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="${size}" height="${size}" aria-hidden="true" focusable="false">` +
    `<defs>` +
    `<linearGradient id="fg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.light}"/><stop offset=".55" stop-color="${p.main}"/><stop offset="1" stop-color="${p.deep}"/></linearGradient>` +
    `<linearGradient id="mg${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f6ff"/><stop offset="1" stop-color="#9db6ff"/></linearGradient>` +
    `<radialGradient id="hg${uid}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${p.main}" stop-opacity=".42"/><stop offset="1" stop-color="${p.main}" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    `<circle cx="120" cy="120" r="114" fill="url(#hg${uid})"/>` +
    `<g class="emb-orbit"><circle cx="120" cy="120" r="104" fill="none" stroke="#a590ff" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="2 7"/></g>` +
    `<circle cx="120" cy="120" r="92" fill="none" stroke="#bfd8ff" stroke-opacity=".22" stroke-width="1"/>` +
    moon +
    `<g class="emb-fg emb-fg-${el}">${foreground(el, uid, p)}</g>` +
    sparkle(196, 62, 10, p.light) +
    sparkle(46, 184, 7, '#bfd8ff') +
    sparkle(204, 150, 5, '#ffd8f6') +
    `</svg>`
  );
}
