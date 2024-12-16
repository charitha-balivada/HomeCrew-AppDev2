import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    template: `
      <div>
        <!-- Include the custom navbar -->
        <CustomerNavbar />
  
        <!-- Main content for the profile page -->
        <div class="d-flex justify-content-center align-items-center vh-100">
          <div class="card p-4 shadow" style="width: 24rem;">
            <h2 class="text-center mb-4">Customer Profile</h2>
            <div v-if="customer" class="mb-3">
              <h5>Name:</h5>
              <p>{{ customer.name }}</p>
            </div>
            <div v-if="customer" class="mb-3">
              <h5>Email:</h5>
              <p>{{ customer.email }}</p>
            </div>
            <div v-if="customer" class="mb-3">
              <h5>Phone Number:</h5>
              <p>{{ customer.phone_number }}</p>
            </div>
            <div v-if="customer" class="mb-3">
              <h5>Address:</h5>
              <p>{{ customer.address }}</p>
            </div>
            <div v-else>
              <p class="text-center">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        customer: null,
      };
    },
    async mounted() {
      try {
        // Retrieve the user object from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          console.error("Token not found or invalid.");
          this.$router.push('/login'); // Redirect to login if user data or token is missing
          return;
        }
  
        // Fetch the customer profile using the token
        const res = await fetch(`${location.origin}/customer/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`, // Include token in the request headers
          },
        });
  
        if (res.ok) {
          this.customer = await res.json(); // Store the fetched customer data
          console.log('Customer Data:', this.customer);
        } else {
          const errorData = await res.json();
          console.error('Failed to fetch customer profile:', errorData);
          if (res.status === 401) {
            alert('Authentication failed. Please log in again.');
            this.$router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert("An error occurred while fetching your profile.");
        this.$router.push('/login');
      }
    },
    components: {
      CustomerNavbar,
    },
  };
  