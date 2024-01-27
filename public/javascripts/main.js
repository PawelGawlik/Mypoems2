const h2 = document.querySelectorAll("h2");
const p = document.querySelectorAll("p");
const counter = document.querySelectorAll(".counter");
const span = document.querySelector('span');
const adv = document.querySelector('.advertisement');
const a = document.querySelector('.advertisement>a');
const a2 = document.querySelectorAll('a');
const off = document.querySelector('.off');
const footer = document.querySelector('footer');
adv.style.top = (window.innerHeight - 40) + 'px';
const links = ["https://tmlead.pl/redirect/190176_2282", "https://pawgaw.oferty-kredytowe.pl"];
const desc = ["TaniaKsiążka.pl - księgarnia online", "Konta, pożyczki i inne"];
const param = Math.floor(Math.random() * 2);
const href = links[param];
a.setAttribute('href', href);
a.innerText = desc[param];
const path = location.pathname.split('/')[2];
fetch(`/page/${path}`).then((res) => {
    return res.json();
}).then((poetArr) => {
    footer.innerText = `Autor: ${poetArr[0].poet}`;
})
fetch(`/visits/${path}`).then((res) => {
    return res.json();
}).then((visitors) => {
    const numberOfVisits = visitors.visitors;
    span.innerText = numberOfVisits;
    let i = 0;
    let max = 7;
    const hrefs = (par1, par2, par3) => {
        while (par1 < par2) {
            a2[par1 - par3].setAttribute('href', `../poem.html/${path}/${par1 + 1}`);
            par1++;
        }
    }
    if (location.pathname === `/page2.html/${path}`) {
        i = 7;
        max = 14;
        a2[7].setAttribute('href', `/allpoems.html/${path}`);
        a2[8].setAttribute('href', `/index2.html/${path}`);
        hrefs(i, max, 7);
    } else {
        a2[7].setAttribute('href', `/page2.html/${path}`);
        hrefs(i, max, 0);
    }
    const poems = (par1, par2, poemArr) => {
        h2[par1 - par2].innerText = poemArr[par1].body.title;
        p[par1 - par2].innerText = poemArr[par1].body.header;
        counter[par1 - par2].innerText = poemArr[par1].likes;
    }
    fetch(`/poems/${path}`).then((res) => {
        return res.json();
    }).then((poemArr) => {
        while (i < poemArr.length && i < max) {
            if (i < 7) {
                poems(i, 0, poemArr);
            } else {
                poems(i, 7, poemArr);
            }
            i++;
        }
    })
    off.onclick = () => {
        adv.remove();
    }
})
