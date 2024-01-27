const header = document.getElementsByTagName("header");
const article = document.getElementsByTagName("article");
const span = document.getElementsByTagName("span");
const form = document.getElementsByTagName("form");
const comments = document.getElementsByClassName("comments");
const path = location.pathname;
const param = path.split('/')[3];
const param3 = path.split('/')[2];
const button = document.getElementsByTagName('button');
const adv = document.querySelector('.advertisement');
const off = document.querySelector('.off');
const a = document.querySelector('.advertisement>a');
const a2 = document.querySelector('.back2');
a2.setAttribute('href', `/page2.html/${param3}`);
button[0].onclick = function () {
    fetch(`/likes/${param3}/${param}`)
    this.remove();
}
off.onclick = () => {
    adv.remove();
}
const links = ["https://tmlead.pl/redirect/190176_2282", "https://pawgaw.oferty-kredytowe.pl"];
const desc = ["TaniaKsiążka.pl - księgarnia online", "Konta, pożyczki i inne"];
const param2 = Math.floor(Math.random() * 2);
const href = links[param2];
a.setAttribute('href', href);
a.innerText = desc[param2];
form[0].setAttribute("action", `/comment/${param3}/${param}`);
if (path !== `/poem.html/${param3}`) {
    fetch(`/poem/${param3}/${param}`).then((res) => {
        return res.json();
    }).then((poem) => {
        header[0].innerText = poem.body.title;
        article[0].innerText = poem.body.text;
        span[0].innerText = poem.commentNumber;
        fetch(`/buttonDisplay/${param3}/${param}`).then((res) => {
            return res.json();
        }).then((likeButton) => {
            const like = likeButton.likeButton;
            if (like) {
                button[0].remove();
            }
        })
        let i = 0;
        const commentDisplay = (param3) => {
            const param1 = document.createElement("p");
            const param2 = document.createTextNode(poem.comments[i][param3]);
            param1.appendChild(param2);
            comments[0].appendChild(param1);
        }
        while (i < poem.comments.length) {
            commentDisplay("nick");
            commentDisplay("comment");
            const div = document.createElement('div');
            div.innerText = poem.comments[i].date;
            comments[0].appendChild(div);
            i++;
        }
    })
}