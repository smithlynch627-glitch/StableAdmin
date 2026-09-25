import { useId, useMemo, useState, type ReactNode } from 'react';
import { blobPath, cowAttributes, hashSeed, mulberry32 } from '../lib/art';
import type { Attribute } from '../lib/types';

const BG: Record<string, string> = { Paper: '#ffffff', Ink: '#000000', Fog: '#d6d6d6', 'Roof Tile': '#ffffff', Hanji: '#ececec' };

/** GIWA COWS placeholder: a hand-drawn-style cow head built from the token's traits. */
export function CowArt({ attributes, id }: { attributes?: Attribute[] | null; id: number }) {
  const uid = useId().replace(/:/g, '');
  const a = useMemo(() => {
    const src = attributes?.length ? attributes : cowAttributes(id);
    return Object.fromEntries(src.map((x) => [x.trait_type, String(x.value)])) as Record<string, string>;
  }, [attributes, id]);
  const rand = mulberry32(id * 7919 + 17);
  const bg = BG[a.Background] ?? '#fff';
  const dark = a.Background === 'Ink';
  const ink = dark ? '#fff' : '#000';
  const midnight = a.Hide === 'Midnight';
  const head = midnight ? '#000' : '#fff';
  const headStroke = midnight && dark ? '#fff' : '#000';
  const spot = midnight ? '#fff' : '#000';
  const eye = midnight ? '#fff' : '#000';

  const spots: ReactNode[] = [];
  if (a.Hide === 'Classic Spots') for (let i = 0; i < 4; i++) spots.push(<path key={i} d={blobPath(30 + rand() * 40, 28 + rand() * 42, 6 + rand() * 5, rand)} fill={spot} />);
  if (a.Hide === 'Big Patch') spots.push(<path key="p" d={blobPath(rand() > 0.5 ? 40 : 60, 46, 14, rand, 8)} fill={spot} />);
  if (a.Hide === 'Freckles') for (let i = 0; i < 16; i++) spots.push(<circle key={i} cx={30 + rand() * 40} cy={26 + rand() * 36} r={0.9 + rand() * 1.6} fill={spot} />);
  if (a.Hide === 'Midnight') for (let i = 0; i < 2; i++) spots.push(<path key={i} d={blobPath(34 + rand() * 32, 30 + rand() * 20, 4 + rand() * 3, rand)} fill={spot} />);
  if (a.Hide === 'Marble') for (let i = 0; i < 3; i++) {
    const y = 30 + i * 13 + rand() * 4;
    spots.push(<path key={i} d={`M24 ${y} Q37 ${y - 8} 50 ${y} T76 ${y}`} stroke={spot} strokeWidth={3.2} fill="none" strokeLinecap="round" />);
  }

  const hornColor = a.Horns === 'Chrome' ? '#9a9a9a' : midnight ? '#e6e6e6' : '#000';
  const horns = {
    Short: <><path d="M36 30 Q31 22 33 17 Q38 22 40 28Z" /><path d="M64 30 Q69 22 67 17 Q62 22 60 28Z" /></>,
    Long: <><path d="M36 29 Q24 22 20 8 Q31 16 40 26Z" /><path d="M64 29 Q76 22 80 8 Q69 16 60 26Z" /></>,
    Curled: <><path d="M37 28 Q26 26 25 16 Q27 10 33 12 Q28 16 31 20 Q34 24 40 25Z" /><path d="M63 28 Q74 26 75 16 Q73 10 67 12 Q72 16 69 20 Q66 24 60 25Z" /></>,
    Chrome: <><path d="M36 29 Q27 21 26 11 Q34 17 40 26Z" /><path d="M64 29 Q73 21 74 11 Q66 17 60 26Z" /></>,
    None: null,
  }[a.Horns as 'Short'];

  const eyes = {
    Calm: <><circle cx="41" cy="50" r="3.2" fill={eye} /><circle cx="59" cy="50" r="3.2" fill={eye} /></>,
    Sleepy: <><path d="M37 50 Q41 53.5 45 50" stroke={eye} strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M55 50 Q59 53.5 63 50" stroke={eye} strokeWidth="2.2" fill="none" strokeLinecap="round" /></>,
    Wide: <><circle cx="41" cy="49" r="5.2" fill="#fff" stroke="#000" strokeWidth="1.6" /><circle cx="59" cy="49" r="5.2" fill="#fff" stroke="#000" strokeWidth="1.6" /><circle cx="42" cy="50" r="2.4" fill="#000" /><circle cx="60" cy="50" r="2.4" fill="#000" /></>,
    Shades: <><rect x="33" y="45" width="15" height="9" rx="3.5" fill="#000" stroke={midnight ? '#fff' : '#000'} strokeWidth="1.2" /><rect x="52" y="45" width="15" height="9" rx="3.5" fill="#000" stroke={midnight ? '#fff' : '#000'} strokeWidth="1.2" /><path d="M48 48 H52" stroke={midnight ? '#fff' : '#000'} strokeWidth="1.6" /><path d="M36 47.5 L39 47.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></>,
    Wink: <><circle cx="41" cy="50" r="3.2" fill={eye} /><path d="M55 51 Q59 47.5 63 51" stroke={eye} strokeWidth="2.2" fill="none" strokeLinecap="round" /></>,
  }[a.Eyes as 'Calm'];

  const body = 'M18 100 Q20 85 40 82 L60 82 Q80 85 82 100Z';
  const outfit = {
    None: <path d={body} fill={head} stroke={headStroke} strokeWidth="1.8" />,
    Hoodie: <><path d={body} fill="#bdbdbd" stroke={ink} strokeWidth="1.8" /><path d="M40 82 Q50 92 60 82" fill="none" stroke="#000" strokeWidth="1.6" /><path d="M46 88 V96 M54 88 V96" stroke="#000" strokeWidth="1.3" strokeLinecap="round" /></>,
    'GIWA Tee': <><path d={body} fill="#000" stroke={ink} strokeWidth="1.8" /><text x="50" y="95" textAnchor="middle" fontSize="5.4" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif" letterSpacing="0.6">GIWA</text></>,
    Hanbok: <><path d={body} fill="#fff" stroke="#000" strokeWidth="1.8" /><path d="M38 83 L50 96 L62 83" fill="none" stroke="#000" strokeWidth="3.4" strokeLinejoin="round" /><path d="M50 96 L44 100 M50 96 L56 100" stroke="#000" strokeWidth="1.4" /></>,
    Suit: <><path d={body} fill="#000" stroke={ink} strokeWidth="1.8" /><path d="M42 82 L50 94 L58 82Z" fill="#fff" /><path d="M50 86 L48 90 L50 99 L52 90Z" fill="#000" stroke="#fff" strokeWidth="0.6" /></>,
    Varsity: <><path d={body} fill="#000" stroke={ink} strokeWidth="1.8" /><path d="M20 100 Q21 89 29 85 L31 100Z M80 100 Q79 89 71 85 L69 100Z" fill="#fff" /><path d="M42 82 Q50 88 58 82" fill="none" stroke="#fff" strokeWidth="2" /></>,
  }[a.Outfit as 'None'];

  const headD = 'M31 31 Q50 17 69 31 Q75 45 71 60 Q67 80 50 80 Q33 80 29 60 Q25 45 31 31Z';

  return (
    <svg viewBox="0 0 100 100" className="art" role="img" aria-label={`Cow #${id}`}>
      <rect width="100" height="100" fill={bg} />
      {a.Background === 'Roof Tile' && (
        <g fill="none" stroke="#000" strokeWidth="1.4" opacity="0.14">
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 6 }).map((__, c) => <path key={`${r}-${c}`} d={`M${c * 18 - (r % 2) * 9} ${r * 15 + 8} a9 7 0 0 0 18 0`} />),
          )}
        </g>
      )}
      {a.Background === 'Hanji' && (
        <g stroke="#000" strokeWidth="0.5" opacity="0.16">
          {Array.from({ length: 14 }).map((_, i) => {
            const x = rand() * 100, y = rand() * 100;
            return <path key={i} d={`M${x} ${y} q${4 + rand() * 6} ${rand() * 3} ${10 + rand() * 8} ${rand() * 2}`} fill="none" />;
          })}
        </g>
      )}
      {outfit}
      <rect x="41" y="72" width="18" height="12" fill={head} />
      <g fill={head} stroke={headStroke} strokeWidth="1.8">
        <ellipse cx="23" cy="42" rx="11" ry="5.6" transform="rotate(-22 23 42)" />
        <ellipse cx="77" cy="42" rx="11" ry="5.6" transform="rotate(22 77 42)" />
      </g>
      {horns && <g fill={hornColor} stroke={headStroke} strokeWidth="1.2" strokeLinejoin="round">{horns}</g>}
      <clipPath id={`h${uid}`}><path d={headD} /></clipPath>
      <path d={headD} fill={head} />
      <g clipPath={`url(#h${uid})`}>{spots}</g>
      <path d={headD} fill="none" stroke={headStroke} strokeWidth="1.8" />
      <ellipse cx="50" cy="69" rx="17" ry="10.5" fill="#d9d9d9" stroke="#000" strokeWidth="1.6" />
      <ellipse cx="44.5" cy="69" rx="2" ry="3" fill="#000" />
      <ellipse cx="55.5" cy="69" rx="2" ry="3" fill="#000" />
      {eyes}
      {a.Accessory === 'Nose Ring' && <circle cx="50" cy="78.5" r="3.6" fill="none" stroke="#8c8c8c" strokeWidth="1.8" />}
      {a.Accessory === 'Bell' && <><circle cx="50" cy="88" r="5" fill="#cfcfcf" stroke="#000" strokeWidth="1.4" /><path d="M47 88 H53" stroke="#000" strokeWidth="1.2" /></>}
      {a.Accessory === 'Earring' && <circle cx="14" cy="46" r="2.6" fill={dark ? '#fff' : '#000'} stroke={dark ? '#000' : '#fff'} strokeWidth="0.8" />}
      {a.Accessory === 'Headphones' && <><path d="M24 46 Q24 8 50 8 Q76 8 76 46" fill="none" stroke={ink} strokeWidth="4" /><rect x="18" y="38" width="9" height="15" rx="4" fill="#000" stroke={dark ? '#fff' : '#000'} /><rect x="73" y="38" width="9" height="15" rx="4" fill="#000" stroke={dark ? '#fff' : '#000'} /></>}
    </svg>
  );
}

