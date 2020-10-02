const body = document.querySelector("body");
const modal = document.querySelector(".modal");
let isTCModalOpened = false;

const openModal = () => {
  modal.classList.add("is-open");
  body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-open");
  body.style.overflow = "initial";
};

window.addEventListener("scroll", () => {
    if (window.scrollY > window.innerHeight / 3 && !isTCModalOpened) {
      isTCModalOpened = true;
    document.querySelector(".scroll-down").style.display = "none";
    openModal();
  }
});

document.querySelector(".modal-button").addEventListener("click", openModal);
document.querySelector(".close-button").addEventListener("click", closeModal);

document.onkeydown = evt => {
    evt = evt || window.event;
    switch (evt.keyCode) {
        case 27: closeModal(); break;
        case 37: openModal(); break;
        case 39: closeModal(); break;
    }
};