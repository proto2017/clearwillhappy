/**
 * Created by proto on 2017/4/19.
 */
import {WIDTH, HEIGHT, randNum} from './config'
import Ball from './ball'
import Element from './Element'

function ClearWillHappy(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.column = 10; // 列
    this.line = 12;  // 行
    this.elementsListInfo = [];  // 存取元素的所有信息
    this.elementsSelect = []; // 选中的元素
    this.elementSize = Math.floor((WIDTH-10) / this.column); // 每个元素的大小
    this.offsetDistance = [(WIDTH- this.elementSize * this.column)/2, 10]; // canvas的偏移量
    this.bombArea = 50; // 爆炸范围
    this.bombBalls = []; // 这里有小球代表爆炸的元素
}
// 初始化
ClearWillHappy.prototype.init = function (imgsInfo) {
    const {elementsListInfo, elementSize} = this;
    const [x, y] = this.offsetDistance;
    let len = imgsInfo.length;
    this.imgsInfo = imgsInfo; // 添加元素图像
    // 初始化面板
    for (let i = 0; i < this.line; i++) {
        elementsListInfo[i] = [];
        for (let j = 0; j < this.column; j++) {
            let b = {};
            b.visibile = true; // 控制元素的显示和是否可点击
            b.index = Math.floor(Math.random()*len);  // 图像的index，根据此参数搜索
            b.x = j*elementSize + x;
            b.y = i*elementSize + y;
            b.color = imgsInfo[b.index].color;
            b.px = i;
            b.py = j;
            elementsListInfo[i][j] = b;
        }
    }
    return this;
};

