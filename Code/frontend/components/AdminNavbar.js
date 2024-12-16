export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand" href="#" style="font-weight: bold; color: #333;">HomeCrew</a>
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#adminNavbar" 
        aria-controls="adminNavbar" 
        aria-expanded="false" 
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="adminNavbar">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/home" style="color: #555;">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/users" style="color: #555;">Users</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/services" style="color: #555;">Services</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/summary" style="color: #555;">Summary</router-link>
          </li>
          <li class="nav-item">
            <button class="btn btn-success mt-2 me-3" @click="downloadCSV">
              <i class="fas fa-download me-2"></i>Export CSV
            </button>
          </li>
          <li class="nav-item">
            <button class="btn btn-danger mt-2" @click="logout">
              <i class="fas fa-sign-out-alt me-2"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `,
  data() {
    return {
      exportStatus: null,
      downloadLink: null,
    };
  },
  methods: {
    async logout() {
      const token = JSON.parse(localStorage.getItem("user")).token;

      try {
        const res = await fetch(location.origin + "/logout", {
          method: "GET",
          headers: {
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          // Clear localStorage
          localStorage.removeItem("user");

          // Redirect to login page
          this.$router.push("/login");
        } else {
          console.error("Error logging out:", res.status);
          alert("Error logging out.");
        }
      } catch (error) {
        console.error("Error logging out:", error);
        alert("Error logging out.");
      }
    },
    async downloadCSV() {
      try {
        // Trigger the CSV export
        const response = await fetch("/admin/export-closed-requests", {
          method: "POST",
        });
        const data = await response.json();

        // Monitor the export status
        this.checkExportStatus(data.task_id);
      } catch (error) {
        console.error("Error exporting CSV:", error);
      }
    },
    async checkExportStatus(taskId) {
      try {
        const interval = setInterval(async () => {
          const response = await fetch(`/admin/export-status/${taskId}`);
          const data = await response.json();

          if (data.status === "completed") {
            this.exportStatus = "Completed";
            this.downloadLink = data.file_path;
            clearInterval(interval);

            // Automatically download the file
            const link = document.createElement("a");
            link.href = this.downloadLink;
            link.download = "closed_service_requests.csv";
            link.click();
          } else if (data.status === "failed") {
            this.exportStatus = `Failed: ${data.error}`;
            clearInterval(interval);
          } else {
            this.exportStatus = data.status;
          }
        }, 3000);
      } catch (error) {
        console.error("Error checking export status:", error);
      }
    },
  },
};