/** Placeholder for creator collections: roof-tile rows, a nod to "giwa" (Korean roof tile). */
export function TileArt({ seed, wide = false }: { seed: string; wide?: boolean }) {
  const s = useMemo(() => {
    const rand = mulberry32(hashSeed(seed));
    const inverted = rand() > 0.55;
    const cols = 3 + Math.floor(rand() * 4);
    const stroke = 5 + rand() * 9;
    const filledEvery = 2 + Math.floor(rand() * 4);
    const shift = rand() > 0.5;
    const blob = rand() > 0.6;
    return { rand, inverted, cols, stroke, filledEvery, shift, blob, blobSeed: rand() };
  }, [seed]);
  const W = wide ? 300 : 100;
  const H = wide ? 100 : 100;
  const fg = s.inverted ? '#fff' : '#000';
  const bg = s.inverted ? '#000' : '#fff';
  const w = W / s.cols;
  const rows = Math.ceil(H / (w * 0.55)) + 1;
  const arcs: ReactNode[] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c <= s.cols; c++) {
      const x = c * w + (s.shift && r % 2 ? w / 2 : 0);
      const y = r * w * 0.55;
      const filled = (k++ % s.filledEvery) === 0;
      arcs.push(
        <path
          key={`${r}-${c}`}
          d={`M${x + 2} ${y} Q${x + w / 2} ${y + w * 0.55} ${x + w - 2} ${y}`}
          fill="none"
          stroke={fg}
          strokeWidth={filled ? s.stroke : Math.max(1.2, s.stroke / 4)}
          strokeLinecap="round"
        />,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="art" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <rect width={W} height={H} fill={bg} />
      {arcs}
      {s.blob && <path d={blobPath(W / 2, H / 2, H * 0.24, mulberry32(Math.floor(s.blobSeed * 1e9)), 8)} fill={fg} stroke={bg} strokeWidth="3" />}
    </svg>
  );
}

