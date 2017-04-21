/**
 * Created by proto on 2017/4/20.
 */

function Element({dom, size}) {
    this.dom = dom;
    this.size = size;
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotate = 0;
}
Element.prototype.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.rotate(this.rotate);
    ctx.drawImage(this.dom, 0, 0, this.size, this.size);
    ctx.closePath();
    ctx.restore();
};

export default Element