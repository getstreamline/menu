import Menu from './Menu.js';

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.sl-menu');

  elements.forEach((element) => {
    new Menu(element);
  });
});
