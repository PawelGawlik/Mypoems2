const div = document.querySelectorAll('div');
const form = document.querySelector('form');
const input = document.querySelectorAll('input');
const p = document.querySelector('p');
const a1 = document.querySelectorAll('a');
fetch('/users').then((res) => {
    return res.json();
}).then((poets) => {
    if (poets) {
        const param = Math.ceil(Math.random() * poets);
        fetch(`/page/${param}`).then((res) => {
            return res.json();
        }).then((poetArr) => {
            a1[1].innerText = poetArr[0].poet;
            a1[1].setAttribute('href', `/index2.html/${poetArr[0].id}`);
        })
    } else {
        a1[1].innerText = 'Brak strony do wyświetlenia';
    }
})
form.onsubmit = (e) => {
    if (input[1].value.length < 7 || input[2].value.length < 7) {
        p.innerText = 'Hasło i login muszą mieć przynajmniej 7 znaków!';
        e.preventDefault();
        return;
    }
    if (input[2].value !== input[3].value) {
        p.innerText = 'Hasła nie są identyczne!';
        e.preventDefault();
        return;
    }
}

fetch('/search').then((res) => {
    return res.json();
}).then((poetsArr) => {
    let i = 0;
    while (i < poetsArr.length) {
        const a = document.createElement('a');
        const text = document.createTextNode(poetsArr[i].poet);
        a.setAttribute('href', `/index2.html/${poetsArr[i].id}`);
        a.appendChild(text);
        div[1].appendChild(a);
        i++;
    }
    /*form.onsubmit = (e) => {
        if (input[1].value.length < 5 || input[2].value.length < 5) {
            e.preventDefault();
            p.innerText = 'Hasło i login muszą mieć przynajmniej 5 znaków!';
            return;
        }
        if (input[2].value.length !== input[3].value.length) {
            e.preventDefault();
            p.innerText = 'Hasła nie są identyczne!';
            return;
        }
    }*/
})