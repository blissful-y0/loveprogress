"use client";
import type { CSSProperties } from "react";
import { BOOTH_ROWS } from "@/lib/booth-layout";
import type { BoothCardData } from "@/types/booth";
import styles from "./BoothMap.module.css";

const MOBILE_CENTERS:Record<string,number> = {거:8, 위:25, 와:42, 토:59, 끼:92};
export default function BoothMap({booths, likes, onSelect}:{booths:readonly BoothCardData[]; likes:Set<string>; onSelect:(row:string,column:number)=>void}) {
  const positions = new Map(booths.filter(b=>b.rowLabel && b.columnNumber).map(b=>[`${b.rowLabel}-${b.columnNumber}`,b]));
  function slot(row:string, column:number, x:number, group:number, part=0, half=false, horizontal=false) {
    const booth=positions.get(`${row}-${column}`);
    const liked=!!booth && likes.has(booth.id);
    const style = {
      "--desktop-x":`${x}%`,
      "--desktop-y":`${9+group*11.4+part*3.6}%`,
      "--desktop-width":horizontal?"8.5%":"4.5%",
      "--desktop-height":half||horizontal?"3.6%":"7.2%",
      "--mobile-x":`${horizontal?75.5:MOBILE_CENTERS[row]}%`,
      "--mobile-y":`${60+group*108+part*44}px`,
      "--mobile-height":half||horizontal?"44px":"88px",
      background:booth?"#fff":"#ddd",
      borderColor:liked?"#33aa8e":"#999",
    } as CSSProperties;
    return <button key={`${row}-${column}`} type="button" onClick={()=>onSelect(row,column)} aria-label={`${row}-${column} ${booth?.name ?? "미등록"}${liked ? " 즐겨찾기" : ""}`} title={booth?.name ?? "부스 인포 미등록"} className={styles.slot} style={style}>{column}</button>;
  }
  return <div aria-label="부스 배치도" className={styles.map}>
    {BOOTH_ROWS.map(row=><div key={row.name}>
      <span className={styles.label} style={{"--desktop-label-x":`${row.x+2.25}%`,"--mobile-x":`${MOBILE_CENTERS[row.name]}%`,background:row.color} as CSSProperties}>{row.name}</span>
      {row.groups.flatMap((group,index)=>group.map((column,part)=>slot(row.name,column,row.x,index,part,group.length===2)))}
      {row.name==="끼" && slot("끼",1,row.x-8.5,0,0,false,true)}
    </div>)}
  </div>;
}
