const div = document.getElementsByTagName('div');
fetch('/mypwd').then((res) => {
    return res.json();
}).then((accountArr) => {
    let i = 0;
    while (i < accountArr.length) {
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        const text1 = document.createTextNode(`login${i + 1}: ${accountArr[i].login}`);
        const text2 = document.createTextNode(`hasło${i + 1}: ${accountArr[i].password}`);
        p1.appendChild(text1);
        p2.appendChild(text2);
        div[0].appendChild(p1);
        div[0].appendChild(p2);
        i++;
    }
})