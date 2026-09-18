(()=>{
const $=id=>document.getElementById(id),d=window.fileExamples[window.fileFormat];
$('detail-title').textContent=d.title;document.title=d.title+' — 飞象老师';
const toggle=$('threads-toggle');toggle.classList.add('detail-comments');
const label=document.createElement('span');label.textContent='评论';toggle.insertBefore(label,$('count'));
document.querySelector('.tools').append(toggle);
toggle.setAttribute('aria-controls','panel');
const sync=()=>toggle.setAttribute('aria-expanded',String(!$('panel').hidden));
new MutationObserver(sync).observe($('panel'),{attributes:true,attributeFilter:['hidden']});sync();
$('detail-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('canvas').requestFullscreen();}catch{notify('暂时无法进入全屏，请重试');}};
function notify(text){$('toast').textContent=text;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,2400);}
$('detail-share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);notify('链接已复制');}catch{notify('请复制浏览器地址栏中的链接');}};
$('detail-download').onclick=()=>{
 if(window.fileFormat==='html'){const a=document.createElement('a');a.href='courseware.html';a.download=d.file;a.click();return;}
 const text=d.pages.map(p=>'# '+p.title+'\n\n'+p.sections.map(([h,t])=>'## '+h+'\n\n'+t).join('\n\n')).join('\n\n---\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=d.file.replace(/\.[^.]+$/,'.md');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
if(window.fileFormat!=='html'){$('detail-download').textContent='下载预览稿';$('detail-download').title='下载 Markdown 预览稿';}
})();
