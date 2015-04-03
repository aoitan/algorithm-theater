// vim: set ts=2 sts=2 sw=2
// jshint esnext:true, moz:true, latedef:true
// global document

/**********************************************************
 * Util
 **********************************************************/
var INPUT_ARRAY = [];
var sortingArray = [];
var INTERVAL = 20;
var ARRAY_NUM = 200;
var INITFREQ = 3000;
var INITVOL = 0.001;
var MAXFREQ = 6000;

var audio = {
  context: null,
  oscillator: null,
  gainNode: null
};

function draw(arr) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  var maxHeight = arr.length * 2;

  for (var i = 0; i < arr.length; ++i) {
    ctx.fillRect(i * 2, maxHeight - arr[i] * 2, 2, 2);
  }
}

function rand(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function swap(arr, l, r) {
  var tmp = arr[l];
  arr[l] = arr[r];
  arr[r] = tmp;
  //console.log('l=' + arr[l] + ', r=' + arr[r] + ', arr=' + arr.toString());
}

function swapif(arr, l, r) {
  if (arr[l] > arr[r]) {
    swap(arr, l, r);
    return true;
  }
  return false;
}

function rotateRight(arr, pos, size) {
  var tmp = arr[pos + size - 1];
  for (var i = pos + size - 1; i > pos; --i) {
    swap(arr, i - 1, i);
  }
  arr[pos] = tmp;
}

function median(a, b ,c) {
  if (a < b && a < c) { 
    if (b < c) {
      return b;
    } else {
      return c;
    }
  } else if (b < a && b < c) {
    if (a < c) {
      return a;
    } else {
      return c;
    }
  } else if (c < a && c < b) {
    if (a < c) {
      return a;
    } else {
      return c;
    }
  }

  return -1;
}

function shuffle(arr) {
  for (var i = 0; i < arr.length; ++i) {
    var s = rand(i, arr.length);
    swap(arr, i, s);
  }
}

function expression(i) {
  // 可視化
  draw(sortingArray);

  // 音を変える
  audio.oscillator.frequency.value = (i / ARRAY_NUM) * MAXFREQ;
}

/**********************************************************
 * Init
 **********************************************************/
function initArray() {
  INPUT_ARRAY = [];
  for (var i = 0; i < ARRAY_NUM; ++i) {
    INPUT_ARRAY[i] = i;
  }
  shuffle(INPUT_ARRAY);
}

function initCanvas() {
  draw(INPUT_ARRAY);
  sortingArray = INPUT_ARRAY.slice(0);
}

function initAudio() {
  // Web Audio APIの状態管理オブジェクトを生成
  audio.context = new AudioContext();

  // オシレータとゲインを生成
  audio.oscillator = audio.context.createOscillator();
  audio.gainNode = audio.context.createGain();

  // オシレータとゲインをスピーカにつなぐ
  audio.oscillator.connect(audio.gainNode);

  // オシレータオプションを設定する
  audio.oscillator.type = 'square'; // 矩形波
  audio.oscillator.frequency.value = INITFREQ; // 発振周波数(Hz単位)
  audio.oscillator.detune.value = 100; // デチューン設定(セント単位)
  audio.oscillator.start();

  audio.oscillator.onended = function() {
    console.log('再生停止');
  }

  // ゲインを設定する
  audio.gainNode.gain.value = INITVOL;
}

function init() {
  initArray();
  initCanvas();
  initAudio();
}

document.addEventListener('DOMContentLoaded', init);

// ボタン
document.getElementById('bubble').addEventListener('click', bubbleButton);
document.getElementById('shaker').addEventListener('click', shakerButton);
document.getElementById('quick').addEventListener('click', quickButton);
document.getElementById('merge').addEventListener('click', mergeButton);
document.getElementById('comb').addEventListener('click', combButton);
document.getElementById('selection').addEventListener('click', selectionButton);
document.getElementById('insertion').addEventListener('click', insertionButton);
document.getElementById('binaryInsertion').addEventListener('click', binaryInsertionButton);
document.getElementById('reset').addEventListener('click', initCanvas);
document.getElementById('test').addEventListener('click', testButton);

// 設定
document.getElementById('num-select').addEventListener('change', changeNum);
document.getElementById('num-interval').addEventListener('change', changeInterval);

/**********************************************************
 * Settings
 **********************************************************/
function changeNum(event) {
  ARRAY_NUM = parseInt(event.target.value);
  init();
}

function changeInterval(event) {
  INTERVAL = parseInt(event.target.value);
}

/**********************************************************
 * test
 **********************************************************/
function testButton() {
  var test = [0, 2, 3, 4, 6, 7, 9];
}

/**********************************************************
 * Bubble Sort
 **********************************************************/
var bubbleId;
function* bubbleSort(arr) {
  audio.gainNode.connect(audio.context.destination);
  for (var l = 0; l < arr.length; ++l) {
    for (var j = 0; j < arr.length - l; ++j) {
      swapif(arr, j - 1, j);
      yield j;
    }
  }
  clearInterval(bubbleId);
  console.timeEnd('bubble');
  audio.gainNode.disconnect(audio.context.destination);
}

function bubbleButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('bubble');
  var bubble = bubbleSort(sortingArray);
  bubbleId = setInterval(()=> {
    var current = bubble.next();
    expression(current.value);
  }, INTERVAL);
}

