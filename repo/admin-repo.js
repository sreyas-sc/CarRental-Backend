// Repository pattern files for handling database operations. It abstracts complex SQL or Sequelize queries into reusable functions.

// admin-repo.js: This handles all database-related queries for the admin (e.g., fetching admin data, updating admin information).

import Admin from '../models/admin-model.js'
import Vehicle from '../models/vehicle-model.js';

class AdminRepo {
    async getAllAdmins() {
        return await Admin.findAll();
    }

    async createAdmin(email, password) {
        return await Admin.create({ email, password });
    }
    async createvehilce(make, model, year){
        return await Vehicle.create({make, model, year})
    }
    
}

module.exports = new AdminRepo();
