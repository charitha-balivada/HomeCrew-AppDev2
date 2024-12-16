export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: 4rem;">
        <div class="card p-4 shadow" style="width: 28rem;">
            <h2 class="text-center mb-4">Register as Service Professional</h2>
            <div class="form-group mb-3">
                <label for="fullname">Full Name</label>
                <input
                    id="fullname"
                    type="text"
                    class="form-control"
                    placeholder="Enter full name"
                    v-model="fullname"
                    required
                />
            </div>
            <div class="form-group mb-3">
                <label for="email">Email Address</label>
                <input
                    id="email"
                    type="email"
                    class="form-control"
                    placeholder="Enter email"
                    v-model="email"
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
                />
            </div>
            <div class="form-group mb-3">
                <label for="experience">Experience (in years)</label>
                <input
                    id="experience"
                    type="number"
                    class="form-control"
                    placeholder="Enter years of experience"
                    v-model="experience"
                    required
                />
            </div>
            <div class="form-group mb-3">
                <label for="serviceCategory">Service Category</label>
                <select
                    id="serviceCategory"
                    class="form-control"
                    v-model="serviceCategory"
                    required
                >
                    <option disabled value="">Select a category</option>
                    <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                    </option>
                </select>
            </div>
            <div class="form-group mb-3">
                <label for="resume">Upload Resume</label>
                <input
                    id="resume"
                    type="file"
                    class="form-control"
                    @change="handleFileUpload"
                    required
                />
                <small v-if="resume && resume.size > 5 * 1024 * 1024" class="text-danger">Resume file size exceeds the 5MB limit</small>
            </div>
            <button
                class="btn btn-primary w-100"
                @click="submitRegister"
                :disabled="isSubmitting"
            >
                Register
            </button>
            <div v-if="isSubmitting" class="text-center mt-3">
                <span>Submitting...</span>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            fullname: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            address: '',
            pincode: '',
            experience: '',
            serviceCategory: '',
            resume: null,
            isSubmitting: false,
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
            ], // Static list of categories
        };
    },
    methods: {
        handleFileUpload(event) {
            this.resume = event.target.files[0];
        },
        async submitRegister() {
            if (this.password !== this.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Create FormData for submission
            const formData = new FormData();
            formData.append('email', this.email);
            formData.append('password', this.password);
            formData.append('confirmPassword', this.confirmPassword);
            formData.append('fullname', this.fullname);
            formData.append('phone', this.phone);
            formData.append('address', this.address);
            formData.append('pincode', this.pincode);
            formData.append('experience', this.experience);
            formData.append('serviceCategory', this.serviceCategory);
            formData.append('resume', this.resume);

            this.isSubmitting = true;

            try {
                const res = await fetch(location.origin + '/professional/register', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    alert('Registration successful!');
                    this.$router.push('/login');
                } else {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error("Submission error:", error);
                alert("An error occurred during registration.");
            } finally {
                this.isSubmitting = false;
            }
        },
        resetForm() {
            this.fullname = '';
            this.email = '';
            this.password = '';
            this.confirmPassword = '';
            this.phone = '';
            this.address = '';
            this.pincode = '';
            this.experience = '';
            this.serviceCategory = '';
            this.resume = null;
        },
    },
};
