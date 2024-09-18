describe('mobile accessible keyboard interaction', function() {
  const END_KEY = 'End';
  const HOME_KEY = 'Home';

  beforeEach(function() {
    cy.viewport('iphone-x');
    cy.visit('index.html');
    cy.get('nav > ul')
      .as('menu')
      .should('have.descendants', '.sl-menu--has-submenu')
      .children('li:nth-child(3)')
      .as('item')
      .children('ul')
      .as('submenu')
      .should('not.be.visible');
  });

  // https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/#menu
  describe('ARIA keyboard interaction', function() {
    describe('vertical menu with vertical submenus', function() {
      describe('middle item', function() {
        it('moves focus to first item for Home key', function() {
          cy.contains('a', 'Services')
            .focus()
            .trigger('keydown', { key: HOME_KEY });
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to previous item for Up arrow key', function() {
          cy.contains('a', 'Services')
            .focus()
            .type('{uparrow}');
          cy.active()
            .should('have.text', 'Home');
        });

        it('moves focus to next item for Down arrow key', function() {
          cy.contains('a', 'Services')
            .focus()
            .type('{downarrow}');
          cy.active()
            .should('have.text', 'District Governance');
        });

        it('moves focus to last item for End key', function() {
          cy.contains('a', 'Services')
            .focus()
            .trigger('keydown', { key: END_KEY });
          cy.active()
            .should('have.text', 'Contact Us');
        });
      });

      describe('item without submenu', function() {
        it('keeps focus for Left arrow key', function() {
          cy.contains('a', 'Home')
            .focus()
            .type('{leftarrow}');
          cy.active()
            .should('have.text', 'Home');
        });

        it('keeps focus for Right arrow key', function() {
          cy.contains('a', 'Home')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'Home');
        });
      });

      describe('item with submenu', function() {
        it('keeps focus for Left arrow key', function() {
          cy.contains('a', 'Services')
            .focus()
            .type('{leftarrow}');
          cy.active()
            .should('have.text', 'Services');
        });

        it('opens submenu for Right arrow key', function() {
          cy.contains('a', 'Services')
            .focus()
            .type('{rightarrow}');
          cy.active()
            .should('have.text', 'FAQs')
            .and('be.visible');
        });
      });
    });
  });
});
