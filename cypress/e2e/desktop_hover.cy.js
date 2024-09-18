describe('desktop mouse hover interaction', function() {
  const HOVER_ENTER_TIMEOUT = 400;
  const HOVER_MOVE_TIMEOUT = 40;
  const HOVER_LEAVE_TIMEOUT = 400;

  beforeEach(function() {
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

  it('does not work on mobile', function() {
    cy.viewport('iphone-x');
    cy.get('@item')
      .trigger('mouseenter')
      .trigger('mousemove');
    cy.wait(Math.max(HOVER_ENTER_TIMEOUT, HOVER_MOVE_TIMEOUT) + 100);
    cy.get('@submenu', { timeout: 0 }).should('not.be.visible');
  });

  it('does not open menus without intent', function() {
    //cy.pause();
    cy.get('@item')
      .trigger('mouseenter')
      .trigger('mousemove');
    cy.wait(Math.min(HOVER_ENTER_TIMEOUT, HOVER_MOVE_TIMEOUT) - 10);
    cy.get('@submenu', { timeout: 0 }).should('not.be.visible');

    cy.get('@item')
      .trigger('mouseleave');
    cy.wait(Math.max(HOVER_ENTER_TIMEOUT, HOVER_MOVE_TIMEOUT) + 100);
    cy.get('@submenu', { timeout: 0 }).should('not.be.visible');
  });

  it('opens menus when hovering for a long time', function() {
    cy.get('@item')
      .trigger('mouseenter')
      .shakemouse(HOVER_MOVE_TIMEOUT - 10, HOVER_ENTER_TIMEOUT - 100);
    cy.get('@submenu', { timeout: 0 }).should('not.be.visible');
    cy.get('@item')
      .shakemouse(HOVER_MOVE_TIMEOUT - 10, 200);
    cy.get('@submenu', { timeout: 0 }).should('be.visible');
  });

  it('opens menus when holding still for a short time', function() {
    cy.get('@item')
      .trigger('mouseenter')
      .shakemouse(HOVER_MOVE_TIMEOUT - 10, 100);
    cy.wait(HOVER_MOVE_TIMEOUT + 10);
    cy.get('@submenu', { timeout: 0 }).should('be.visible');
  });

  it('opens menus instantly once intent is established', function() {
    cy.get('@item')
      .trigger('mouseenter')
      .trigger('mousemove');
    cy.get('@submenu').should('be.visible');
    cy.get('@item')
      .trigger('mouseleave')
      .next('li')
      .trigger('mouseenter')
      .trigger('mousemove')
      .children('ul')
      .as('nextSubmenu');
    cy.get('@submenu', { timeout: 0 }).should('not.be.visible');
    cy.get('@nextSubmenu', { timeout: 0 }).should('be.visible');
  });

  it('does not close menus without intent', function() {
    cy.get('@item')
      .trigger('mouseenter')
      .trigger('mousemove');
    cy.get('@submenu').should('be.visible');
    cy.get('@item')
      .trigger('mouseleave');
    cy.wait(HOVER_LEAVE_TIMEOUT - 100);
    cy.get('@item')
      .trigger('mouseenter');
    cy.get('@submenu', { timeout: 0 }).should('be.visible');
  });

  it('closes menus with intent', function() {
    cy.get('@item')
      .trigger('mouseenter')
      .trigger('mousemove');
    cy.get('@submenu').should('be.visible');
    cy.get('@item')
      .trigger('mouseleave');
    cy.wait(HOVER_LEAVE_TIMEOUT + 100);
    cy.get('@submenu', { timeout: 0 }).should('not.be.visible');
  });
});
