const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector("#browseBtn");
const fileinput = document.querySelector("#fileInput");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#progressPercent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURL = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");
const maxAllowedSize = 100 * 1024 * 1024; //100MB




const host = "https://file-sharing-backend.onrender.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;


dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();

         
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged")
    }
})

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged")
})

dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.log(files);
    if(files.length){
        fileinput.files = files;
        uploadFile();
    }

})

fileinput.addEventListener("change", () => {
    uploadFile();
})


browseBtn.addEventListener("click", (e) => {
    fileinput.click();
})



copyBtn.addEventListener("click", () => {
    fileURL.select();
    document.execCommand("copy");
    showToast("Link Copied")

})

const uploadFile = () => {
    if(fileinput.files.length > 1){
        resetFileInput()
        showToast("Only Upload 1 File!");
        return;
    }
    const file = fileinput.files[0];
    // console.log(file);
    // console.log(file.size)
    if(file.size > maxAllowedSize){
        showToast("Can't Upload more than 100MB");
        resetFileInput();
        return;
    }
    progressContainer.style.display = "block";
    const formData = new FormData();
    formData.append("myfile",file);


    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        // console.log(xhr.readyState);
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    }

    xhr.upload.onprogress = uploadProgress;
    xhr.upload.onerror = () => {
        resetFileInput()
        showToast(`Error in upload: ${xhr.statusText}`)
    }


    xhr.open("POST", uploadURL);
    xhr.send(formData);

}



const uploadProgress = (event) => {
    let percent = Math.round((100 * event.loaded) / event.total);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
}

const onUploadSuccess = ({file: url}) => {
    resetFileInput()
    emailForm.removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileURL.value = url;
}

const resetFileInput = () => {
    fileinput.value = "";
    
}

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const url = fileURL.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    }
    emailForm[2].setAttribute("disabled", "true");
    console.log(formData);
    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",

        },
        body:JSON.stringify(formData),
    }).then((res) => res.json()).then(({success}) => {
        if(success){
            sharingContainer.style.display = "none";
            showToast("Email Sent")
        }
    })
})

let toastTimer;
const showToast = (msg) => {
    console.log(msg);
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  };
