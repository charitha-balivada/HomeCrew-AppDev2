import ProfessionalNavbar from "../components/ProfessionalNavbar.js"; 

export default {
  components: {
    ProfessionalNavbar,
  },
  template: `
    <div>
      <ProfessionalNavbar />
      <div class="container mt-4">
        <h1 class="text-center">Accepted Service Requests</h1>
        <div v-if="isLoading" class="text-center mt-4">
          Loading service requests...
        </div>
        <div v-else-if="serviceRequests.length === 0" class="alert alert-info mt-4">
          No accepted service requests available.
        </div>
        <div v-else class="row mt-4">
          <div class="col-md-4" v-for="request in serviceRequests" :key="request.id">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">{{ request.service_name }}</h5>
                <p>{{ request.description }}</p>
                <p><strong>Price:</strong> {{ request.price }}</p>
                <p><strong>Time Required:</strong> {{ request.time_required }}</p>
                <p>
                  <strong>Customer:</strong> {{ request.customer_name }}<br />
                  <strong>Address:</strong> {{ request.customer_address }}<br />
                  <strong>Pincode:</strong> {{ request.customer_pincode }}<br />
                  <strong>Date:</strong> {{ new Date(request.date_of_request).toLocaleDateString() }}
                </p>
                <button class="btn btn-danger btn-sm" @click="closeService(request.id)">
                  Close Service
                </button>
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
      isLoading: true,
    };
  },
  async created() {
    try {
      const res = await fetch(location.origin + "/professional/service-requests", {
        headers: {
          "Authentication-Token": JSON.parse(localStorage.getItem("user")).token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        this.serviceRequests = data.requests || [];
      } else {
        console.error("Error fetching service requests.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async closeService(id) {
      try {
        const res = await fetch(location.origin + `/service-requests/${id}/close`, {
          method: "POST",
          headers: {
            "Authentication-Token": JSON.parse(localStorage.getItem("user")).token,
          },
        });

        if (res.ok) {
          alert("Service request closed successfully!");
          this.serviceRequests = this.serviceRequests.filter(req => req.id !== id);
        } else {
          const errorData = await res.json();
          alert(`Error closing service: ${errorData.message || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error closing service:", error);
        alert("Failed to close service. Please try again.");
      }
    },
  },
};
