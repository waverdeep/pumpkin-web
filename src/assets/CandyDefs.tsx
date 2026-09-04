/**
 * 사탕 12종 + 호박 통 SVG 정의. design-system-v1.html 이 원본.
 * 문서 어디서든 <use href="#c3"/> 처럼 참조한다. 도형은 한 곳에만 정의한다.
 */
const DEFS = `
<clipPath id="bC"><path d="M54 86 A76 21 0 0 0 206 86 C226 96 228 142 206 166 C186 188 74 188 54 166 C32 142 34 96 54 86 Z"/></clipPath>
<clipPath id="lC">
  <ellipse cx="64" cy="124" rx="34" ry="52"/><ellipse cx="196" cy="124" rx="34" ry="52"/>
  <ellipse cx="96" cy="128" rx="42" ry="58"/><ellipse cx="164" cy="128" rx="42" ry="58"/>
  <ellipse cx="130" cy="130" rx="48" ry="62"/>
</clipPath>
<linearGradient id="bs" x1="0" y1="0.3" x2="0" y2="1">
  <stop offset="0" stop-color="#6B3A08" stop-opacity="0"/><stop offset="1" stop-color="#5E3206" stop-opacity="0.6"/>
</linearGradient>
<radialGradient id="gl" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#FFF3D8" stop-opacity="0.32"/><stop offset="1" stop-color="#FFF3D8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="gr" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#0B0512" stop-opacity="0.85"/><stop offset="1" stop-color="#0B0512" stop-opacity="0"/>
</radialGradient>
<linearGradient id="lp" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#E9B564"/><stop offset="1" stop-color="#FBD597"/>
</linearGradient>
<radialGradient id="ig" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#FFC24D" stop-opacity="0.6"/><stop offset="1" stop-color="#FFC24D" stop-opacity="0"/>
</radialGradient>
<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#FFB443" stop-opacity="0.45"/><stop offset="0.6" stop-color="#FFB443" stop-opacity="0.12"/><stop offset="1" stop-color="#FFB443" stop-opacity="0"/>
</radialGradient>
<filter id="sf" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>

<g id="pkBack">
  <ellipse cx="130" cy="86" rx="76" ry="21" fill="#DCA95C"/>
  <ellipse cx="130" cy="83.5" rx="65" ry="14.5" fill="#1B0F28"/>
  <path d="M65 83.5 A65 14.5 0 0 0 195 83.5" stroke="#C08F3E" stroke-width="1.4" fill="none" opacity=".7"/>
  <ellipse cx="130" cy="90" rx="58" ry="11" fill="#0E0717" opacity=".5"/>
</g>
<g id="pkBody">
  <ellipse cx="130" cy="192" rx="88" ry="16" fill="url(#gr)"/>
  <g clip-path="url(#bC)">
    <g clip-path="url(#lC)">
      <ellipse cx="64" cy="124" rx="34" ry="52" fill="#BF741A"/><ellipse cx="196" cy="124" rx="34" ry="52" fill="#BF741A"/>
      <ellipse cx="96" cy="128" rx="42" ry="58" fill="#DC8F26"/><ellipse cx="164" cy="128" rx="42" ry="58" fill="#DC8F26"/>
      <ellipse cx="130" cy="130" rx="48" ry="62" fill="#F2A93A"/>
      <rect x="20" y="86" width="220" height="130" fill="url(#bs)"/>
      <ellipse cx="104" cy="122" rx="38" ry="34" fill="url(#gl)"/>
      <ellipse cx="70" cy="118" rx="16" ry="22" fill="url(#gl)"/>
    </g>
    <path d="M105 104 Q95 140 108 180" stroke="#A45F10" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M155 104 Q165 140 152 180" stroke="#A45F10" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M74 92 Q58 132 76 172" stroke="#A45F10" stroke-width="2" fill="none" opacity=".38" stroke-linecap="round"/>
    <path d="M186 92 Q202 132 184 172" stroke="#A45F10" stroke-width="2" fill="none" opacity=".38" stroke-linecap="round"/>
    <path d="M54 86 A76 21 0 0 0 206 86" stroke="#8E5A12" stroke-width="4" fill="none" opacity=".3"/>
  </g>
</g>
<g id="pkLip">
  <path d="M54 86 A76 21 0 0 0 206 86 L195 83.5 A65 14.5 0 0 1 65 83.5 Z" fill="url(#lp)"/>
  <path d="M54 86 A76 21 0 0 0 206 86" stroke="#C99247" stroke-width="1.2" fill="none" opacity=".8"/>
</g>
<g id="pkFace">
  <path d="M104 122 L124 122 L114 141 Z"/>
  <path d="M156 122 L136 122 L146 141 Z"/>
  <path d="M102 152 L116 160 L130 152 L144 160 L158 152 Q130 182 102 152 Z"/>
</g>

<g id="c0"><path d="M2 22 L18 30 L2 38 Z" fill="#F0997B"/><path d="M58 22 L42 30 L58 38 Z" fill="#F0997B"/><ellipse cx="30" cy="30" rx="16" ry="13" fill="#FAEEDA"/></g>
<g id="c1"><rect x="27" y="28" width="5" height="30" rx="2.5" fill="#FAEEDA"/><circle cx="30" cy="22" r="16" fill="#F4C0D1"/><path d="M30 22 m0 -9 a9 9 0 0 1 7 11 a6 6 0 0 1 -11 3" stroke="#FBEAF0" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<g id="c2"><rect x="16" y="10" width="28" height="40" rx="3" fill="#4A1B0C"/><rect x="16" y="10" width="28" height="13" rx="3" fill="#D3D1C7"/><path d="M23 23 L23 50 M30 23 L30 50 M37 23 L37 50" stroke="#2C1207" stroke-width="1.3"/></g>
<g id="c3"><circle cx="20" cy="16" r="5" fill="#1D9E75"/><circle cx="40" cy="16" r="5" fill="#1D9E75"/><circle cx="30" cy="20" r="11" fill="#5DCAA5"/><rect x="19" y="28" width="22" height="24" rx="10" fill="#5DCAA5"/><rect x="10" y="30" width="12" height="7" rx="3.5" fill="#1D9E75"/><rect x="38" y="30" width="12" height="7" rx="3.5" fill="#1D9E75"/></g>
<g id="c4"><path d="M14 16 L46 16 L42 52 L18 52 Z" fill="#378ADD"/><path d="M12 8 L18 14 L24 8 L30 14 L36 8 L42 14 L48 8 L46 16 L14 16 Z" fill="#85B7EB"/><rect x="20" y="28" width="20" height="4" rx="2" fill="#E6F1FB"/></g>
<g id="c5"><circle cx="30" cy="30" r="19" fill="#BA7517"/><path d="M30 11 a19 19 0 0 1 17 11 a6 6 0 0 1 -8 6 a19 19 0 0 0 -25 4 a7 7 0 0 1 -5 -10 a19 19 0 0 1 21 -11 Z" fill="#F4C0D1"/><circle cx="30" cy="30" r="6.5" fill="#241733"/></g>
<g id="c6"><rect x="14" y="18" width="32" height="26" rx="6" fill="#FBEAF0"/><ellipse cx="30" cy="18" rx="16" ry="5" fill="#F4C0D1"/></g>
<g id="c7"><rect x="22" y="8" width="16" height="44" rx="2" fill="#9FE1CB"/><rect x="22" y="8" width="16" height="14" rx="2" fill="#1D9E75"/><path d="M26 30 L34 30 M26 36 L34 36" stroke="#0F6E56" stroke-width="1.5"/></g>
<g id="c8"><circle cx="30" cy="30" r="18" fill="#FAC775"/><circle cx="24" cy="24" r="2.8" fill="#4A1B0C"/><circle cx="37" cy="28" r="2.8" fill="#4A1B0C"/><circle cx="27" cy="37" r="2.8" fill="#4A1B0C"/><circle cx="38" cy="39" r="2.3" fill="#4A1B0C"/></g>
<g id="c9"><path d="M6 22 L16 30 L6 38 Z" fill="#993C1D"/><path d="M54 22 L44 30 L54 38 Z" fill="#993C1D"/><rect x="16" y="16" width="28" height="28" rx="4" fill="#D85A30"/><path d="M22 24 L38 24" stroke="#712B13" stroke-width="2" stroke-linecap="round"/></g>
<g id="c10"><rect x="28" y="38" width="4" height="18" rx="2" fill="#FAEEDA"/><path d="M30 12 C22 8 12 14 12 24 C12 34 22 42 30 42 C38 42 48 34 48 24 C48 14 38 8 30 12 Z" fill="#E24B4A"/><path d="M30 12 L30 6" stroke="#3B6D11" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="22" cy="21" rx="4" ry="6" fill="#F7C1C1" transform="rotate(-25 22 21)"/></g>
<g id="c11"><path d="M30 9 L36 24 L52 25 L40 35 L44 51 L30 42 L16 51 L20 35 L8 25 L24 24 Z" fill="#AFA9EC"/><path d="M30 20 L33 27 L40 28 L34 32 L36 40 L30 36 L24 40 L26 32 L20 28 L27 27 Z" fill="#CECBF6"/></g>
`

export const SHELL_COUNT = 12

/** 껍질 이름. 화면에 라벨로 쓰지는 않고 접근성 텍스트에만 쓴다. */
export const SHELL_NAMES = [
  '비닐 사탕', '막대사탕', '초콜릿 바', '젤리곰', '컵 젤리', '소용돌이 사탕',
  '마시멜로', '껌', '쿠키', '캐러멜', '사과 사탕', '별사탕',
]

export function CandyDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs dangerouslySetInnerHTML={{ __html: DEFS }} />
    </svg>
  )
}
