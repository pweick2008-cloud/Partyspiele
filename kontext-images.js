"use strict";

/* =========================================================
   Kontextlos – Bilder zum Posten
   Eigene, bewusst harmlose Illustrationen (400 × 300). Erst die
   Bildunterschrift eines anderen Spielers macht sie verdächtig.
   ========================================================= */
const KX_IMAGES = {
  strand: `
    <rect width="400" height="300" fill="#8fd3f4"/>
    <circle cx="318" cy="68" r="32" fill="#ffd66b"/>
    <rect y="150" width="400" height="62" fill="#3fa7d6"/>
    <path d="M0 162q25-8 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0v8H0z" fill="#9ad8f0" opacity=".7"/>
    <path d="M0 210q200-26 400 0v90H0z" fill="#f3d9a4"/>
    <rect x="148" y="128" width="5" height="122" fill="#7a5a3a"/>
    <path d="M78 136q72-82 145 0z" fill="#ef6a5a"/>
    <path d="M128 136q22-68 45 0z" fill="#fff4e6"/>
    <rect x="196" y="232" width="112" height="34" rx="4" fill="#6c8cf5" transform="rotate(-6 252 249)"/>
    <rect x="196" y="244" width="112" height="8" fill="#fff" opacity=".7" transform="rotate(-6 252 249)"/>`,

  torte: `
    <rect width="400" height="300" fill="#f6e3e8"/>
    <rect y="232" width="400" height="68" fill="#c98f6b"/>
    <ellipse cx="200" cy="232" rx="120" ry="14" fill="#fff" opacity=".8"/>
    <rect x="110" y="168" width="180" height="62" rx="10" fill="#f4b7c7"/>
    <rect x="135" y="120" width="130" height="52" rx="10" fill="#f9d1dc"/>
    <path d="M110 180q15 14 30 0t30 0 30 0 30 0 30 0 30 0" stroke="#fff" stroke-width="7" fill="none"/>
    <path d="M135 132q13 12 26 0t26 0 26 0 26 0 26 0" stroke="#fff" stroke-width="6" fill="none"/>
    <g fill="#8ec5ff"><rect x="160" y="88" width="8" height="32" rx="3"/><rect x="196" y="84" width="8" height="36" rx="3"/><rect x="232" y="88" width="8" height="32" rx="3"/></g>
    <g fill="#ffb238"><path d="M164 70q8 10 0 18-8-8 0-18z"/><path d="M200 66q8 10 0 18-8-8 0-18z"/><path d="M236 70q8 10 0 18-8-8 0-18z"/></g>`,

  katze: `
    <rect width="400" height="300" fill="#e8dccb"/>
    <rect x="250" y="40" width="90" height="70" rx="4" fill="#c7b59b"/>
    <rect x="258" y="48" width="74" height="54" fill="#9bb7c9"/>
    <rect y="258" width="400" height="42" fill="#a07d5b"/>
    <rect x="40" y="150" width="320" height="100" rx="26" fill="#5b7f95"/>
    <rect x="40" y="130" width="60" height="120" rx="24" fill="#4d6f84"/>
    <rect x="300" y="130" width="60" height="120" rx="24" fill="#4d6f84"/>
    <rect x="96" y="176" width="208" height="40" rx="14" fill="#6a90a6"/>
    <ellipse cx="200" cy="170" rx="56" ry="26" fill="#f0a35a"/>
    <circle cx="246" cy="150" r="22" fill="#f0a35a"/>
    <path d="M230 136l4-20 12 14zM250 130l10-16 4 20z" fill="#f0a35a"/>
    <path d="M144 176q-30 10-24-16" stroke="#f0a35a" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M238 150q4 3 8 0M252 150q4 3 8 0" stroke="#5a3418" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  hund: `
    <rect width="400" height="300" fill="#bfe3f2"/>
    <circle cx="70" cy="60" r="24" fill="#fff6c9"/>
    <path d="M0 190q100-30 200-10t200-6v126H0z" fill="#7cc36d"/>
    <path d="M0 230q120-20 230 0t170 0v70H0z" fill="#69b25c"/>
    <ellipse cx="170" cy="210" rx="60" ry="30" fill="#c98b53"/>
    <rect x="125" y="220" width="16" height="44" rx="7" fill="#c98b53"/>
    <rect x="195" y="220" width="16" height="44" rx="7" fill="#c98b53"/>
    <circle cx="234" cy="178" r="30" fill="#c98b53"/>
    <ellipse cx="226" cy="164" rx="12" ry="22" fill="#8a5a31" transform="rotate(25 226 164)"/>
    <ellipse cx="258" cy="186" rx="9" ry="7" fill="#3b2416"/>
    <circle cx="242" cy="172" r="4" fill="#3b2416"/>
    <path d="M110 200q-26-20-14-40" stroke="#c98b53" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="318" cy="250" r="18" fill="#ffd23f"/>
    <path d="M302 244q16 8 32 0" stroke="#fff" stroke-width="4" fill="none"/>`,

  kuehlschrank: `
    <rect width="400" height="300" fill="#dfe6ea"/>
    <rect y="262" width="400" height="38" fill="#b9c2c7"/>
    <rect x="110" y="30" width="150" height="236" rx="10" fill="#f5f7f8" stroke="#aab4ba" stroke-width="3"/>
    <rect x="120" y="40" width="130" height="216" rx="4" fill="#eaf6ff"/>
    <g fill="#cfe3ef"><rect x="120" y="100" width="130" height="5"/><rect x="120" y="160" width="130" height="5"/><rect x="120" y="215" width="130" height="5"/></g>
    <rect x="170" y="128" width="26" height="32" rx="4" fill="#e8a33d"/>
    <rect x="168" y="122" width="30" height="8" rx="2" fill="#b86f1d"/>
    <path d="M260 34l78 24v190l-78 18z" fill="#e9eef1" stroke="#aab4ba" stroke-width="3"/>
    <rect x="320" y="120" width="6" height="60" rx="3" fill="#aab4ba"/>
    <path d="M120 40h130v8H120z" fill="#fff" opacity=".9"/>`,

  badewanne: `
    <rect width="400" height="300" fill="#d4ecf0"/>
    <g stroke="#bcdde3" stroke-width="2"><path d="M0 50h400M0 100h400M0 150h400M80 0v190M160 0v190M240 0v190M320 0v190"/></g>
    <rect y="250" width="400" height="50" fill="#9fc6cf"/>
    <path d="M50 170h300v20q0 60-60 60H110q-60 0-60-60z" fill="#ffffff" stroke="#b5cfd6" stroke-width="3"/>
    <g fill="#ffffff" stroke="#d2e6ea" stroke-width="2"><circle cx="90" cy="166" r="20"/><circle cx="125" cy="156" r="24"/><circle cx="165" cy="164" r="20"/><circle cx="205" cy="154" r="26"/><circle cx="248" cy="164" r="22"/><circle cx="290" cy="158" r="24"/><circle cx="325" cy="168" r="16"/></g>
    <ellipse cx="270" cy="134" rx="18" ry="13" fill="#ffd23f"/>
    <circle cx="282" cy="120" r="10" fill="#ffd23f"/>
    <path d="M290 120l10 3-10 3z" fill="#f28c28"/>
    <path d="M340 90v-40h-30" stroke="#9aa9ae" stroke-width="7" fill="none" stroke-linecap="round"/>`,

  auto: `
    <rect width="400" height="300" fill="#ffd9b0"/>
    <circle cx="300" cy="90" r="40" fill="#ff9b6a"/>
    <path d="M0 170l80-40 70 30 90-50 80 40 80-20v70H0z" fill="#c08a7e"/>
    <rect y="200" width="400" height="100" fill="#4d4a55"/>
    <g fill="#f4e7c6"><rect x="20" y="246" width="50" height="6"/><rect x="120" y="246" width="50" height="6"/><rect x="220" y="246" width="50" height="6"/><rect x="320" y="246" width="50" height="6"/></g>
    <path d="M90 230v-30q0-10 10-12l40-6 30-30q8-8 20-8h70q12 0 20 10l26 30 30 6q10 2 10 14v26z" fill="#2f7fd1"/>
    <path d="M178 180l24-24h50l20 24z" fill="#b6e0ff"/>
    <rect x="222" y="156" width="6" height="24" fill="#2f7fd1"/>
    <circle cx="140" cy="232" r="20" fill="#222"/><circle cx="140" cy="232" r="8" fill="#bbb"/>
    <circle cx="290" cy="232" r="20" fill="#222"/><circle cx="290" cy="232" r="8" fill="#bbb"/>
    <rect x="330" y="196" width="14" height="8" rx="3" fill="#ffe28a"/>`,

  zelt: `
    <rect width="400" height="300" fill="#1b2340"/>
    <g fill="#fff"><circle cx="40" cy="40" r="2"/><circle cx="120" cy="70" r="1.6"/><circle cx="200" cy="30" r="2"/><circle cx="260" cy="80" r="1.4"/><circle cx="340" cy="50" r="2"/><circle cx="90" cy="110" r="1.4"/><circle cx="370" cy="120" r="1.6"/></g>
    <circle cx="310" cy="60" r="20" fill="#f3efd2"/><circle cx="320" cy="54" r="18" fill="#1b2340"/>
    <path d="M0 210l40-90 40 90zM330 210l35-80 35 80z" fill="#16352b"/>
    <rect y="210" width="400" height="90" fill="#233b2c"/>
    <path d="M110 250l70-110 70 110z" fill="#e08a3c"/>
    <path d="M180 140l-18 110h36z" fill="#3a2518"/>
    <path d="M286 250l20-12 20 12z" fill="#6b4a2e"/>
    <path d="M306 244q-14-18 0-38 14 20 0 38z" fill="#ffb238"/>
    <path d="M306 244q-6-10 0-20 6 10 0 20z" fill="#fff1b0"/>`,

  spaghetti: `
    <rect width="400" height="300" fill="#e7d2b8"/>
    <g stroke="#d6bc9c" stroke-width="10"><path d="M0 40h400M0 110h400M0 180h400M0 250h400"/></g>
    <circle cx="200" cy="150" r="118" fill="#fbfbf8"/>
    <circle cx="200" cy="150" r="92" fill="#f1efe8"/>
    <g fill="none" stroke="#f0c75e" stroke-width="6" stroke-linecap="round">
      <path d="M140 150q20-40 50-10t50 0 20-30"/><path d="M130 170q30 20 60 0t60 0"/><path d="M150 120q30-30 70 0t40 20"/><path d="M150 190q30 10 50-10t50 10"/></g>
    <ellipse cx="200" cy="150" rx="40" ry="28" fill="#d6452f"/>
    <g fill="#5fa04e"><circle cx="190" cy="142" r="5"/><circle cx="212" cy="156" r="4"/></g>
    <path d="M300 60l14 4-40 150-8-2z" fill="#b8bcc2"/>`,

  schreibtisch: `
    <rect width="400" height="300" fill="#dcd6ec"/>
    <rect x="40" y="40" width="110" height="80" rx="4" fill="#fff" opacity=".8"/>
    <rect y="200" width="400" height="20" fill="#8f6b4e"/>
    <rect x="30" y="220" width="16" height="80" fill="#7a5a40"/><rect x="354" y="220" width="16" height="80" fill="#7a5a40"/>
    <rect x="140" y="110" width="140" height="88" rx="6" fill="#33363f"/>
    <rect x="148" y="118" width="124" height="72" rx="2" fill="#7fb7e8"/>
    <path d="M120 198h180l-14 4H134z" fill="#2a2c33"/>
    <rect x="300" y="166" width="30" height="34" rx="5" fill="#ef6a5a"/>
    <path d="M330 176q14 0 14 10t-14 10" stroke="#ef6a5a" stroke-width="5" fill="none"/>
    <path d="M70 200v-70l30-30" stroke="#444" stroke-width="5" fill="none"/>
    <path d="M90 92l40 10-10 20z" fill="#ffcf5c"/>`,

  grill: `
    <rect width="400" height="300" fill="#bde4c4"/>
    <rect y="230" width="400" height="70" fill="#78b35f"/>
    <g fill="#e9edf2" opacity=".9"><circle cx="190" cy="70" r="20"/><circle cx="215" cy="50" r="24"/><circle cx="240" cy="74" r="18"/></g>
    <path d="M120 140h160q0 70-80 70t-80-70z" fill="#2c2c32"/>
    <rect x="114" y="134" width="172" height="8" rx="3" fill="#55555e"/>
    <g fill="#c2553a"><rect x="140" y="118" width="60" height="16" rx="8"/><rect x="206" y="118" width="56" height="16" rx="8"/><rect x="168" y="102" width="62" height="16" rx="8"/></g>
    <g stroke="#2c2c32" stroke-width="6" stroke-linecap="round"><path d="M160 200l-20 50M240 200l20 50M200 210v40"/></g>`,

  hantel: `
    <rect width="400" height="300" fill="#2e3440"/>
    <rect y="230" width="400" height="70" fill="#20242c"/>
    <g fill="#434b5a"><rect x="30" y="40" width="10" height="190"/><rect x="360" y="40" width="10" height="190"/></g>
    <rect x="110" y="190" width="180" height="12" rx="5" fill="#b8bec9"/>
    <rect x="80" y="160" width="26" height="72" rx="6" fill="#e55b4d"/>
    <rect x="58" y="172" width="22" height="48" rx="6" fill="#c94436"/>
    <rect x="294" y="160" width="26" height="72" rx="6" fill="#e55b4d"/>
    <rect x="320" y="172" width="22" height="48" rx="6" fill="#c94436"/>
    <rect x="160" y="70" width="80" height="50" rx="6" fill="#3d4554"/>
    <path d="M170 104l14-16 12 10 18-22 16 28" stroke="#7ee0a1" stroke-width="4" fill="none"/>`,

  keller: `
    <rect width="400" height="300" fill="#15131a"/>
    <path d="M60 0h280l-60 300H120z" fill="#2a2630"/>
    <g fill="#3a3440"><path d="M80 40h240l-6 26H86z"/><path d="M96 100h208l-6 26H102z"/><path d="M112 160h176l-6 26H118z"/></g>
    <rect x="160" y="200" width="80" height="100" fill="#3d2c22"/>
    <rect x="160" y="292" width="80" height="8" fill="#ffd77a"/>
    <path d="M140 300l20-8h80l20 8z" fill="#ffd77a" opacity=".35"/>
    <circle cx="228" cy="252" r="4" fill="#c9a56a"/>`,

  schaufel: `
    <rect width="400" height="300" fill="#3c3157"/>
    <circle cx="80" cy="70" r="26" fill="#f6e7b8"/>
    <path d="M0 200q60-30 130-10t140-10 130 10v110H0z" fill="#2b4436"/>
    <path d="M0 250q200-24 400 0v50H0z" fill="#22382c"/>
    <path d="M150 236q50-60 110 0z" fill="#6b4a32"/>
    <rect x="218" y="110" width="8" height="110" rx="3" fill="#a77b4f" transform="rotate(14 222 165)"/>
    <path d="M222 214l24 6-8 30-26-6z" fill="#9aa2ad" transform="rotate(14 230 230)"/>
    <rect x="206" y="104" width="30" height="8" rx="4" fill="#a77b4f" transform="rotate(14 222 108)"/>`,

  sessel: `
    <rect width="400" height="300" fill="#efe1c9"/>
    <g stroke="#e2cfae" stroke-width="2"><path d="M0 60h400M0 120h400M0 180h400"/></g>
    <rect y="250" width="400" height="50" fill="#9c6b4a"/>
    <path d="M110 120q0-40 40-40h100q40 0 40 40v70H110z" fill="#7b9a63"/>
    <rect x="90" y="160" width="40" height="80" rx="16" fill="#6a8854"/>
    <rect x="270" y="160" width="40" height="80" rx="16" fill="#6a8854"/>
    <rect x="124" y="180" width="152" height="50" rx="12" fill="#8aaa72"/>
    <circle cx="220" cy="186" r="20" fill="#d0566c"/>
    <path d="M208 172q12 14 0 28M222 168q10 18 0 36" stroke="#a9384e" stroke-width="2" fill="none"/>
    <path d="M180 196l60-34M186 204l58-30" stroke="#d8b46a" stroke-width="4" stroke-linecap="round"/>
    <path d="M340 250v-120" stroke="#5a4636" stroke-width="5"/>
    <path d="M318 130h44l-10-36h-24z" fill="#f4c96b"/>`,

  party: `
    <rect width="400" height="300" fill="#24133a"/>
    <path d="M200 0v40" stroke="#888" stroke-width="3"/>
    <circle cx="200" cy="72" r="34" fill="#c8cbd6"/>
    <g stroke="#8d91a3" stroke-width="2"><path d="M170 60h60M166 76h68M172 92h56M190 40v64M210 40v64"/></g>
    <g fill="#ff5c8a"><rect x="40" y="120" width="10" height="5" transform="rotate(30 45 122)"/><rect x="300" y="160" width="10" height="5" transform="rotate(-20 305 162)"/><rect x="120" y="220" width="10" height="5" transform="rotate(60 125 222)"/></g>
    <g fill="#ffd23f"><rect x="90" y="160" width="10" height="5" transform="rotate(-40 95 162)"/><rect x="340" y="230" width="10" height="5" transform="rotate(20 345 232)"/><rect x="250" y="120" width="10" height="5" transform="rotate(70 255 122)"/></g>
    <g fill="#5ee3ff"><rect x="60" y="250" width="10" height="5" transform="rotate(10 65 252)"/><rect x="220" y="250" width="10" height="5" transform="rotate(-60 225 252)"/><rect x="160" y="150" width="10" height="5" transform="rotate(45 165 152)"/></g>
    <path d="M200 106L60 300h40zM200 106L300 300h40z" fill="#ffffff" opacity=".07"/>
    <rect y="270" width="400" height="30" fill="#180c27"/>`,

  balkon: `
    <defs><linearGradient id="kxSun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f58a6b"/><stop offset="1" stop-color="#fbd38d"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#kxSun)"/>
    <circle cx="200" cy="170" r="50" fill="#fff0c2" opacity=".9"/>
    <path d="M0 170h40v-40h30v40h20v-70h40v70h30v-30h30v30h40v-50h30v50h40v-20h30v20h50v130H0z" fill="#7a4a5c"/>
    <rect y="200" width="400" height="10" fill="#3a2a33"/>
    <g fill="#3a2a33"><rect x="20" y="210" width="6" height="90"/><rect x="80" y="210" width="6" height="90"/><rect x="140" y="210" width="6" height="90"/><rect x="200" y="210" width="6" height="90"/><rect x="260" y="210" width="6" height="90"/><rect x="320" y="210" width="6" height="90"/><rect x="380" y="210" width="6" height="90"/></g>
    <path d="M290 150h40q0 30-20 32-20-2-20-32z" fill="#ffffff" opacity=".85"/>
    <path d="M292 158h36q-2 20-18 22-16-2-18-22z" fill="#9b1c3a"/>
    <rect x="308" y="182" width="4" height="18" fill="#fff" opacity=".85"/>`,

  schneemann: `
    <rect width="400" height="300" fill="#cfe2f3"/>
    <g fill="#fff"><circle cx="40" cy="40" r="3"/><circle cx="120" cy="90" r="2.5"/><circle cx="300" cy="40" r="3"/><circle cx="360" cy="110" r="2.5"/><circle cx="220" cy="20" r="2"/></g>
    <path d="M0 230q200-30 400 0v70H0z" fill="#ffffff"/>
    <circle cx="200" cy="210" r="56" fill="#fdfdfd" stroke="#dbe7f1" stroke-width="3"/>
    <circle cx="200" cy="130" r="40" fill="#fdfdfd" stroke="#dbe7f1" stroke-width="3"/>
    <circle cx="200" cy="74" r="28" fill="#fdfdfd" stroke="#dbe7f1" stroke-width="3"/>
    <rect x="176" y="34" width="48" height="10" fill="#333"/><rect x="184" y="10" width="32" height="26" fill="#333"/>
    <path d="M200 78l30 6-30 4z" fill="#f28c28"/>
    <circle cx="190" cy="68" r="3.5" fill="#333"/><circle cx="210" cy="68" r="3.5" fill="#333"/>
    <path d="M172 104q28 16 56 0" stroke="#d0566c" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M160 130l-50-30M240 130l50-24" stroke="#7a5a3a" stroke-width="5" stroke-linecap="round"/>`,

  koffer: `
    <rect width="400" height="300" fill="#e9e2d6"/>
    <rect x="300" y="20" width="70" height="230" fill="#c4b39b"/>
    <circle cx="312" cy="140" r="4" fill="#8a7863"/>
    <rect y="250" width="400" height="50" fill="#9c8a74"/>
    <rect x="120" y="80" width="140" height="170" rx="16" fill="#2b7a78"/>
    <g fill="#236664"><rect x="146" y="80" width="10" height="170"/><rect x="224" y="80" width="10" height="170"/></g>
    <path d="M165 80V54q0-8 8-8h34q8 0 8 8v26" stroke="#333" stroke-width="7" fill="none"/>
    <circle cx="140" cy="254" r="7" fill="#333"/><circle cx="240" cy="254" r="7" fill="#333"/>
    <rect x="170" y="120" width="40" height="26" rx="3" fill="#f4d35e" transform="rotate(-8 190 133)"/>`,

  bett: `
    <rect width="400" height="300" fill="#d9d4ef"/>
    <rect x="290" y="40" width="70" height="90" rx="4" fill="#24264a"/>
    <circle cx="335" cy="70" r="10" fill="#f3efd2"/>
    <rect y="262" width="400" height="38" fill="#8d7a9e"/>
    <rect x="40" y="130" width="22" height="132" rx="6" fill="#7a5a76"/>
    <rect x="40" y="200" width="320" height="50" rx="10" fill="#f4f1f8"/>
    <path d="M110 190h250v40q0 20-20 20H110z" fill="#7c8ce0"/>
    <path d="M110 200h250" stroke="#aab5f0" stroke-width="5"/>
    <rect x="66" y="170" width="70" height="36" rx="14" fill="#ffffff"/>
    <circle cx="170" cy="170" r="22" fill="#b8865a"/>
    <circle cx="154" cy="152" r="9" fill="#b8865a"/><circle cx="186" cy="152" r="9" fill="#b8865a"/>
    <ellipse cx="170" cy="178" rx="9" ry="7" fill="#e3c39d"/>
    <circle cx="163" cy="166" r="2.5" fill="#3b2416"/><circle cx="177" cy="166" r="2.5" fill="#3b2416"/>`,

  kaktus: `
    <rect width="400" height="300" fill="#f2e6d3"/>
    <rect x="70" y="20" width="260" height="200" fill="#bfe1f2" stroke="#fff" stroke-width="12"/>
    <path d="M200 20v200M70 120h260" stroke="#fff" stroke-width="8"/>
    <rect x="40" y="220" width="320" height="24" fill="#d8c3a3"/>
    <path d="M160 220l8-50h64l8 50z" fill="#d1693c" transform="translate(0 0)"/>
    <rect x="156" y="164" width="88" height="14" rx="3" fill="#b85a30"/>
    <rect x="186" y="80" width="28" height="86" rx="14" fill="#4f9a5b"/>
    <path d="M186 130h-16q-8 0-8-8v-24" stroke="#4f9a5b" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M214 114h14q8 0 8-8V92" stroke="#4f9a5b" stroke-width="14" fill="none" stroke-linecap="round"/>
    <circle cx="200" cy="78" r="7" fill="#ff7aa2"/>`,

  klopapier: `
    <rect width="400" height="300" fill="#dbe9e4"/>
    <rect y="250" width="400" height="50" fill="#a9c2b9"/>
    <g fill="#ffffff" stroke="#c7d6d1" stroke-width="3">
      <rect x="90" y="190" width="70" height="60" rx="8"/><rect x="165" y="190" width="70" height="60" rx="8"/><rect x="240" y="190" width="70" height="60" rx="8"/>
      <rect x="128" y="130" width="70" height="60" rx="8"/><rect x="203" y="130" width="70" height="60" rx="8"/>
      <rect x="165" y="70" width="70" height="60" rx="8"/></g>
    <g fill="#c7d6d1"><ellipse cx="125" cy="220" rx="10" ry="8"/><ellipse cx="200" cy="220" rx="10" ry="8"/><ellipse cx="275" cy="220" rx="10" ry="8"/><ellipse cx="163" cy="160" rx="10" ry="8"/><ellipse cx="238" cy="160" rx="10" ry="8"/><ellipse cx="200" cy="100" rx="10" ry="8"/></g>`,

  pizza: `
    <rect width="400" height="300" fill="#3b3f4a"/>
    <path d="M60 120l40-80h200l40 80z" fill="#c9a06d"/>
    <rect x="60" y="120" width="280" height="150" fill="#d8b07c"/>
    <rect x="76" y="136" width="248" height="118" fill="#e9cfa6"/>
    <circle cx="200" cy="195" r="54" fill="#d9963f"/>
    <circle cx="200" cy="195" r="46" fill="#f2b84b"/>
    <path d="M200 195L254 168v54z" fill="#e9cfa6"/>
    <g fill="#c2402f"><circle cx="176" cy="178" r="8"/><circle cx="214" cy="170" r="7"/><circle cx="182" cy="215" r="8"/><circle cx="220" cy="222" r="6"/></g>
    <g fill="#f7f1e3"><circle cx="196" cy="196" r="3"/><circle cx="166" cy="200" r="3"/></g>`,

  gipfel: `
    <rect width="400" height="300" fill="#a6d0f0"/>
    <g fill="#fff" opacity=".9"><ellipse cx="80" cy="60" rx="40" ry="14"/><ellipse cx="320" cy="90" rx="50" ry="14"/></g>
    <path d="M0 300l110-150 60 60 70-140 160 230z" fill="#6d7f99"/>
    <path d="M240 70l30 44-14-6-16 16-12-18-16 12z" fill="#ffffff"/>
    <path d="M110 150l22 30-12-4-10 10-14-12-10 4z" fill="#ffffff"/>
    <rect x="238" y="30" width="4" height="44" fill="#3d3d3d"/>
    <path d="M242 32l36 10-36 10z" fill="#ef4f5f"/>
    <path d="M0 300q120-60 240-20t160-10v30z" fill="#4f6a52"/>`,

  aquarium: `
    <rect width="400" height="300" fill="#e3ddd2"/>
    <rect y="240" width="400" height="60" fill="#8b6f52"/>
    <rect x="70" y="70" width="260" height="170" rx="8" fill="#5cc0dd" stroke="#e8f6fa" stroke-width="6"/>
    <path d="M73 210q60-14 127 0t127 0v27H73z" fill="#e9d29c"/>
    <path d="M110 210q-10-40 6-80M124 210q14-30 0-60" stroke="#3e9a56" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M190 140q30-26 60 0-30 26-60 0zM250 140l18-14v28z" fill="#ff8c3a"/>
    <circle cx="206" cy="136" r="3" fill="#222"/>
    <g fill="#e8f6fa" opacity=".9"><circle cx="180" cy="120" r="4"/><circle cx="174" cy="104" r="3"/><circle cx="178" cy="90" r="2.5"/></g>
    <rect x="66" y="62" width="268" height="12" rx="4" fill="#4b4f57"/>`,

  gartenzwerg: `
    <rect width="400" height="300" fill="#c6e6b8"/>
    <g fill="#ffffff"><circle cx="70" cy="230" r="8"/><circle cx="330" cy="210" r="7"/><circle cx="300" cy="250" r="6"/></g>
    <g fill="#ffd23f"><circle cx="70" cy="230" r="3"/><circle cx="330" cy="210" r="3"/><circle cx="300" cy="250" r="2.5"/></g>
    <rect y="260" width="400" height="40" fill="#79b05f"/>
    <path d="M160 250q0-60 40-60t40 60z" fill="#3973c2"/>
    <circle cx="200" cy="168" r="28" fill="#f6c9a5"/>
    <path d="M172 170q28 74 56 0q-10 8-28 8t-28-8z" fill="#ffffff"/>
    <path d="M170 160l30-90 30 90z" fill="#d23b3b"/>
    <circle cx="200" cy="170" r="6" fill="#ec9c88"/>
    <circle cx="190" cy="160" r="3" fill="#333"/><circle cx="210" cy="160" r="3" fill="#333"/>
    <rect x="232" y="196" width="6" height="56" fill="#8a6a46"/>
    <path d="M222 252h26l-4 10h-18z" fill="#8a6a46"/>`,

  haltestelle: `
    <rect width="400" height="300" fill="#7d8796"/>
    <g stroke="#b9c3d1" stroke-width="2" opacity=".7"><path d="M40 20l-10 30M120 60l-10 30M200 10l-10 30M290 50l-10 30M360 20l-10 30M80 120l-10 30M330 130l-10 30M160 150l-10 30"/></g>
    <rect y="240" width="400" height="60" fill="#4b525e"/>
    <rect x="80" y="90" width="200" height="12" fill="#3c434f"/>
    <rect x="84" y="102" width="6" height="140" fill="#3c434f"/><rect x="270" y="102" width="6" height="140" fill="#3c434f"/>
    <rect x="96" y="104" width="168" height="104" fill="#a9c4d8" opacity=".45"/>
    <rect x="110" y="196" width="140" height="10" rx="3" fill="#2f353f"/>
    <rect x="310" y="70" width="6" height="170" fill="#3c434f"/>
    <circle cx="313" cy="66" r="20" fill="#f4d35e"/>
    <path d="M305 58h16v16h-16z" fill="#2e7d32" opacity=".9"/>
    <ellipse cx="200" cy="270" rx="70" ry="6" fill="#9aa6b6" opacity=".5"/>`,

  kerze: `
    <rect width="400" height="300" fill="#120f14"/>
    <circle cx="200" cy="120" r="110" fill="#ffb238" opacity=".08"/>
    <circle cx="200" cy="120" r="60" fill="#ffb238" opacity=".1"/>
    <rect y="250" width="400" height="50" fill="#1e1920"/>
    <rect x="182" y="140" width="36" height="110" rx="4" fill="#f3e9d6"/>
    <path d="M182 150q10 8 18 0t18 4" stroke="#e0d2b8" stroke-width="4" fill="none"/>
    <path d="M200 140v-10" stroke="#333" stroke-width="3"/>
    <path d="M200 92q16 22 0 38-16-16 0-38z" fill="#ffb238"/>
    <path d="M200 108q7 10 0 18-7-8 0-18z" fill="#fff1b0"/>
    <ellipse cx="200" cy="252" rx="50" ry="6" fill="#000" opacity=".4"/>`,

  waesche: `
    <rect width="400" height="300" fill="#e6eef5"/>
    <rect y="250" width="400" height="50" fill="#b9c7d3"/>
    <path d="M110 160h180l-16 92H126z" fill="#d6b48a"/>
    <g stroke="#c29d70" stroke-width="3"><path d="M118 190h164M122 220h156"/></g>
    <path d="M120 170q20-50 60-40 20-40 60-10 40-10 50 40z" fill="#7c8ce0"/>
    <path d="M140 150q10-30 40-26l10 30z" fill="#ef6a5a"/>
    <path d="M210 130q30-20 50 10l-20 20z" fill="#f4d35e"/>
    <path d="M190 120q20-20 30 0" stroke="#5aa86a" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M300 250q10-30 30-20t20 20z" fill="#ffffff"/>`
};

const KX_IMAGE_IDS = Object.keys(KX_IMAGES);

// Fertiges SVG für ein Bild (unbekannte IDs ergeben ein leeres Feld)
function kxImageSvg(id) {
  return `<svg class="kx-img" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${KX_IMAGES[id] || '<rect width="400" height="300" fill="#ccc"/>'}</svg>`;
}

if (typeof module !== "undefined") module.exports = { KX_IMAGES, KX_IMAGE_IDS, kxImageSvg };
