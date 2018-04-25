import $ from 'jquery';

const ESC_KEY = 27;
const END_KEY = 35;
const HOME_KEY = 36;
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;

const HOVER_ENTER_TIMEOUT = 400;
const HOVER_MOVE_TIMEOUT = 40;
const HOVER_LEAVE_TIMEOUT = 400;

let lastSubmenuIndex = 0;

function generateSubmenuId() {
  const submenuIndex = lastSubmenuIndex + 1;
  lastSubmenuIndex = submenuIndex;
  return `sl-menu__submenu_${submenuIndex}`;
}

class MenuItem {
  constructor(menu, $element) {
    this.menu = menu;
    this.$element = $element;
    // Allow the link to be in a wrapper for styling purposes.
    this.$link = $element.find('a').first();
    this.open = false;

    if (!this.$element.attr('role')) {
      this.$element.attr('role', 'none');
    }
    if (!this.$link.attr('role')) {
      this.$link.attr('role', 'menuitem');
    }

    const $submenuElement = $element.find('ul').first();
    if ($submenuElement.length) {
      if (!$submenuElement.attr('id')) {
        $submenuElement.attr('id', generateSubmenuId());
      }

      this.submenu = new (menu.constructor)($submenuElement, {
        role: 'menu',
        focusContainer: false,
      });
      this.$element.addClass('sl-menu--has-submenu');
      this.$link
        .attr('aria-haspopup', 'menu')
        .attr('aria-controls', $submenuElement.attr('id'));
      this.$toggle = $('<button type="button" class="sl-menu__toggle">Toggle menu</button>')
        .attr('aria-controls', $submenuElement.attr('id'))
        .attr('tabindex', '-1')
        // If the link is in a wrapper, this puts the toggle button in the wrapper for easier
        // styling.
        .insertAfter(this.$link);
      $submenuElement.addClass('sl-menu__submenu');
      if (!$submenuElement.attr('aria-label')) {
        $submenuElement.attr('aria-label', this.$link.text());
      }
    }

    this.update();
  }

  setOpen(open) {
    if (!this.submenu) {
      return;
    }

    this.open = open;
    // Recursively close any submenus.
    this.submenu.setOpenIndex(-1);

    this.update();
  }

  update() {
    if (!this.submenu) {
      return;
    }

    if (this.open) {
      this.$element.removeClass('sl-menu--closed');
      this.$element.addClass('sl-menu--open');
    } else {
      this.$element.removeClass('sl-menu--open');
      this.$element.addClass('sl-menu--closed');
    }

    // Set aria-expanded based on how these classes affect styling. These classes may not have an
    // effect depending on responsive breakpoints.
    // TODO: Efficiently listen for window resize events and update this attribute when breakpoints
    // change.
    const expanded = this.submenu.$element.is(':visible') ? 'true' : 'false';
    this.$link.attr('aria-expanded', expanded);
    this.$toggle.attr('aria-expanded', expanded);
  }

  focus() {
    this.$link.focus();
  }
}

