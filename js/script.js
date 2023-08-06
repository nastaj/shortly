"use strict";

const header = document.querySelector(".section-head");
const mobileNav = document.querySelector(".nav-mobile");
const mobileNavBtn = document.querySelector(".nav__mobile");
const shortener = document.querySelector(".shortener");
const linksList = document.querySelector(".links-list");
const form = document.querySelector(".shortener__form");
const input = document.querySelector(".shortener__input");
const btn = document.querySelector(".shortener__btn");

class App {
  #links = [];
  #link;
  #linkShortened;

  constructor() {
    this._getLocalStorage();

    mobileNavBtn.addEventListener("click", this._openNav.bind(this));
    mobileNav.addEventListener("click", this._hideNav.bind(this));
    form.addEventListener("submit", this._submitForm.bind(this));
  }

  _openNav() {
    mobileNav.classList.toggle("nav-mobile--hidden");
  }

  _hideNav(e) {
    const target = e.target;
    if (target.classList.contains("nav-mobile__item")) {
      mobileNav.classList.add("nav-mobile--hidden");
    }
  }

  async _submitForm(e) {
    try {
      e.preventDefault();
      this.#link = input.value;

      await this._shortenLink(this.#link);

      const linkObject = {
        original: this.#link,
        shortened: this.#linkShortened,
      };
      this.#links.push(linkObject);

      this._setLocalStorage();
      this._renderLink(this.#links);
      this._addHandlers();
      this._togglePopup("success", "Link successfully shortened!");
    } catch (err) {
      this._togglePopup("error", "There was a problem. Try another link!");
    }
  }

  async _shortenLink(link) {
    try {
      const response = await fetch(
        `https://api.shrtco.de/v2/shorten?url=${link}`
      );
      const data = await response.json();

      this.#linkShortened = data.result.full_short_link;
    } catch (err) {
      throw err;
    }
  }

  _renderLink() {
    const markup = this._generateMarkup(this.#linkShortened);

    linksList.insertAdjacentHTML("beforeend", markup);
  }

  _renderAllLinks() {
    this.#links.forEach((link) => {
      const markup = this._generateMarkup(link.shortened, link.original);

      linksList.insertAdjacentHTML("beforeend", markup);
    });
  }

  _generateMarkup(newLink, oldLink = "") {
    return `
    <div class="container links">
        <a href="${
          oldLink ? oldLink : this.#link
        }" class="links__before" target="_blank">${
      oldLink ? oldLink : this.#link
    }</a>
        <div class="links__after-box">
          <a href="${newLink}" class="links__after" target="_blank">${newLink}</a>
          <button class="btn-cta links__btn-copy">Copy</button>
        </div>
    </div>
    `;
  }

  _addHandlers() {
    const copyBtns = document.querySelectorAll(".links__btn-copy");
    copyBtns.forEach((btn) =>
      btn.addEventListener("click", this._copyToClipboard)
    );
  }

  async _copyToClipboard(e) {
    const copyBtns = document.querySelectorAll(".links__btn-copy");
    const btn = e.target;
    const link = btn
      .closest(".links")
      .querySelector(".links__after").textContent;

    copyBtns.forEach((btn) => {
      btn.classList.remove("links__btn-copy--active");
      btn.textContent = "Copy";
    });

    btn.classList.add("links__btn-copy--active");
    btn.textContent = "Copied!";

    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      this._togglePopup(
        "error",
        `Could not copy the link to clipboard: ${err}`
      );
    }
  }

  _togglePopup(state = "error", msg) {
    const markup = `
    <div class="popup ${
      state === "success" ? "success" : "error"
    }-popup new-popup">
      <p>${msg}</p>
    </div>
    `;
    header.insertAdjacentHTML("beforebegin", markup);

    const popups = document.querySelectorAll(".popup");
    popups.forEach((popup) => this._hidePopup(popup));
  }

  async _hidePopup(popup) {
    await this._pause(3);
    popup.classList.add("hide-popup");
    await this._pause(0.2);
    popup.style.visibility = "hidden";
    popup.remove();
  }

  _pause(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  _setLocalStorage() {
    localStorage.setItem("links", JSON.stringify(this.#links));
  }

  _getLocalStorage() {
    const dataLinks = JSON.parse(localStorage.getItem("links"));

    if (dataLinks) this.#links = dataLinks;

    this._renderAllLinks();
    this._addHandlers();
  }
}
const app = new App();
