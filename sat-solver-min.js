function dimacsStringToClauses(t){let l=t.split("\n");for(let t=0;t<l.length;t++)"c"===l[t].charAt(0)&&l.splice(t--,1);let e=l.shift().split(" ");if("p"!==e[0]||"cnf"!==e[1])return console.log("Error: Dimacs format not recognized (should begin with 'p cnf')"),null;let i=parseInt(e[2]),n=parseInt(e[3]),r=[];for(let t=0;t<i;t++)r[t]=null;if(""===l[l.length-1].charAt(0)&&(l.length-=1),n!==l.length)return console.log("Error: clauses number not concording with given parameters: ",n," given and",l.length," real ones"),null;let s=[],o=[];for(let t=0;t<l.length;t++){let e=l[t].split(" ");s[t]=[],o[t]=0;for(let l=0;l<e.length;l++)if("0"!==e[l]){let n=parseInt(e[l]),r=!1;if(n<0&&(n=Math.abs(n),r=!0),!(n>=1&&n<=i))return console.log("Error: literal not concording with maximal announced value: has met litteral ",n," but maximum number is ",i),null;s[t].push([r,n]),o[t]++}}return{nbCls:n,nbLit:i,clsArr:s,clsSizeArr:o,contradiction:!1}}const SATSOLVER_GLOBALS={solution:[]};function initSolution(t){solution=SATSOLVER_GLOBALS.solution,solution.length=0;for(let l=0;l<t.nbLit;l++)solution[l]=null}const getLitID=t=>t[1],litIsNeg=t=>t[0],complementaryLit=(t,l)=>litIsNeg(t)!==litIsNeg(l)&&getLitID(t)===getLitID(l),identicalLitStrict=(t,l)=>litIsNeg(t)===litIsNeg(l)&&getLitID(t)===getLitID(l),identicalLit=(t,l)=>getLitID(t)===getLitID(l),litExists=t=>t&&t.length>0;function deleteLit(t,l,e){t.clsArr[l][e].length=0,t.clsSizeArr[l]-=1,0===t.clsSizeArr[l]?deleteCls(t,l):t.clsSizeArr[l]<0&&console.log("Error : cls de taille invalide (plus petite que 0)")}function deleteCls(t,l){t.clsArr[l].length>0&&(t.clsArr[l].length=0,t.nbCls-=1,t.clsSizeArr[l]=0)}const clsSize=(t,l)=>t.clsSizeArr[l];function clsAcontainsClsB(t,l){if(0===t.length||0===l.length)return!1;let e=!0;for(let i=0;i<l.length;i++){let n=l[i];if(litExists(n)){let l=!1;for(let e=0;e<t.length;e++){let i=t[e];if(litExists(i)&&identicalLitStrict(i,n)){l=!0;break}}if(!l){e=!1;break}}}return e}function addSolution(t,l){let e=getLitID(t);SATSOLVER_GLOBALS.solution[e-1]=l}function assigningVar(t,l,e){if(t.contradiction||!litExists(l))return;let i=t.clsArr,n=Array.from(l);addSolution(n,1===e);for(let l=0;l<i.length;l++){let r=i[l];for(let i=0;i<r.length;i++){let s=r[i];if(litExists(s)&&identicalLit(s,n))if(1===e){if(!litIsNeg(s)){deleteCls(t,l);break}deleteLit(t,l,i)}else if(0===e){if(litIsNeg(s)){deleteCls(t,l);break}deleteLit(t,l,i)}}}}function copyingClsArrObj(t){let l=[];for(let e=0;e<t.clsArr.length;e++){l[e]=[];for(let i=0;i<t.clsArr[e].length;i++)l[e][i]=Array.from(t.clsArr[e][i])}return{nbCls:t.nbCls,nbLit:t.nbLit,clsArr:l,clsSizeArr:Array.from(t.clsSizeArr),contradiction:t.contradiction}}function cleaningClsArrObj(t){let l=t.clsArr,e=t.clsSizeArr;for(let i=0;i<l.length;i++){l[i];0===clsSize(t,i)&&(l.splice(i,1),e.splice(i,1),i--)}}function nextLitAssigned(t){let l=[];for(let e=0;e<=t.nbLit;e++)l[e]=0;let e,i=t.clsArr;for(let t=0;t<i.length;t++){let e=i[t];for(let t=0;t<e.length;t++){let i=e[t];litExists(i)&&l[getLitID(i)]++}}let n=0;for(let t=1;t<l.length;t++)n=Math.max(n,l[t]),l[t]===n&&(e=t);return[null,e]}function reduction(t){let l=t.clsArr;for(let e=0;e<l.length;e++){let i=l[e];for(let n=e+1;n<l.length;n++){let r=l[n];clsSize(t,e)>clsSize(t,n)?clsAcontainsClsB(i,r)&&deleteCls(t,e):clsSize(t,e)<clsSize(t,n)&&clsAcontainsClsB(r,i)&&deleteCls(t,n)}}}function elimination(t){let l=t.clsArr,e=t.nbLit,i=!1;for(let n=1;n<=e;n++){let e=[null,n],r=null,s=!1;t:for(let t=0;t<l.length;t++){let i=l[t];for(let t=0;t<i.length;t++){let l=i[t];if(litExists(l))if(r){if(complementaryLit(l,r)){s=!1;break t}}else identicalLit(l,e)&&(r=l,s=!0)}}s&&(i=!0,assigningVar(t,r,litIsNeg(r)?0:1))}return i}function unitResolution(t){let l=!1,e=t.clsArr,i=[];do{i.length=0;t:for(let l=0;l<e.length;l++){let n=e[l];if(1===clsSize(t,l))for(let t=0;t<n.length;t++){let l=n[t];if(litExists(l)){i=Array.from(l);break t}}}if(litExists(i)){for(let l=0;l<e.length;l++){let n=e[l];if(1===clsSize(t,l))for(let l=0;l<n.length;l++){let e=n[l];if(litExists(e)&&complementaryLit(e,i))return t.contradiction=!0,!0}}l=!0,assigningVar(t,i,litIsNeg(i)?0:1)}}while(litExists(i));return l}function DPLL(t){let l;do{if(t.contradiction)return!1;if(0===t.nbCls)return!0;reduction(t),(l=elimination(t))||(l=unitResolution(t))}while(l);cleaningClsArrObj(t);let e=nextLitAssigned(t),i=copyingClsArrObj(t);if(assigningVar(i,e,0),DPLL(i))return!0;let n=copyingClsArrObj(t);return assigningVar(n,e,1),DPLL(n)}function resolutionDPLL(t){initSolution(t);let l=t.clsArr;for(let e=0;e<l.length;e++){let i=l[e],n=!1;t:for(let t=0;t<i.length;t++){let l=i[t];if(litExists(l))for(let e=t+1;e<i.length;e++){let t=i[e];if(litExists(t)&&complementaryLit(l,t)){n=!0;break t}}}n&&deleteCls(t,e)}return 0===t.nbCls||DPLL(t)}