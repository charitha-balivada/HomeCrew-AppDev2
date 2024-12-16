export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: 4rem;">
        <div class="card p-4 shadow" style="width: 28rem;">
            <h2 class="text-center mb-4">Register as Customer</h2>
            <div class="form-group mb-3">
                <label for="fullname">Full Name</label>
                <input
                    id="fullname"
                    type="text"
                    class="form-control"
                    placeholder="Enter full name"
                    v-model="fullname"
                />
            </div>
            <div class="form-group mb-3">
                <label for="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    class="form-control"
                    placeholder="Enter email"
                    v-model="email"
                />
            </div>
            <div class="form-group mb-3">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    class="form-control"
                    placeholder="Enter password"
                    v-model="password"
                />
            </div>
            <div class="form-group mb-3">
                <label for="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    class="form-control"
                    placeholder="Confirm password"
                    v-model="confirmPassword"
                />
            </div>
            <div class="form-group mb-3">
                <label for="phone">Phone Number</label>
                <input
                    id="phone"
                    type="text"
                    class="form-control"
                    placeholder="Enter phone number"
                    v-model="phone"
                />
            </div>
            <div class="form-group mb-3">
                <label for="address">Address</label>
                <input
                    id="address"
                    type="text"
                    class="form-control"
                    placeholder="Enter address"
                    v-model="address"
                />
            </div>
            <div class="form-group mb-3">
                <label for="pincode">Pincode</label>
                <input
                    id="pincode"
                    type="text"
                    class="form-control"
                    placeholder="Enter pincode"
                    v-model="pincode"
                />
            </div>
            <button
                class="btn btn-primary w-100"
                @click="submitRegister"
            >
                Register
            </button>
        </div>
    </div>
    `,
    data() {
        return {
            fullname: null,
            email: null,
            password: null,
            confirmPassword: null,
            phone: null,
            address: null,
            pincode: null,
        };
    },
    methods: {
        async submitRegister() {
            if (this.password !== this.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const formData = {
                fullname: this.fullname,
                email: this.email,
                password: this.password,
                confirmPassword: this.confirmPassword,
                phone: this.phone,
                address: this.address,
                pincode: this.pincode,
            };

            try {
                const res = await fetch(location.origin + '/customer/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    alert('Registration successful!');
                    this.$router.push('/login');
                } else {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert("An error occurred while submitting the form. Please try again.");
            }
        },
    },
};
