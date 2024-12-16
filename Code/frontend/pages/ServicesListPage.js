export default {
    template : `
    <div>
        <h1> Services List</h1>
        <h3 v-for="service in services"> {{service.name}} </h3>
    </div>
    
    `,
    data(){
        return {
            services : []
        }
    },
    methods : {

    },
    async mounted(){
        const res = await fetch(location.origin + '/api/services', {
            headers : {
                'Authentication-Token' : JSON.parse(localStorage.getItem('user')).token
            }
        })

        this.services = await res.json()
    }
}