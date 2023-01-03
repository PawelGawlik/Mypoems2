const body = document.querySelector("body");
const a = document.querySelectorAll('a');
let i = 0;
const path = location.pathname.split('/')[2];
a[0].setAttribute('href', `/page2.html/${path}`);
a[1].setAttribute('href', `/index2.html/${path}`);
fetch(`/poems/${path}`).then((res) => {
    return res.json();
}).then((poemArr) => {
    while (i < poemArr.length) {
        const h1 = document.createElement("h1");
        const pre = document.createElement("pre");
        const hr = document.createElement("hr");
        const title = document.createTextNode(poemArr[i].body.title);
        const text = document.createTextNode(poemArr[i].body.text);
        h1.appendChild(title);
        pre.appendChild(text);
        body.appendChild(h1);
        body.appendChild(pre);
        body.appendChild(hr);
        i++;
    }
})