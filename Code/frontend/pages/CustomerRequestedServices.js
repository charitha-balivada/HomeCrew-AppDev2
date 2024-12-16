import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
  template: `
    <div>
      <CustomerNavbar />
      <div class="container mt-4">
        <h1 class="text-center mb-4">Your Requested Services</h1>

        <div v-if="pendingRequests.length === 0" class="text-center">
          <p>No pending service requests found.</p>
        </div>

        <div v-for="request in pendingRequests" :key="request.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ request.service_name }}</h5>
            <p><strong>Category:</strong> {{ request.service_category }}</p>
            <p><strong>Date:</strong> {{ request.date_of_request }}</p>
            <p><strong>Time:</strong> {{ request.time }}</p>
            <p><strong>Status:</strong> {{ request.service_status }}</p>

            <!-- Buttons -->
            <button class="btn btn-primary me-2" @click="editRequest(request)">Edit</button>
            <button class="btn btn-danger" @click="cancelRequest(request.id)">Cancel</button>
          </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingRequest" class="modal show d-block">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Service Request</h5>
                <button type="button" class="btn-close" @click="closeEditModal"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="updateRequest">
                  <div class="mb-3">
                    <label for="editDate" class="form-label">Date</label>
                    <input type="date" id="editDate" v-model="editedDate" class="form-control" required />
                  </div>
                  <div class="mb-3">
                    <label for="editTime" class="form-label">Time</label>
                    <input type="time" id="editTime" v-model="editedTime" class="form-control" required />
                  </div>
                  <button type="submit" class="btn btn-primary">Save Changes</button>
                  <button type="button" class="btn btn-secondary" @click="closeEditModal">Cancel</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      pendingRequests: [],
      editingRequest: null, // Current request being edited
      editedDate: "",
      editedTime: "",
    };
  },
  methods: {
    async fetchPendingRequests() {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const customerId = JSON.parse(localStorage.getItem("user")).id;

      try {
        const res = await fetch(`/api/service-requests/pending?customer_id=${customerId}`, {
          headers: { "Authentication-Token": token },
        });
        if (res.ok) {
          this.pendingRequests = await res.json();
        } else {
          console.error("Failed to fetch requests.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },

    async cancelRequest(requestId) {
      const token = JSON.parse(localStorage.getItem("user")).token;
      try {
        const res = await fetch(`/api/service-requests/${requestId}`, {
          method: "DELETE",
          headers: { "Authentication-Token": token },
        });
        if (res.ok) {
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== requestId);
        } else {
          alert("Failed to cancel request.");
        }
      } catch (error) {
        alert("Error canceling request.");
      }
    },

    editRequest(request) {
      this.editingRequest = request;
      this.editedDate = request.date_of_request;
      this.editedTime = request.time;
    },

    async updateRequest() {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const url = `/api/service-requests/${this.editingRequest.id}/update`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Authentication-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date_of_request: this.editedDate,
            time: this.editedTime,
          }),
        });
        if (res.ok) {
          this.editingRequest.date_of_request = this.editedDate;
          this.editingRequest.time = this.editedTime;
          this.closeEditModal();
        } else {
          alert("Failed to update request.");
        }
      } catch (error) {
        alert("Error updating request.");
      }
    },

    closeEditModal() {
      this.editingRequest = null;
    },
  },
  mounted() {
    this.fetchPendingRequests();
  },
  components: { CustomerNavbar },
};
