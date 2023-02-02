const textConfig = {
    text1: "He luu cậu!",
    text2: "Tớ có điều này muốn hỏi cậu nhớ phải trả lời thật lòng nhaaa.",
    text3: "Cậu yêu tớ có phải không nào ._.",
    text4: "Nếu cậu ko trả lời mà thoát ra tức là muốn làm vợ tớ rùi đó nha :v",
    text5: "Cậu mơ à???",
    text6: "Yêu ơi là yêu <3",
    text7: "lí do cậu thích tớ đi :vvvv",
    text8: "Gửi cho tớ <3",
    text9: "Vì cậu đẹp try vlllll",
    text10: "Tớ biết mà ^^ Yêu cậu 300.000",
    text11:
      "Tối nay tớ qua đón cậu đi chơi nhaa :v Còn giờ thì chờ gì nữa mà ko inbox cho tớ đi nàooo",
    text12: "Okii lunn <3",
  };

$(document).ready(function () {
    // process bar
    setTimeout(function () {
        firstQuestion();
    }, 600);

    function firstQuestion() {
        $(".content").hide();
        Swal.fire({
            title: textConfig.text1,
            t
        });
        
    }
})