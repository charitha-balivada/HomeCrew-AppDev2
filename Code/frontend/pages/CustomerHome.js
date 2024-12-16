// Import necessary components
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
  name: "CustomerPage",
  components: {
    CustomerNavbar, // Register the imported component
  },
  template: `
    <div>
      <CustomerNavbar />
      <div class="container mt-4">
        <!-- Available Services Section -->
        <h1 class="text-center mb-4">Available Services</h1>
        <div class="mb-3">
          <label for="service-category-filter">Filter by Category:</label>
          <select
            id="service-category-filter"
            class="form-control"
            v-model="selectedServiceCategory"
            @change="fetchServices"
          >
            <option value="">All</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="row">
          <div
            v-for="service in services"
            :key="service.id"
            v-if="service.name"
            class="col-md-4"
          >
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">{{ service.name }}</h5>
                <p class="card-text">{{ service.description }}</p>
                <p><strong>Price:</strong> {{ service.price }}</p>
                <p><strong>Category:</strong> {{ service.category }}</p>
                <button
                  class="btn btn-primary"
                  @click="$router.push({ path: '/request-service', query: { service_id: service.id } })"
                >
                  Request Service
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Professionals Section -->
        <h1 class="text-center mb-4 mt-5">Available Professionals</h1>
        <div class="mb-3">
          <label for="professional-category-filter">Filter by Category:</label>
          <select
            id="professional-category-filter"
            class="form-control"
            v-model="selectedProfessionalCategory"
            @change="fetchProfessionals"
          >
            <option value="">All</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="row">
          <div
            v-for="professional in professionals"
            :key="professional.id"
            class="col-md-4"
          >
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">{{ professional.fullname }}</h5>
                <p class="card-text">
                  <strong>Email:</strong> {{ professional.email }}
                </p>
                <p><strong>Phone:</strong> {{ professional.phone }}</p>
                <p><strong>Address:</strong> {{ professional.address }}</p>
                <p>
                  <strong>Category:</strong> {{ professional.service_category }}
                </p>
                <button
                  class="btn btn-primary"
                  @click="showRequestModalForProfessional(professional.id, professional.service_category)"
                >
                  Request Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Service Modal -->
      <div v-if="showModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Request Service</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="service-name" class="form-label">Select Service:</label>
                <select
                  id="service-name"
                  class="form-control"
                  v-model="selectedServiceName"
                >
                  <option value="">Select a service</option>
                  <option
                    v-for="service in filteredServices"
                    :key="service.id"
                    :value="service.name"
                  >
                    {{ service.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="request-date" class="form-label">Date of Request:</label>
                <input
                  type="date"
                  id="request-date"
                  class="form-control"
                  v-model="requestDate"
                />
              </div>
              <div class="mb-3">
                <label for="request-time" class="form-label">Time:</label>
                <input
                  type="time"
                  id="request-time"
                  class="form-control"
                  v-model="requestTime"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
              <button type="button" class="btn btn-primary" @click="sendServiceRequest">Send Request</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      services: [],
      professionals: [],
      categories: [
        "Cleaning",
        "Plumbing",
        "Electrical",
        "Painting",
        "Pest Control",
        "Repairs",
        "Gardening",
        "Appliances",
        "Grooming",
        "Moving",
      ],
      selectedServiceCategory: "",
      selectedProfessionalCategory: "",
      selectedServiceName: "", // Updated to store service name
      requestDate: "",
      requestTime: "",
      selectedProfessionalId: null,
      filteredServices: [],
      showModal: false,
    };
  },
  methods: {
    async fetchServices() {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const url = this.selectedServiceCategory
        ? `/api/services?category=${encodeURIComponent(this.selectedServiceCategory)}`
        : "/api/services";

      try {
        const res = await fetch(location.origin + url, {
          headers: {
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.services = Array.isArray(data) ? data : [];
        } else {
          console.error("Error fetching services, status:", res.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    },
    async fetchProfessionals() {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const url = this.selectedProfessionalCategory
        ? `/professionals?category=${encodeURIComponent(this.selectedProfessionalCategory)}`
        : "/professionals";

      try {
        const res = await fetch(location.origin + url, {
          headers: {
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.professionals = Array.isArray(data) ? data : [];
        } else {
          console.error("Error fetching professionals, status:", res.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    },
    showRequestModalForProfessional(professionalId, professionalCategory) {
      this.selectedProfessionalId = professionalId;
      this.filteredServices = this.services.filter((service) => {
        return service.category === professionalCategory;
      });
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.requestDate = "";
      this.requestTime = "";
      this.selectedProfessionalId = null;
      this.selectedServiceName = "";
    },
    async sendServiceRequest() {
      const token = JSON.parse(localStorage.getItem("user")).token;

      const serviceRequest = {
        service_name: this.selectedServiceName, // Send service name
        customer_id: JSON.parse(localStorage.getItem("user")).id, // Assuming the customer ID is stored here
        date_of_request: this.requestDate,
        time: this.requestTime,
      };

      try {
        const res = await fetch(location.origin + `/api/service-requests/professionals/${this.selectedProfessionalId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
          body: JSON.stringify(serviceRequest),
        });

        if (res.ok) {
          const data = await res.json();
          alert("Service request created successfully!");
          this.closeModal();
        } else {
          const errorData = await res.json();
          alert(`Error: ${errorData.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Request service error:", error);
      }
    },
  },
  async mounted() {
    await this.fetchServices();
    await this.fetchProfessionals();
  },
  watch: {
    selectedServiceCategory() {
      this.fetchServices();
    },
    selectedProfessionalCategory() {
      this.fetchProfessionals();
    },
  },
};
