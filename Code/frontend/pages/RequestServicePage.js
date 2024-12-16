export default {
    template: `
      <div class="container mt-4">
        <h1 class="text-center mb-4">Request Service</h1>
        <form @submit.prevent="submitRequest">
          <div class="mb-3">
            <label for="date" class="form-label">Select Date:</label>
            <input 
              type="date" 
              id="date" 
              v-model="date" 
              class="form-control" 
              required 
            />
          </div>
          <div class="mb-3">
            <label for="time" class="form-label">Select Time:</label>
            <input 
              type="time" 
              id="time" 
              v-model="time" 
              class="form-control" 
              required 
            />
          </div>
          <button type="submit" class="btn btn-primary">Submit Request</button>
        </form>
      </div>
    `,
    data() {
      return {
        date: "",
        time: "",
        remarks: "",
        serviceId: null, // To hold the service_id passed as a query parameter
      };
    },
    methods: {
      async submitRequest() {
        try {
          const token = JSON.parse(localStorage.getItem("user")).token;
          const customerId = JSON.parse(localStorage.getItem("user")).id; // Add customer_id here
  
          // Validate required fields
          if (!this.date || !this.time || !this.serviceId || !customerId) {
            alert("Please fill in all required fields.");
            return;
          }
  
          // Prepare request payload
          const payload = {
            service_id: this.serviceId,
            customer_id: customerId, // Adding the customer_id to the payload
            date_of_request: this.date, // YYYY-MM-DD format is expected from <input type="date">
            time: this.time, // HH:MM format is expected from <input type="time">
            remarks: this.remarks,
          };
  
          // Send POST request to backend
          const response = await fetch("http://127.0.0.1:5000/api/service-requests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": token,
            },
            body: JSON.stringify(payload),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            alert("Service request submitted successfully!");
            this.$router.push("/customer/home"); // Redirect after success
          } else {
            console.error("Error submitting request:", data);
            alert(`Failed to submit request: ${data.message || "Unknown error"}`);
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while submitting the request.");
        }
      },
    },
    mounted() {
      // Retrieve service_id from query parameters
      const query = this.$route.query;
      if (query.service_id) {
        this.serviceId = query.service_id;
      } else {
        alert("Invalid access. No service selected.");
        this.$router.push("/customer/home"); // Redirect if service_id is missing
      }
    },
  };
  