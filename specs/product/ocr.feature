Feature: OCR Uploader and Preview
  As a user
  I want to upload images and extract text
  So I can preview, copy, and download results with accessible UI

  Scenario: Preview uploaded image
    Given I am on the OCR page
    When I upload a valid image
    Then I see a preview of the image
    And the preview is accessible

  Scenario: Extract text from image
    Given I have uploaded an image
    When I click "Extract"
    Then I see the extracted text
    And the result matches the expected OCR output

  Scenario: Copy extracted text
    Given text is extracted
    When I click "Copy"
    Then the text is copied to my clipboard

  Scenario: Download extracted text
    Given text is extracted
    When I click "Download"
    Then a file is downloaded with the extracted text

  Scenario: Dark/Light mode parity
    Given I toggle between dark and light mode
    Then the uploader and preview are visually consistent and readable

  Scenario: Accessibility basics
    Given I use a screen reader
    Then the uploader has an accessible name
    And there is exactly one <main> landmark
    And the modal (if present) uses inert for background
