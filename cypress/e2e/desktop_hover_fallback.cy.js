// This tests the proof of concept in index.html more than anything.
describe('desktop mouse hover interaction CSS fallback', function() {
  it('works when the JavaScript behavior is disabled', function() {
    cy.once('window:before:load', (window) => {
      // Cypress.$ is not our document's jQuery, so use the old skool method to
      // wait for the DOM to load.
      window.document.addEventListener('DOMContentLoaded', () => {
        // Simulate JavaScript failing to load by removing the class that
        // triggers the menu behavior.
        Cypress.$('nav > ul').removeClass('sl-menu');
      });
    });
    cy.visit('index.html');

    // Assert the menu behavior is disabled.
    cy.get('nav > ul').should('not.have.descendants', '.sl-menu--has-submenu');

    // Simulate CSS hover to open the District Governance top level menu.
    cy.get('nav > ul > li:nth-child(3)')
      .as('item')
      .children('ul')
      .as('submenu')
      .should('not.be.visible');
    cy.get('@item').then($item => $item.addClass('cy-hover'));
    cy.get('@submenu').should('be.visible');

    // Simulate CSS hover to open the District Transparency second level menu.
    cy.get('@submenu').children('li:nth-child(6)')
      .as('subitem')
      .children('ul')
      .as('subsubmenu')
      .should('not.be.visible');
    cy.get('@subitem').then($item => $item.addClass('cy-hover'));
    cy.get('@subsubmenu').should('be.visible');
  });

  it('does not work otherwise', function() {
    cy.visit('index.html');

    // Assert the menu behavior is enabled.
    cy.get('nav > ul').should('have.descendants', '.sl-menu--has-submenu');

    // Simulate CSS hover to open the District Governance top level menu.
    cy.get('nav > ul > li:nth-child(3)')
      .as('item')
      .children('ul')
      .as('submenu')
      .should('not.be.visible');
    cy.get('@item').then($item => $item.addClass('cy-hover'));
    cy.get('@submenu').should('not.be.visible');
  });
});
