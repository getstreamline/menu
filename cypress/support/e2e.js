import nextTabbable from './nextTabbable';

/**
 * Triggers mousemove events at a minimum interval for a period of time.
 */
Cypress.Commands.add('shakemouse', { prevSubject: true }, ($subject, interval, time) => (
  new Cypress.Promise((resolve) => {
    const startTime = Date.now();
    const target = $subject.get(0);
    const eventInit = {
      bubbles: true,
      cancelable: true,
    };

    function shakemouse() {
      target.dispatchEvent(new Event('mousemove', eventInit));

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < time) {
        setTimeout(shakemouse, Math.min(interval, time - elapsedTime));
      } else {
        resolve($subject);
      }
    }

    Cypress.log({
      $el: $subject,
      name: 'shakemouse',
      message: time.toString(),
    });

    shakemouse();
  })
));

/**
 * Emulates Tab key navigation.
 */
Cypress.Commands.add('tab', { prevSubject: 'optional' }, ($subject, direction = 'forward', options = {}) => {
  const thenable = $subject
    ? cy.wrap($subject, { log: false })
    : cy.focused({ log: options.log !== false });
  thenable
    .then($el => nextTabbable($el, direction))
    .then(($el) => {
      if (options.log !== false) {
        Cypress.log({
          $el,
          name: 'tab',
          message: direction,
        });
      }
    })
    .focus({ log: false });
});

/**
 * Queries for the active element, irrespective of document focus state, unlike cy.focused().
 *
 * This may not match Cypress' internal focus tracker, so you may have to .focus() the returned
 * element to interact with it.
 */
Cypress.Commands.add('active', (options = {}) => {
  cy.document({ log: false })
    .then(document => cy.wrap(document.activeElement, { log: false }))
    .then(($el) => {
      if (options.log !== false) {
        Cypress.log({
          $el,
          name: 'active',
          message: '',
        });
      }
    });
});
