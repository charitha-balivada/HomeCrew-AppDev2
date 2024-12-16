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

        <!-- Service Requests -->
        <div>
          <h2>Service Requests</h2>
          <div v-if="isLoading">Loading service requests...</div>
          <div v-if="serviceRequests.length === 0 && !isLoading">No service requests available.</div>
          <div class="row">
            <div class="col-md-4" v-for="request in serviceRequests" :key="request.id">
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">Service: {{ request.service.name }}</h5>
                  <p>Customer: {{ request.customer.fullname }}</p>
                  <p>Status: {{ request.service_status }}</p>
                  <p>Date: {{ request.date_of_request }}</p>
                  <button
                    class="btn btn-warning"
                    @click="handleAction('flag', request.id)"
                  >
                    Flag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Professionals -->
        <div class="mt-5">
          <h2>Pending Professionals</h2>
          <div v-if="isLoading">Loading pending professionals...</div>
          <div v-if="pendingProfessionals.length === 0 && !isLoading">
            No pending professional verifications.
          </div>
          <div class="row">
            <div class="col-md-4" v-for="professional in pendingProfessionals" :key="professional.id">
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">{{ professional.name }}</h5>
                  <p>Email: {{ professional.email }}</p>
                  <p>Phone: {{ professional.phone }}</p>
                  <p>Address: {{ professional.address }}</p>
                  <p>Experience: {{ professional.experience }} years</p>
                  <p>Category: {{ professional.service_category }}</p>
                  <a :href="getResumeUrl(professional.resume)" target="_blank" class="btn btn-info">View Resume</a>
                  <button
                    class="btn btn-success mt-2"
                    @click="handleAction('accept', professional.id)"
                  >
                    Accept
                  </button>
                  <button
                    class="btn btn-danger mt-2"
                    @click="handleAction('reject', professional.id)"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      serviceRequests: [],
      pendingProfessionals: [],
      errors: [], // New field to capture error messages
      isLoading: false, // New field to track loading state
    };
  },
  methods: {
    getResumeUrl(filename) {
      return `${filename}`;
    },
    async apiCall(endpoint, options = {}) {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const headers = {
        "Authentication-Token": token,
        "Content-Type": "application/json",
        ...options.headers,
      };

      try {
        const res = await fetch(endpoint, { ...options, headers });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Unknown Error");
        }
        return await res.json();
      } catch (error) {
        this.errors.push(error.message);
        console.error(error.message);
      }
    },
    async fetchServiceRequests() {
      this.isLoading = true; // Set loading to true
      const data = await this.apiCall("/admin/service-requests");
      if (data) this.serviceRequests = data.requests || [];
      this.isLoading = false; // Set loading to false
    },
    async fetchPendingProfessionals() {
      this.isLoading = true; // Set loading to true
      const data = await this.apiCall("/admin/pending-professionals");
      if (data) this.pendingProfessionals = data.professionals || [];
      this.isLoading = false; // Set loading to false
    },
    async handleAction(action, id) {
      const endpointMap = {
        flag: `/admin/flag-service-request/${id}`,
        accept: `/admin/accept-professional/${id}`,
        reject: `/admin/reject-professional/${id}`,
      };
      const endpoint = endpointMap[action];
      if (!endpoint) return;

      const res = await this.apiCall(endpoint, { method: "POST" });
      if (res) {
        this.fetchPendingProfessionals();
        this.fetchServiceRequests();
      }
    },
  },
  mounted() {
    this.fetchServiceRequests();
    this.fetchPendingProfessionals();
  },
  components: {
    AdminNavbar,
  },
};
