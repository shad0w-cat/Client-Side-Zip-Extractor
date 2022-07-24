const inp = document.getElementById("text-field");
var selectedfile, file_names;
inp.onchange = async () => {
    try {
        selectedfile = inp.files[0];
        await load_files();
    }
    catch (error) { alert(error); }
};

async function load_files() {
    file_names = await (new zip.ZipReader(new zip.BlobReader(selectedfile))).getEntries();
    console.log(file_names.length);
    /*for (let i = 0; i < file_names.length; i++){
        //console.log(file_names[i]);
        if (file_names[i].filename )
    }*/
    //console.log(file_names[0]);
    $('#jstree_demo_div').jstree(file_names);

}



// (() => {

//     if (typeof TransformStream == "undefined") {
//         const script = document.createElement("script");
//         script.src = "lib/web-streams-polyfill.min.js";
//         document.body.appendChild(script);
//     }

//     const model = (() => {

//         return {
//             getEntries(file, options) {
//                 return (new zip.ZipReader(new zip.BlobReader(file))).getEntries(options);
//             },
//             async getURL(entry, options) {
//                 return URL.createObjectURL(await entry.getData(new zip.BlobWriter(), options));
//             }
//         };

//     })();

//     (() => {

//         const appContainer = document.getElementById("container");
//         const fileInput = document.getElementById("file-input");
//         let fileList = document.getElementById("file-list");
//         let entries;
//         let selectedFile;
//         fileInput.onchange = selectFile;
//         appContainer.onclick = downloadFile;

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

//         async function selectFile() {
//             try {
//                 fileInputButton.disabled = true;
//                 selectedFile = fileInput.files[0];
//                 await loadFiles();
//             } catch (error) {
//                 alert(error);
//             } finally {
//                 fileInputButton.disabled = false;
//                 fileInput.value = "";
//             }
//         }

//         async function loadFiles(filenameEncoding) {
//             entries = await model.getEntries(selectedFile, { filenameEncoding });
//             if (entries && entries.length) {
//                 fileList.classList.remove("empty");
//                 const filenamesUTF8 = Boolean(!entries.find(entry => !entry.filenameUTF8));
//                 const encrypted = Boolean(entries.find(entry => entry.encrypted));
//                 encodingInput.value = filenamesUTF8 ? "utf-8" : filenameEncoding || "cp437";
//                 encodingInput.disabled = filenamesUTF8;
//                 passwordInput.value = "";
//                 passwordInput.disabled = !encrypted;
//                 refreshList();
//             }
//         }

//         function refreshList() {
//             const newFileList = fileList.cloneNode();
//             entries.forEach((entry, entryIndex) => {
//                 const li = document.createElement("li");
//                 const filenameContainer = document.createElement("span");
//                 const filename = document.createElement("a");
//                 filenameContainer.classList.add("filename-container");
//                 li.appendChild(filenameContainer);
//                 filename.classList.add("filename");
//                 filename.dataset.entryIndex = entryIndex;
//                 filename.textContent = filename.title = entry.filename;
//                 filename.title = `${entry.filename}\n  Last modification date: ${entry.lastModDate.toLocaleString()}`;
//                 if (!entry.directory) {
//                     filename.href = "";
//                     filename.title += `\n  Uncompressed size: ${entry.uncompressedSize.toLocaleString()} bytes`;
//                 }
//                 filenameContainer.appendChild(filename);
//                 newFileList.appendChild(li);
//             });
//             fileList.replaceWith(newFileList);
//             fileList = newFileList;
//         }

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

//     })();

// })();
