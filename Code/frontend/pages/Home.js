export default {
    template: `
      <div class="home-page">
        <!-- Navbar -->
        <nav class="navbar bg-light py-3 shadow" style="box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);">
          <div class="container">
            <a class="navbar-brand fw-bold fs-3 text-black" href="#">
              HomeCrew
            </a>
          </div>
        </nav>
  
        <!-- Main Content -->
        <div class="home-container d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 class="text-black text-center fw-bold mb-4" style="font-size: 3rem;">
            Welcome to HomeCrew!
          </h1>
          <p class="text-center text-black fs-5 mb-5" style="max-width: 600px;">
            Your one-stop destination for all your home service needs. From repairs to cleaning, we've got you covered!
          </p>
          <div>
            <router-link to="/login" class="btn btn-dark me-3 px-4 py-2">
              Login
            </router-link>
            <router-link to="/role-selection" class="btn btn-outline-dark px-4 py-2">
              Register
            </router-link>
          </div>
          <!-- Additions to fill the space -->
          <div class="mt-5 text-center">
            <p class="text-muted">
              Explore a wide range of home services tailored to meet your needs.
            </p>
            <p class="text-muted">
              Fast, reliable, and trusted professionals at your fingertips.
            </p>
          </div>
        </div>
      </div>
    `,
    style: `
      .home-page {
        background-color: #f8f9fa; /* Light background */
        color: #000; /* Black text */
        height: 100vh; /* Full height */
      }
  
      .navbar {
        background-color: #f8f9fa; /* Light navbar */
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25); /* Increased shadow */
      }
  
      .navbar-brand {
        font-family: 'Arial', sans-serif;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #000; /* Black text for HomeCrew */
      }
  
      .home-container {
        text-align: center;
        margin-top: -5rem; /* Center alignment tweak */
      }
  
      h1, p {
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1); /* Subtle text shadow */
      }
  
      .btn-dark {
        color: #fff; /* White text */
        background-color: #000; /* Black background */
        border: none;
        transition: transform 0.2s, background-color 0.2s;
      }
  
      .btn-dark:hover {
        background-color: #333; /* Darker black on hover */
        transform: scale(1.05); /* Slight scale effect */
      }
  
      .btn-outline-dark {
        color: #000; /* Black text */
        border: 2px solid #000; /* Black border */
        background-color: transparent;
        transition: transform 0.2s, border-color 0.2s;
      }
  
      .btn-outline-dark:hover {
        background-color: #000; /* Black background */
        color: #fff; /* White text on hover */
        transform: scale(1.05); /* Slight scale effect */
      }
  
      .text-muted {
        font-size: 1rem;
        color: #6c757d; /* Light gray for muted text */
      }
    `,
  };
  