let wordsFound = new Array();
const editor = document.querySelector("#search");
editor.addEventListener("input", updateEditor);
function objectDefaultArray() {
  const sampleObject = {
    shirts: {
      "t-shirts": ["t-shirts one", "t-shirts two", "t-shirts three"],
      "sleeve-shirts": [
        "sleeve-shirts one",
        "sleeve-shirts two",
        "sleeve-shirts three",
      ],
    },
    pants: {
      dress: ["dress one", "dress two", "dress three"],
      jeans: ["jeans one", "jeans two", "jeans three"],
      general: ["term one", "term two", "three"],
    },
  };
  document.querySelector("#getArray").value = JSON.stringify(sampleObject);
}

function searchBoxInit() {
  const ele = document.querySelector("#search");

  // Get the placeholder attribute
  const placeholder = ele.getAttribute("data-placeholder");

  // Set the placeholder as initial content if it's empty
  ele.innerHTML === "" && (ele.innerHTML = placeholder);

  ele.addEventListener("focus", function (e) {
    const value = e.target.innerHTML;
    value === placeholder && (e.target.innerHTML = "");
  });

  ele.addEventListener("blur", function (e) {
    const value = e.target.innerHTML;
    value === "" && (e.target.innerHTML = placeholder);
  });
  ele.addEventListener("input", function (e) {
    // wordsFound = [];
    // foundElement(e.target.innerText);
  });
}
function search(query, object) {
  const result = {};

  // Loop over the properties in the object
  for (const property in object) {
    const value = object[property];

    if (typeof value === "object") {
      // If the property value is an object, call the search function recursively
      const subResult = search(query, value);
      if (Object.keys(subResult).length > 0) {
        // If the sub-result is not empty, add it to the result object
        result[property] = subResult;
      }
    } else {
      // If the property value is a string, check if it contains the search query
      if (query.toString().toLowerCase().includes(value.toLowerCase())) {
        wordsFound.push(value);
        result[property] = value;
      }
    }
  }

  return result;
}
function foundElement(str) {
  const found = search(
    str,
    JSON.parse(document.querySelector("#getArray").value)
  );

  if (!(Object.keys(found).length === 0)) {
    document.querySelector("#resultObject").innerHTML = JSON.stringify(found);
    document.querySelector("#wordsFound").innerHTML = JSON.stringify(
      wordsFound.join(",")
    );
  } else {
    document.querySelector("#resultObject").innerHTML = "";
    document.querySelector("#wordsFound").innerHTML = "";
  }
}

function getTextSegments(element) {
  const textSegments = [];
  Array.from(element.childNodes).forEach((node) => {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        textSegments.push({ text: node.nodeValue, node });
        break;

      case Node.ELEMENT_NODE:
        textSegments.splice(textSegments.length, 0, ...getTextSegments(node));
        break;

      default:
        throw new Error(`Unexpected node type: ${node.nodeType}`);
    }
  });
  return textSegments;
}

function updateEditor() {
  const sel = window.getSelection();
  const textSegments = getTextSegments(editor);
  const textContent = textSegments.map(({ text }) => text).join("");
  let anchorIndex = null;
  let focusIndex = null;
  let currentIndex = 0;
  textSegments.forEach(({ text, node }) => {
    if (node === sel.anchorNode) {
      anchorIndex = currentIndex + sel.anchorOffset;
    }
    if (node === sel.focusNode) {
      focusIndex = currentIndex + sel.focusOffset;
    }
    currentIndex += text.length;
  });
  console.log(textContent);
  wordsFound = [];
  foundElement(textContent);
  editor.innerHTML = renderText(textContent);

  restoreSelection(anchorIndex, focusIndex);
}

function restoreSelection(absoluteAnchorIndex, absoluteFocusIndex) {
  const sel = window.getSelection();
  const textSegments = getTextSegments(editor);
  let anchorNode = editor;
  let anchorIndex = 0;
  let focusNode = editor;
  let focusIndex = 0;
  let currentIndex = 0;
  textSegments.forEach(({ text, node }) => {
    const startIndexOfNode = currentIndex;
    const endIndexOfNode = startIndexOfNode + text.length;
    if (
      startIndexOfNode <= absoluteAnchorIndex &&
      absoluteAnchorIndex <= endIndexOfNode
    ) {
      anchorNode = node;
      anchorIndex = absoluteAnchorIndex - startIndexOfNode;
    }
    if (
      startIndexOfNode <= absoluteFocusIndex &&
      absoluteFocusIndex <= endIndexOfNode
    ) {
      focusNode = node;
      focusIndex = absoluteFocusIndex - startIndexOfNode;
    }
    currentIndex += text.length;
  });

  sel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
}

function renderText(text) {
  wordsFound.forEach((item) => {
    let word = item;
    let position = text.indexOf(word);

    let positions = [];

    while (position !== -1) {
      // loop to find all occurrences of the word in the text
      positions.push(position); // add the position of the word to an array
      position = text.indexOf(word, position + 1); // search for the word again from the next position
    }
    if (positions.length > 0) {
      // check if the word exists in the text
      let newSentence = "";
      let prevPosition = 0;

      for (let i = 0; i < positions.length; i++) {
        // loop through all positions of the word
        let currentPosition = positions[i];
        newSentence +=
          text.substring(prevPosition, currentPosition) +
          `<span style='background-color:yellow'>${word}</span>`;
        prevPosition = currentPosition + word.length;
      }

      newSentence += text.substring(prevPosition); // add the remaining part of the text
      text = newSentence;
    }
  });
  return text;
}

objectDefaultArray();
updateEditor();
// searchBoxInit();
