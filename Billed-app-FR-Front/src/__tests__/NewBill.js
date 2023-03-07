/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES } from "../constants/routes";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Admin",
        email: "a@a",
      })
    );
    const fakeFile = new File(["test"], "test.png", { type: "image/png" });
    jest.spyOn(mockStore, "bills");

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    test("Then when I add a file handleChangeFile has been call", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const bill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
      const handleChangeFile = jest.fn((e) => bill.handleChangeFile(e));
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      userEvent.upload(fileInput, fakeFile);
      expect(handleChangeFile).toHaveBeenCalled();
    });

    test("Then when I click to submit button handleSubmit has been call", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const bill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
      const handleSubmit = jest.fn(bill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      userEvent.click(screen.getByText("Envoyer"));
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
