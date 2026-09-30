import { test, expect } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test(`mobile ${width}px: complete map, usable targets and editing`, async ({page}) => {
    await page.setViewportSize({width,height:844});
    await page.goto('http://localhost:3000/booth-promotion/preview');
    const map = page.getByLabel('부스 배치도');
    await expect(map.getByRole('button')).toHaveCount(40);
    const geometry = await map.evaluate(element => {
      const mapRect=element.getBoundingClientRect();
      const buttons=Array.from(element.querySelectorAll('button')).map(b=>{
        const r=b.getBoundingClientRect();
        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
      });
      return {left:mapRect.left,right:mapRect.right,width:window.innerWidth,scrollWidth:element.scrollWidth,clientWidth:element.clientWidth,buttons};
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(width);
    expect(geometry.scrollWidth).toBe(geometry.clientWidth);
    for (const b of geometry.buttons) {
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
      expect(b.left).toBeGreaterThanOrEqual(geometry.left);
      expect(b.right).toBeLessThanOrEqual(geometry.right);
    }
    for(let i=0;i<geometry.buttons.length;i++) for(let j=i+1;j<geometry.buttons.length;j++) {
      const a=geometry.buttons[i],b=geometry.buttons[j];
      expect(a.right<=b.left || b.right<=a.left || a.bottom<=b.top || b.bottom<=a.top).toBe(true);
    }
    await page.getByRole('button',{name:'위-11 샘플 부스'}).click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const bounds=await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(844);
    const edit=page.getByRole('button',{name:'수정',exact:true});
    await expect.poll(async () => (await edit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await edit.click();
    await page.setViewportSize({width,height:460});
    await expect(page.getByRole("button",{name:"수정",exact:true})).toBeInViewport();
    await page.getByPlaceholder('부스 이름',{exact:true}).fill('모바일에서 수정');
    expect(await page.getByPlaceholder('부스 이름',{exact:true}).evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
    await page.getByRole('button',{name:'수정',exact:true}).click();
    await expect(page.getByRole('heading',{name:'[위-11] 모바일에서 수정'})).toBeVisible();
  });
}
