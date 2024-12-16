import AdminNavbar from "../components/AdminNavbar.js";

export default {
  template: `
    <div>
      <AdminNavbar />
      <div class="container mt-4">
        <h1 class="text-center mb-4">Manage Services</h1>

        <!-- Add Service Button -->
        <div class="text-end mb-3">
          <button class="btn btn-primary" @click="showAddServiceForm = true">Add Service</button>
        </div>

        <!-- Add/Edit Service Form -->
        <div v-if="showAddServiceForm || selectedService" class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">
              {{ selectedService ? "Edit Service" : "Add Service" }}
            </h5>
            <form @submit.prevent="saveService">
              <div class="mb-3">
                <label for="name" class="form-label">Service Name</label>
                <input v-model="formData.name" type="text" id="name" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="price" class="form-label">Base Price</label>
                <input v-model="formData.price" type="number" id="price" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="time" class="form-label">Time Required</label>
                <input v-model="formData.time_required" type="text" id="time" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea v-model="formData.description" id="description" class="form-control" required></textarea>
              </div>
              <div class="mb-3">
                <label for="category" class="form-label">Category</label>
                <select v-model="formData.category" id="category" class="form-control" required>
                  <option value="" disabled>Select a category</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="resetForm">Cancel</button>
                <button type="submit" class="btn btn-success">Save</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Services List -->
        <div>
          <div v-if="isLoading">Loading services...</div>
          <div v-else-if="services.length === 0">No services available.</div>
          <div class="row">
            <div class="col-md-4" v-for="service in services" :key="service.id">
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">{{ service.name }}</h5>
                  <p>Price: ₹{{ service.price }}</p>
                  <p>Time Required: {{ service.time_required }}</p>
                  <p>Category: {{ service.category }}</p>
                  <p>Description: {{ service.description }}</p>
                  <button class="btn btn-warning me-2" @click="editService(service)">Edit</button>
                  <button class="btn btn-danger" @click="deleteService(service.id)">Delete</button>
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
      services: [],
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
      formData: {
        id: null,
        name: "",
        price: "",
        time_required: "",
        description: "",
        category: "",
      },
      selectedService: null,
      showAddServiceForm: false,
      isLoading: false,
    };
  },
  methods: {
    async fetchServices() {
      this.isLoading = true;
      const token = JSON.parse(localStorage.getItem("user")).token;

      try {
        const response = await fetch("/api/services", {
          method: "GET",
          headers: { "Authentication-Token": token },
        });
        if (!response.ok) throw new Error("Failed to fetch services.");
        this.services = await response.json();
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async saveService() {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const method = this.selectedService ? "PUT" : "POST";
      const endpoint = this.selectedService
        ? `/api/services/${this.selectedService.id}`
        : "/api/services";

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
          body: JSON.stringify(this.formData),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to save service.");
        alert(result.message || "Service saved successfully.");
        this.resetForm();
        this.fetchServices();
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    },
    async deleteService(serviceId) {
      const token = JSON.parse(localStorage.getItem("user")).token;

      try {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: "DELETE",
          headers: { "Authentication-Token": token },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to delete service.");
        alert(result.message || "Service deleted successfully.");
        this.fetchServices();
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    },
    editService(service) {
      this.selectedService = service;
      this.formData = { ...service };
      this.showAddServiceForm = true;
    },
    resetForm() {
      this.formData = {
        id: null,
        name: "",
        price: "",
        time_required: "",
        description: "",
        category: "",
      };
      this.selectedService = null;
      this.showAddServiceForm = false;
    },
  },
  mounted() {
    this.fetchServices();
  },
  components: {
    AdminNavbar,
  },
};
