# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## 1. **Direct Access via Browser**

- If you visit [http://localhost:5000/](http://localhost:5000/) in your browser, you’ll see a 404 error because your backend does **not** define a route for `/`.
- This is normal for an API-only backend.

---

## 2. **Accessing API Endpoints**

Your backend exposes endpoints under `/auth`:
- **Register:** `POST http://localhost:5000/auth/register`
- **Login:** `POST http://localhost:5000/auth/login`

You can interact with these endpoints using:
- Your React frontend (already set up)
- Tools like **Postman**, **Insomnia**, or **curl** for manual testing

**Example using curl:**
```sh
# Register a user
curl -X POST http://localhost:5000/auth/register -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}'

# Login
curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}'
```

---

## 3. **Adding a Root Route (Optional)**

If you want to see a message at the backend root, add this to `server/server.js`:
```js
app.get('/', (req, res) => {
  res.send('Backend API is running');
});
```
Then restart your backend. Now, visiting [http://localhost:5000/](http://localhost:5000/) will show "Backend API is running".

---

## 4. **Checking Backend Logs**

- The best way to see what your backend is doing is to look at the terminal where you ran `docker-compose up`.
- Any errors or requests will be logged there.

---

## 5. **Summary Table**

| How to Access         | What You See/Do                        |
|-----------------------|----------------------------------------|
| http://localhost:5000/| 404 (unless you add a root route)      |
| /auth/register        | Register a user (POST request)         |
| /auth/login           | Login (POST request)                   |
| Terminal logs         | See backend activity/errors            |

---

**If you want to test your backend directly, use Postman, curl, or add a root route as shown above. If you want to add more API endpoints, let me know!**

---

## 1. **Login with the Account You Just Created**

- In Postman, create a new request:
  - **Method:** `POST`
  - **URL:** `http://localhost:5000/auth/login`
  - **Body:** (raw, JSON)
    ```json
    {
      "username": "the_username_you_used",
      "password": "the_password_you_used"
    }
    ```
- Click **Send**.

**Expected Result:**  
You should get a response like:
```json
{ "token": "..." }
```
If you get an error, let me know the exact error message.

---

## 2. **What Does the Token Mean?**

- The token is a "login ticket" (JWT) that proves you are authenticated.
- In a real app, you would use this token to access protected routes (like `/dashboard`).

---

## 3. **If You Want to Test Protected Routes (Optional)**

If you later add protected endpoints, you’ll need to:
- Copy the token from the login response.
- In Postman, add a header:
  ```
  Authorization: Bearer <your_token_here>
  ```

---

## 4. **Summary Table**

| Action         | Method | URL                                 | Body Example                                      |
|----------------|--------|-------------------------------------|---------------------------------------------------|
| Register       | POST   | http://localhost:5000/auth/register | `{ "username": "testuser", "password": "testpass" }` |
| Login          | POST   | http://localhost:5000/auth/login    | `{ "username": "testuser", "password": "testpass" }` |

---

**Try logging in now in Postman and let me know what response you get!**
