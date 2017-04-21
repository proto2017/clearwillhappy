/**
 * Created by proto on 2017/4/20.
 */
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

export default Ball;
