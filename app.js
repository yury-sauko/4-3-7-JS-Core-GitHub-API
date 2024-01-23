"use strict";

// Кол-во репозиториев, отображающихся
// в выпадающем меню под полем ввода
const REPOS_PER_VIEW = 5;

// Класс для создания и отображения элементов на странице приложения
class AppView {
  constructor() {
    this.app = document.querySelector(".app");

    this.searchInput = this.createElement("input", "search-input");
    this.reposWrapper = this.createElement("div", "repos-wrapper");
    this.addedReposWrapper = this.createElement("div", "added-repos-wrapper");

    this.app.append(this.searchInput);
    this.app.append(this.reposWrapper);
    this.app.append(this.addedReposWrapper);
  }

  // Метод для создания элемента DOM
  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag);
    if (elementClass) element.classList.add(elementClass);

    return element;
  }

  // Метод для создания контейнера с информацией по репозиторию и добавления его в DOM
  createRepoItem(item) {
    const repo = this.createElement("div", "repo");
    repo.insertAdjacentHTML(
      "afterbegin",
      `<div class='repos-container'>
      <span class='repo-prev toggling'>${item.name}</span>
      <span class='repo-added__name disp-none toggling'>Name: ${item.name}</span>
      <span class='repo-added__owner disp-none toggling'>Owner: ${item.owner.login}</span>
      <span class='repo-added__stars disp-none toggling'>Stars: ${item.stargazers_count}</span>
      </div>
      <div class='cross-container disp-none toggling'></div>`
    );

    this.reposWrapper.append(repo);
  }
}

/* *********************************************************
Класс для реализации логики приложения и обработки данных */
class AppLogicData extends AppView {
  constructor() {
    super();

    // Слушатель ввода текста для поиска репозиториев
    this.searchInput.addEventListener(
      "keyup",
      this.debounce(this.searchRepos.bind(this), 1000)
    );

    // Слушатель для добавления репозитория в избранные
    this.reposWrapper.addEventListener("click", (e) => {
      const addedRepo = e.target.closest(".repo");
      addedRepo
        .querySelectorAll(".toggling")
        .forEach((el) => el.classList.toggle("disp-none"));

      this.addedReposWrapper.append(addedRepo);
      this.searchInput.value = "";
      this.clearReposList();
    });

    // Слушатель для удаления репозитория из избранных
    this.addedReposWrapper.addEventListener("click", (e) => {
      const crossCollection =
        this.addedReposWrapper.querySelectorAll(".cross-container");

      for (const cross of crossCollection) {
        if (e.target === cross) e.target.closest(".repo").remove();
      }
    });
  }

  // Метод обработки ввода и отправки запроса для поиска репозиториев
  async searchRepos() {
    const searchValue = this.searchInput.value;

    if (searchValue[0] === " ") {
      // если первый символ пробел - запрос не отправляем
      return;
    } else if (searchValue) {
      this.clearReposList(); // перед отправкой нового запроса очищаем список выдачи по предыдущему

      try {
        return await fetch(
          `https://api.github.com/search/repositories?q=${searchValue}-&per_page=${REPOS_PER_VIEW}`
        ).then((response) => {
          if (response.ok) {
            response.json().then((resJSON) => {
              resJSON.items.forEach((item) => this.createRepoItem(item));
            });
          } else {
            alert(`response.status = ${response.status}`);
          }
        });
      } catch (err) {
        alert(`Ошибка: ${err.message}`);
      }
    } else {
      this.clearReposList(); // очищаем список выдачи, если пользователь удалил запрос
    }
  }

  // Метод для очистки списка выдачи репозиториев
  clearReposList() {
    const reposPrev = this.reposWrapper.querySelectorAll(".repo");
    reposPrev.forEach((el) => el.remove());
  }

  // Метод для установки задержки перед отправкой запроса
  debounce(fn, debounceTime) {
    let timerId;

    return function wrapper(...args) {
      clearTimeout(timerId);

      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, debounceTime);
    };
  }
}

new AppLogicData();
