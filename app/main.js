/**
 * Created by proto on 2017/4/17.
 */

import {WIDTH, HEIGHT} from './config'
import ClearWillHappy from './clearWillHappy'
import imgsInfo from './material'

if (process.env.NODE_ENV !== 'production') {
    require('../index.html')
}

function loadImg(cb) {
    let cnt = 0, len = imgsInfo.length;
    imgsInfo.forEach(item=>{
        let img = new Image();  // 这里用let 定义，解决作用域的问题
        img.onload = () => {
            cnt++;
            item.dom = img;
            if (cnt >= len) {
                cb(imgsInfo)
            }
        };
        img.src = item.src;
    })
}


var canvas = document.querySelector("#canvas"),
    ctx = canvas.getContext('2d');

canvas.width = WIDTH;
canvas.height = HEIGHT;
let clearWillHappy = new ClearWillHappy(ctx, canvas);
// loadImg(
//     function(imgsInfo) {
//         clearWillHappy.init(imgsInfo)
//                         // .createBoard()
//                         .draw()
//             .handleEvent().animate()
//     }

// );


