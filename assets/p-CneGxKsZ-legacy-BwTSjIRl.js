System.register(["./index-legacy-DH-7fU5n.js"],function(e,t){"use strict";var n,r,s,o,i;return{setters:[e=>{n=e.$,r=e.a0,s=e.a1,o=e.a2,i=e.a3}],execute:function(){
/*!
			 * (C) Ionic http://ionicframework.com - MIT License
			 */
e("startStatusTap",()=>{const e=window;e.addEventListener("statusTap",()=>{n(()=>{const t=document.elementFromPoint(e.innerWidth/2,e.innerHeight/2);if(!t)return;const n=r(t);n&&new Promise(e=>s(n,e)).then(()=>{o(async()=>{n.style.setProperty("--overflow","hidden"),await i(n,300),n.style.removeProperty("--overflow")})})})})})}}});
