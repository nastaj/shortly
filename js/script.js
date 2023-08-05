"use strict";

// DOM Elements
const shortener = document.querySelector(".shortener");
const linksList = document.querySelector(".links-list");
const form = document.querySelector(".shortener__form");
const input = document.querySelector(".shortener__input");
const btn = document.querySelector(".shortener__btn");

// App
class App {
  #links = [];
  #link;
  #linkShortened;

  constructor() {
    this._getLocalStorage();
    form.addEventListener("submit", this._submitForm.bind(this));
  }

  async _submitForm(e) {
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
    console.log(this.#links);
  }

  async _shortenLink(link) {
    const response = await fetch(
      `https://api.shrtco.de/v2/shorten?url=${link}`
    );
    const data = await response.json();

    this.#linkShortened = data.result.full_short_link;
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
        <a href="#" class="links__before">${oldLink ? oldLink : this.#link}</a>
        <div class="links__after-box">
          <a href="#" class="links__after">${newLink}</a>
          <button class="btn-cta links__btn-copy">Copy</button>
        </div>
    </div>
    `;
  }

  _setLocalStorage() {
    localStorage.setItem("links", JSON.stringify(this.#links));
  }

  _getLocalStorage() {
    const dataLinks = JSON.parse(localStorage.getItem("links"));

    if (dataLinks) this.#links = dataLinks;

    this._renderAllLinks();
  }
}
const app = new App();
