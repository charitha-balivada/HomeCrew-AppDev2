export default {
    template: `
      <nav class="navbar navbar-expand-lg bg-body-tertiary" style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div class="container-fluid">
          <a class="navbar-brand" href="#" style="color: black; font-weight: bold;">HomeCrew</a>
          <button 
            class="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#customerNavbar" 
            aria-controls="customerNavbar" 
            aria-expanded="false" 
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="customerNavbar">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link class="nav-link" to="/customer/home" style="color: black;">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/customer/profile" style="color: black;">Profile</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/requested-services" style="color: black;">Requested Services</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/customer/service-history" style="color: black;">History</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/services/search" style="color: black;">Search</router-link>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" style="color: black;" @click="logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `,
    methods: {
      async logout() {
        const token = JSON.parse(localStorage.getItem("user")).token;
  
        try {
          const res = await fetch(location.origin + "/logout", {
            method: "GET",
            headers: {
              "Authentication-Token": token,
            },
          });
  
          if (res.ok) {
            // Clear localStorage
            localStorage.removeItem("user");
  
            // Redirect to login page
            this.$router.push("/login");
          } else {
            console.error("Error logging out:", res.status);
            alert("Error logging out.");
          }
        } catch (error) {
          console.error("Error logging out:", error);
          alert("Error logging out.");
        }
      },
    },
  };
  