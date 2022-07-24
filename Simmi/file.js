/************************************************
 * 
 *  DOM Code and event handlers 
 * 
************************************************/

const fileInput = document.getElementById("file-input");
const fileSelectBtn = document.getElementById("trigger-file-input")
fileSelectBtn.addEventListener('click', () => fileInput.dispatchEvent(new MouseEvent('click')))
// fileSelectBtn.addEventListener('click', () => fileInput.click())
var selectedFile, fileAndFolderPaths, jsonObj = [];

//
// File Change Event Handler
//
fileInput.onchange = async () => {
  try {
    initializeJSTree()
    selectedFile = fileInput.files[0];
    // console.log(inp.files)
    await load_files();
  } catch (error) {
    alert(error);
  }
};


/************************************************
 * 
 *  Zip File Handling Funtions 
 * 
************************************************/


// Function to load files 

async function load_files() {
  fileAndFolderPaths = await new zip.ZipReader(
    new zip.BlobReader(selectedFile)
  ).getEntries();

  let parentArr = [], parentObj = {}, dataObj = [];

  for (let i = 0; i < fileAndFolderPaths.length; i++) {
    parentArr = [...parentArr, fileAndFolderPaths[i].filename];
  }
  parentArr.forEach((p) =>
    p.split("/").reduce((o, k) => (o[k] = o[k] || {}), parentObj)
  );
  deepIterator(parentObj, '#');
  function deepIterator(target, desiredKey) {
    // console.log(target)
    if (
      typeof target === "object" &&
      target &&
      Object.keys(target).length > 0
    ) {
      for (const key in target) {
        // console.log(target)
        if (key !== "") {
          console.log(key)
          deepIterator(target[key], key + desiredKey);
          dataObj = [...dataObj, { id: key + desiredKey, parent: desiredKey, text: key }];
          // console.log(dataObj);
        }
      }
    } else {
      // console.log(target);

    }
  }

  jsonObj = JSON.stringify(dataObj);
  jsonObj = JSON.parse(jsonObj);

  //console.log(jsonObj);

  reDrawJSTree()

  $('#jstree_demo_div').bind('loaded.jstree', function (e, data) {
    console.log(true)

  })
  $('#jstree_demo_div').bind("dblclick.jstree", function (event) {
    var tree = $(this).jstree();
    var node = tree.get_node(event.target);
    var nodePath = tree.get_path(node).join("/");
    if (node.children.length > 0 && node.children) {
      console.log("has child")
    }
    else {
      downloadFile
    }
  });


}


function initializeJSTree() {
  console.log
  $("#jstree_demo_div").jstree({
    core: {
      data: jsonObj,
      multiple: false,
    },
    "plugins": ["unique"]
    // "checkbox", "contextmenu", "dnd", 
  });
}

function reDrawJSTree() {
  $('#jstree_demo_div').jstree(true).settings.core.data = jsonObj;
  $('#jstree_demo_div').jstree(true).refresh();
}
// Function to download files

async function downloadFile(event) {
  const target = event.target;
  let href = target.getAttribute("href");
  if (target.dataset.entryIndex !== undefined && !target.download && !href) {
    target.removeAttribute("href");
    event.preventDefault();
    try {
      await download(entries[Number(target.dataset.entryIndex)], target.parentElement.parentElement, target);
      href = target.getAttribute("href");
    } catch (error) {
      alert(error);
    }
    target.setAttribute("href", href);
  }
}

async function download(entry, li, a) {
  if (!li.classList.contains("busy")) {
    const unzipProgress = document.createElement("progress");
    li.appendChild(unzipProgress);
    const controller = new AbortController();
    const signal = controller.signal;
    const abortButton = document.createElement("button");
    abortButton.onclick = () => controller.abort();
    abortButton.textContent = "✖";
    abortButton.title = "Abort";
    li.querySelector(".filename-container").appendChild(abortButton);
    li.classList.add("busy");
    li.onclick = event => event.preventDefault();
    try {
      const blobURL = await model.getURL(entry, {
        password: passwordInput.value,
        onprogress: (index, max) => {
          unzipProgress.value = index;
          unzipProgress.max = max;
        },
        signal
      });
      a.href = blobURL;
      a.download = entry.filename;
      const clickEvent = new MouseEvent("click");
      a.dispatchEvent(clickEvent);
    } catch (error) {
      if (error.message != zip.ERR_ABORT) {
        throw error;
      }
    } finally {
      li.classList.remove("busy");
      unzipProgress.remove();
      abortButton.remove();
    }
  }
}
