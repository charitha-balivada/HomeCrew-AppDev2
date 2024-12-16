export default {
    template: `
      <nav class="navbar navbar-expand-lg bg-body-tertiary" style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div class="container-fluid">
          <a class="navbar-brand" href="#" style="color: black; font-weight: bold;">HomeCrew</a>
          <button 
            class="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link class="nav-link active" aria-current="page" to="/" style="color: black;">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/login" style="color: black;">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/register" style="color: black;">Register</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `,
  };