var csv_data;
var dict;
var current;
var action = show_kanji;
var show_stroke = false;

window.onload = function () {
    let time_elem = $("#last_modified_by");
    let date = new Date();
    time_elem.html(date.toDateString());
    time_elem.attr("datetime", date.toISOString());

    $.ajax({
        type: "GET",
        url: "kanji.csv",
        contentType: "text/csv;charset=utf-8",
        dataType: "text",
        success: function (data) {
            // save raw data for later
            csv_data = data;
            // proccess data
            process_kanji(data, 0);
        }
    });

    $(document).on("keyup", function (e) {
        switch (e.keyCode) {
            case 37:
                prev();
                break;
            case 39:
                next();
                break;
            case 32:
                flip_card();
                break;
            case 75:
                show_kanji();
                break;
            case 79:
                show_onkun();
                break;
            case 68:
                show_def();
                break;
            case 82:
                randomize();
                break;
            case 83:
                let elem = $("#show-stroke-order-btn");
                check_box(elem);
                toggle_stroke(elem);
                break;
        }
    }).on("fullscreenchange", function () {
        fs_events();
    });
}

function process_kanji(data, chapter) {
    dict = new Array(0);
    current = -1;
    let lines = data.split("\r\n");
    for (let i = 0; i < lines.length; i++) {
        try {
            let attr = lines[i].split(",");
            if (chapter == 0 || parseInt(attr[5]) == chapter) {
                let entry = {
                    "kanji": attr[0],
                    "onkun": attr[1].split("・"),
                    "def": attr[2],
                    "stroke": attr[3],
                    "page": attr[4],
                    "chapter": attr[5],
                    "id": i
                };
                dict.push(entry);
            }
        } catch {
            console.error("There wasa problem parsing line " + i);
        }
    }
    next();
    show_kanji();
}

function randomize() {
    for (let i = 0; i < dict.length; i++) {
        let temp = dict[i];
        let rand = Math.floor(Math.random() * dict.length);
        dict[i] = dict[rand];
        dict[rand] = temp;
    }
    action();
}

function next() {
    current++;
    if (current >= dict.length) current = 0;
    action();
}

function prev() {
    current--;
    if (current < 0) current = dict.length - 1;
    action();
}

function show_kanji() {
    action = show_kanji;
    let entry = dict[current];
    let front = `<span class='jp kanji kanji-large ${(show_stroke ? "kanji-stroke-order" : "")}'>${(show_stroke ? "<div id='kanji-frame'><img id='kanji-image' style='left: -" + (160.25 * entry.id) + "px;' src='kanji.png'/></div>" : entry.kanji)}</span>`;
    let onkun = "";
    for (let i = 0; i < entry.onkun.length; i++) {
        onkun += entry.onkun[i] + (i < entry.onkun.length - 1 ? ", " : "");
    }
    let back = ""
        + `<div class='quad'><b>On/Kun</b><p class="jp">${onkun}</p></div>`
        + `<div class='quad'><b>Definition</b><p>${entry.def}</p></div>`
        + `<div class='quad'><b>Strokes</b><p>${entry.stroke}</p></div>`
        + `<div class='quad'><b>Reference</b><p>ch.${entry.chapter} p.${entry.page}</p></div>`;
    let card = create_card(front, back);
    $("#card-holder").html(card);
}

function show_onkun() {
    action = show_onkun;
    let entry = dict[current];
    let onkun = "";
    for (let i = 0; i < entry.onkun.length; i++) {
        onkun += entry.onkun[i] + (i < entry.onkun.length - 1 ? "<br>" : "");
    }
    let front = `<span class='jp onkun-large'>${onkun}</span>`;
    let back = ""
        + `<div class='quad'><b>Kanji</b><p class="jp kanji kanji-small ${(show_stroke ? "kanji-stroke-order" : "")}">${entry.kanji}</p></div>`
        + `<div class='quad'><b>Definition</b><p>${entry.def}</p></div>`
        + `<div class='quad'><b>Strokes</b><p>${entry.stroke}</p></div>`
        + `<div class='quad'><b>Reference</b><p>ch.${entry.chapter} p.${entry.page}</p></div>`;
    let card = create_card(front, back);
    $("#card-holder").html(card);
}

function show_def() {
    action = show_def;
    let entry = dict[current];
    let onkun = "";
    for (let i = 0; i < entry.onkun.length; i++) {
        onkun += entry.onkun[i] + (i < entry.onkun.length - 1 ? ", " : "");
    }
    let front = `<span class='en-large'>${entry.def}</span>`;
    let back = ""
        + `<div class='quad'><b>Kanji</b><p class="jp kanji kanji-small ${(show_stroke ? "kanji-stroke-order" : "")}">${entry.kanji}</p></div>`
        + `<div class='quad'><b>On/Kun</b><p>${onkun}</p></div>`
        + `<div class='quad'><b>Strokes</b><p>${entry.stroke}</p></div>`
        + `<div class='quad'><b>Reference</b><p>ch.${entry.chapter} p.${entry.page}</p></div>`;
    let card = create_card(front, back);
    $("#card-holder").html(card);
}

function create_card(front, back) {
    let card = "<div id='card' onclick='flip_card();'>"
        + "<div id='front' class='center'>"
        + `<span>${front}</span>`
        + "</div>"
        + "<div id='back' class='center' style='display:none;'>"
        + `${back}`
        + "</div>"
        + "<div id='card-flip'></div>"
        + "</div>";
    return card;
}

function flip_card() {
    let card = $("#card");
    let front = $("#front");
    let back = $("#back");
    front.toggle();
    back.toggle();
}

function check_box(elem) {
    $(elem).toggleClass("checkbox-btn-checked");
}

function toggle_stroke(elem) {
    show_stroke = !show_stroke;
    //$(".kanji").toggleClass("kanji-stroke-order", show_stroke);
    let html = (show_stroke ? "Hide Stroke Order" : "Show Stroke Order");
    $(elem).html(html);
    action();
}

function toggle_information(elem) {
    let hidden = $("#footer-content").is(":visible");
    $('#footer-content').slideToggle(!hidden);
    let html = (!hidden ? "Hide Information" : "More Information");
    $(elem).html(html);
}

function toggle_fs() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function fs_events() {
    if (!document.fullscreenElement) {
        $("#exit_fs_btn").toggle(false);
        $("header").toggle(true);
        $("footer").toggle(true);
        $(".fs-limit").removeClass("fs");
    } else {
        if (document.exitFullscreen) {
            $("#exit_fs_btn").toggle(true);
            $("header").toggle(false);
            $("footer").toggle(false);
            $(".fs-limit").addClass("fs");
        }
    }
}