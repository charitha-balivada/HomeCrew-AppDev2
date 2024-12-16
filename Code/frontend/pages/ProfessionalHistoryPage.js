import ProfessionalNavbar from "../components/ProfessionalNavbar.js";

export default {
    template: `
      <div>
        <ProfessionalNavbar />
        <div class="container mt-4">
          <h1 class="text-center mb-4">Service History</h1>
          <div v-if="loading" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else>
            <div v-if="serviceHistory.length === 0" class="text-center text-muted">
              <p>No service history found.</p>
            </div>
            <div v-for="service in serviceHistory" :key="service.id" class="card mb-3 shadow">
              <div class="card-body">
                <h5 class="card-title">{{ service.service_name }}</h5>
                <p><strong>Date:</strong> {{ service.date_of_request }}</p>
                <p><strong>Time:</strong> {{ service.time }}</p>
                <p><strong>Customer:</strong> {{ service.customer_name }}</p>
                <p><strong>Rating:</strong> 
                  <span v-if="service.rating">{{ service.rating }} / 5</span>
                  <span v-else>No rating provided</span>
                </p>
                <p><strong>Remarks:</strong> {{ service.remarks || 'No remarks provided' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        serviceHistory: [],
        loading: true,
      };
    },
    async created() {
      await this.fetchServiceHistory();
    },
    methods: {
      async fetchServiceHistory() {
        const token = JSON.parse(localStorage.getItem("user")).token;
        const url = "/professional/service-history";
  
        try {
          const res = await fetch(location.origin + url, {
            headers: {
              "Authentication-Token": token,
            },
          });
  
          if (res.ok) {
            const data = await res.json();
            console.log('Service History Data:', data); // Log the response to check the structure
            if (Array.isArray(data)) {
              this.serviceHistory = data;
            } else {
              console.error("Unexpected response format:", data);
              this.serviceHistory = [];
            }
          } else {
            console.error("Error fetching service history, status:", res.status);
          }
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          this.loading = false;
        }
      },
    },
    components: {
      ProfessionalNavbar,
    },
  };
  