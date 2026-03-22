"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import BannerManager from "./_components/banner-manager";
import BoardManager from "./_components/board-manager";
import PinManager from "./_components/pin-manager";
import MemberManager from "./_components/member-manager";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">관리자 패널</h1>

      <Tabs defaultValue="banners" className="w-full">
        <TabsList>
          <TabsTrigger value="banners">배너관리</TabsTrigger>
          <TabsTrigger value="boards">게시판관리</TabsTrigger>
          <TabsTrigger value="pins">공지관리</TabsTrigger>
          <TabsTrigger value="members">회원관리</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-6">
          <BannerManager />
        </TabsContent>

        <TabsContent value="boards" className="mt-6">
          <BoardManager />
        </TabsContent>

        <TabsContent value="pins" className="mt-6">
          <PinManager />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MemberManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
