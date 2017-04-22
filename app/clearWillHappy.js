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

    this.pos = []; //方便查找鼠标的点击的是哪个元素

    this.replaceElement = false;
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
            b.ty = b.y;  // 每个元素向下走的趋势
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

     elementsListInfo.forEach((lines, i) => {
        lines.forEach((element, j) => {
            element.y += (element.ty - element.y) * 0.08;
        })
    });

       // 将元素坐标位置修改，根据自身ty的属性
    // if (!this.replaceElement) {
    //         for (let len = elementsListInfo.length, i = len-1; i >= 0; i--) {
    //             elementsListInfo[i].forEach((item,col)=>{
    //                 if (item.visibile && Math.abs(item.y - item.ty) >= 0) {
    //                    let pos = this._findElement({x:item.x+10, y:item.ty+10}); //找到现在的坐标
                       
    //                    this.replaceElement = true;
    //                     if (pos) {
    //                         const [tx, ty] = pos;
    //                         let targetElement = elementsListInfo[tx][ty].index, // 已经爆炸过的元素属性
    //                             targetColor = elementsListInfo[tx][ty].color,
    //                             targetVisible =  elementsListInfo[tx][ty].visibile,

    //                             sourceElement = elementsListInfo[i][col].index,  // 以前的坐标，里面有正确的元素属性
    //                             sourceColor = elementsListInfo[i][col].color,
    //                             sourceVisible = elementsListInfo[i][col].visibile;


    //                         elementsListInfo[i][col].index = targetElement;
    //                         elementsListInfo[i][col].color = targetColor;
    //                         elementsListInfo[i][col].visibile = targetVisible;

    //                         elementsListInfo[tx][ty].index = sourceElement;
    //                         elementsListInfo[tx][ty].color = sourceColor;
    //                         elementsListInfo[tx][ty].visibile = sourceVisible;
    //                     }
                        


    //                 }
                    
    //             })
    //         }
    // }
   


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
    
   //  console.log(x, y, "找不到");
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
  //   console.log("呵呵", elem[4], elem[5], elementsListInfo[sx][sy], "呵呵");
    if (!elem ) {
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

// 找到了可以爆炸的地方
ClearWillHappy.prototype._setElementStatus = function() {

    const {elementsListInfo, elementSize, line} = this;
    // console.log(selectElements);
    // selectElements.sort(function(a, b) {
    //     return b.y - a.y || -1;
    // })
    // selectElements.map(element=>{
    //     element.index = -1;
    //     element.visibile = false;
       
    //     for (let i = 0; i < elementsListInfo.length; i++) {
    //         elementsListInfo[i].forEach(item=>{
    //             if (item.x == element.x && item.y < element.y ) {
    //                 item.ty += elementSize;
    //             }
    //         })
    //     }
    // })
    
    // 用这种方式解决溢出的问题了，上面的方式可能是因为重复计算的原因
    // 现在可以正常降落了
    for (let len = elementsListInfo.length, i = len-1; i >= 0; i--) {
        elementsListInfo[i].forEach((item,col)=>{
            if (!item.visibile) {
                for (let k = i - 1; k >= 0; k--) {
                    elementsListInfo[k][col].ty += elementSize;
                }
            }
            
        })
    }

  



    console.log("执行了");
    // 自动移动，这里找出每个元素的下层有几个空格，计算距离后添加到每个元素的身上
    // 另一个思路，这里已经找到了这些要爆炸的元素，而且这些元素肯定是连续的，所以可以考虑通过这些元素来处理
    // 
    // 就用上面这个思路试一试
    // 1、先排序，按照行从大到小排
    
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
            elementsListInfo[x][y].index = -1;
            elementsListInfo[x][y].visibile = false;
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
        elementsListInfo[targetX][targetY].index = -1;
        elementsListInfo[targetX][targetY].visibile = false;
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
    let bombBall = [];
    for (let i = 0; i < elementsListInfo.length; i++) {
        let elements = elementsListInfo[i];
        elements.forEach((element, key)=>{
            if (element.visibile) {
               let temp = this._breakElement(i, key);
               if (temp) {
                    bombBall = bombBall.concat(temp);
               }
            }
            
        })
    }
    this._setElementStatus();
    console.timeEnd("递归时间");
}

// 自动补全的功能
// 爆炸后自动填充爆炸的空格
ClearWillHappy.prototype._addAuto = function() {

}


export default ClearWillHappy;