import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PageProps } from '../AdminApp';
import { SITE_URL } from '../config';
import { SITE_DEFAULTS } from '../content/siteDefaults';
import { useAuthedApi } from '../lib/tx';
import { Card, LoadError, Skeleton, Status, useDialog, useToast } from '../components/ui';
import { IconArrowDown, IconExternal, IconPlus, IconRefresh, IconTrash } from '../components/Icons';

type Branding = { logo: string | null; cowsLogo: string | null; cowsBanner: string | null; cowsImages: string[] | null };
type SiteContent = { branding: Branding; limits: { art: number } };
type Form = { logo: string; cowsLogo: string; cowsBanner: string; images: string[] };

const LINK = /^(https:\/\/[^\s"'<>\\]{4,500}|ipfs:\/\/[A-Za-z0-9._\-/]{10,500})$/;
const bad = (v: string) => !!v.trim() && !LINK.test(v.trim());
/** Preview through a public gateway for ipfs:// links. */
const view = (v: string) => (v.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${v.slice(7).replace(/^ipfs\//, '')}` : v);

function Preview({ src, shape, fallback }: { src: string; shape: 'square' | 'wide' | 'thumb'; fallback?: string }) {
  const [broken, setBroken] = useState<string | null>(null);
  const url = src.trim() || fallback || '';
  const ok = url && !bad(url);
  return (
    <div className={`img-preview img-preview--${shape}${src.trim() ? '' : ' is-default'}`}>
      {ok && broken !== url ? <img key={url} src={view(url)} alt="" onError={() => setBroken(url)} onLoad={() => setBroken(null)} /> : null}
      {ok && broken === url && <span className="img-preview__err">Can't open</span>}
      {!src.trim() && shape !== 'thumb' && <span className="img-preview__tag">Built-in</span>}
    </div>
  );
}

function ImageField({ id, label, hint, value, fallback, shape, onChange }: {
  id: string; label: string; hint: string; value: string; fallback: string; shape: 'square' | 'wide'; onChange: (v: string) => void;
}) {
  return (
    <div className={`image-field image-field--${shape}`}>
      <Preview src={value} shape={shape} fallback={fallback} />
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <input id={id} className={`input ${bad(value) ? 'input--invalid' : ''}`} placeholder="https://…  or  ipfs://…" value={value} spellCheck={false} onChange={(e) => onChange(e.target.value)} />
        {bad(value) ? <span className="hint" style={{ color: 'var(--bad)' }}>Use an https:// or ipfs:// link to the image file</span> : <span className="hint">{hint}</span>}
      </div>
    </div>
  );
}

export default function BrandingPage(_: PageProps) {
  const authed = useAuthedApi();
  const toast = useToast();
  const dialog = useDialog();
  const q = useQuery({ queryKey: ['admin-site'], queryFn: () => authed.get<SiteContent>('/admin/site') });
  const [f, setF] = useState<Form | null>(null);
  const [bulk, setBulk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (q.isError) return <LoadError error={q.error} what="the website content" retry={() => q.refetch()} />;
  if (!q.data) return <div className="stack-lg"><Skeleton h={220} r={18} /><Skeleton h={420} r={18} /></div>;
  const b = q.data.branding;
  const max = q.data.limits?.art ?? 60;
  const saved: Form = { logo: b.logo || '', cowsLogo: b.cowsLogo || '', cowsBanner: b.cowsBanner || '', images: b.cowsImages || [] };
  const v = f ?? saved;
  const set = (patch: Partial<Form>) => setF({ ...v, ...patch });
  const images = v.images;
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const invalid = [v.logo, v.cowsLogo, v.cowsBanner, ...images].some(bad) || images.length > max;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    set({ images: next });
  };

  async function save() {
    setSaving(true);
    try {
      const list = images.map((x) => x.trim()).filter(Boolean);
      await authed.put('/admin/site/branding', {
        logo: v.logo.trim() || null, cowsLogo: v.cowsLogo.trim() || null, cowsBanner: v.cowsBanner.trim() || null, cowsImages: list.length ? list : null,
      });
      toast('Visitors see the new images the next time they open or refresh the site (within 30 seconds).', 'success', { title: 'Images saved' });
      setF(null);
      setBulk(null);
      q.refetch();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }
  async function useBuiltIn() {
    if (images.length && !(await dialog.confirm({ title: 'Replace the list?', message: 'The list below is replaced with the 18 built-in images. Nothing changes on the website until you save.', confirmLabel: 'Replace' }))) return;
    set({ images: [...SITE_DEFAULTS.cowsImages] });
  }
  function applyBulk() {
    const lines = (bulk || '').split(/\s+/).map((x) => x.trim()).filter(Boolean);
    set({ images: [...new Set(lines)].slice(0, max) });
    setBulk(null);
  }

  const foot = (
    <>
      <button className="btn" disabled={saving || !dirty || invalid} onClick={save}>{saving && <span className="spinner" />}Save images</button>
      {dirty && <button className="btn btn--ghost" onClick={() => { setF(null); setBulk(null); }}>Discard changes</button>}
      <span className="hint" style={{ marginLeft: 'auto' }}>Empty fields use the built-in image.</span>
    </>
  );

  return (
    <div className="stack-lg">
      <Card title="Site logo" sub="Header, footer and the browser tab icon."
        right={<a className="btn btn--sm btn--outline" href={SITE_URL} target="_blank" rel="noreferrer"><IconExternal size={14} />View site</a>}>
        <ImageField id="logo" label="Logo link" hint="Square image, at least 256 × 256 px (PNG, JPG, WebP or SVG)." value={v.logo} fallback={SITE_DEFAULTS.logo} shape="square" onChange={(x) => set({ logo: x })} />
      </Card>

      <Card title="GIWA COWS" sub="Logo and banner of the official collection page.">
        <div className="stack">
          <ImageField id="cows-logo" label="Collection logo" hint="Square, at least 400 × 400 px." value={v.cowsLogo} fallback={SITE_DEFAULTS.cowsLogo} shape="square" onChange={(x) => set({ cowsLogo: x })} />
          <ImageField id="cows-banner" label="Banner" hint="Wide image, about 2500 × 1500 px. Shown behind the GIWA COWS title." value={v.cowsBanner} fallback={SITE_DEFAULTS.cowsBanner} shape="wide" onChange={(x) => set({ cowsBanner: x })} />
        </div>
      </Card>

      <Card title={<>GIWA COWS artwork <span className="tag">{images.length ? `${images.length} of ${max}` : 'built-in · 18'}</span></>}
        sub="The rotating art on the home page, the card deck, the moving rows and the locked utility cards."
        right={<div className="row-wrap">
          <button className="btn btn--sm btn--outline" onClick={() => setBulk(bulk === null ? images.join('\n') : null)}>{bulk === null ? 'Paste many links' : 'Close'}</button>
          <button className="btn btn--sm btn--outline" onClick={useBuiltIn}><IconRefresh size={14} />Start from built-in</button>
        </div>}
        foot={foot}>
        {bulk !== null ? (
          <div className="field">
            <label htmlFor="bulk">One link per line</label>
            <textarea id="bulk" className="textarea mono" rows={10} value={bulk} spellCheck={false} onChange={(e) => setBulk(e.target.value)} placeholder={'https://…/1.png\nhttps://…/2.png\nipfs://…/3.png'} />
            <div className="row-wrap"><button className="btn btn--sm" onClick={applyBulk}>Use these links</button><span className="hint">Duplicates are removed, up to {max} images.</span></div>
          </div>
        ) : images.length === 0 ? (
          <div className="art-empty">
            <div className="art-strip">{SITE_DEFAULTS.cowsImages.slice(0, 8).map((src) => <Preview key={src} src={src} shape="thumb" />)}</div>
            <p className="hint">The site uses the 18 built-in images. Press <b>Start from built-in</b> to edit that list, or <b>Add image</b> to build your own.</p>
          </div>
        ) : (
          <ol className="art-list">
            {images.map((src, i) => (
              <li key={i} className="art-row">
                <span className="art-row__n mono">{String(i + 1).padStart(2, '0')}</span>
                <Preview src={src} shape="thumb" />
                <input className={`input ${bad(src) ? 'input--invalid' : ''}`} value={src} spellCheck={false} placeholder="https://…  or  ipfs://…" aria-label={`Image ${i + 1} link`}
                  onChange={(e) => { const next = [...images]; next[i] = e.target.value; set({ images: next }); }} />
                <div className="art-row__actions">
                  <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><IconArrowDown size={15} style={{ transform: 'rotate(180deg)' }} /></button>
                  <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move down"><IconArrowDown size={15} /></button>
                  <button className="icon-btn" onClick={() => set({ images: images.filter((_, j) => j !== i) })} aria-label="Remove"><IconTrash size={15} /></button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {bulk === null && (
          <div className="row-wrap">
            <button className="btn btn--sm btn--outline" disabled={images.length >= max} onClick={() => set({ images: [...images, ''] })}><IconPlus size={14} />Add image</button>
            {images.length > 0 && <button className="btn btn--sm btn--ghost" onClick={() => set({ images: [] })}>Use built-in art again</button>}
            {images.some((x) => !x.trim()) && <Status tone="warning">Empty rows are skipped when you save</Status>}
          </div>
        )}
      </Card>
    </div>
  );
}
