describe('mock checkout (RenderCheck)', () => {
  it('shows the right total, legibly', () => {
    cy.visit('/?variant=');
    cy.matchText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
  });

  it('checks one element against its DOM text', () => {
    cy.visit('/');
    cy.get('#total').matchText('Total: $14.00', { minConfidence: 85 });
  });

  it('fails on a wrong currency, with the OCR diff in the message', () => {
    cy.visit('/?variant=euro');
    cy.on('fail', (err) => {
      expect(err.message).to.match(/Expected to find text "\[Total: \$14\.00\]" but OCR read "\[Total: €14\.00\]"/);
      expect(err.message).to.match(/Diff: Total: \[\$\]14\.00 {2}→ {2}Total: \[€\]14\.00/);
      return false; // the failure is the expected outcome
    });
    cy.matchText('Total: $14.00', { timeout: 0 }).then(() => {
      throw new Error('cy.matchText should have failed');
    });
  });

  it('fails on low-contrast text the DOM accepts', () => {
    cy.visit('/?variant=low-contrast');
    cy.get('#total').should('have.text', 'Total: $14.00');
    cy.on('fail', (err) => {
      expect(err.message).to.match(/not legible: contrast must be at least 4\.5:1/);
      return false;
    });
    cy.matchText('Total: $14.00', { minContrastRatio: 4.5, timeout: 0 }).then(() => {
      throw new Error('cy.matchText should have failed');
    });
  });

  it('fails on text that is in the DOM but covered on screen', () => {
    cy.visit('/?variant=cover');
    cy.get('#total').should('have.text', 'Total: $14.00');
    cy.on('fail', (err) => {
      expect(err.message).to.match(/not visible in the rendered pixels/);
      return false;
    });
    cy.get('#total').matchText('Total: $14.00', { timeout: 0 }).then(() => {
      throw new Error('cy.matchText should have failed');
    });
  });
});
