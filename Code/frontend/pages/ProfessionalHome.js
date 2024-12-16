import ProfessionalNavbar from "../components/ProfessionalNavbar.js";

export default {
  components: {
    ProfessionalNavbar
  },
  template: `
    <div>
      <ProfessionalNavbar />
      <h1 class="text-center mt-5">Professional Dashboard</h1>

      <!-- Status Messages -->
      <div v-if="status === 'pending'" class="alert alert-warning mt-4 text-center">
        Your document verification is still pending.
      </div>
      <div v-else-if="status === 'rejected'" class="alert alert-danger mt-4 text-center">
        Sorry, you're not selected. Better luck next time.
      </div>
      <div v-else-if="status === 'approved'">
        <div class="container mt-4">
          <h2>Available Service Requests</h2>
          <div v-if="availableRequests.length === 0" class="alert alert-info mt-3">
            No service requests available.
          </div>
          <ul class="list-group mt-3" v-else>
            <li
              class="list-group-item d-flex justify-content-between align-items-center"
              v-for="req in availableRequests"
              :key="req.id"
            >
              <div>
                <strong>{{ req.service_name }}</strong>
                <p>{{ req.description }}</p>
                <p><strong>Price:</strong> {{ req.price }} | <strong>Time:</strong> {{ req.time_required }}</p>
                <p>
                  <strong>Requested by:</strong> {{ req.customer_name }}
                  <br>
                  <strong>Address:</strong> {{ req.customer_address }}
                  <br>
                  <strong>Pincode:</strong> {{ req.customer_pincode }}
                  <br>
                  <small>On {{ new Date(req.date_of_request).toLocaleDateString() }} at {{ req.time }}</small>
                </p>
              </div>
              <div>
                <button
                  class="btn btn-success btn-sm"
                  @click="acceptAvailableRequest(req.id)"
                >
                  Accept
                </button>
              </div>
            </li>
          </ul>

          <h2 class="mt-5">Personal Service Requests</h2>
          <div v-if="personalRequests.length === 0" class="alert alert-info mt-3">
            No personal requests available.
          </div>
          <ul class="list-group mt-3" v-else>
            <li
              class="list-group-item d-flex justify-content-between align-items-center"
              v-for="req in personalRequests"
              :key="req.id"
            >
              <div>
                <strong>{{ req.service_name }}</strong>
                <p>{{ req.description }}</p>
                <p><strong>Price:</strong> {{ req.price }} | <strong>Time:</strong> {{ req.time_required }}</p>
                <p>
                  <strong>Requested by:</strong> {{ req.customer_name }}
                  <br>
                  <strong>Address:</strong> {{ req.customer_address }}
                  <br>
                  <strong>Pincode:</strong> {{ req.customer_pincode }}
                  <br>
                  <small>On {{ new Date(req.date_of_request).toLocaleDateString() }} at {{ req.time }}</small>
                </p>
              </div>
              <div>
                <button
                  class="btn btn-success btn-sm"
                  @click="handlePersonalRequest(req.id, 'accept')"
                >
                  Accept
                </button>
                <button
                  class="btn btn-danger btn-sm ml-2"
                  @click="handlePersonalRequest(req.id, 'reject')"
                >
                  Reject
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      status: "",
      availableRequests: [],
      personalRequests: [],
      errors: []
    };
  },
  async created() {
    try {
      const res = await fetch(`${location.origin}/professional/home`, {
        headers: {
          "Authentication-Token": JSON.parse(localStorage.getItem("user")).token
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message.toLowerCase().includes("pending")) {
          this.status = "pending";
        } else if (data.message.toLowerCase().includes("not selected")) {
          this.status = "rejected";
        } else if (data.message.toLowerCase().includes("available")) {
          this.status = "approved";
          this.availableRequests = data.available_requests || [];
          this.personalRequests = data.personal_requests || [];
        }
      } else {
        const errorData = await res.json();
        console.error("Error fetching data:", errorData.message || "Unknown error");
        this.errors.push(errorData.message || "Unable to fetch data.");
      }
    } catch (error) {
      console.error("Error:", error);
      this.errors.push(error.message);
    }
  },
  methods: {
    async acceptAvailableRequest(id) {
      try {
        const res = await fetch(`${location.origin}/service-requests/${id}/assign`, {
          method: "POST",
          headers: {
            "Authentication-Token": JSON.parse(localStorage.getItem("user")).token
          }
        });

        if (res.ok) {
          alert("Request accepted successfully!");
          this.availableRequests = this.availableRequests.filter((req) => req.id !== id);
        } else {
          const errorData = await res.json();
          console.error("Error accepting request:", errorData.message || "Unknown error");
          this.errors.push(errorData.message || "Unable to accept request.");
        }
      } catch (error) {
        console.error("Error:", error);
        this.errors.push(error.message);
      }
    },
    async handlePersonalRequest(id, action) {
      try {
        const res = await fetch(`${location.origin}/service-requests/${id}/${action}`, {
          method: "POST",
          headers: {
            "Authentication-Token": JSON.parse(localStorage.getItem("user")).token
          }
        });

        if (res.ok) {
          alert(`Request ${action}ed successfully!`);
          this.personalRequests = this.personalRequests.filter((req) => req.id !== id);
        } else {
          const errorData = await res.json();
          console.error(`Error ${action}ing request:`, errorData.message || "Unknown error");
          this.errors.push(errorData.message || `Unable to ${action} request.`);
        }
      } catch (error) {
        console.error("Error:", error);
        this.errors.push(error.message);
      }
    }
  }
};
