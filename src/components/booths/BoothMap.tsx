"use client";
import { BOOTH_ROWS } from "@/lib/booth-layout";
import type { BoothCardData } from "@/types/booth";
export default function BoothMap({booths, likes, onSelect}:{booths:readonly BoothCardData[]; likes:Set<string>; onSelect:(row:string,column:number)=>void}) {
  const positions = new Map(booths.filter(b=>b.rowLabel && b.columnNumber).map(b=>[`${b.rowLabel}-${b.columnNumber}`,b]));
  function slot(row:string, column:number, x:number, y:number, half=false, horizontal=false) {
    const booth=positions.get(`${row}-${column}`);
    const liked=!!booth && likes.has(booth.id);
    return <button key={`${row}-${column}`} type="button" onClick={()=>onSelect(row,column)} aria-label={`${row}-${column} ${booth?.name ?? "미등록"}${liked ? " 즐겨찾기" : ""}`} title={booth?.name ?? "부스 인포 미등록"}
      className="absolute flex items-center justify-center rounded-[4px] border-2 text-[24px] font-semibold leading-none text-[#333] transition-colors hover:ring-2 hover:ring-[#33aa8e]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#33aa8e]"
      style={{left:`${x}%`,top:`${y}%`,width:horizontal?"8.5%":"4.5%",height:half?"3.6%":horizontal?"3.6%":"7.2%", background:booth?"#fff":"#ddd",borderColor:liked?"#33aa8e":"#999"}}>{column}</button>;
  }
  return <div className="overflow-x-auto pb-3" aria-label="부스 배치도"><div className="relative mx-auto min-w-[520px] max-w-[680px] aspect-[0.86] rounded-xl border-2 border-[#999] bg-white">
    {BOOTH_ROWS.map(row=><div key={row.name}>
      <span className="absolute top-[2.5%] flex size-9 -translate-x-1/2 items-center justify-center rounded-full text-[24px] font-black text-white" style={{left:`${row.x+2.25}%`,background:row.color}}>{row.name}</span>
      {row.groups.flatMap((group,index)=>group.map((column,part)=>slot(row.name,column,row.x,9+index*11.4+part*3.6,group.length===2)))}
      {row.name==="끼" && slot("끼",1,row.x-8.5,9,false,true)}
    </div>)}
  </div></div>;
}
