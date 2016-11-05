document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.documentElement.style.width = '100%';
document.body.style.width = '100%';
var translateUrl = "https://www.googleapis.com/language/translate/v2?key=AIzaSyD4rLhLb3ZmwjLJDt-njNqFYP30eHeaBTQ&target=en&q=";
var watsonUrl = "https://access.alchemyapi.com/calls/html/HTMLGetCombinedData";
var alchemyApiKey = "2559328133acc4a3e8825bc7afe60edcd1d0beeb";

$(document).ready(function(){
  $(document).on("mouseover", ".userContent", function() {
    var position = $(this).offset();
    var width = $(this).width();
    var content = $(this).find("p").first().html();
    var height = $(this).height();

    function addHoverBox(){
      $("body").append("<div id='hover-box' style='background-color: blue; opacity: 0.2; position:absolute; width:auto; height:auto;'></div>");

      $("#hover-box").css("left", position.left + "px");
      $("#hover-box").css("top", position.top + "px");
      $("#hover-box").css("width", width + "px");
      $("#hover-box").css("height", height + "px");
    }

    function createButton(){
      $("body").append("<button class='btn-class' style='position:absolute;'>Check</button>");
      $(".btn-class").css("left", (position.left + width) + "px");
      $(".btn-class").css("top", position.top + "px");
      $(".btn-class").css("z-index", 100000);
      $(".btn-class").css("background-color", "red");
      $(".btn-class").css("position", "absolute");
      $(".btn-class").css("border", "none");
      $(".btn-class").css("padding", "10px");
    }



   function detectLanguage(foreignText) {
      $.post(watsonUrl, {html: foreignText, apikey: alchemyApiKey, outputMode: "json"}, function (data) {
        console.log(data);
        var language = data["language"];
        if (language != "english" && language!=null) {
          console.log("not english");
          addHoverBox();
          createButton();
          clickButton();
          //translateText();
        }
        else{
          console.log("english");
        }
      });
    }

    detectLanguage(content);

    function clickButton(){
      $(".btn-class").click(function(){
        console.log('clicked');
        addTranslationBox();
        translateText();
      });
    }
    function addTranslationBox(){
      $("body").append("<div id='translation-box' style='background-color: lightblue; position:absolute; width:auto; height:auto;'></div>");
      $("#translation-box").css("left", (position.left + width) + "px");
      $("#translation-box").css("top", position.top + "px");
      //$("#translation-box").css("height", $(this).height() + "px");
      $("#translation-box").css("z-index", 1000);
      $("#translation-box").css("padding", "20px");
    }

    function translateText() {
      $.get(translateUrl + content, function (data) {
        var translatedText = data.data.translations[0].translatedText;
        $("#translation-box").html("<h2> Translation: </h2>" + translatedText);
        runEmotionAnalysis(translatedText);
      });
    }

    function runEmotionAnalysis(transText) {
      $.post(watsonUrl, {
        html: transText,
        apikey: alchemyApiKey,
        outputMode: "json",
        extract: "doc-emotion"
      }, function (data) {
        console.log(data);
        var count = Object.keys(data).length;
        var emotions = ["anger", "disgust", "fear", "joy", "sadness"];
        $("#translation-box").append("<h2> Emotion Analysis: </h2>");
        for (var i = 0; i < count; i++) {
          var emotion = emotions[i];
          if (emotion != "fear") {
            var imageUrl = chrome.extension.getURL('/img/' + emotion + '.png');
            var emotionImage = document.createElement('img');
            emotionImage.src = imageUrl;
            $(emotionImage).css("height", "50px");
            $("#translation-box").append(emotionImage);
            var analysis = emotion + ": " + data["docEmotions"][emotion];
            $("#translation-box").append(analysis + "<br>");
          }
        }
      });
    }
  });
});