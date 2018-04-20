describe('desktop accessible keyboard interaction', function () {
  const END_KEY = 35;
  const HOME_KEY = 36;

  beforeEach(function () {
    cy.visit('./index.html');
    cy.get('nav > ul')
      .as('menu')
      .should('have.descendants', '.sl-menu--has-submenu')
      .children('li:nth-child(3)')
      .as('item')
      .children('ul')
      .as('submenu')
      .should('not.be.visible');
  });

  describe('focus management', function () {
    it('acts as a composite component', function () {
      cy.contains('button', 'Before')
        .focus();
      cy.tab();
      cy.tab()
        .should('have.text', 'After');
    });

    it('defaults to focus on the first link', function () {
      cy.contains('button', 'Before')
        .focus();
      cy.tab()
        .should('have.text', 'Home');
    });

    it('restores focus for a top level link', function () {
      cy.contains('a', 'District Governance')
        .focus();
      cy.tab()
        .should('have.text', 'After');
      cy.tab('backward')
        .should('have.text', 'District Governance');
    });

    it('restores focus for a second level link', function () {
      cy.contains('a', 'District Governance')
        .focus()
        .type('{downarrow}');
      cy.active()
        .should('have.text', 'Board')
        .tab()
        .should('have.text', 'After');
      cy.get('@submenu')
        .should('not.be.visible');
      cy.active()
        .tab('backward')
        .should('have.text', 'District Governance');
    });

    it('restores focus for a third level link', function () {
      cy.contains('a', 'District Governance')
        .focus()
        .type('{downarrow}');
      cy.contains('a', 'District Transparency')
        .focus()
        .type('{rightarrow}');
      cy.active()
        .should('have.text', 'CA State Requirements')
        .tab()
        .should('have.text', 'After');
      cy.get('@submenu')
        .should('not.be.visible');
      cy.active()
        .tab('backward')
        .should('have.text', 'District Governance');
    });
  });

  // https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/#menu
  describe('ARIA keyboard interaction', function () {
    it('has appropriate ARIA roles', function () {
      cy.get('@menu')
        .should('have.attr', 'role', 'menubar');
      cy.get('@item')
        .should('have.attr', 'role', 'none')
        .find('a')
        .first()
        .should('have.attr', 'role', 'menuitem');
      cy.get('@submenu')
        .should('have.attr', 'role', 'menu');
    });

    it('keeps default behavior for Enter key', function () {
      cy.contains('a', 'District Governance')
        .focus()
        .type('{enter}');
      cy.active()
        .should('have.text', 'District Governance');
    });

    it('keeps default behavior for Space key', function () {
      cy.contains('a', 'District Governance')
        .focus()
        .type(' ');
      cy.active()
        .should('have.text', 'District Governance');
    });

    describe('horizontal menu with vertical submenus', function () {
      describe('first item', function () {
        it('keeps focus for Home key', function () {
          cy.contains('a', 'Home')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'Home');
        });

        it('keeps focus for Left arrow key', function () {
          cy.contains('a', 'Home')
            .focus()
            .type('{leftarrow}');
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to next item for Right arrow key', function () {
          cy.contains('a', 'Home')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'Services');
        });

        it('moves focus to last item for End key', function () {
          cy.contains('a', 'Home')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'Contact Us');
        });
      });

      describe('middle item', function () {
        it('moves focus to first item for Home key', function () {
          cy.contains('a', 'Services')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to previous item for Left arrow key', function () {
          cy.contains('a', 'Services')
            .focus()
            .type('{leftarrow}');
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to next item for Right arrow key', function () {
          cy.contains('a', 'Services')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'District Governance');
        });

        it('moves focus to last item for End key', function () {
          cy.contains('a', 'Services')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'Contact Us');
        });
      });

      describe('last item', function () {
        it('moves focus to first item for Home key', function () {
          cy.contains('a', 'Contact Us')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to previous item for Left arrow key', function () {
          cy.contains('a', 'Contact Us')
            .focus()
            .type('{leftarrow}');
          cy.active()
            .should('have.text', 'Updates');
        });

        it('keeps focus for Right arrow key', function () {
          cy.contains('a', 'Contact Us')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'Contact Us');
        });

        it('keeps focus for End key', function () {
          cy.contains('a', 'Contact Us')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'Contact Us');
        });
      });

      describe('item without submenu', function () {
        it('keeps default behavior for Esc key', function () {
          cy.contains('a', 'Home')
            .focus()
            .type('{esc}');
          cy.active()
            .should('have.text', 'Home');
        });

        it('keeps focus for Up arrow key', function () {
          cy.contains('a', 'Home')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'Home');
        });

        it('keeps focus for Down arrow key', function () {
          cy.contains('a', 'Home')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'Home');
        });
      });

      describe('item with submenu', function () {
        it('keeps default behavior for Esc key', function () {
          cy.contains('a', 'Services')
            .focus()
            .type('{esc}');
          cy.active()
            .should('have.text', 'Services');
        });

        it('keeps focus for Up arrow key', function () {
          cy.contains('a', 'Services')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'Services');
        });

        it('opens submenu for Down arrow key', function () {
          cy.contains('a', 'Services')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'FAQs')
            .and('be.visible');
        });
      });
    });

    describe('vertical submenu with vertical submenus', function () {
      beforeEach(function () {
        cy.contains('a', 'District Governance')
          .focus()
          .type('{downarrow}');
      });

      describe('first item', function () {
        it('keeps focus for Home key', function () {
          cy.contains('a', 'Board')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'Board');
        });

        it('closes menu for Up arrow key', function () {
          cy.contains('a', 'Board')
            .focus()
            .type('{uparrow}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'District Governance');
        });

        it('moves focus to next item for Down arrow key', function () {
          cy.contains('a', 'Board')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'Meetings');
        });

        it('moves focus to last item for End key', function () {
          cy.contains('a', 'Board')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'About Special Districts');
        });
      });

      describe('middle item', function () {
        it('moves focus to first item for Home key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'Board');
        });

        it('moves focus to previous item for Up arrow key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'Board');
        });

        it('moves focus to next item for Down arrow key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'Mission');
        });

        it('moves focus to last item for End key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'About Special Districts');
        });
      });

      describe('last item', function () {
        it('moves focus to first item for Home key', function () {
          cy.contains('a', 'About Special Districts')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'Board');
        });

        it('moves focus to previous item for Up arrow key', function () {
          cy.contains('a', 'About Special Districts')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'District Transparency');
        });

        it('keeps focus for Down arrow key', function () {
          cy.contains('a', 'About Special Districts')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'About Special Districts');
        });

        it('keeps focus for End key', function () {
          cy.contains('a', 'About Special Districts')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'About Special Districts');
        });
      });

      describe('item without submenu', function () {
        it('closes menu for Esc key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .type('{esc}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'District Governance');
        });

        it('moves focus to first item in previous submenu or previous parent item for Left arrow key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .type('{leftarrow}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'FAQs')
            .focus()
            .type('{leftarrow}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to first item in next submenu or next parent item for Right arrow key', function () {
          cy.contains('a', 'Meetings')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'Job Opportunities')
            .focus()
            .type('{rightarrow}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'Contact Us');
        });
      });

      describe('item with submenu', function () {
        it('closes menu for Esc key', function () {
          cy.contains('a', 'District Transparency')
            .focus()
            .type('{esc}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'District Governance');
        });

        it('moves focus to first item in previous submenu for Left arrow key', function () {
          cy.contains('a', 'District Transparency')
            .focus()
            .type('{leftarrow}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'FAQs');
        });

        it('opens submenu for Right arrow key', function () {
          cy.contains('a', 'District Transparency')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'CA State Requirements');
        });
      });
    });

    describe('second level vertical submenu', function () {
      beforeEach(function () {
        cy.contains('a', 'District Governance')
          .focus()
          .type('{downarrow}');
        cy.contains('a', 'District Transparency')
          .focus()
          .type('{rightarrow}');
      });

      describe('first item', function () {
        it('keeps focus for Home key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'CA State Requirements');
        });

        it('keeps focus for Up arrow key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'CA State Requirements');
        });

        it('moves focus to next item for Down arrow key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'SDLF Transparency Certification');
        });

        it('moves focus to last item for End key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'SDLF Transparency Certification');
        });
      });

      describe('last item', function () {
        it('moves focus to first item for Home key', function () {
          cy.contains('a', 'SDLF Transparency Certification')
            .focus()
            .trigger('keydown', { which: HOME_KEY });
          cy.active()
            .should('have.text', 'CA State Requirements');
        });

        it('moves focus to previous item for Up arrow key', function () {
          cy.contains('a', 'SDLF Transparency Certification')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'CA State Requirements');
        });

        it('keeps focus for Down arrow key', function () {
          cy.contains('a', 'SDLF Transparency Certification')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'SDLF Transparency Certification');
        });

        it('keeps focus for End key', function () {
          cy.contains('a', 'SDLF Transparency Certification')
            .focus()
            .trigger('keydown', { which: END_KEY });
          cy.active()
            .should('have.text', 'SDLF Transparency Certification');
        });
      });

      describe('item without submenu', function () {
        it('closes menu for Esc key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .type('{esc}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'District Transparency');
        });

        it('closes menu for Left arrow key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .type('{leftarrow}')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'District Transparency');
        });

        it('moves focus to first item in next submenu for Right arrow key', function () {
          cy.contains('a', 'CA State Requirements')
            .focus()
            .type('{rightarrow}')
            .should('not.be.visible');
          cy.contains('a', 'District Transparency')
            .should('not.be.visible');
          cy.active()
            .should('have.text', 'Job Opportunities');
        });
      });
    });
  });
});