/**********************************************************
 * Shaker Sort
 **********************************************************/
var shakerId;
function* shakerSort(arr) {
  audio.gainNode.connect(audio.context.destination);
  for (var s = 0, e = arr.length; s < e; ++s, --e) {
    for (var j = s; j < e; ++j) {
      swapif(arr, j - 1, j);
      yield j;
    }
    for (var k = e - 1; k >= s; --k) {
      swapif(arr, k - 1, k);
      yield k;
    }
  }
  clearInterval(shakerId);
  console.timeEnd('shaker');
  audio.gainNode.disconnect(audio.context.destination);
}

function shakerButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('shaker');
  var shaker = shakerSort(sortingArray);
  shakerId = setInterval(() => {
    var current = shaker.next();
    expression(current.value);
  }, INTERVAL);
}

/**********************************************************
 * Quick Sort
 **********************************************************/
function* quickSort(arr, low, up, depth) {
  if (up - low < 2) {
    return;
  }

  var p = arr[Math.floor((up - low) / 2 + low)];

  var i = low, j = up - 1;
  while (true) {
    for (; i < up; ++i) {
      if (arr[i] >= p) break;
      yield i;
    }
    for (; j >= low; --j) {
      if (arr[j] <= p) break;
      yield j;
    }
    if (i < j) {
      swap(arr, i, j);
      ++i; --j;
    } else {
      break;
    }
  }
  yield* quickSort(arr, low, i, depth + 1);
  yield* quickSort(arr, i, up, depth + 1);
  if (depth === 0) {
    audio.gainNode.disconnect(audio.context.destination);
    console.timeEnd('quick');
    clearInterval(quickId);
  }
}

function quickButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('quick');
  var quick = quickSort(sortingArray, 0, sortingArray.length, 0);
  audio.gainNode.connect(audio.context.destination);
  quickId = setInterval(() => {
    var current = quick.next();
    expression(current.value);
  }, INTERVAL);
}

/**********************************************************
 * Merge Sort
 **********************************************************/
function* merge(arr, low1, up1, low2, up2) {
  for (var i = low1, j = low2; i < up2 && j < up2 && i < j; ++i) {
    if (arr[i] > arr[j]) {
      rotateRight(arr, i, j - i + 1);
      ++j;
    }
    yield i;
  }
}

function* mergeSort(arr, low, up, depth) {
  var half = Math.floor((up - low) / 2 + low);
  if (up - low > 2) {
    yield* mergeSort(arr, low, half, depth + 1);
    yield* mergeSort(arr, half, up, depth + 1);
  } else {
    swapif(arr, low, up);
    yield low;
  }

  yield* merge(arr, low, half, half, up);

  if (depth === 0) {
    audio.gainNode.disconnect(audio.context.destination);
    console.timeEnd('merge');
    clearInterval(mergeId);
  }
}

function mergeButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('merge');
  var merge = mergeSort(sortingArray, 0, sortingArray.length, 0);
  audio.gainNode.connect(audio.context.destination);
  mergeId = setInterval(() => {
    var current = merge.next();
    expression(current.value);
  }, INTERVAL);
}


/**********************************************************
 * Comb Sort
 **********************************************************/
var combId;
function* combSort(arr) {
  var h = Math.floor(arr.length / 1.3);

  while (true) {
    var swaped = false;
    for (var i = 0; i + h < arr.length; ++i) {
      if (arr[i] > arr[i + h]) {
        swap(arr, i, i + h);
        swaped = true;
      }
      yield i;
    }
    if (h <= 1) {
      if (!swaped) {
        break;
      }
    } else {
      h = Math.floor(h / 1.3);
    }
  }
  clearInterval(combId);
  console.timeEnd('comb');
  audio.gainNode.disconnect(audio.context.destination);
}

function combButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('comb');
  var comb = combSort(sortingArray);
  audio.gainNode.connect(audio.context.destination);
  combId = setInterval(() => {
    var current = comb.next();
    expression(current.value);
  }, INTERVAL);
}

/**********************************************************
 * Selection Sort
 **********************************************************/
var selectionId;
function* selectionSort(arr) {
  for (var i = 0; i < arr.length; ++i) {
    var min = i;
    for (var j = i + 1; j < arr.length; ++j) {
      if (arr[j] < arr[min]) {
        min = j;
      }
      yield min;
    }
    swapif(arr, i, min);
  }
  clearInterval(selectionId);
  console.timeEnd('selection');
  audio.gainNode.disconnect(audio.context.destination);
}

function selectionButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('selection');
  var selection = selectionSort(sortingArray);
  audio.gainNode.connect(audio.context.destination);
  selectionId = setInterval(() => {
    var current = selection.next();
    expression(current.value);
  }, INTERVAL);
}

/**********************************************************
 * Insertion Sort
 **********************************************************/
var insertionId;
function* insertionSort(arr) {
  for (var i = 1; i < arr.length; ++i) {
    var tmp = arr[i];
    if (arr[i - 1] > tmp) {
      var j = i;
      do {
        arr[j] = arr[j - 1];
        --j;
        yield j;
      } while (j > 0 && arr[j - 1] > tmp);
      arr[j] = tmp;
    }
  }
  clearInterval(insertionId);
  console.timeEnd('insertion');
  audio.gainNode.disconnect(audio.context.destination);
}

function insertionButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('insertion');
  var insertion = insertionSort(sortingArray);
  audio.gainNode.connect(audio.context.destination);
  insertionId = setInterval(() => {
    var current = insertion.next();
    expression(current.value);
  }, INTERVAL);
}

/**********************************************************
 * Binary Insertion Sort
 **********************************************************/
function* binarySearch(arr, low, up, value) {
  var range = up - low;
  while (range > 1) {
    var pos = low + Math.floor(range / 2);
    if (arr[pos] > value) {
      up = pos;
    } else {
      low = pos;
    }
    range = up - low;
    yield pos;
  }

  if (arr[low] < value) {
    return low +1;
  } else {
    return low;
  }
}

var binaryInsertionId;
function* binaryInsertionSort(arr) {
  for (var i = 1; i < arr.length; ++i) {
    var tmp = arr[i];
    if (arr[i - 1] > tmp) {
      var j = yield* binarySearch(arr, 0, i, tmp);
      rotateRight(arr, j, i - j + 1);
    }
    yield i;
  }
  clearInterval(binaryInsertionId);
  console.timeEnd('binaryInsertion');
  audio.gainNode.disconnect(audio.context.destination);
}

function binaryInsertionButton() {
  sortingArray = INPUT_ARRAY.slice(0);
  console.time('binaryInsertion');
  var binaryInsertion = binaryInsertionSort(sortingArray);
  audio.gainNode.connect(audio.context.destination);
  binaryInsertionId = setInterval(() => {
    var current = binaryInsertion.next();
    expression(current.value);
  }, INTERVAL);
}