/** Wide cow-hide banner used when a collection has no banner image. */
export function HideBanner({ seed }: { seed: string }) {
  const paths = useMemo(() => {
    const rand = mulberry32(hashSeed(seed));
    return Array.from({ length: 11 }).map(() => blobPath(rand() * 300, rand() * 100, 10 + rand() * 22, rand, 8, 0.55));
  }, [seed]);
  return (
    <svg viewBox="0 0 300 100" className="art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="300" height="100" fill="#fff" />
      {paths.map((d, i) => <path key={i} d={d} fill="#000" />)}
    </svg>
  );
}

/** Image with skeleton while loading and generated art if it fails. */
export function SmartImage({ src, alt, fallback }: { src: string; alt: string; fallback: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  if (state === 'error') return <>{fallback}</>;
  return (
    <>
      {state === 'loading' && <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />}
      <img
        className="art"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
        style={state === 'loading' ? { opacity: 0 } : undefined}
      />
    </>
  );
}

type ColLike = { address: string; art_style?: 'cow' | 'tile' | string | null; image_url?: string | null; banner_url?: string | null; name?: string };
type TokLike = { token_id: string; image_url?: string | null; attributes?: Attribute[] | null; name?: string | null };

export function TokenArt({ collection, token }: { collection: ColLike; token: TokLike }) {
  const id = Number(token.token_id);
  const generated = collection.art_style === 'cow' ? <CowArt attributes={token.attributes} id={id} /> : <TileArt seed={`${collection.address}:${token.token_id}`} />;
  if (token.image_url) return <SmartImage src={token.image_url} alt={token.name || `#${token.token_id}`} fallback={generated} />;
  return generated;
}

export function CollectionAvatar({ collection }: { collection: ColLike }) {
  const generated = collection.art_style === 'cow' ? <CowArt id={6} /> : <TileArt seed={collection.address} />;
  if (collection.image_url) return <SmartImage src={collection.image_url} alt={collection.name || ''} fallback={generated} />;
  return generated;
}

export function CollectionBanner({ collection }: { collection: ColLike }) {
  const generated = collection.art_style === 'cow' ? <HideBanner seed={collection.address} /> : <TileArt seed={`${collection.address}:banner`} wide />;
  if (collection.banner_url) return <SmartImage src={collection.banner_url} alt="" fallback={generated} />;
  return generated;
}

/** Wallet avatar: a cow-hide circle unique to the address. */
export function Avatar({ address, size = 32 }: { address: string; size?: number }) {
  const paths = useMemo(() => {
    const rand = mulberry32(hashSeed(address.toLowerCase()));
    const inverted = rand() > 0.5;
    return { inverted, d: Array.from({ length: 4 }).map(() => blobPath(rand() * 40, rand() * 40, 6 + rand() * 7, rand)) };
  }, [address]);
  return (
    <span className="avatar" style={{ width: size, height: size, display: 'inline-block' }}>
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
        <rect width="40" height="40" fill={paths.inverted ? '#000' : '#fff'} />
        {paths.d.map((d, i) => <path key={i} d={d} fill={paths.inverted ? '#fff' : '#000'} />)}
        <circle cx="20" cy="20" r="19.4" fill="none" stroke="#000" strokeOpacity="0.15" />
      </svg>
    </span>
  );
}
