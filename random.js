// vim: set ts=2 sts=2 sw=2
// jshint esnext:true, moz:true, latedef:true
// global document

document.addEventListener('DOMContentLoaded', init);

// ボタン
document.getElementById('uniform_1').addEventListener('click', uniform1Button);
document.getElementById('uniform_2_ave').addEventListener('click', uniform2AveButton);
document.getElementById('uniform_5_ave').addEventListener('click', uniform5AveButton);
document.getElementById('uniform_5_sma').addEventListener('click', uniform5SmaButton);
document.getElementById('box-muller').addEventListener('click', boxMullerButton);
document.getElementById('sqrt').addEventListener('click', sqrtButton);
document.getElementById('reset').addEventListener('click', init);
document.getElementById('test').addEventListener('click', testButton);

// 設定
document.getElementById('num-select').addEventListener('change', changeNum);
document.getElementById('loop-select').addEventListener('change', changeLoop);
document.getElementById('num-interval').addEventListener('change', changeInterval);

/**********************************************************
 * Util
 **********************************************************/
var HISTGRAM_ARRAY = [];
var SCATTER_ARRAY = [];
var INTERVAL = 0;
var RANGE_NUM = 100;
var LOOP_NUM = 1000;

function expand(value, low, high) {
  return Math.floor(value * (high - low) + low);
}
function rand(low, high) {
  return expand(Math.random(), low, high);
}

function drawScatter(arr, idx) {
  var canvas = document.getElementById('scatter');
  var ctx = canvas.getContext('2d');

  ctx.beginPath();

  var unitX = canvas.width / LOOP_NUM;
  var dotW = Math.ceil(unitX);
  var unitY = canvas.height / RANGE_NUM;
  var dotH = Math.ceil(unitY);
  var maxHeight = canvas.height;
  ctx.fillStyle = 'rgb(160,' + ((arr[idx] / RANGE_NUM) * 256) + ',160)';
  ctx.globalAlpha = 0.7;

  ctx.fillRect(idx * unitX, maxHeight - arr[idx] * unitY - unitY, dotW, dotH);
}

function drawHistgram(arr, idx) {
  var canvas = document.getElementById('histgram');
  var ctx = canvas.getContext('2d');

  ctx.beginPath();

  var dotW = Math.ceil(canvas.width / RANGE_NUM);
  var dotH = Math.ceil(canvas.height / LOOP_NUM);
  var maxHeight = canvas.height;
  ctx.fillStyle = 'rgb(160,' + ((idx / arr.length) * 256) + ',160)';
  ctx.globalAlpha = 0.7;

  ctx.fillRect(idx * dotW, maxHeight - arr[idx] * dotH - dotH, dotW, maxHeight);
}

/**********************************************************
 * Init
 **********************************************************/
function initArray() {
  HISTGRAM_ARRAY = [];
  for (var i = 0; i < RANGE_NUM; ++i) {
    HISTGRAM_ARRAY[i]  = 0;
  }

  SCATTER_ARRAY = [];
  for (var j = 0; j < LOOP_NUM; ++j) {
    SCATTER_ARRAY[j] = 0;
  }
}

