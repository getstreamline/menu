describe('mobile touch toggle interaction', function() {
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

  it('has no toggle button for items without submenu', function() {
    cy.contains('a', 'Home')
      .siblings('button')
      .should('not.exist');
  });

  it('opens submenu with toggle button', function() {
    cy.contains('a', 'Services')
      .siblings('button')
      .click();
    cy.active()
      .should('have.text', 'FAQs')
      .and('be.visible');
  });

  it('opens nested submenus with toggle button', function() {
    cy.contains('a', 'District Governance')
      .siblings('button')
      .click();
    cy.contains('a', 'District Transparency')
      .siblings('button')
      .click();
    cy.active()
      .should('have.text', 'CA State Requirements')
      .and('be.visible');
  });

  it('closes all submenus when opening another submenu', function() {
    cy.contains('a', 'District Governance')
      .siblings('button')
      .click();
    cy.contains('a', 'District Transparency')
      .siblings('button')
      .click();
    cy.contains('a', 'Updates')
      .siblings('button')
      .click();
    cy.active()
      .should('have.text', 'Job Opportunities')
      .and('be.visible');
    cy.contains('a', 'CA State Requirements')
      .should('not.be.visible');
    cy.contains('a', 'District Transparency')
      .should('not.be.visible');
  });

  it('closes all submenus when clicking another control', function() {
    cy.contains('a', 'District Governance')
      .siblings('button')
      .click();
    cy.contains('a', 'District Transparency')
      .siblings('button')
      .click();
    cy.contains('button', 'After')
      .click();
    cy.contains('a', 'CA State Requirements')
      .should('not.be.visible');
    cy.contains('a', 'District Transparency')
      .should('not.be.visible');
  });
});
