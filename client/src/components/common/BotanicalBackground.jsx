import React from 'react';

/**
 * BotanicalBackground renders delicate abstract organic blobs, looping lines,
 * and minimal botanical leaf strokes inspired by the reference artwork.
 * Completely non-interactive and fixed behind content.
 */
const BotanicalBackground = () => {
  return (
    <div className="botanical-bg-layer" aria-hidden="true">
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          minHeight: '100vh',
        }}
      >
        <defs>
          <linearGradient id="dustyRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C66A86" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#D9829B" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id="blushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E9A0B5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F2D6D5" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="beigeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8D8CC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F5EFE7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* TOP LEFT: Organic dusty rose blob */}
        <path
          d="M-50 -40 C60 -60 260 -20 280 80 C300 170 180 230 70 210 C-40 190 -90 120 -50 -40 Z"
          fill="url(#dustyRoseGrad)"
        />

        {/* TOP RIGHT: Warm beige soft blob */}
        <path
          d="M1250 -60 C1380 -50 1490 20 1470 130 C1450 200 1360 210 1280 180 C1200 150 1180 60 1250 -60 Z"
          fill="url(#beigeGrad)"
        />

        {/* TOP RIGHT: Minimal Botanical Foliage / Branch */}
        <g stroke="var(--botanical-stroke)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
          {/* Main stem */}
          <path d="M1360 20 C1330 70 1280 120 1210 160 C1170 185 1130 200 1090 210" />
          
          {/* Leaves */}
          <path d="M1320 65 C1305 45 1335 35 1350 45 C1365 55 1335 85 1320 65 Z" fill="none" />
          <path d="M1295 90 C1265 85 1275 60 1295 70 C1315 80 1315 95 1295 90 Z" fill="none" />
          <path d="M1270 115 C1250 95 1280 85 1295 95 C1310 105 1285 130 1270 115 Z" fill="none" />
          <path d="M1240 140 C1210 135 1220 110 1240 120 C1260 130 1260 145 1240 140 Z" fill="none" />
          <path d="M1205 165 C1185 145 1215 135 1230 145 C1245 155 1220 180 1205 165 Z" fill="none" />
          <path d="M1165 190 C1135 185 1145 160 1165 170 C1185 180 1185 195 1165 190 Z" fill="none" />
        </g>

        {/* TOP/RIGHT: Delicate flowing contour line */}
        <path
          d="M-20 180 C200 160 400 300 700 240 C1000 180 1200 320 1460 260"
          stroke="var(--botanical-stroke)"
          strokeWidth="1.25"
          opacity="0.25"
          fill="none"
        />

        {/* RIGHT CENTER: Soft blush pink organic blob */}
        <path
          d="M1260 320 C1390 300 1490 380 1470 500 C1450 600 1330 630 1240 590 C1160 550 1140 440 1200 370 C1220 345 1240 325 1260 320 Z"
          fill="url(#blushGrad)"
        />

        {/* RIGHT CENTER: Looping abstract contour line */}
        <path
          d="M1360 270 C1280 340 1250 480 1300 580 C1350 680 1440 700 1400 780 C1360 860 1260 840 1200 890"
          stroke="var(--botanical-stroke)"
          strokeWidth="1.3"
          opacity="0.32"
          fill="none"
        />

        {/* LEFT CENTER: Small blush accent dots & organic curve */}
        <circle cx="95" cy="540" r="18" fill="#E9A0B5" opacity="0.35" />
        <circle cx="70" cy="580" r="26" fill="#D9829B" opacity="0.32" />
        <path
          d="M-40 420 C60 440 110 520 80 620 C50 710 -20 740 -50 720 Z"
          fill="url(#blushGrad)"
        />

        {/* BOTTOM LEFT: Dusty rose organic blob under botanical */}
        <path
          d="M110 740 C170 710 240 760 230 830 C220 900 140 920 80 890 C20 860 40 790 110 740 Z"
          fill="url(#dustyRoseGrad)"
        />

        {/* BOTTOM LEFT: Botanical branch artwork */}
        <g stroke="var(--botanical-stroke)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
          {/* Main stem reaching upwards */}
          <path d="M120 920 C130 850 150 780 190 700 C210 660 240 610 280 570" />

          {/* Leaf pairs */}
          <path d="M150 820 C125 805 140 780 160 790 C180 800 170 830 150 820 Z" fill="none" />
          <path d="M165 800 C190 785 205 810 185 820 C165 830 150 810 165 800 Z" fill="none" />
          <path d="M175 760 C150 745 165 720 185 730 C205 740 195 770 175 760 Z" fill="none" />
          <path d="M190 740 C215 725 230 750 210 760 C190 770 175 750 190 740 Z" fill="none" />
          <path d="M210 690 C185 675 200 650 220 660 C240 670 230 700 210 690 Z" fill="none" />
          <path d="M230 660 C255 645 270 670 250 680 C230 690 215 670 230 660 Z" fill="none" />
          <path d="M255 620 C240 595 270 590 280 605 C290 620 270 635 255 620 Z" fill="none" />
        </g>

        {/* BOTTOM RIGHT: Warm beige & blush blobs */}
        <path
          d="M1150 880 C1250 820 1380 840 1440 920 C1400 960 1200 970 1150 880 Z"
          fill="url(#beigeGrad)"
        />

        {/* Looping ribbon line across bottom right */}
        <path
          d="M1020 920 C1100 840 1180 780 1250 800 C1320 820 1310 900 1280 920 C1250 940 1220 890 1260 840 C1300 790 1380 740 1460 760"
          stroke="var(--botanical-stroke)"
          strokeWidth="1.3"
          opacity="0.3"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default BotanicalBackground;
