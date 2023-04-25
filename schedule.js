import { view } from './index.js';

fetch("https://api.t1league.basketball/season/2/matches").then(res => res.json()).then(data => {
  // console.log(data);

  const newGame = data.data.filter(match => match.status != 3);

  // 取得 schedule div
  const scheduleDiv = document.querySelector('.schedule');

  newGame.forEach(game => {
    // 取得日期、時間、季後賽賽事編號、主客隊名稱、地點等資訊
    const date = new Date(game.playDate).toLocaleDateString();
    const time = game.playTime;
    const gameNumber = game.serial;
    const gameType = game.stage.name;
    const homeTeam = game.teamHome.name;
    const guestTeam = game.teamGuest.name;
    const location = game.location;

    // 建立 HTML 元素
    const gameElement = document.createElement('div');
    const dateElement = document.createElement('div');
    const gameNumberElement = document.createElement('div');
    const teamElement = document.createElement('div');
    const locationElement = document.createElement('div');

    // 設定 HTML 元素內容
    dateElement.textContent = date ? `${date} ${time}` : "時間未定";
    gameNumberElement.textContent = `${gameType} Game ${gameNumber}`;
    teamElement.textContent = `${homeTeam} vs ${guestTeam}`;
    locationElement.textContent = location ? `at ${location}` : "地點未定";

    // 加入 CSS class
    gameElement.classList.add('game');
    dateElement.classList.add('date');
    gameNumberElement.classList.add('game-id');
    teamElement.classList.add('team');
    locationElement.classList.add('location');

    // 設定跟 overlay 有關的東西
    (() => {
      const overlayElement =
        `<div class="overlay">
        <div class="row">
          <div class="col-6 map-col" href="#">
            <div>
              <i class="fa-regular fa-map fa-2xl"></i>
              <p>地圖查看</p>
            </div>
          </div>` +
        (game.meta ? `<div class="col-6 buy-col">
            <div>
              <i class="fa-brands fa-youtube fa-2xl"></i>
              <p>觀看直播</p>
            </div>
          </div>` : `<div class="col-6 buy-col">
            <div>
              <i class="fa-regular fa-credit-card fa-2xl"></i>
              <p>線上購票</p>
            </div>
          </div>`) +
        `</div>
      </div>`;

      gameElement.innerHTML = overlayElement;

      // 在滑鼠移入時顯示浮現的 div
      gameElement.addEventListener("mouseenter", function () {
        const overlay = gameElement.querySelector(".overlay");
        overlay.style.display = "block";
      });

      // 在滑鼠移出時隱藏浮現的 div
      gameElement.addEventListener("mouseleave", function () {
        const overlay = gameElement.querySelector(".overlay");
        overlay.style.display = "none";
      });

      // 在手機裝置上點擊時顯示或隱藏浮現的 div
      gameElement.addEventListener("click", function () {
        const overlay = gameElement.querySelector(".overlay");
        if (overlay.style.display === "block") {
          overlay.style.display = "none";
        } else {
          overlay.style.display = "block";
        }
      });

      // 左邊地圖點擊事件
      gameElement.querySelector(".map-col").onclick = (ele, ele2) => {

        const t1CourtMap = {
          臺體大體育館: [120.68994397939694, 24.151399541168043],
          天母體育館: [121.53477862481277, 25.116123294033123],
          嘉南藥理大學紹宗體育館: [120.22977964038311, 22.92320241041931],
          新莊體育館: [121.45185875392662, 25.040705688059862],
          高雄巨蛋: [120.30272039612913, 22.669078279436306],
          國體大綜合體育館: [121.38351678782385, 25.034886112999867],
        };

        if (!location || !t1CourtMap[location]) return false;

        view.goTo({
          center: t1CourtMap[location],
          zoom: 15
        }, { duration: 2000 });
      }

      // 右邊立即購票點集事件
      gameElement.querySelector(".buy-col").onclick = () => {
        game.meta ?
          window.open(game.meta.live_stream_url, "_blank") :
          window.open("https://www.famiticket.com.tw/Home/Activity/Search/S01/002", "_blank");
      }
    })();

    // 將 HTML 元素加入到 schedule div 裡
    gameElement.appendChild(dateElement);
    gameElement.appendChild(gameNumberElement);
    gameElement.appendChild(teamElement);
    gameElement.appendChild(locationElement);
    scheduleDiv.appendChild(gameElement);
  });
});

function overlaySetup() {

}


window.onload = function () {
  const scheduleToggle = document.createElement("div");

  scheduleToggle.classList.add("esri-component", "esri-home", "esri-widget--button", "esri-widget")
  scheduleToggle.setAttribute("title", "關閉 T1 賽程");

  const icon = document.createElement("img");
  icon.src = "img/t1leagueoutline.svg";
  icon.alt = "Toggle Schedule";
  icon.style.width = "16px";
  icon.style.height = "16px";
  scheduleToggle.appendChild(icon);

  scheduleToggle.onclick = function () {
    const scheduleDiv = document.querySelector(".schedule-box");
    scheduleDiv.style.display = scheduleDiv.style.display === "none" ? "block" : "none";
  };

  document.querySelector(".esri-ui-top-left").appendChild(scheduleToggle);
};

