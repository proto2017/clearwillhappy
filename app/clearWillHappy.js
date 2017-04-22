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
    this.bombBallAutoCheck = true; // 开启小球自动检查爆炸

    this.pos = []; //  [123, 123，123， 123] = [1, 3] 用这种键值得方式存储，方便查找鼠标的点击的是哪个元素
}
// 初始化
ClearWillHappy.prototype.init = function () {
    const {elementsListInfo, elementSize} = this;
    const [x, y] = this.offsetDistance;
    let len = IMGSINFO.length;
    let num = 3, size = elementSize-num; // 使图片在边框内，设置两个像素
    // this.imgsInfo = imgsInfo; // 添加元素图像
    // 初始化面板
    console.time("初始化时间");
    for (let i = 0; i < this.line; i++) {
        elementsListInfo[i] = [];
        for (let j = 0; j < this.column; j++) {
            let index = Math.floor(Math.random()*len),
                b = new Element({index, size});
            b.visibile = true; // 控制元素的显示和是否可点击
            b.index = index;  // 图像的index，根据此参数搜索
            b.x = j*elementSize + x;
            b.y = i*elementSize + y;
            b.color = IMGSINFO[b.index].color;
            b.vy = 1; // 给一个向下的速度，现在是0
          //  b.px = i; // 这两个属性去掉，位置还是通过坐标来找吧，否则位置移动了就不好处理了
           // b.py = j;
          //  str = JSON.stringify([b.x, b.y, b.x + elementSize, b.y+elementSize]); // 这样速度比以数组的形式快
            this.pos.push([b.x, b.y, b.x + elementSize, b.y+elementSize, i, j])
        //    JSON.parse(str);
            elementsListInfo[i][j] = b;
        }
    }
   // console.log(this.pos);
    console.timeEnd("初始化时间");
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
        line
    } = this;
   
    elementsListInfo.forEach((lines, i) => {
        lines.forEach((element, j) => {
            if (element.visibile) { // 显示正常图片
             //   debugger
                element.draw(ctx);
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

    const {ctx, canvas, bombBalls, bombArea, line, elementSize, elementsListInfo} = this;

    if (this.bombBallAutoCheck) {
        this._breakAuto();
        this.bombBallAutoCheck = false;
    }
  //  this._breakAuto();
    // console.log(WIDTH, HEIGHT);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    //  elementsListInfo.forEach((lines, i) => {
    //     lines.forEach((element, j) => {
    //         if (element.visibile) { // 显示正常图片
    //             for (let k = i+1; k < line; k++) {
    //                 elementsListInfo[k][j].num = 0;
    //                 if (elementsListInfo[k][j].isBomb) {
    //                     elementsListInfo[k][j].num += elementSize;
    //                   //  elementsListInfo[k][j].isBomb = true;
    //                 } else {
    //                     break;
    //                 }
    //             }
    //            element.y += elementsListInfo[i][j].num;
    //         } 
    //     })
    // });

    this.draw(); // 绘制元素
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
        elementSize,
        pos
    } = this;
    
    // console.log(x, y, pos);
    let elem = pos.filter((element, key) => {
        return element[0] <= x && element[2] >= x && element[1] <= y && element[3] >= y
    })[0]
    // for (let i = 0; i < elementsListInfo.length; i++) {
    //     let elements = elementsListInfo[i];
    //     elem = elements.filter(element => {
    //         return element.x <= x && element.x+elementSize >= x && element.y <= y && element.y+elementSize >= y
    //     })[0];
    //     if (elem) {
    //         elem.select = true;
    //         break;
    //     }
    // }
    let sx = elem[4], sy = elem[5]
    // console.log(elem[4], elem[5]);
    if (!elem || !elementsListInfo[sx][sy].visibile) {
        return false;
    }
    
    return [sx, sy];
};

// 两个元素之间替换
ClearWillHappy.prototype._replaceElement = function() {

    const {elementsSelect, elementsListInfo} = this;

    const [ex, ey] = elementsSelect.pop(),
          [sx, sy] = elementsSelect.pop(), // 第一次点击的元素
        endElement = elementsListInfo[ex][ey].index,
        endColor = elementsListInfo[ex][sy].color,
        startElement = elementsListInfo[sx][sy].index,
        startColor = elementsListInfo[sx][sy].color;
        
    elementsListInfo[ex][ey].index = startElement;
    elementsListInfo[sx][sy].index = endElement;
    //
    elementsListInfo[ex][ey].color = startColor;
    elementsListInfo[sx][sy].color = endColor;

    const startBreak = this._breakElement(sx, sy);
    const endBreak = this._breakElement(ex, ey);

     if (!startBreak && !endBreak) {
        elementsListInfo[ex][ey].index = endElement;
        elementsListInfo[sx][sy].index = startElement;
        return;
    }

    startBreak && this._setElementStatus(startBreak);
    endBreak && this._setElementStatus(endBreak);


   
};

ClearWillHappy.prototype._setElementStatus = function(selectElements) {
    selectElements.map(element=>{
        element.index = -1;
        element.visibile = false;
    })
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
    
    dfs(targetX, targetY, true);
    
    if (breakElem.length >= 2) {
        breakElem.push(elementsListInfo[targetX][targetY]);
        return breakElem;
    } 
    return false;
};

// 自动爆炸
// 实现自动查找的相同元素的功能
ClearWillHappy.prototype._breakAuto = function() {
    console.time("递归时间")
    const {elementsListInfo} = this;
    for (let i = 0; i < elementsListInfo.length; i++) {
        let elements = elementsListInfo[i];
        elements.forEach((element, key)=>{
            let bombBall = this._breakElement(i, key);
            bombBall && this._setElementStatus(bombBall);
        })
    }
    console.timeEnd("递归时间");
}

// 自动补全的功能
// 爆炸后自动填充爆炸的空格
ClearWillHappy.prototype._addAuto = function() {

}


export default ClearWillHappy;