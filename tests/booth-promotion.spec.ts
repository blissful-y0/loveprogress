import { test, expect } from "@playwright/test";

test("preview preserves booth layout, edits, likes, and role boundaries without writes", async ({page}) => {
  const writes:string[]=[];
  page.on("request",request=>{if(request.method()!=="GET"&&request.url().includes("/api/"))writes.push(request.url());});
  await page.goto("http://localhost:3000/booth-promotion/preview");
  await expect(page.getByRole("heading",{name:"부스홍보게시판",exact:true})).toBeVisible();
  await expect(page.getByLabel("부스 배치도").getByRole("button")).toHaveCount(40);
  await page.getByRole("button",{name:"거-1 샘플 부스"}).click();
  await expect(page.getByRole("button",{name:"수정",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"즐겨찾기",exact:true}).click();
  await expect(page.getByRole("button",{name:"즐겨찾기 해제"})).toBeVisible();
  await page.getByRole("button",{name:"수정",exact:true}).click();
  await page.getByPlaceholder("부스 이름",{exact:true}).fill("수정한 샘플 부스");
  await page.getByRole("button",{name:"수정",exact:true}).click();
  await expect(page.getByRole("heading",{name:"[거-1] 수정한 샘플 부스"})).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByLabel("미리보기 권한").selectOption("member");
  await expect(page.getByRole("button",{name:"글쓰기"})).toHaveCount(0);
  await page.getByRole("button",{name:"거-1 수정한 샘플"}).click();
  await expect(page.getByRole("button",{name:"수정",exact:true})).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByLabel("미리보기 권한").selectOption("guest");
  await page.getByRole("button",{name:"거-2 미등록"}).click();
  await expect(page.getByRole("dialog",{name:"부스 인포 미등록"})).toBeVisible();
  await page.mouse.click(5,150);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole("heading",{name:"부스홍보게시판",exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(writes).toEqual([]);
});

test("anonymous mutations are rejected by API", async ({request}) => {
  for (const [method,path] of [["POST","/api/booth-promotion"],["PUT","/api/booth-promotion/00000000-0000-4000-8000-000000000001"],["POST","/api/booth-promotion/upload"]]) {
    const response=await request.fetch(`http://localhost:3000${path}`,{method,data:{}});
    expect(response.status()).toBe(401);
  }
});
