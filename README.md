# 消消乐
## 1、使用说明 
> 使用了webpack作为构建工具，webpack-dev-server热加载。部分代码用了ES6，有些语法糖用起来还是非常爽的了😁，大部分还是ES5了。绘图用的canvas
* npm install
* npm run dev // 本地调试
* npm run build // 打包生成代码
* localhost:8080 访问

## 2、开发记录
> 写完了一个东西要沉淀了，这样才能更快的进步，**警告！！以下文字主要是自己记录的，可能有错误**。哈哈哈，我知道，其实也没人看
1. 代码结构
> 主入口是app里面main.js，两个画图的类，ball.js是一个画爆炸的球的类，element.js是画游戏的元素类，两个大同小异了，其他的都是一些工具的方法了
```javascript
function Ball(radius = 5, color="red") {
    this.radius = radius;
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotate = 0;
    this.color = color;
}

Ball.prototype.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.rotate(this.rotate);
    ctx.fillStyle = this.color;
    ctx.arc(0, 0, this.radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
};

```

2. 创建好面板,类似于网格之类的东西了
> 这部分功能代码实现了，但是后期并没有放上去了，因为感觉没必要。不过前期作为参考还是挺好的,写的时候定义好列和行，然后画出来就行了。遇到个坑,边线总是会比其他的地方细点，我后来设计成游戏是个box,比方说0.9倍的canvas的大小，然后移动距离就行了,网上说像右移动0.5个像素也能解决
``` javascript
this.column = 10; // 列
this.line = 12;  // 行
this.elementSize = Math.floor((WIDTH-10) / this.column); // 每个元素的大小，这里简单考虑，就当正方形考虑了


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
```
3. 绘制游戏中的元素
> 先构建数据，以一个二维数组的形式，具体的每个元素是个对象了，里面存了一些属性。这些属性也不是开始就能一次性想到的了，都是后来感觉需要这些，然后就慢慢加上去的。
>> 首先每个数组里面都有个存储了Element对象实例的方法，后面画的时候直接用这个实例的draw方法就行了

>> index这个属性的作用比较多了（后期考虑还是得抽出来），首先可以用来获取要绘制图片的dom信息，因为drawImage第一个参数是img的dom,考虑到每个元素带上这个属性数据有点大了，就干脆存个key值了，用的时候查找就行了。后来发现这个值还是挺重要的，后面查找的时候要通过这个值来判断元素是否相等了，绘制爆炸小球的时候也是根据这个值.

>> visible这个属性前面是考虑到所有的地方都根据index的值来判断有些数据处理不过来，还需要一个属性来控制游戏中的某个元素是否能被显示出来，这方面的逻辑有点混乱，先这样理解。

>> x,y代表元素的位置，根据这两个值可以确定元素现在的位置

>> ty是后面增加的，代表元素要移动的位置，默认是等于y,当它下面有元素爆炸的时候，ty就会加上这个元素的大小了，然后y每次的目标都会移动到这个位置

>>  vy速度，每个元素向下移动时的速度，这里都设置成1了

>> color 爆炸的时候显示的颜色

>> isBomb bool类型的值，后面代码加上去的，用来控制爆炸过的元素只会绘制一次

>> v 搜索的时候加上去的，用来标识某个元素是否已经被搜索过

>> px,py前期用来存取数组的键，后面发现当元素移动的时候就有点尴尬了，位置也要改变，有点麻烦。后面弃用了



```javascript
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
console.timeEnd("初始化时间");
```

> 开始画游戏的元素，我这里画用的是drawImage函数的方法，canvas对于高屏的手机有个坑，画出来的图片会模糊，[html5 canvas绘制图片模糊的问题](https://segmentfault.com/q/1010000002391424),这篇博客有解决办法。这里我直接把这个问题忽略了😅，本着主要以实现功能为主的目的，好吧，这是借口。我另一个项目上还是用到了这个方法的
```
<canvas width="320" height="180" style="width:160px;height:90px;"></canvas>
```
> 就是把canvas的width和height设置成原先的两倍，这样设置后你其他地方也要改变了，比方说你画线，原本moveTo(0, 0), lineTo(100, 100)现在不会画到100， 100了，在屏幕上看是50，50的坐标。当你要实现鼠标点击准确定位到哪里的话，点击的位置都要乘以2。确实很麻烦。
> 然后画就简单了，把上面配置好的二维数组构建遍历下就行了，里面的一些判断后面在探讨。电脑充电线落在公司了，电脑没电了。下次继续更新
```javascript
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
```