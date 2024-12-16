import AdminNavbar from "../components/AdminNavbar.js";

export default {
    template: `
      <div>
        <AdminNavbar />
        <div class="container mt-4">
          <h1 class="text-center mb-4">Manage Users</h1>
  
          <!-- Filter Section -->
          <div class="mb-3">
            <label for="role" class="form-label">Filter by Role</label>
            <select id="role" class="form-select" v-model="selectedRole" @change="fetchUsers">
              <option value="">All</option>
              <option value="customer">Customers</option>
              <option value="service_professional">Professionals</option>
            </select>
          </div>
  
          <!-- Users List -->
          <div>
            <div v-if="isLoading">Loading users...</div>
            <div v-else-if="users.length === 0">No users available.</div>
            <div class="row">
              <div class="col-md-4" v-for="user in users" :key="user.id">
                <div class="card mb-3">
                  <div class="card-body">
                    <h5 class="card-title">{{ user.name }}</h5>
                    <p>Email: {{ user.email }}</p>
                    <p>Phone: {{ user.phone }}</p>
                    <p>Role: {{ user.role }}</p>
                    <p>Status: {{ user.active ? 'Active' : 'Flagged' }}</p>
                    <button class="btn btn-warning" @click="handleFlag(user.id)" :disabled="!user.active">
                      Flag
                    </button>
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
        users: [],
        isLoading: false,
        selectedRole: "", // Filter for 'customer' or 'professional'
      };
    },
    methods: {
      async apiCall(endpoint, options = {}) {
        const token = JSON.parse(localStorage.getItem("user")).token;
        const headers = {
          "Authentication-Token": token,
          "Content-Type": "application/json",
          ...options.headers,
        };
  
        try {
          const res = await fetch(endpoint, { ...options, headers });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Unknown Error");
          }
          return await res.json();
        } catch (error) {
          console.error(error.message);
        }
      },
  
      async fetchUsers() {
        this.isLoading = true;
        const roleParam = this.selectedRole ? `?role=${this.selectedRole}` : '';
        const data = await this.apiCall(`/admin/users${roleParam}`);
        if (data) {
          this.users = data.users || [];
        }
        this.isLoading = false;
      },
  
      async handleFlag(userId) {
        const res = await this.apiCall('/admin/flag-user', {
          method: 'POST',
          body: JSON.stringify({ user_id: userId }),
        });
        if (res) {
          this.fetchUsers(); // Refresh the users list after flagging
        }
      },
    },
    mounted() {
      this.fetchUsers();
    },
    components: {
      AdminNavbar,
    },
  };
  