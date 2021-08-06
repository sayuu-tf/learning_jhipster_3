import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Post e2e test', () => {
  let startingEntitiesCount = 0;

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });

    cy.clearCookies();
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.visit('');
    cy.login('admin', 'admin');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.visit('/');
  });

  it('should load Posts', () => {
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest');
    cy.getEntityHeading('Post').should('exist');
    if (startingEntitiesCount === 0) {
      cy.get(entityTableSelector).should('not.exist');
    } else {
      cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
    }
    cy.visit('/');
  });

  it('should load details Post page', () => {
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityDetailsButtonSelector).first().click({ force: true });
      cy.getEntityDetailsHeading('post');
      cy.get(entityDetailsBackButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should load create Post page', () => {
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest');
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('Post');
    cy.get(entityCreateSaveButtonSelector).should('exist');
    cy.visit('/');
  });

  it('should load edit Post page', () => {
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityEditButtonSelector).first().click({ force: true });
      cy.getEntityCreateUpdateHeading('Post');
      cy.get(entityCreateSaveButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should create an instance of Post', () => {
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('Post');

    cy.get(`[data-cy="title"]`)
      .type('Garden Salad reciprocal', { force: true })
      .invoke('val')
      .should('match', new RegExp('Garden Salad reciprocal'));

    cy.get(`[data-cy="content"]`)
      .type('../fake-data/blob/hipster.txt', { force: true })
      .invoke('val')
      .should('match', new RegExp('../fake-data/blob/hipster.txt'));

    cy.get(`[data-cy="date"]`).type('2021-07-20T12:51').invoke('val').should('equal', '2021-07-20T12:51');

    cy.setFieldSelectToLastOfEntity('blog');

    cy.setFieldSelectToLastOfEntity('tag');

    cy.get(entityCreateSaveButtonSelector).click({ force: true });
    cy.scrollTo('top', { ensureScrollable: false });
    cy.get(entityCreateSaveButtonSelector).should('not.exist');
    cy.intercept('GET', '/api/posts*').as('entitiesRequestAfterCreate');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequestAfterCreate');
    cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount + 1);
    cy.visit('/');
  });

  it('should delete last instance of Post', () => {
    cy.intercept('GET', '/api/posts*').as('entitiesRequest');
    cy.intercept('DELETE', '/api/posts/*').as('deleteEntityRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('post');
    cy.wait('@entitiesRequest').then(({ request, response }) => {
      startingEntitiesCount = response.body.length;
      if (startingEntitiesCount > 0) {
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
        cy.get(entityDeleteButtonSelector).last().click({ force: true });
        cy.getEntityDeleteDialogHeading('post').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait('@deleteEntityRequest');
        cy.intercept('GET', '/api/posts*').as('entitiesRequestAfterDelete');
        cy.visit('/');
        cy.clickOnEntityMenuItem('post');
        cy.wait('@entitiesRequestAfterDelete');
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount - 1);
      }
      cy.visit('/');
    });
  });
});
