/**
 * Created by proto on 2017/4/19.
 */

export const WIDTH = document.documentElement.clientWidth;
export const HEIGHT = document.documentElement.clientHeight;

export function randNum(min, max, step) {
    let rand = Math.random() * (max - min) + min;
    return rand < 0 ? rand - step : rand + step;
}