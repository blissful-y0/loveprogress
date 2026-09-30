"use client";
import { useEffect, useState } from "react";
import { PenLineIcon } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginModal from "@/components/auth/login-modal";
import BoothMap from "./BoothMap";
import BoothDetailModal from "./BoothDetailModal";
import BoothFormFields, { INITIAL_FORM, type FormState } from "./BoothFormFields";
import { toBoothCardData, type BoothCardData, type BoothWithDetails } from "@/types/booth";
import { promotionSchema } from "@/lib/schemas/promotion-schema";

const DEMO_USER = "00000000-0000-4000-8000-000000000001";
const DEMO_BOOTHS:BoothCardData[] = [
  {id:"preview-1",name:"샘플 부스 · 거위의 서재",rowLabel:"거",columnNumber:1,thumbnailImageKey:"/img/booth/booth-placeholder-1.svg",hoverImageKey:null,ageType:"general",keywords:["글회지"],owner:{name:"샘플 참가자",snsUrl:null},participants:[],authorUserId:DEMO_USER,infoUrl:"https://example.com"},
  {id:"preview-2",name:"샘플 부스 · 토끼의 작업실",rowLabel:"위",columnNumber:11,thumbnailImageKey:"/img/booth/booth-placeholder-2.svg",hoverImageKey:null,ageType:"general",keywords:["그림회지","팬시굿즈"],owner:{name:"샘플 참가자",snsUrl:null},participants:[],authorUserId:DEMO_USER,infoUrl:null},
  {id:"preview-3",name:"샘플 부스 · 작은 상점",rowLabel:"끼",columnNumber:1,thumbnailImageKey:"/img/booth/booth-placeholder-3.svg",hoverImageKey:null,ageType:"adult",keywords:["수공예품"],owner:{name:"다른 참가자",snsUrl:null},participants:[],authorUserId:null,infoUrl:null},
];
function formFromBooth(b:BoothCardData):FormState {
  return {...INITIAL_FORM,name:b.name,row:b.rowLabel??"",column:String(b.columnNumber??""),infoUrl:b.infoUrl??"",thumbnailImageKey:b.thumbnailImageKey,ageType:b.ageType,keywords:[...b.keywords],ownerName:b.owner.name,ownerSnsUrl:b.owner.snsUrl??"",participants:b.participants.map(p=>({name:p.name,snsUrl:p.snsUrl??""}))};
}
export default function PromotionClient({preview=false}:{preview?:boolean}) {
  const {user}=useUser();
  const [demoRole,setDemoRole]=useState("booth_member");
  const role=preview ? demoRole : user?.role;
  const userId=preview ? (demoRole==="guest"?null:DEMO_USER) : user?.authUser.id;
  const canWrite=role==="booth_member"||role==="admin";
  const [booths,setBooths]=useState<BoothCardData[]>(preview ? DEMO_BOOTHS : []);
  const [loading,setLoading]=useState(!preview);
  const [error,setError]=useState("");
  const [likes,setLikes]=useState<Set<string>>(new Set(preview?["preview-2"]:[]));
  const [likePending,setLikePending]=useState(false);
  const [selected,setSelected]=useState<{row:string;column:number}|null>(null);
  const [loginOpen,setLoginOpen]=useState(false);
  const [formOpen,setFormOpen]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [form,setForm]=useState<FormState>(INITIAL_FORM);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [formError,setFormError]=useState("");
  async function refresh() {
    setLoading(true);setError("");
    try { const r=await fetch("/api/booth-promotion");const d=await r.json();if(!r.ok)throw new Error(d.error);setBooths((d.booths as BoothWithDetails[]).map(toBoothCardData)); }
    catch(e){setError(e instanceof Error?e.message:"부스 정보를 불러오지 못했습니다.");}finally{setLoading(false);}
  }
  useEffect(()=>{if(!preview)void refresh();},[preview]);
  useEffect(()=>{
    if(preview)return;
    let active=true;setLikes(new Set());
    if(userId)fetch("/api/booths/likes").then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setLikes(new Set(d.userLikes));}).catch(()=>{});
    return()=>{active=false;};
  },[preview,userId]);
  const selectedBooth=selected?booths.find(b=>b.rowLabel===selected.row&&b.columnNumber===selected.column):null;
  function openForm(booth?:BoothCardData) {
    setEditingId(booth?.id??null);setForm(booth?formFromBooth(booth):{...INITIAL_FORM});setFormError("");setSelected(null);setFormOpen(true);
  }
  async function toggleLike() {
    if(!selectedBooth || likePending)return;
    if(!userId){if(preview)setError("로그인 사용자 보기로 바꾸면 즐겨찾기를 체험할 수 있습니다.");else setLoginOpen(true);return;}
    const id=selectedBooth.id;setLikePending(true);
    try {
      let liked=!likes.has(id);
      if(!preview){const r=await fetch("/api/booths/likes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({boothId:id})});const d=await r.json();if(!r.ok)throw new Error(d.error);liked=d.liked;}
      setLikes(prev=>{const next=new Set(prev);if(liked)next.add(id);else next.delete(id);return next;});
    }catch(e){setError(e instanceof Error?e.message:"즐겨찾기에 실패했습니다.");}finally{setLikePending(false);}
  }
  async function save() {
    if(saving||uploading)return;
    const body={name:form.name.trim(),thumbnailImageKey:form.thumbnailImageKey,ageType:form.ageType,keywords:form.keywords,owner:{name:form.ownerName.trim(),snsUrl:form.ownerSnsUrl.trim()||undefined},participants:form.participants.map(p=>({name:p.name.trim(),snsUrl:p.snsUrl.trim()||undefined})),rowLabel:form.row,columnNumber:Number(form.column),infoUrl:form.infoUrl.trim()||null};
    const parsed=promotionSchema.safeParse(body);
    if(!parsed.success){setFormError(parsed.error.issues[0].message);return;}
    if(booths.some(b=>b.id!==editingId&&b.rowLabel===body.rowLabel&&b.columnNumber===body.columnNumber)){setFormError("이미 등록된 위치입니다.");return;}
    setSaving(true);setFormError("");
    try {
      if(preview){const item:BoothCardData={id:editingId??`preview-${Date.now()}`,name:body.name,rowLabel:body.rowLabel,columnNumber:body.columnNumber,infoUrl:body.infoUrl,thumbnailImageKey:body.thumbnailImageKey,hoverImageKey:null,ageType:body.ageType,keywords:body.keywords,owner:{name:body.owner.name,snsUrl:body.owner.snsUrl??null},participants:body.participants.map(p=>({...p,snsUrl:p.snsUrl??null})),authorUserId:DEMO_USER};setBooths(prev=>[...prev.filter(b=>b.id!==editingId),item]);}
      else {const r=await fetch(`/api/booth-promotion${editingId?`/${editingId}`:""}`,{method:editingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parsed.data)});const d=await r.json();if(!r.ok)throw new Error(d.error);await refresh();}
      setFormOpen(false);setSelected({row:body.rowLabel,column:body.columnNumber});
    }catch(e){setFormError(e instanceof Error?e.message:"저장에 실패했습니다.");}finally{setSaving(false);}
  }
  return <div className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-8">
    {preview&&<div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm text-[#707070]"><p><strong>미리보기</strong> · 샘플 데이터이며 변경은 새로고침하면 초기화됩니다.</p><select aria-label="미리보기 권한" value={demoRole} onChange={e=>{setDemoRole(e.target.value);setSelected(null);setFormOpen(false);setError("");}} className="rounded border px-3 py-2"><option value="booth_member">부스어 보기</option><option value="member">로그인 사용자 보기</option><option value="guest">비로그인 보기</option></select></div>}
    <PageHeader label="깨달음의 나무 정원" title="부스홍보게시판" subtitle="부스 판매상품을 자유롭게 전시 및 홍보 할 수 있습니다." />
    <div className="my-6 flex min-h-8 flex-wrap items-center justify-end gap-2">
      {canWrite&&booths.filter(b=>b.authorUserId===userId&&!b.rowLabel).map(b=><Button key={b.id} variant="outline" onClick={()=>openForm(b)}>{b.name} 위치 등록</Button>)}
      {canWrite&&<Button onClick={()=>openForm()} className="h-8 bg-primary px-3 text-[13px] text-white"><PenLineIcon className="mr-1.5 size-3.5"/>글쓰기</Button>}
    </div>
    {error&&<p role="alert" className="mb-4 text-center text-sm text-red-500">{error} {!preview&&<button className="ml-2 underline" onClick={()=>void refresh()}>다시 시도</button>}</p>}
    {loading?<p className="py-20 text-center text-text-muted">불러오는 중...</p>:!error||preview?<BoothMap booths={booths} likes={userId?likes:new Set()} onSelect={(row,column)=>setSelected({row,column})}/>:null}
    <BoothDetailModal booth={selectedBooth??null} open={!!selectedBooth} onOpenChange={open=>{if(!open)setSelected(null);}} promotion liked={!!selectedBooth&&!!userId&&likes.has(selectedBooth.id)} likePending={likePending} onToggleLike={()=>void toggleLike()} onEdit={canWrite&&selectedBooth?.authorUserId===userId?()=>openForm(selectedBooth!):undefined}/>
    <Dialog open={!!selected&&!selectedBooth} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="border-0 bg-transparent shadow-none ring-0" showCloseButton={false}><DialogHeader><DialogTitle className="sr-only">부스 인포 미등록</DialogTitle></DialogHeader><div className="relative aspect-[1.6] w-full overflow-hidden"><img src="/img/booth/promotion-empty.jpg" alt="부스 인포 미등록" className="absolute left-0 top-0 w-[340%] max-w-none -translate-x-[36%] -translate-y-[32.5%]"/></div><p className="text-center text-sm">빈 공간을 누르면 돌아갑니다.</p></DialogContent></Dialog>
    <Dialog open={formOpen} onOpenChange={open=>{if(!saving&&!uploading)setFormOpen(open);}}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{editingId?"부스 수정":"부스 등록"}</DialogTitle></DialogHeader><fieldset disabled={saving} className="space-y-4"><BoothFormFields form={form} setForm={setForm} promotion preview={preview} onUploadingChange={setUploading}/>{formError&&<p role="alert" className="text-sm text-red-500">{formError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setFormOpen(false)} disabled={saving||uploading}>취소</Button><Button onClick={()=>void save()} disabled={saving||uploading}>{saving?"저장 중...":editingId?"수정":"등록"}</Button></div></fieldset></DialogContent></Dialog>
    <LoginModal open={loginOpen} onOpenChange={setLoginOpen}/>
  </div>;
}