class Menu {
  constructor($element, options = {}) {
    this.$element = $element;
    // Indicates our ARIA role, typically menubar for the root menu and menu for submenus.
    this.role = options.role || 'menubar';
    // Determines whether we are the root menu and therefore the focus container that manages the
    // roving tabindex.
    this.focusContainer = typeof options.focusContainer === 'boolean' ? options.focusContainer : true;
    this.items = [];
    this.openIndex = -1;
    this.hoverMode = true;
    this.hoverIntent = false;

    if (!this.$element.attr('role')) {
      this.$element.attr('role', this.role);
    }

    // Triggered when any descendant receives focus.
    $element.focusin((event) => {
      // Update the roving tabindex.
      if (this.focusContainer) {
        const $activeElement = $(event.target);
        this.setActiveElement($activeElement);
      }

      // Detect our orientation so our keyboard navigation make sense.
      this.setOrientation();
    });

    if (this.focusContainer) {
      // Triggered when any descendant loses focus.
      $element.focusout(() => {
        // We can't rely on event.relatedTarget in Cypress, and possibly certain browsers. Instead,
        // use document.activeElement during the next iteration of the event loop.
        setTimeout(() => {
          if (!document.activeElement || $element.has(document.activeElement).length === 0) {
            // Focus has moved outside of our focus container, so close all submenus and move the
            // roving tabindex to the item corresponding to the last open top level submenu.
            if (this.openIndex !== -1) {
              this.setActiveElement(this.items[this.openIndex].$link);
              this.setOpenIndex(-1);
            }
          }
        });
      });
    }

    // Close submenu when Escape key is pressed.
    $element.keydown((event) => {
      if (event.which === ESC_KEY && this.openIndex !== -1) {
        const item = this.items[this.openIndex];
        this.setOpenIndex(-1);
        item.focus();

        // Close one submenu at a time.
        event.stopPropagation();
        event.preventDefault();
      }
    });

    // Detect whether hover mode should be enabled.
    $element.mouseenter(() => {
      this.setHoverMode();
    });

    let hoverTimeout;
    let hoverMoveTimeout;
    $element.children('li').each((index, itemElement) => {
      const $itemElement = $(itemElement);
      const item = new MenuItem(this, $itemElement);
      this.items.push(item);

      // Set up all menu item links for roving tabindex.
      item.$link.attr('tabindex', '-1');

      $itemElement.keydown((event) => {
        // Determine the keys for different behaviors based on our orientation.
        const openKey = this.orientation === 'horizontal' ? DOWN_ARROW : RIGHT_ARROW;
        const closeKey = this.orientation === 'horizontal' ? UP_ARROW : LEFT_ARROW;
        const prevKey = this.orientation === 'horizontal' ? LEFT_ARROW : UP_ARROW;
        const nextKey = this.orientation === 'horizontal' ? RIGHT_ARROW : DOWN_ARROW;

        switch (event.which) {
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
              // Determine whether this event bubbled up from an open submenu.
              const bubbled = index === this.openIndex;

              // Only allow bubbling from an open submenu on a horizontal menu.
              if (!bubbled || this.orientation === 'horizontal') {
                const prevItem = this.items[index - 1];

                // If a submenu is open, try to open the previous item's submenu.
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

              // If a submenu is open, try to open the previous item's submenu.
              if (nextItem.submenu && this.openIndex !== -1) {
                this.setOpenIndex(index + 1);
                nextItem.submenu.focusFirstItem();
              } else {
                this.setOpenIndex(-1);
                nextItem.focus();
              }
            }

            // We're at the end of the menu, don't allow this to bubble and close the menu or
            // something.
            event.stopPropagation();
            event.preventDefault();
            break;

          case HOME_KEY:
            if (this.items.length > 0) {
              const firstItem = this.items[0];

              // If a submenu is open, try to open the first item's submenu.
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

              // If a submenu is open, try to open the last item's submenu.
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

          default:
            // Ignore all other keys.
        }
      });

      $itemElement.mouseenter(() => {
        if (!this.hoverMode) {
          return;
        }

        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = undefined;
        }
        if (this.hoverIntent) {
          this.setOpenIndex(index);
        } else {
          // Assume hover intent HOVER_ENTER_TIMEOUT after the mouse enters.
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
          hoverMoveTimeout = undefined;
        }
      });

      $itemElement.mousemove(() => {
        if (!this.hoverMode || this.hoverIntent) {
          return;
        }

        if (hoverMoveTimeout) {
          clearTimeout(hoverMoveTimeout);
        }
        // Assume hover intent HOVER_MOVE_TIMEOUT after the mouse last moved (i.e. stopped moving).
        hoverMoveTimeout = setTimeout(() => {
          this.hoverIntent = true;
          this.setOpenIndex(index);
        }, HOVER_MOVE_TIMEOUT);
      });

      $itemElement.mouseleave(() => {
        if (!this.hoverMode) {
          return;
        }

        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        // Clear hover intent HOVER_LEAVE_TIMEOUT after the mouse leaves.
        hoverTimeout = setTimeout(() => {
          if (this.openIndex === index) {
            this.hoverIntent = false;
            this.setOpenIndex(-1);
          }
        }, HOVER_LEAVE_TIMEOUT);

        if (hoverMoveTimeout) {
          clearTimeout(hoverMoveTimeout);
          hoverMoveTimeout = undefined;
        }
      });

      if (item.submenu && item.$toggle) {
        item.$toggle.click(() => {
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

    // Move the roving tabindex to the first top level menu item.
    if (this.focusContainer && this.items.length > 0) {
      this.setActiveElement(this.items[0].$link);
    }
    this.setOrientation();
    this.update();
  }

  /**
   * Updates the roving tabindex with the given descendant.
   */
  setActiveElement($element) {
    // Ensure we keep a roving tabindex on one of our descendants, otherwise we effectively become
    // impossible to focus.
    if (this.$element.has($element).length === 0) {
      return;
    }

    if (this.$prevActiveElement) {
      this.$prevActiveElement.attr('tabindex', '-1');
    }

    const $nextActiveElement = $element;
    $nextActiveElement.attr('tabindex', '0');
    this.$prevActiveElement = $nextActiveElement;
  }

  /**
   * Automatically sets our orientation and updates the ARIA orientation attribute.
   */
  setOrientation() {
    if (this.$element.is(':visible') && this.items.length >= 2) {
      const firstOffset = this.items[0].$element.offset();
      const secondOffset = this.items[1].$element.offset();
      const dx = Math.abs(secondOffset.left - firstOffset.left);
      const dy = Math.abs(secondOffset.top - firstOffset.top);

      if (dx > dy) {
        this.orientation = 'horizontal';
      } else {
        this.orientation = 'vertical';
      }
    } else if (this.role === 'menubar') {
      this.orientation = 'horizontal';
    } else {
      this.orientation = 'vertical';
    }

    this.$element.attr('aria-orientation', this.orientation);
  }

  /**
   * Automatically sets hover mode based on toggle button visibility.
   */
  setHoverMode() {
    this.hoverMode = !this.items.some(item => item.$toggle && item.$toggle.is(':visible'));
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

export default Menu;
