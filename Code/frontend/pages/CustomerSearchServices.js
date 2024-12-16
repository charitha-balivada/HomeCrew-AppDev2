import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
  template: `
    <div>
      <CustomerNavbar />
      <div class="container mt-4">
        <h1 class="text-center mb-4">Search Services</h1>

        <!-- Search Bar -->
        <input
          v-model="searchQuery"
          @input="searchServices"
          type="text"
          class="form-control"
          placeholder="Search by service name"
        />

        <div v-if="loading">Loading...</div>

        <!-- Search Results -->
        <div v-if="services.length > 0">
          <div v-for="service in services" :key="service.id" class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">{{ service.name }}</h5>
              <p><strong>Category:</strong> {{ service.category }}</p>
              <p><strong>Price:</strong> Rs.{{ service.price }}</p>
              <p><strong>Time Required:</strong> {{ service.time_required }}</p>
              <p><strong>Description:</strong> {{ service.description }}</p>
            </div>
          </div>
        </div>

        <!-- No Results Found -->
        <div v-else>
          <p>No services found matching the query.</p>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      searchQuery: '',  // User's search query
      services: [],     // List of services found
      loading: false,   // Loading indicator
    };
  },
  methods: {
    // Method to search services based on the search query
    async searchServices() {
      if (this.searchQuery.length < 3) {
        this.services = [];  // Hide results if query is too short (less than 3 characters)
        return;
      }

      this.loading = true;  // Show loading indicator
      try {
        const res = await fetch(`/search-services?query=${this.searchQuery}`);  // Call the backend search API
        if (res.ok) {
          this.services = await res.json();  // Update services list with response data
        } else {
          this.services = [];  // If no results, clear the services list
        }
      } catch (error) {
        console.error("Error fetching search results:", error);  // Handle any errors
        this.services = [];
      } finally {
        this.loading = false;  // Hide loading indicator after search completes
      }
    },
  },
  components: {
    CustomerNavbar,  // Include the CustomerNavbar component
  }
};
