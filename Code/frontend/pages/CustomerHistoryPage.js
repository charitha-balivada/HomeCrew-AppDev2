import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
  template: `
    <div>
      <CustomerNavbar />
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
              <p><strong>Professional:</strong> {{ service.professional_name }}</p>
              <p><strong>Remarks:</strong> {{ service.remarks || 'No remarks yet' }}</p>
              <p><strong>Rating:</strong> 
                <span v-if="service.rating">{{ service.rating }} / 5</span>
                <span v-else>No rating yet</span>
              </p>

              <!-- Rating Section -->
              <div v-if="!service.rating">
                <label :for="'rating-' + service.id" class="form-label">Rate this service:</label>
                <select
                  :id="'rating-' + service.id"
                  class="form-select mb-3"
                  v-model="service.feedbackRating"
                >
                  <option disabled value="">Select rating</option>
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>

              <!-- Remarks Section -->
              <textarea
                class="form-control mb-3"
                placeholder="Add remarks"
                v-model="service.feedbackRemarks"
              ></textarea>

              <!-- Submit Feedback Button -->
              <button
                class="btn btn-primary"
                @click="submitFeedback(service)"
                :disabled="service.isSubmitting"
              >
                Submit Feedback
              </button>
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
      const url = "/customer/service-history";

      try {
        const res = await fetch(location.origin + url, {
          headers: {
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            this.serviceHistory = data.map((service) => ({
              ...service,
              feedbackRating: service.rating || "",
              feedbackRemarks: service.remarks || "",
              isSubmitting: false,
            }));
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
    async submitFeedback(service) {
      service.isSubmitting = true;
      const token = JSON.parse(localStorage.getItem("user")).token;

      try {
        const res = await fetch(location.origin + "/customer/service-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
          body: JSON.stringify({
            id: service.id,
            rating: service.feedbackRating,
            remarks: service.feedbackRemarks,
          }),
        });

        if (res.ok) {
          alert("Feedback submitted successfully");
          service.rating = service.feedbackRating;
          service.remarks = service.feedbackRemarks;
        } else {
          console.error("Error submitting feedback, status:", res.status);
          alert("Failed to submit feedback.");
        }
      } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("An error occurred while submitting feedback.");
      } finally {
        service.isSubmitting = false;
      }
    },
  },
  components: {
    CustomerNavbar,
  },
};
