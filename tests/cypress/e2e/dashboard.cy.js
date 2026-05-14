describe('Dashboard E2E', () => {
  beforeEach(() => {
    // Mock login by setting a token in localStorage or via API
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@cognitioit.ca');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display dashboard stats', () => {
    cy.contains(/dashboard|overview/i).should('exist');
    cy.get('.stat-card, [class*="Stat"]').should('have.length.at.least', 1);
  });

  it('should navigate to Live Chat', () => {
    cy.contains(/live chat|messages/i).click();
    cy.url().should('include', '/chat');
  });

  it('should navigate to Tickets', () => {
    cy.contains(/tickets|helpdesk/i).click();
    cy.url().should('include', '/tickets');
  });
});
