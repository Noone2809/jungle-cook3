export default function login() {
    return `
    <div class="login-page">

        <form class="login-area" id="loginForm">
            <h1>Login Here!</h1>

            <label>Email Address</label>
            <input type="email" id="loginEmail" required>

            <label>Password</label>
            <input type="password" id="loginPassword" required>

            <button type="submit" class="login-button">Login</button>
        </form>

        <form class="signup-area" id="signupForm">
            <h2>don't have an account?</h2>
            <h1>Sign Up!</h1>

            <label>First Name</label>
            <input type="text" id="firstName" required>

            <label>Last Name</label>
            <input type="text" id="lastName" required>

            <label>Email Address</label>
            <input type="email" id="signupEmail" required>

            <label>Password</label>
            <input type="password" id="signupPassword" required>

            <button type="submit" class="signup-button">Sign Up</button>
        </form>

    </div>
    `;
}