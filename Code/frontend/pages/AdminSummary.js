import AdminNavbar from "../components/AdminNavbar.js";

export default {
  template: `
    <div>
      <AdminNavbar />
      <div class="container mt-4">
        <h1 class="text-center mb-4">Admin Dashboard</h1>

        <!-- Error Messages -->
        <div v-if="errors.length" class="alert alert-danger">
          <ul>
            <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
          </ul>
        </div>

        <!-- Statistics Cards -->
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card text-dark bg-light" style="background-color: #d0e7f1;">
              <div class="card-body">
                <h5 class="card-title">Total Customers</h5>
                <p class="card-text fs-4">{{ totalUsers.num_customers }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-4">
            <div class="card text-dark bg-light" style="background-color: #b7e3d0;">
              <div class="card-body">
                <h5 class="card-title">Total Service Professionals</h5>
                <p class="card-text fs-4">{{ totalUsers.num_professionals }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-4">
            <div class="card text-dark bg-light" style="background-color: #f5d49e;">
              <div class="card-body">
                <h5 class="card-title">Service Requests by Category</h5>
                <ul class="list-unstyled">
                  <li v-for="(count, category) in serviceRequestsByCategory" :key="category">
                    {{ category }}: {{ count }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-4">
            <div class="card text-dark bg-light" style="background-color: #f2a8a1;">
              <div class="card-body">
                <h5 class="card-title">Ratings Distribution</h5>
                <ul class="list-unstyled">
                  <li v-for="(count, rating) in ratingsDistribution" :key="rating">
                    {{ rating }} Star: {{ count }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-4">
            <div class="card text-dark bg-light" style="background-color: #a8c8e1;">
              <div class="card-body">
                <h5 class="card-title">Professionals by Category</h5>
                <ul class="list-unstyled">
                  <li v-for="(count, category) in professionalsByCategory" :key="category">
                    {{ category }}: {{ count }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      totalUsers: {
        num_customers: 0,
        num_professionals: 0,
      },
      serviceRequestsByCategory: {},
      ratingsDistribution: {},
      professionalsByCategory: {},
      errors: [],
    };
  },
  methods: {
    async fetchStatistics(endpoint, key) {
      const token = JSON.parse(localStorage.getItem("user")).token;
      try {
        const response = await fetch(location.origin + endpoint, {
          headers: {
            "Authentication-Token": token,
          },
        });
        if (response.ok) {
          this[key] = await response.json();
        } else {
          const errorData = await response.json();
          this.errors.push(errorData.message || "Error fetching data");
        }
      } catch (error) {
        this.errors.push(error.message);
      }
    },
  },
  mounted() {
    this.fetchStatistics("/admin/total-users", "totalUsers");
    this.fetchStatistics("/admin/service-requests-by-category", "serviceRequestsByCategory");
    this.fetchStatistics("/admin/ratings-distribution", "ratingsDistribution");
    this.fetchStatistics("/admin/professionals-by-category", "professionalsByCategory");
  },
  components: {
    AdminNavbar,
  },
};
