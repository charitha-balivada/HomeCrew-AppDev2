export default {
  template: `
      <div class="d-flex justify-content-center align-items-center vh-100">
          <div class="card p-4 shadow" style="width: 24rem;">
              <h2 class="text-center mb-4">Login</h2>
              <div class="form-group mb-3">
                  <label for="email">Email address</label>
                  <input
                      id="email"
                      type="email"
                      class="form-control"
                      placeholder="Enter email"
                      v-model="email"
                  />
              </div>
              <div class="form-group mb-3">
                  <label for="password">Password</label>
                  <input
                      id="password"
                      type="password"
                      class="form-control"
                      placeholder="Enter password"
                      v-model="password"
                  />
              </div>
              <button class="btn btn-primary w-100" @click="submitLogin">Login</button>
          </div>
      </div>
  `,
  data() {
      return { email: null, password: null };
  },
  methods: {
      async submitLogin() {
          try {
              const res = await fetch('/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: this.email, password: this.password })
              });

              if (res.ok) {
                  const data = await res.json();
                  localStorage.setItem('user', JSON.stringify(data));
                  this.$router.push(data.redirect_url);
              } else {
                  const errorData = await res.json();
                  alert(errorData.message || "Invalid login credentials!");
              }
          } catch (error) {
              console.error("Login error:", error);
              alert("An error occurred during login. Please try again.");
          }
      },
  },
};

