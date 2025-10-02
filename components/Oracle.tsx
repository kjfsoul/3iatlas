"use client";
import { useEffect, useMemo, useState } from "react";
import { CARDS, pickDeterministic } from "@/lib/oracle-cards";
type Survey = { name?: string; email?: string; birthMonth?: string; currentFocus?: string; energyLevel?: string };
export default function Oracle() {
  const [s, setS] = useState<Survey>({});
  const [revealed, setRevealed] = useState<string | null>(null);
  useEffect(() => { const saved = localStorage.getItem("attunementChoice"); if (saved) setRevealed(saved); }, []);
  const canReveal = s.birthMonth || s.currentFocus || s.energyLevel || s.name || s.email;
  const seed = useMemo(() => JSON.stringify([s.name||"", s.email||"", s.birthMonth||"", s.currentFocus||"", s.energyLevel||""]), [s]);
  const card = revealed ? CARDS.find(c => c.name === revealed) ?? CARDS[6] : null;
  function onReveal(skip=false) { const chosen = skip ? CARDS[6] : pickDeterministic(seed); setRevealed(chosen.name); localStorage.setItem("attunementChoice", chosen.name); }
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-lg font-semibold">3I/Atlas Oracle</h3>
      {!revealed && (<>
        <div className="grid gap-2 sm:grid-cols-3">
          <select className="rounded-md bg-black/30 p-2" onChange={(e)=>setS(v=>({...v, birthMonth:e.target.value}))} defaultValue="">
            <option value="" disabled>Birth month</option>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <select className="rounded-md bg-black/30 p-2" onChange={(e)=>setS(v=>({...v, currentFocus:e.target.value}))} defaultValue="">
            <option value="" disabled>Current focus</option>
            {["Career","Love","Health","Wealth","Creativity","Learning","Community","Travel"].map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <select className="rounded-md bg-black/30 p-2" onChange={(e)=>setS(v=>({...v, energyLevel:e.target.value}))} defaultValue="">
            <option value="" disabled>Energy level</option>
            {["Low","Calm","Balanced","Rising","High","Intense"].map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50" onClick={()=>onReveal(false)} disabled={!canReveal}>Reveal Card</button>
          <button className="rounded-md bg-white/5 px-3 py-2 text-sm hover:bg-white/10" onClick={()=>onReveal(true)}>Skip survey & draw</button>
        </div>
      </>)}
      {revealed && card && (<div className="mt-4 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt={card.name} className="h-28 w-20 rounded-md object-cover" />
        <div>
          <div className="text-base font-semibold">{card.name}</div>
          <div className="text-sm text-white/80">{card.title} — {card.meaning}</div>
          <button className="mt-3 rounded-md bg-white/10 px-3 py-2 text-xs hover:bg-white/20" onClick={()=>{ setRevealed(null); localStorage.removeItem("attunementChoice"); }}>Draw again</button>
        </div>
      </div>)}
    </section>
  );
}
