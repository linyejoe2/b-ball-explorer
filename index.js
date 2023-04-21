require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Popup",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/widgets/Search"
], function (Map, MapView, Graphic, GraphicsLayer, BasemapToggle, Popup, Home, Locate, Search) {

  // 建立地圖
  var map = new Map({
    basemap: "gray-vector"
    // basemap: "dark-gray-vector", // 全黑，風格不錯
    // basemap: "oceans", // 土地是白的，方便看清楚其他資訊
  });

  // 建立地圖視圖
  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [120.960515, 23.69781],
    zoom: 7,
    popup: {
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false
      }
    }
  });

  // 建立底圖切換器
  var toggle = new BasemapToggle({
    view: view,
    nextBasemap: "osm", // 切換後的底圖
    container: document.createElement("div")
  });
  view.ui.add(toggle, "bottom-left");

  // 建立回初始畫面工具
  let homeWidget = new Home({
    view: view
  });
  // 讓回初始畫面的動畫更司滑
  homeWidget.goToOverride = function (view, goToParams) {
    goToParams.options.duration = 2000;
    return view.goTo(goToParams.target, goToParams.options);
  };
  view.ui.add(homeWidget, "top-left");

  // 建立 GraphicsLayer 來顯示籃球場點位
  var graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // 顯示載入中提示
  const loadingDiv = document.createElement("div");
  loadingDiv.textContent = "載入中...";
  loadingDiv.className = "loading"
  document.body.appendChild(loadingDiv);

  // // 呼叫 api 取得籃球場資料，並將資料轉成 Graphics 顯示在地圖上
  fetch("https://script.google.com/macros/s/AKfycbz8dfD4bGT6NYSls3LOfsr6Gz3b3Fm3iJUyI8o_Z-axrSsQtyFhXASHoz3GZU0XkklgPw/exec")
    .then(response => response.json())
    .then(data => {
      data.locations.forEach(function (feature) {
        var graphic = new Graphic({
          geometry: {
            type: "point",
            longitude: feature.lon,
            latitude: feature.lat
          },
          attributes: {
            "name": feature.name,
            "address": feature.address,
            "team": feature.team,
            "league": feature.league,
            "rentState": feature.rent_state,
            "tel": feature.tel
          },
          popupTemplate: {
            title: feature.name,
            content: [
              {
                type: "media",
                mediaInfos: [
                  {
                    type: "image",
                    value: {
                      sourceURL: feature.photo1,
                      linkURL: feature.photo1,
                    },
                  },
                ],
              },
              {
                type: "fields",
                fieldInfos: [
                  {
                    fieldName: "address",
                    label: "地址",
                  },
                  {
                    fieldName: "team",
                    label: "主場隊伍",
                  },
                  {
                    fieldName: "league",
                    label: "所屬聯盟",
                  },
                  {
                    fieldName: "rentState",
                    label: "是否對外開放",
                  },
                  {
                    fieldName: "tel",
                    label: "聯絡該場館",
                  },
                ],
              },
            ],
            //   content:
            //     `
            //   <b>地址：</b> ${feature.address} <br>
            //   <b>主場隊伍：</b> ${feature.team} <br>
            //   <b>所屬聯盟：</b> ${feature.league} <br>
            //   <b>是否對外開放：</b> ${feature.rent_state} <br>
            //   <b>聯絡該場館：</b> ${feature.tel} <br>
            //   <img src="${feature.photo1}" alt="圖片">
            // `,
          },
        });
        graphicsLayer.add(graphic);

        // 移除載入中提示
        loadingDiv.remove();
      });
    });

  // // 創建一個 Search widget
  // const searchWidget = new Search({
  //   view: view,
  //   allPlaceholder: "搜尋籃球場名稱",
  //   includeDefaultSources: false,
  //   sources: [{
  //     layer: graphicsLayer,
  //     placeholder: "搜尋籃球場名稱",
  //     maxResults: 5,
  //     searchFields: ["name"],
  //     displayField: "name",
  //     name: "搜尋籃球場名稱",
  //     // filter: searchExtent
  //   }],
  //   locationEnabled: false
  // });
  // view.ui.add(searchWidget, {
  //   position: "top-right",
  //   index: 2
  // });



  // 監聽點擊事件，彈出 Popup 顯示籃球場資訊
  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      var graphic = response.results[0].graphic;
      if (graphic.attributes.name) {
        // view.popup.open({
        //   title: graphic.attributes.name,
        //   content: "<b>地址：</b>" + graphic.attributes.address + "<br><b>主場隊伍：</b>" + graphic.attributes.team + "<br>" +
        //     "<b>所屬聯盟：</b>" + graphic.attributes.league,
        //   location: event.mapPoint
        // });
        view.goTo({
          target: graphic,
          zoom: 17
        }, { duration: 2000 });
      }
    });
  });

  // 定位使用者位置
  view.ui.add(new Locate({
    view: view,   // Attaches the Locate button to the view
    graphic: new Graphic({
      symbol: { type: "simple-marker" }  // overwrites the default symbol used for the
      // graphic placed at the location of the user when found
    })
  }), { position: "top-left", index: 1 });

});