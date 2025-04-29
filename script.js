let defaultTxtSize = parseFloat(getComputedStyle(document.body).fontSize);
let txtSize = .85*defaultTxtSize;
let words = [];
let lines = [];
let default_font = "stars";
let mouse_font = "raritas";
let maxLineWidth;
let lineHeight = txtSize * 1.2;
let hoverDuration = 8000; // time to keep font changed

function setup() {
  createCanvas(windowWidth, windowHeight);

  // get poem text
  let textElement = document.querySelector(".text-block");
  let textBlock = textElement.innerText; 
  textElement.style.display = "none"; // hide original text, use p5.js rendering
  // set style
  textSize(txtSize);
  maxLineWidth = width / 2;
  // see function
  wrapText(textBlock);
}

function draw() {
  // colors
  background(255);
  fill("#4A2545");
  // center vertically
  let totalTextHeight = lines.length * lineHeight;
  let yOffset = (height - totalTextHeight) / 2; 
  // track time
  let currentTime = millis();

  for (let i = 0; i < lines.length; i++) {
    let lineWidth = lines[i].reduce(
      (sum, word) => sum + textWidth(word.msg) + txtSize * 0.2,
      0
    );
    // center horizontally
    let xOffset = (width - lineWidth) / 2;

    for (let j = 0; j < lines[i].length; j++) {
      let word = lines[i][j];

      let bboxDefault = getBoundBox(word.msg, xOffset, yOffset, default_font);
      let bboxMouse = getBoundBox(word.msg, xOffset, yOffset, mouse_font);
      let maxBBox = getMaxBBox(bboxDefault, bboxMouse);

      if (mouseInRect(maxBBox.x, maxBBox.y, maxBBox.w, maxBBox.h)) {
        word.lastHovered = millis();
      }

      if (word.lastHovered && currentTime - word.lastHovered < hoverDuration) {
        word.font = mouse_font;
      } else {
        word.font = default_font;
      }

      textFont(word.font);
      let bbox = getBoundBox(word.msg, xOffset, yOffset, word.font);
      word.bbox = bbox;

      text(word.msg, xOffset, yOffset);

      xOffset += bbox.w + txtSize * 0.2;
    }

    yOffset += lineHeight;
  }
}

// break text into lines based on maxWidth
function wrapText(txt) {
  words = [];
  lines = [];
  // split into individual words
  let rawWords = split(txt, " ");
  // fill in lines until maxWidth is reached, basically
  let currentLine = [];
  let currentLineWidth = 0;
  for (let i = 0; i < rawWords.length; i++) {
    textFont(default_font);
    let wordWidth = textWidth(rawWords[i]);
    // if adding this word exceeds max width, start a new line
    if (currentLineWidth + wordWidth > maxLineWidth) {
      lines.push(currentLine);
      currentLine = [];
      currentLineWidth = 0;
    }
    currentLine.push({ msg: rawWords[i], font: default_font, lastHovered: 0 });
    currentLineWidth += wordWidth + txtSize * 0.2; // add spacing
  }
  // add last line if any words remain
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
}

// check if mouse is inside bounding box
function mouseInRect(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

// get bounding box for text with given font
function getBoundBox(txt, x, y, font) {
  textFont(font);
  let w = textWidth(txt);
  let h = txtSize;
  let y_fixed = y - h + txtSize / 10;
  return { x: x, y: y_fixed, w: w, h: h };
}

// get the larger bounding box
function getMaxBBox(bbox1, bbox2) {
  return {
    x: Math.min(bbox1.x, bbox2.x),
    y: Math.min(bbox1.y, bbox2.y),
    w: Math.max(bbox1.w, bbox2.w),
    h: Math.max(bbox1.h, bbox2.h),
  };
}
