const ESC_KEY = "Escape";
const END_KEY = "End";
const HOME_KEY = "Home";
const LEFT_ARROW = "ArrowLeft";
const UP_ARROW = "ArrowUp";
const RIGHT_ARROW = "ArrowRight";
const DOWN_ARROW = "ArrowDown";
const HOVER_ENTER_TIMEOUT = 400;
const HOVER_MOVE_TIMEOUT = 40;
const HOVER_LEAVE_TIMEOUT = 400;
let lastSubmenuIndex = 0;
function generateSubmenuId() {
  const submenuIndex = lastSubmenuIndex + 1;
  lastSubmenuIndex = submenuIndex;
  return `sl-menu__submenu_${submenuIndex}`;
}
function isVisible(element) {
  if (!element) return false;
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && element.offsetParent !== null;
}
class MenuItem {
  constructor(menu, element) {
    this.menu = menu;
    this.element = element;
    this.link = element.querySelector(":scope > a");
    this.open = false;
    if (!this.element.getAttribute("role")) {
      this.element.setAttribute("role", "none");
    }
    if (!this.link.getAttribute("role")) {
      this.link.setAttribute("role", "menuitem");
    }
    const submenuElement = element.querySelector(":scope > ul");
    if (submenuElement) {
      if (!submenuElement.getAttribute("id")) {
        submenuElement.setAttribute("id", generateSubmenuId());
      }
      this.submenu = new menu.constructor(submenuElement, {
        role: "menu",
        focusContainer: false
      });
      this.element.classList.add("sl-menu--has-submenu");
      this.link.setAttribute("aria-haspopup", "menu");
      this.link.setAttribute("aria-controls", submenuElement.getAttribute("id"));
      this.toggle = document.createElement("button");
      this.toggle.textContent = "Toggle menu";
      this.toggle.setAttribute("type", "button");
      this.toggle.classList.add("sl-menu__toggle");
      this.toggle.setAttribute("aria-controls", submenuElement.getAttribute("id"));
      this.toggle.setAttribute("tabindex", "-1");
      this.link.parentNode.insertBefore(this.toggle, this.link.nextSibling);
      submenuElement.classList.add("sl-menu__submenu");
      if (!submenuElement.getAttribute("aria-label")) {
        submenuElement.setAttribute("aria-label", this.link.textContent);
      }
    }
    this.update();
  }
  setOpen(open) {
    if (!this.submenu) {
      return;
    }
    this.open = open;
    this.submenu.setOpenIndex(-1);
    this.update();
  }
  update() {
    if (!this.submenu) {
      return;
    }
    if (this.open) {
      this.element.classList.remove("sl-menu--closed");
      this.element.classList.add("sl-menu--open");
    } else {
      this.element.classList.remove("sl-menu--open");
      this.element.classList.add("sl-menu--closed");
    }
    const expanded = isVisible(this.submenu.element) ? "true" : "false";
    this.link.setAttribute("aria-expanded", expanded);
    this.toggle.setAttribute("aria-expanded", expanded);
  }
  focus() {
    this.link.focus();
  }
}
class MenuModern {
  constructor(element, options = {}) {
    this.element = element;
    this.role = options.role || "menubar";
    this.focusContainer = typeof options.focusContainer === "boolean" ? options.focusContainer : true;
    this.items = [];
    this.openIndex = -1;
    this.hoverMode = true;
    this.hoverIntent = false;
    if (!this.element.getAttribute("role")) {
      this.element.setAttribute("role", this.role);
    }
    this.element.addEventListener("focusin", (event) => {
      if (this.focusContainer) {
        const activeElement = event.target;
        this.setActiveElement(activeElement);
      }
      this.setOrientation();
    });
    if (this.focusContainer) {
      const setActiveElementAndOpenIndex = (event) => {
        if (this.openIndex !== -1 && !this.element.contains(event.target)) {
          this.setActiveElement(this.items[this.openIndex].link);
          this.setOpenIndex(-1);
        }
      };
      document.addEventListener("keydown", setActiveElementAndOpenIndex);
      document.addEventListener("click", setActiveElementAndOpenIndex);
      document.addEventListener("focusin", setActiveElementAndOpenIndex);
    }
    this.element.addEventListener("keydown", (event) => {
      if (event.key === ESC_KEY && this.openIndex !== -1) {
        const item = this.items[this.openIndex];
        this.setOpenIndex(-1);
        item.focus();
        event.stopPropagation();
        event.preventDefault();
      }
    });
    this.element.addEventListener("mouseenter", () => {
      this.setHoverMode();
    });
    let hoverTimeout;
    let hoverMoveTimeout;
    Array.from(this.element.children).forEach((itemElement, index) => {
      const item = new MenuItem(this, itemElement);
      this.items.push(item);
      item.link.setAttribute("tabindex", "-1");
      itemElement.addEventListener("keydown", (event) => {
        const openKey = this.orientation === "horizontal" ? DOWN_ARROW : RIGHT_ARROW;
        const closeKey = this.orientation === "horizontal" ? UP_ARROW : LEFT_ARROW;
        const prevKey = this.orientation === "horizontal" ? LEFT_ARROW : UP_ARROW;
        const nextKey = this.orientation === "horizontal" ? RIGHT_ARROW : DOWN_ARROW;
        switch (event.key) {
          case openKey:
            if (item.submenu && this.openIndex !== index) {
              this.setOpenIndex(index);
              item.submenu.focusFirstItem();
              event.stopPropagation();
              event.preventDefault();
            }
            break;
          case closeKey:
            if (item.submenu && this.openIndex === index) {
              this.setOpenIndex(-1);
              item.focus();
              event.stopPropagation();
              event.preventDefault();
            }
            break;
          case prevKey:
            if (index > 0) {
              const bubbled = index === this.openIndex;
              if (!bubbled || this.orientation === "horizontal") {
                const prevItem = this.items[index - 1];
                if (prevItem.submenu && this.openIndex !== -1) {
                  this.setOpenIndex(index - 1);
                  prevItem.submenu.focusFirstItem();
                } else {
                  this.setOpenIndex(-1);
                  prevItem.focus();
                }
              }
              event.stopPropagation();
              event.preventDefault();
            }
            break;
          case nextKey:
            if (index < this.items.length - 1) {
              const nextItem = this.items[index + 1];
              if (nextItem.submenu && this.openIndex !== -1) {
                this.setOpenIndex(index + 1);
                nextItem.submenu.focusFirstItem();
              } else {
                this.setOpenIndex(-1);
                nextItem.focus();
              }
            }
            event.stopPropagation();
            event.preventDefault();
            break;
          case HOME_KEY:
            if (this.items.length > 0) {
              const firstItem = this.items[0];
              if (firstItem.submenu && this.openIndex !== -1) {
                this.setOpenIndex(1);
                firstItem.submenu.focusFirstItem();
              } else {
                this.setOpenIndex(-1);
                firstItem.focus();
              }
              event.stopPropagation();
              event.preventDefault();
            }
            break;
          case END_KEY:
            if (this.items.length > 0) {
              const lastItem = this.items[this.items.length - 1];
              if (lastItem.submenu && this.openIndex !== -1) {
                this.setOpenIndex(this.items.length - 1);
                lastItem.submenu.focusFirstItem();
              } else {
                this.setOpenIndex(-1);
                lastItem.focus();
              }
              event.stopPropagation();
              event.preventDefault();
            }
            break;
        }
      });
      itemElement.addEventListener("mouseenter", () => {
        if (!this.hoverMode) {
          return;
        }
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = void 0;
        }
        if (this.hoverIntent) {
          this.setOpenIndex(index);
        } else {
          hoverTimeout = setTimeout(() => {
            if (!this.hoverMode) {
              return;
            }
            this.hoverIntent = true;
            this.setOpenIndex(index);
          }, HOVER_ENTER_TIMEOUT);
        }
        if (hoverMoveTimeout) {
          clearTimeout(hoverMoveTimeout);
          hoverMoveTimeout = void 0;
        }
      });
      itemElement.addEventListener("mousemove", () => {
        if (!this.hoverMode || this.hoverIntent) {
          return;
        }
        if (hoverMoveTimeout) {
          clearTimeout(hoverMoveTimeout);
        }
        hoverMoveTimeout = setTimeout(() => {
          this.hoverIntent = true;
          this.setOpenIndex(index);
        }, HOVER_MOVE_TIMEOUT);
      });
      itemElement.addEventListener("mouseleave", () => {
        if (!this.hoverMode) {
          return;
        }
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        hoverTimeout = setTimeout(() => {
          if (this.openIndex === index) {
            this.hoverIntent = false;
            this.setOpenIndex(-1);
          }
        }, HOVER_LEAVE_TIMEOUT);
        if (hoverMoveTimeout) {
          clearTimeout(hoverMoveTimeout);
          hoverMoveTimeout = void 0;
        }
      });
      if (item.submenu && item.toggle) {
        item.toggle.addEventListener("click", () => {
          if (this.openIndex === index) {
            this.setOpenIndex(-1);
            item.focus();
          } else {
            this.setOpenIndex(index);
            item.submenu.focusFirstItem();
          }
        });
      }
    });
    if (this.focusContainer && this.items.length > 0) {
      this.setActiveElement(this.items[0].link);
    }
    this.setOrientation();
    this.update();
  }
  /**
   * Updates the roving tabindex with the given descendant.
   */
  setActiveElement(element) {
    if (!this.element.contains(element)) {
      return;
    }
    if (this.prevActiveElement) {
      this.prevActiveElement.setAttribute("tabindex", "-1");
    }
    const nextActiveElement = element;
    nextActiveElement.setAttribute("tabindex", "0");
    this.prevActiveElement = nextActiveElement;
  }
  /**
   * Automatically sets our orientation and updates the ARIA orientation attribute.
   */
  setOrientation() {
    if (isVisible(this.element) && this.items.length >= 2) {
      const firstOffset = this.items[0].element.getBoundingClientRect();
      const secondOffset = this.items[1].element.getBoundingClientRect();
      const dx = Math.abs(secondOffset.left - firstOffset.left);
      const dy = Math.abs(secondOffset.top - firstOffset.top);
      if (dx > dy) {
        this.orientation = "horizontal";
      } else {
        this.orientation = "vertical";
      }
    } else if (this.role === "menubar") {
      this.orientation = "horizontal";
    } else {
      this.orientation = "vertical";
    }
    this.element.setAttribute("aria-orientation", this.orientation);
  }
  /**
   * Automatically sets hover mode based on toggle button visibility.
   */
  setHoverMode() {
    this.hoverMode = !this.items.some((item) => item.toggle && isVisible(item.toggle));
  }
  /**
   * Opens the given submenu or closes the currently opened submenu.
   *
   * @param {number} index
   *   The index of the menu item whose submenu is open, or -1 if no submenu is open.
   */
  setOpenIndex(index) {
    this.openIndex = index;
    this.update();
  }
  /**
   * Update the DOM based on state changes.
   */
  update() {
    this.items.forEach((item, index) => {
      item.setOpen(index === this.openIndex);
    });
  }
  /**
   * Helper to move focus to the first item in this menu.
   */
  focusFirstItem() {
    if (this.items.length === 0) {
      return;
    }
    this.items[0].focus();
  }
}
export {
  MenuModern as default
};
