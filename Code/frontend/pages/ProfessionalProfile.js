import ProfessionalNavbar from "../components/ProfessionalNavbar.js";

export default {
  components: {
    ProfessionalNavbar,
  },
  template: `
    <div>
      <!-- Add Professional Navbar -->
      <ProfessionalNavbar />

      <div class="container mt-5">
        <h1 class="text-center">Your Profile</h1>
        <form @submit.prevent="updateProfile" class="mt-4">
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input
              type="text"
              id="name"
              v-model="profile.name"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              v-model="profile.email"
              class="form-control"
              disabled
            />
          </div>
          <div class="mb-3">
            <label for="phone" class="form-label">Phone</label>
            <input
              type="text"
              id="phone"
              v-model="profile.phone"
              class="form-control"
              disabled
            />
          </div>
          <div class="mb-3">
            <label for="service_category" class="form-label">Service Category</label>
            <input
              type="text"
              id="service_category"
              v-model="profile.service_category"
              class="form-control"
              disabled
            />
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Address</label>
            <input
              type="text"
              id="address"
              v-model="profile.address"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="experience" class="form-label">Experience (Years)</label>
            <input
              type="number"
              id="experience"
              v-model="profile.experience"
              class="form-control"
            />
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      profile: {
        name: "",
        email: "",
        phone: "",
        service_category: "",
        address: "",
        experience: "",
      },
    };
  },
  methods: {
    async fetchProfile() {
      const token = JSON.parse(localStorage.getItem("user")).token;

      try {
        const res = await fetch(location.origin + "/professional/profile", {
          headers: {
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          this.profile = await res.json();
        } else {
          console.error("Error fetching profile:", res.status);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },
    async updateProfile() {
      const token = JSON.parse(localStorage.getItem("user")).token;

      try {
        const res = await fetch(location.origin + "/professional/profile", {
          method: "PUT",
          headers: {
            "Authentication-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.profile.name,
            address: this.profile.address,
            experience: this.profile.experience,
          }),
        });

        if (res.ok) {
          alert("Profile updated successfully!");
        } else {
          console.error("Error updating profile:", res.status);
          alert("Error updating profile.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile.");
      }
    },
  },
  mounted() {
    this.fetchProfile();
  },
};
