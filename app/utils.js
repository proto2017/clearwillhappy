let utils = {};

function getPos(event) {
    let x, y;
    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + 
            document.documentElement.scrollTop;
    }
    x -= element.offsetLeft;
    y -= element.offsetTop;

    return {x, y};
}

utils.captureMouse = function(element) {
    let mouse = {x:0, y:0};
    element.addEventListener("mousemove", function(event) {
        let res = getPos(event);
        mouse.x = res.x;
        mouse.y = res.y;
    }, false);
    return mouse;
}

utils.captureTouch = function(element) {
    let touch = {x: null, y: null, isPressed: false};

    element.addEventListener("touchstart", function(event) {
        touch.isPressed = true;
    }, false)
    element.addEventListener("touchend", function(event) {
        touch.isPressed = false;
        touch.x = null;
        touch.y = null;
    }, false)
    element.addEventListener("touchmove", function(event) {
        let res = getPos(event.touches[0]);
        touch.x = res.x;
        touch.y = res.y;
    }, false)
}

export default utils;