function clearCanvas(canvas) {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initCanvas() {
  var hist = document.getElementById('histgram');
  clearCanvas(hist);
  var scat = document.getElementById('scatter');
  clearCanvas(scat);
}

function init() {
    initArray();
    initCanvas();
}

/**********************************************************
 * Settings
 **********************************************************/
function changeNum(event) {
  RANGE_NUM = parseInt(event.target.value);
  init();
}

function changeLoop(event) {
  LOOP_NUM = parseInt(event.target.value);
  init();
}

function changeInterval(event) {
  INTERVAL = parseInt(event.target.value);
}

/**********************************************************
 * test
 **********************************************************/
function testButton() {
}

/**********************************************************
 * 一様分布一回
 **********************************************************/
var uniform1Id;
function* uniform1(hist, scat) {
  for (var i = 0; i < LOOP_NUM; ++i) {
      var r = rand(0, hist.length);
      hist[r]++;
      scat[i] = r;
      yield i;
  }
  clearInterval(uniform1Id);
}

function uniform1Button() {
    init();
    var uniform1Iter = uniform1(HISTGRAM_ARRAY, SCATTER_ARRAY);
    uniform1Id = setInterval(() => {
        var c = uniform1Iter.next();
        drawHistgram(HISTGRAM_ARRAY, SCATTER_ARRAY[c.value]);
        drawScatter(SCATTER_ARRAY, c.value);
    }, INTERVAL);
}

/**********************************************************
 * 一様分布二回平均
 **********************************************************/
var uniform2aveId;
function* uniform2ave(hist, scat) {
  var len = hist.length;
  for (var i = 0; i < LOOP_NUM; ++i) {
      var r = Math.ceil((rand(0, len) + rand(0, len)) / 2);
      hist[r]++;
      scat[i] = r;
      yield i;
  }
  clearInterval(uniform2aveId);
}

function uniform2AveButton() {
    init();
    var uniform2aveIter = uniform2ave(HISTGRAM_ARRAY, SCATTER_ARRAY);
    uniform2aveId = setInterval(() => {
        var c = uniform2aveIter.next();
        drawHistgram(HISTGRAM_ARRAY, SCATTER_ARRAY[c.value]);
        drawScatter(SCATTER_ARRAY, c.value);
    }, INTERVAL);
}

/**********************************************************
 * 一様分布五回平均
 **********************************************************/
var uniform5aveId;
function* uniform5ave(hist, scat) {
  var len = hist.length;
  for (var i = 0; i < LOOP_NUM; ++i) {
      var r = Math.ceil((rand(0, len) + rand(0, len) + rand(0, len) + rand(0, len) + rand(0, len)) / 5);
      hist[r]++;
      scat[i] = r;
      yield i;
  }
  clearInterval(uniform5aveId);
}

function uniform5AveButton() {
    init();
    var uniform5aveIter = uniform5ave(HISTGRAM_ARRAY, SCATTER_ARRAY);
    uniform5aveId = setInterval(() => {
        var c = uniform5aveIter.next();
        drawHistgram(HISTGRAM_ARRAY, SCATTER_ARRAY[c.value]);
        drawScatter(SCATTER_ARRAY, c.value);
    }, INTERVAL);
}

/**********************************************************
 * 一様分布五回単純移動平均
 **********************************************************/
var uniform5smaId;
function* uniform5sma(hist, scat) {
  var len = hist.length;

  // 最初の4つを積む
  scat[0] = rand(0, len);
  scat[1] = rand(0, len);
  scat[2] = rand(0, len);
  scat[3] = rand(0, len);
  for (var i = 4; i < LOOP_NUM; ++i) {
      var r = Math.ceil((scat[i-4] + scat[i-3] + scat[i-2] + scat[i-1] + rand(0, len)) / 5);
      hist[r]++;
      scat[i] = r;
      yield i;
  }
  clearInterval(uniform5smaId);
}

function uniform5SmaButton() {
    init();
    var uniform5smaIter = uniform5sma(HISTGRAM_ARRAY, SCATTER_ARRAY);
    uniform5smaId = setInterval(() => {
        var c = uniform5smaIter.next();
        drawHistgram(HISTGRAM_ARRAY, SCATTER_ARRAY[c.value]);
        drawScatter(SCATTER_ARRAY, c.value);
    }, INTERVAL);
}


/**********************************************************
 * ボックス・ミューラー法
 **********************************************************/
var boxMullerId;
function* boxMuller(hist, scat) {
  var len = hist.length;

  for (var i = 0; i < LOOP_NUM; ++i) {
      var x = 1 - Math.random();
      var y = 1 - Math.random();
      var r = -2 * Math.log(x);
      var sr = Math.sqrt(r);
      var theta = 2 * Math.PI * y;
      var cosT = Math.cos(theta);
      var bm = sr * cosT / Math.PI / 2 + 0.5;
      var e = expand(bm, 0, len);
      console.log("x: " + x + ", y: " + y + ", r: " + r + ", sqrt(r): " + sr + ", theta: " + theta + ", cosT: " + cosT + ", bm: " + bm + ", result: " + e);
      hist[e]++;
      scat[i] = e;
      yield i;
  }
  clearInterval(boxMullerId);
}

function boxMullerButton() {
    init();
    var boxMullerIter = boxMuller(HISTGRAM_ARRAY, SCATTER_ARRAY);
    boxMullerId = setInterval(() => {
        var c = boxMullerIter.next();
        drawHistgram(HISTGRAM_ARRAY, SCATTER_ARRAY[c.value]);
        drawScatter(SCATTER_ARRAY, c.value);
    }, INTERVAL);
}


/**********************************************************
 * 一様分布の平方根
 **********************************************************/
var sqrtId;
function* sqrt(hist, scat) {
  var len = hist.length;

  for (var i = 0; i < LOOP_NUM; ++i) {
      var r = expand(Math.sqrt(Math.random()), 0, len);
      hist[r]++;
      scat[i] = r;
      yield i;
  }
  clearInterval(sqrtId);
}

function sqrtButton() {
    init();
    var sqrtIter = sqrt(HISTGRAM_ARRAY, SCATTER_ARRAY);
    sqrtId = setInterval(() => {
        var c = sqrtIter.next();
        drawHistgram(HISTGRAM_ARRAY, SCATTER_ARRAY[c.value]);
        drawScatter(SCATTER_ARRAY, c.value);
    }, INTERVAL);
}

