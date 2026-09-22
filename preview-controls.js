(()=>{
if(new URLSearchParams(location.search).has('embedded'))return;
const $=id=>document.getElementById(id);
const fullscreen=!document.body.classList.contains('detail-page');
if(fullscreen){
 document.body.classList.add('detail-page','fullscreen-page');
 const header=document.querySelector('.site-head'),add=$('add-comment');
 header.innerHTML='<div class="detail-heading"><a class="detail-back" aria-label="返回详情页">‹</a><h1 id="detail-title"></h1></div><div class="tools"></div>';
 document.querySelector('.tools').append(add);
 const exit=document.createElement('button');exit.id='detail-fullscreen';document.querySelector('.tools').append(exit);
}
const d=window.fileExamples[window.fileFormat];$('detail-title').textContent=d.title;
const toggle=$('threads-toggle');
document.querySelector('.tools').append($('add-comment'),$('detail-fullscreen'));
$('canvas').append(toggle);
$('add-comment').title='添加评论';
$('add-comment').setAttribute('aria-label','添加评论');
toggle.setAttribute('aria-controls','panel');
const sync=()=>toggle.setAttribute('aria-expanded',String(!$('panel').hidden));
new MutationObserver(sync).observe($('panel'),{attributes:true,attributeFilter:['hidden']});sync();
function destination(){
 const url=new URL(fullscreen?'detail.html':'share.html',location.href);
 url.searchParams.set('format',window.fileFormat);
 url.searchParams.set('surface',$('quiz').hidden?'cover':'quiz');
 if(!$('panel').hidden)url.searchParams.set('comments','1');
 return url.href;
}
const resize=$('detail-fullscreen');resize.title=fullscreen?'退出全屏':'全屏预览';resize.setAttribute('aria-label',resize.title);
resize.innerHTML=fullscreen?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3v6H3m12-6v6h6M3 15h6v6m6 0v-6h6"/></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6"/></svg>';
resize.onclick=()=>location.href=destination();
if(fullscreen){const back=document.querySelector('.detail-back');back.href=destination();back.onclick=e=>{e.preventDefault();location.href=destination();};}
})();
