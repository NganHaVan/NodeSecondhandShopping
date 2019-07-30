const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");

function backdropClickHandler() {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
}

function menuToggleClickHandler() {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
}

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);

const uploadButton = document.querySelector(".browse-btn");
const fileInfo = document.querySelector(".file-info");
const realInput = document.getElementById("image");

uploadButton.addEventListener("click", e => {
  e.preventDefault();
  realInput.click();
});

function previewFile() {
  var preview = document.querySelector("#productImage");
  var file = document.querySelector("input[type=file]").files[0];
  var reader = new FileReader();

  reader.onloadend = function() {
    preview.src = reader.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

realInput.addEventListener("change", () => {
  const name = realInput.value.split(/\\|\//).pop();
  const truncated = name.length > 20 ? name.substr(name.length - 20) : name;
  const image = document.getElementById("productImage");
  if (!image) {
    let productImage = document.createElement("img");
    productImage.setAttribute("id", "productImage");
    productImage.setAttribute("width", 320);
    productImage.setAttribute("height", 240);
    let form = document.getElementsByClassName("form-control-product");
    form[3].insertBefore(productImage, form[3].children[1]);
  }
  previewFile();
  fileInfo.innerHTML = truncated;
});
