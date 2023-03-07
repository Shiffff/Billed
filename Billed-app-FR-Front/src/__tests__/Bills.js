/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.className).toEqual("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("fetches bills from an API  ", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      expect(screen.getAllByText("accepted")).toBeTruthy();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
    test("fetches bills from an API and fails with message error", async () => {
      const billInstance = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      document.body.innerHTML =
        document.body.innerHTML + BillsUI({ data: bills });
      const eyeIconList = screen.getAllByTestId("icon-eye");

      const handleClickIconEye = jest.fn((icon) =>
        billInstance.handleClickIconEye(icon)
      );
      eyeIconList[0].addEventListener(
        "click",
        handleClickIconEye(eyeIconList[0])
      );
      userEvent.click(eyeIconList[0]);
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
});
