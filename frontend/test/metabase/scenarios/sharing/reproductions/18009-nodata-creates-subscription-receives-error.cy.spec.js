import {
  restore,
  popover,
  setupSMTP,
  visitDashboard,
} from "__support__/e2e/cypress";

describe.skip("issue 18009", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();

    setupSMTP();

    cy.signIn("nodata");
  });

  it("nodata user should be able to create and receive an email subscription without errors (metabase#18009)", () => {
    visitDashboard(1);

    cy.icon("subscription").click();

    cy.findByText("Email it").click();

    cy.findByPlaceholderText("Enter user names or email addresses").click();
    popover()
      .contains(/^No Data/)
      .click();

    // Click anywhere to close the popover that covers the "Send email now" button
    cy.findByText("To:").click();

    cy.button("Send email now").click();
    cy.findByText("Email sent");

    cy.request("GET", "http://localhost:80/email").then(({ body }) => {
      expect(body[0].html).not.to.include(
        "An error occurred while displaying this card.",
      );

      expect(body[0].html).to.include("37.65");
    });
  });
});
