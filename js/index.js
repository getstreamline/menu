import $ from 'jquery';
import Menu from './Menu';

$.fn.slMenu = function slMenu() {
  return new Menu(this);
};

$(document).ready(() => {
  $('.sl-menu').slMenu();
});
