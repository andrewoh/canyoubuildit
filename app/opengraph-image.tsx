import { ImageResponse } from 'next/og';

export const alt = 'Andrew Oh’s home feed of biography, AI projects, and data science';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex', height: '100%', width: '100%', background: '#fbfaf7', color: '#24221f', padding: 64, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 700 }}>
        <div style={{ display: 'flex', fontSize: 32 }}>Andrew Oh</div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 108, fontWeight: 600, letterSpacing: -7, lineHeight: 0.98, marginTop: 34 }}>
          <span>My home</span><span style={{ color: '#a83130' }}>feed.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 25, marginTop: 36 }}>Director of Data Science at Xero</div>
        <div style={{ display: 'flex', fontSize: 23, color: '#655f59', marginTop: 5 }}>Previously at Pinterest</div>
      </div>
      <div style={{ position: 'relative', width: 350, height: 370, display: 'flex' }}>
        <div style={{ display: 'flex', position: 'absolute', left: 10, top: 30, width: 218, height: 296, background: '#bd6551', borderRadius: 16, transform: 'rotate(-13deg)' }} />
        <div style={{ display: 'flex', position: 'absolute', left: 66, top: 24, width: 218, height: 296, background: '#d9caa9', borderRadius: 16, transform: 'rotate(-3deg)' }} />
        <div style={{ display: 'flex', position: 'absolute', left: 112, top: 36, width: 218, height: 296, background: '#253b35', color: '#fff9ed', borderRadius: 16, transform: 'rotate(9deg)', alignItems: 'center', justifyContent: 'center', fontSize: 94, letterSpacing: -11 }}>ao</div>
      </div>
    </div>, size,
  );
}
