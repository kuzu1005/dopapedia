async function getRandomWikipediaPage() {
    const endpoint = "https://ja.wikipedia.org/w/api.php";

    try {
        const randomParams = new URLSearchParams({
            action: "query",
            format: "json",
            list: "random",
            rnnamespace: 0,
            rnlimit: 1,
            origin: "*"
        });

        const randomRes = await fetch(`${endpoint}?${randomParams.toString()}`);
        if (!randomRes.ok) {
            throw new Error(`API Error: ${randomRes.status}`);
        }
        const randomData = await randomRes.json();
        
        if (!randomData.query || !randomData.query.random || !randomData.query.random[0]) {
            throw new Error("ランダムページの取得に失敗しました");
        }
        
        const pageTitle = randomData.query.random[0].title;

        const contentParams = new URLSearchParams({
            action: "query",
            format: "json",
            prop: "extracts|pageimages|info",
            exintro: "true",
            inprop: "url",
            explaintext: "true",
            titles: pageTitle,
            pithumbsize: "300",
            origin: "*"
        });

        const contentRes = await fetch(`${endpoint}?${contentParams.toString()}`);
        if (!contentRes.ok) {
            throw new Error(`API Error: ${contentRes.status}`);
        }
        const contentData = await contentRes.json();
        
        if (!contentData.query || !contentData.query.pages) {
            throw new Error("ページ情報の取得に失敗しました");
        }
        
        const pages = contentData.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (!page.title) {
            throw new Error("ページタイトルが取得できませんでした");
        }

        return {
            title: page.title,
            content: page.extract || "説明がありません",
            imageUrl: page.thumbnail?.source || null,
            pageUrl: page.fullurl 
        };

    } catch (error) {
        console.error("データの取得中にエラーが発生しました:", error);
        alert("ページの読み込みに失敗しました。もう一度試してください。");
        return null;
    }
}

function displayPage(page){
        if (!page) return;

    console.log("ページデータ:", page);
    
    // 履歴に追加
    if (currentHistoryIndex < pageHistory.length - 1) {
        pageHistory = pageHistory.slice(0, currentHistoryIndex + 1);
    }
    pageHistory.push(page);
    currentHistoryIndex = pageHistory.length - 1;
    
    displayPageContent(page);
}

function displayPageContent(page) {
    if (!page) return;
    
    document.getElementById("title").innerText = page.title;
    document.getElementById("display").innerText = page.content;
    
    const img = document.querySelector("#app img");
    if (page.imageUrl) {
        if (!img) {
            const newImg = document.createElement("img");
            const app = document.getElementById("app");
            app.appendChild(newImg);
            newImg.src = page.imageUrl;
        } else {
            img.src = page.imageUrl;
            img.style.display = "block";
        }
    } else if (img) {
        img.remove();
    }

    const urlElement = document.getElementById("url");
    if (urlElement) {
        urlElement.href = page.pageUrl; 
        urlElement.innerText = "フル版はこちらから";
    }

    let pageHeight = document.getElementById('display');
    if(!page.imageUrl){
        pageHeight.style.maxHeight="850px";
    }
    else{
        pageHeight.style.maxHeight="350px";
    }
}

function displayPageFromHistory(page) {
    displayPageContent(page);
}

// 履歴管理の初期化
let pageHistory = [];
let currentHistoryIndex = -1;

const minimumDistance = 50
let startY = 0
let endY = 0
let startX = 0
let endX = 0

window.addEventListener('touchstart', (e) =>  {
  startY = e.touches[0].pageY
  startX = e.touches[0].pageX
  endY = startY
  endX = startX
})

window.addEventListener('touchmove', (e) =>  {
  endY = e.changedTouches[0].pageY
  endX = e.changedTouches[0].pageX
})


window.addEventListener('touchend', (e) =>  {
  const distanceY = Math.abs(endY - startY)
  const distanceX = Math.abs(endX - startX)
  
  if (distanceY > minimumDistance && distanceY > distanceX) {
    if (startY > endY) {
      console.log('上スワイプ');
      getRandomWikipediaPage().then(displayPage);
    }
    else if (startY < endY) {
      console.log('下スワイプ');
      if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        displayPageFromHistory(pageHistory[currentHistoryIndex]);
      }
    }
  }
})

const scrollUpButton = document.querySelector('.scroll-down');
if (scrollUpButton) {
  scrollUpButton.addEventListener('click', () => {
    getRandomWikipediaPage().then(displayPage);
  });
}

const scrollDownButton= document.querySelector('.scroll-up');
if(scrollDownButton){
    scrollDownButton.addEventListener('click',()=>{
        currentHistoryIndex--;
        displayPageFromHistory(pageHistory[currentHistoryIndex]);
    })
}


getRandomWikipediaPage().then(displayPage);


function themeColor() {
    const selectedColor = document.getElementById('theme-color');
    const radioNodeList = selectedColor.elements['color'];
    const checkValue = radioNodeList.value;
    
    const scrollButtons = document.querySelectorAll(".scroll-up, .scroll-down");
    const isDesktop = window.innerWidth >= 680;
    
    if (checkValue === "dark") {
        document.body.style.color = "#fff";
        document.body.style.backgroundColor = "#000";
        document.getElementById("logo").style.fill = "#fff";
        if (isDesktop) {
            document.getElementById("app").style.setProperty("border", "2px solid #fff", "important");
        } else {
            document.getElementById("app").style.border = "none";
        }
        scrollButtons.forEach(btn => {
            btn.style.backgroundColor = "#000";
            btn.style.color = "#fff";
        });
    } else if (checkValue === "lite") {
        document.body.style.color = "#000";
        document.body.style.backgroundColor = "#fff";
        document.getElementById("logo").style.fill = "#000";
        if (isDesktop) {
            document.getElementById("app").style.setProperty("border", "2px solid #000", "important");
        } else {
            document.getElementById("app").style.border = "none";
        }
        scrollButtons.forEach(btn => {
            btn.style.backgroundColor = "#fff";
            btn.style.color = "#000";
        });
    }
}

const themeForm = document.getElementById('theme-color');
if (themeForm) {
    themeForm.addEventListener('change', themeColor);
}

themeColor();