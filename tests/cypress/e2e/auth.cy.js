describe('Authentication E2E', () => {
  it('should load login page', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show error on invalid login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('wrong@beechat.com');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.contains(/invalid|error|incorrect/i).should('exist');
  });

  it('should login and redirect to dashboard', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@cognitioit.ca');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
