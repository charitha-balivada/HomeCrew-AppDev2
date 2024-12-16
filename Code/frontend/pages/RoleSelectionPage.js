// RoleSelectionPage.js
export default {
    template: `
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center mt-5">
            <h2 class="mb-4">Choose Your Role</h2>
            <button class="btn btn-primary btn-lg" @click="navigateToCustomerRegister">Register as Customer</button>
            <button class="btn btn-secondary btn-lg mt-3" @click="navigateToProfessionalRegister">Register as Service Professional</button>
          </div>
        </div>
      </div>
    `,
    methods: {
      navigateToCustomerRegister() {
        this.$router.push("/customer/register");
      },
      navigateToProfessionalRegister() {
        this.$router.push("/professional/register");
      }
    }
  };
  