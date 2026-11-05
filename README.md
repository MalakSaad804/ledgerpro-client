# LedgerPro Client

React booking interface for **LedgerPro Accountants**. Customers log in, browse services, pick a date, choose an open time slot and confirm a booking. Uses the [ledgerpro-api](https://github.com/MalakSaad804/ledgerpro-api) backend.

**Stack:** React 19, Vite, React Router, Axios, Formik, Yup.

## Run locally

1. Start the API (`npm run seed` once, then `npm run dev` in `ledgerpro-api`, port 5000).
2. In this folder:

```bash
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

Demo logins created by the API seed script:
- Customer: register a new account on the Register page
- Staff: `staff@ledgerpro.com` / `Staff@12345`

## Booking flow

1. Log in or register (customers only can book).
2. **Services** page lists active services from `GET /services`.
3. **Book now** opens `/book/:serviceId`. Picking a date calls `GET /services/:id/slots?date=...`; slots come from staff working hours minus existing bookings.
4. Choose a slot, add optional notes, **Confirm booking** posts to `POST /customer/bookings`.
5. **My bookings** lists bookings and allows cancelling.

## Structure

```
src/
  api/client.js          Axios instance, token interceptor, error messages
  context/AuthContext    login state, session restore from saved token
  components/            Navbar, ProtectedRoute, SlotPicker, Spinner/ErrorBox
  pages/                 Login, Register, Services, Book, MyBookings
```

## Loading, error and validation handling

- Every request shows a spinner while loading and an error box with a **Try again** button when it fails (network down, timeout, server error).
- Forms use Formik + Yup: required fields, email format, password length and match, date not in the past, slot required, notes up to 300 characters. Errors show under each field.
- If a slot is taken while the customer is choosing (API returns 409 `SLOT_TAKEN`), the slot list refreshes and the customer is asked to pick again.
- An expired token logs the user out and returns them to the login page.

## Decisions

- **Token in localStorage:** simple for a separate frontend host. Trade-off: readable by scripts if the site had an XSS bug, so the API keeps tokens short-lived (1 day).
- **Slots are fetched from the server per date**, never calculated in the browser, so the UI always matches staff availability.
- **Times shown in a fixed business time zone** (`VITE_TIME_ZONE`) to match the API.

## Limitations

- No automated tests yet; the flow was checked manually in the browser.
- Staff screens (editing availability) are API-only for now.