// 创建面板边框，暂时不用
ClearWillHappy.prototype.createBoard = function() {
    const {
        ctx,
        canvas,
        line,
        column,
        offsetDistance,
        elementSize
    } = this;

    ctx.save();
    ctx.beginPath();
    // 将整个canvas移动，处理边框粗细问题
    ctx.translate(offsetDistance[0], offsetDistance[1]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    // 画列
    for (let i = 0; i <= column; i++) {
        ctx.moveTo(elementSize*i, 0);
        ctx.lineTo(elementSize*i, line*elementSize);
        ctx.stroke();
    }
    // 画行
    for (let i = 0; i <= line; i++) {
        ctx.moveTo(0, elementSize*i);
        ctx.lineTo(elementSize*column, elementSize*i);
        ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();
    return this;
};

// 放置元素
ClearWillHappy.prototype.draw = function() {
    const {
        ctx,
        elementsListInfo,
        elementSize,
        imgsInfo
    } = this;

    elementsListInfo.forEach((lines) => {
        lines.forEach((element) => {

            if (element.visibile) { // 显示正常图片
                let num = 3, size = elementSize-num; // 使图片在边框内，设置两个像素
                ctx.save();
                ctx.beginPath();
                ctx.translate(element.x+num, element.y+num);
                if (element.select) { // 选中了
                   // ctx.scale(5, 5);
                  //  ctx.rotate(50 * Math.PI /180)
                    ctx.rect(-1, -1, elementSize-2, elementSize-2);
                    ctx.stroke();
                }
                ctx.drawImage(imgsInfo[element.index].dom, 0, 0, size, size) // 这里不设置 0 0的化，旋转有问题
                ctx.closePath();
                ctx.restore();
            } else if (element.index == -1){ // 粉碎图片
                this._createBombBalls(element)
                element.isBomb = true; // 是否爆炸过
            }
        })
    });

    return this;
};

// 拖拽元素
ClearWillHappy.prototype.handleEvent = function() {
    const {
        canvas,
        elementsSelect
    } = this;
    let cnt = 0;
    canvas.addEventListener("click", (e) => {
        let element = this._findElement(e);
        if (!element) return false;
        elementsSelect.push(element);
        cnt++;
        if (cnt == 2) {
            cnt = 0;
            this._replaceElement();
        }
    }, false)

    return this;
};

// 处理动画
ClearWillHappy.prototype.animate = function() {

    const {ctx, canvas, bombBalls, bombArea} = this;
    // console.log(WIDTH, HEIGHT);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.draw();
    if (bombBalls.length > 0) {
        let num = bombBalls.length;
        while (num--) {
            let ball = bombBalls[num];
            ball.x += ball.vx;
            ball.y += ball.vy;
            if (ball.x > ball.ox + bombArea || ball.x < ball.ox - bombArea) {
                bombBalls.splice(num, 1)
            }
            if (ball.y > ball.oy + bombArea || ball.y < ball.oy - bombArea) {
                bombBalls.splice(num, 1)
            }
        }
        bombBalls.forEach(ball=>{
            ball.draw(ctx);
        })
    }
    requestAnimationFrame(() => {
        this.animate();
    });
}

ClearWillHappy.prototype._createBombBalls = function(element) {
    const { x, y, isBomb, color } = element;

    if (!isBomb) {
        const {elementSize} = this;
        let radius = 5,
            num = Math.floor(elementSize / radius);
        for (let i = 1; i < num-1; i++) {
            for (let j = 1; j < num-1; j++) {
                let ball = new Ball(radius, color);
                ball.vx = randNum(-1, 1, 2);
                ball.vy = randNum(-1, 1, 2);
                ball.ox = ball.x = x + j*radius;
                ball.oy = ball.y = y + i*radius;
                this.bombBalls.push(ball);
            }
        }
    }

}

// 找到点击的是哪个元素
ClearWillHappy.prototype._findElement = function({x, y}) {
    const {
        elementsListInfo,
        elementSize
    } = this;
    let elem;
    for (let i = 0; i < elementsListInfo.length; i++) {
        let elements = elementsListInfo[i];
        elem = elements.filter(element => {
            return element.x <= x && element.x+elementSize >= x && element.y <= y && element.y+elementSize >= y
        })[0];
        if (elem) {
            elem.select = true;
            break;
        }
    }
    if (!elem || !elem.visibile) {
        return false;
    }
    return elem;
};

// 两个元素之间替换
ClearWillHappy.prototype._replaceElement = function() {

    const {elementsSelect, elementsListInfo} = this;

    let end = elementsSelect.pop(),
        start = elementsSelect.pop(), // 第一次点击的元素
        endElement = end.index,
        startElement = start.index,
        startColor = start.color,
        endColor = end.color;
    elementsListInfo[end.px][end.py].index = startElement;
    elementsListInfo[start.px][start.py].index = endElement;
    //
    elementsListInfo[end.px][end.py].color = startColor;
    elementsListInfo[start.px][start.py].color = endColor;

    const startBreak = this._breakElement(start.px, start.py);
    const endBreak = this._breakElement(end.px, end.py);

    const f1 = this._setElementStatus(start.px, start.py, startBreak);
    const f2 = this._setElementStatus(end.px, end.py, endBreak);


    if (!f1 && !f2) {
        elementsListInfo[end.px][end.py].index = endElement;
        elementsListInfo[start.px][start.py].index = startElement;
    }
};

ClearWillHappy.prototype._setElementStatus = function(px, py, selectElements) {

    if (selectElements.length >= 2) {
        const {elementsListInfo} = this;
        elementsListInfo[px][py].index = -1;
        elementsListInfo[px][py].visibile = false;
        selectElements.map(element=>{
            element.index = -1;
            element.visibile = false;
        })
        return true;
    }
    return false;
};

// 查找替换的元素旁边与没有相同的元素
// 有相同的找出来
ClearWillHappy.prototype._breakElement = function(targetX, targetY) {
    const {
        elementsListInfo,
        column,
        line
    } = this;
    const targetElement = elementsListInfo[targetX][targetY].index;
    let breakElem = [];

    function dfs(x, y, start) {
        if (x < 0 || x >= line || y < 0 || y >= column) return false;

        let element = elementsListInfo[x][y];
        if (element.index != targetElement || element.v) return false;
        if (element.index == targetElement && !start) {
            breakElem.push(elementsListInfo[x][y]);
        }
        elementsListInfo[x][y].v = 1;  // 表示改点已经找过了
        dfs(x - 1, y);  // 上
        dfs(x, y + 1) ; // 右
        dfs(x + 1, y); // 下
        dfs(x, y - 1); // 左
        elementsListInfo[x][y].v = 0;  // 还原
    }
    console.time("递归时间")
    dfs(targetX, targetY, true);
    console.timeEnd("递归时间");
    return breakElem;
};


export default ClearWillHappy;