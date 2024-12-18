import bcrypt from 'bcrypt';
import { createToken } from '../../utils/createToken.js';
import Admin from '../../models/admin-model.js';
import User  from '../../models/user-model.js';
import Vehicle from '../../models/vehicle-model.js';
import RentableVehicle from '../../models/rentable-vehicle-model.js';
import sequelize from '../../models/db.js';
import minioClient from '../../config/minioClient.js';
import path from 'path';
import Booking from '../../models/booking-model.js';
import { GraphQLUpload } from 'graphql-upload';
import { Op } from 'sequelize';
import Razorpay from 'razorpay'; 
import dotenv from 'dotenv';
import crypto from 'crypto';
import twilio from  'twilio';  //for  sending otp via twilio

import { validateVehicle } from '../../requests/vehicleValidation.js';
// import { UserInputError, ApolloError } from 'apollo-server-micro';
import { validateAdminLogin, validateRentableVehicle } from '../../requests/admin.js'; //Joi validations
import { validateVehicleUpdate } from '../../requests/updateVehicleValidation.js'
import { ApolloError, UserInputError } from 'apollo-server'; //for showing apollo errors

import { indexVehicle } from '../../config/typesenseClient.js';
import Typesense from 'typesense';


// for configuration of the environment variables
dotenv.config();

// Twilio initialization
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// In-memory storage for OTPs
const otpStorage = new Map();


// Razorpay initialization
const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
  });

  const typesenseClient = new Typesense.Client({
    nodes: [
      {
        host: 'zqt97vp5eimsjaxrp-1.a1.typesense.net', // Your Typesense server host
        port: '443',
        protocol: 'https',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY, // Your Typesense API key
    connectionTimeoutSeconds: 2,
  });

// Workaround to get __dirname in ESM
import { fileURLToPath } from 'url';
import Make from '../../models/make-model.js';
import { validateMake } from '../../requests/validateMake.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadToMinio = async (filePath, fileName) => {
    const bucketName = 'your-bucket-name';
    const objectName = `${Date.now()}-${fileName}`;

    // Upload the file buffer to MinIO
    await minioClient.putObject(bucketName, objectName, fs.createReadStream(filePath));
    return await minioClient.presignedGetObject(bucketName, objectName);
};

const adminResolvers = {

    Upload: GraphQLUpload, //for file upload in graphql

    // *****************Queries**a*********************
    Query: {

        // Query to get all Admins
        getAllAdmins: async () => {
            return await Admin.findAll();
        },
        // __________________________________________________________________________

        // Query to get all the cars
        getAllCars: async () => {
            return await Vehicle.findAll({
                attributes: ['id', 'make', 'model', 'year', 'createdAt', 'updatedAt'],
            });
        },
        // __________________________________________________________________________

        // Get all makes( distinct for avoiding duplication)
        getAllMakes: async () => {
          return await Vehicle.findAll({
              attributes: [[sequelize.fn('DISTINCT', sequelize.col('make')), 'make']],
              raw: true,
          }).then(results => results.map(result => result.make));
      },


        getAllMakesQuery: async () => {
          return await Make.findAll({
              attributes: ['id','make'],
            
          });
      },

        // __________________________________________________________________________

        // Query to get the model of the  vehicle with the provided make
        getModelsByMake: async (_, { make }) => {
            return await Vehicle.findAll({ 
                attributes: ['model', 'year'], 
                where: { make } 
            });
        },
        // __________________________________________________________________________

        // Query to get the year by vehicle make and year( for filling the dropdown in add rentable vehicles)
        getVehicleByMakeAndModel: async (_, { make, model }) => {
            const vehicle = await Vehicle.findOne({ where: { make, model } });
            if (!vehicle) {
                throw new Error('Vehicle not found');
            }
            return vehicle;
        },
        // __________________________________________________________________________

        // Query get all the vehicles that are rentble(for admin view and user view)
        getRentableVehicles: async () => {
            try {
                const vehicles = await RentableVehicle.findAll(); // Correct usage of Sequelize
                return vehicles;
            } catch (error) {
                throw new Error('Failed to fetch rentable vehicles: ' + error.message);
            }
        }, 
        // __________________________________________________________________________   
        
        // Query to get all the available cars that the user can rent based on the provided input date(from and to date)
        async getAvailableCars(_, { startdate, enddate, searchTerm = '', sortBy = '' }) {
          try {
            // Step 1: Fetch bookings that overlap with the requested date range
            const overlappingBookings = await Booking.findAll({
              where: {
                [Op.or]: [
                  {
                    startDate: {
                      [Op.lte]: enddate,
                    },
                    endDate: {
                      [Op.gte]: startdate,
                    },
                  },
                  {
                    startDate: {
                      [Op.gte]: startdate,
                    },
                    endDate: {
                      [Op.lte]: enddate,
                    },
                  },
                ],
              },
            });
        
            // Step 2: Count booked vehicles
            const bookedVehicleCounts = overlappingBookings.reduce((acc, booking) => {
              acc[booking.vehicleId] = (acc[booking.vehicleId] || 0) + 1;
              return acc;
            }, {});
        
            // Step 3: Prepare Typesense search parameters
            let searchParameters = {
              q: searchTerm,
              query_by: 'make,model,description',
              sort_by: sortBy || 'price:asc',
              per_page: 100, 
            };
        
            // Step 4: Perform Typesense search
            const searchResults = await typesenseClient
              .collections('rentable_vehicles')
              .documents()
              .search(searchParameters);
        
            // Step 5: Filter available vehicles considering quantity
            const availableCars = searchResults.hits.filter(hit => {
              const vehicle = hit.document;
              const bookedCount = bookedVehicleCounts[vehicle.id] || 0;
              return vehicle.quantity > bookedCount;
            }).map(hit => hit.document);
        
            // Log available cars
            // console.log("Available Cars:", availableCars);
        
            // Step 6: Return the list of available cars
            return availableCars;
            
          } catch (error) {
            console.error('Error fetching available cars:', error);
            throw new Error('Error fetching available cars.');
          }
        },
        // __________________________________________________________________________
          
        // Query to get the vehicle details by the id of the vehicle
        getVehicleDetailsById: async (_, { id }) => {
            return await RentableVehicle.findOne({  // Use findOne to get a single record
                attributes: ['make', 'model', 'year', 'price', 'quantity', 'availability', 'transmission', 'fuel_type', 'seats', 'description', 'primaryImageUrl', 'additionalImageUrls'],
                where: { id }
            });
        },
        // __________________________________________________________________________

        // Get all the user bookings(for admin's view)
        getAllBookings: async () => {
          try {
              const bookings = await Booking.findAll({
                  include: [
                      {
                          model: User,
                          as: 'user',
                      },
                      {
                          model: RentableVehicle,
                          as: 'vehicle',
                          paranoid: false,  // Include soft-deleted vehicles
                      },
                  ],
                  paranoid: false, // Include soft-deleted bookings
              });
      
              console.log('Fetched bookings (including deleted):', bookings);
              return bookings;
          } catch (error) {
              console.error('Error fetching bookings (including deleted):', error);
              throw new Error(`Failed to fetch bookings: ${error.message}`);
          }
        },
        // __________________________________________________________________________
        
        // Query for getting the booking of a specific user based on the user id (Used in the user profile to show the bookings of the user)
        getBookingsByUserId: async (_, { userId }) => {
          try {
            // Fetch bookings for the specified userId
            const bookings = await Booking.findAll({ where: { userId } });
    
            // Map over the bookings to fetch user and vehicle details
            const bookingsWithDetails = await Promise.all(
              bookings.map(async (booking) => {
                const user = await User.findByPk(booking.userId);
                const vehicle = await RentableVehicle.findByPk(booking.vehicleId, { paranoid: false }); // Fetch vehicle details including deleted 
    
                return {
                  ...booking.dataValues, // Spread existing booking properties
                  user, // Include user details
                  vehicle, // Include vehicle details
                };
              })
            );
    
            return bookingsWithDetails;
          } catch (error) {
            throw new Error('Failed to fetch bookings: ' + error.message);
          }
        },
    },

    // ***************************Mutations********************
    Mutation: {

       

        // Mutation to add the vechile make, model and year
        addVehicle: async (_, { make, model, year }) => {
          try {
            // Validate input data
            const { error } = validateVehicle({ make, model, year });
            if (error) {
              const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
              }));
              throw new UserInputError('Validation Error', { errors });
            }
    
            // Check for existing vehicle with same make, model, and year
            const existingVehicle = await Vehicle.findOne({
              where: {
                make: make.trim(),
                model: model.trim(),
                year: year
              }
            });
    
            if (existingVehicle) {
              throw new UserInputError('Duplicate Vehicle', {
                errors: [{
                  field: 'general',
                  message: `A vehicle with make: ${make}, model: ${model}, and year: ${year} already exists.`
                }]
              });
            }
    
            // Create new vehicle
            const vehicle = await Vehicle.create({
              make: make.trim(),
              model: model.trim(),
              year
            });
    
            return vehicle;
          } catch (error) {
            if (error instanceof UserInputError) {
              throw error;
            }
            
            // Log the error for debugging
            console.error('Error adding vehicle:', error);
            
            throw new ApolloError('Failed to add vehicle', 'INTERNAL_SERVER_ERROR');
          }
        },
        // __________________________________________________________________________

        // Mutation for making razorpay payment   
        createRazorpayOrder: async (_, { input }) => {
            const { amount, currency } = input;

            try {
                // Create an order in Razorpay
                const order = await razorpay.orders.create({
                    amount: amount, // Amount in paisa
                    currency: currency,
                    receipt: `receipt_order_${new Date().getTime()}`, // unique receipt ID
                });

                // Return the created order
                return {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                };
            } catch (error) {
                console.error('Error creating Razorpay order:', error);
                throw new Error('Failed to create Razorpay order');
            }
        },
        // __________________________________________________________________________

        // Mutation to add Booking of the user
        addBooking: async (_, { input }) => {
            // console.log("Received booking input:", JSON.stringify(input, null, 2));
            try {
              const { 
                vehicleId, 
                userId, 
                startDate, 
                endDate, 
                status, 
                totalPrice, 
                razorpayPaymentId, 
                razorpayOrderId, 
                razorpaySignature 
              } = input;
      
              // Validate input
              if (!vehicleId || !userId || !startDate || !endDate || !status || !totalPrice || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
                throw new Error("Missing required fields");
              }
      
              // Verify Razorpay payment
              const generatedSignature = crypto
                .createHmac('sha256', process.env.KEY_SECRET)
                .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                .digest('hex');
      
              if (generatedSignature !== razorpaySignature) {
                throw new Error('Invalid payment signature');
              }
      
              // Fetch payment details from Razorpay
              const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
              // Verify payment amount and status
              if (payment.status !== 'captured' || payment.amount !== parseFloat(totalPrice) * 100) {
                throw new Error('Payment verification failed');
              }
      
              // Create the booking record in the database
              const booking = await Booking.create({
                vehicleId,
                userId,
                startDate,
                endDate,
                status,
                totalPrice,
                paymentId: razorpayPaymentId,
                orderId: razorpayOrderId
              });
      
              // console.log("Booking created:", booking);
              
              return booking;
            } catch (error) {
              console.error('Error adding booking:', error);
              throw new Error(`Failed to add booking: ${error.message}`);
            }
        },
        // __________________________________________________________________________

        // Mutation to add rentable vehicles by the admin
        addRentableVehicle: async (_, { input, primaryImage, additionalImages }) => {

          // Validate the input using Joi
          const { error } = validateRentableVehicle(input);
          if (error) {
            throw new Error(error.details[0].message); // Throw error with the first validation message
          }

          try {
            const {
              make,
              model,
              year,
              price,
              quantity,
              availability,
              transmission,
              fuel_type,
              seats,
              description,
            } = input;
        
            const bucketName = "carrental";
            const bucketExists = await minioClient.bucketExists(bucketName);
            if (!bucketExists) {
              await minioClient.makeBucket(bucketName);
            }
        
            // Function to upload files to MinIO
            const uploadFile = async (file) => {
              try {
                const { createReadStream, filename } = await file;
                const objectName = `${Date.now()}-${filename}`;
                const stream = createReadStream();
                await minioClient.putObject(bucketName, objectName, stream);
                return await minioClient.presignedGetObject(bucketName, objectName);
              } catch (error) {
                throw new Error(`Error uploading file: ${error.message}`);
              }
            };
        
            // Handle primary image upload
            let primaryImageUrl = '';
            if (primaryImage) {
              primaryImageUrl = await uploadFile(primaryImage);
            }
        
            // Handle additional images (secondary images) upload
            let additionalImageUrls = [];
            if (additionalImages && additionalImages.length > 0) {
              additionalImageUrls = await Promise.all(
                additionalImages.map((image) => uploadFile(image))
              );
            }
        
            // Create a new rentable vehicle entry in the database
            const vehicle = await RentableVehicle.create({
              make,
              model,
              year,
              price,
              quantity,
              availability,
              transmission,
              fuel_type,
              seats,
              description,
              primaryImageUrl,      // Save primary image URL
              additionalImageUrls,   // Save additional image URLs
            });

            // Index the vehicle in Typesense
            const typesenseDocument = {
              id: vehicle.id.toString(),
              make,
              model,
              year,
              price,
              quantity,
              availability,
              transmission,
              fuel_type,
              seats,
              description,
              primaryImageUrl,
              additionalImageUrls,
            };
            // console.log("Typesense document:", typesenseDocument);

            await indexVehicle(typesenseDocument);
            // console.log("Vehicle indexed in Typesense successfully");

        
            return vehicle;
          } catch (error) {
            console.error('Error adding rentable vehicle:', error);
            throw new Error(`Failed to add rentable vehicle: ${error.message}`);
          }
        },
        // __________________________________________________________________________
        
        // Mutation to delete the vehicles that the users can rent(soft delete is implemented so that even after deletion the user can see the booked car in bookings)
        deleteRentableVehicle: async (_, { id }) => {
            try {
                const result = await RentableVehicle.destroy({
                    where: { id }  // Specify the ID of the vehicle to delete
                });
        
                if (!result) {
                    return { success: false, message: "Vehicle not found." };
                }

                 // Ensure Typesense collection exists before attempting to delete
                const collectionExists = await typesenseClient.collections('rentable_vehicles').retrieve().catch(() => null);
                if (!collectionExists) {
                    console.error('Typesense collection does not exist.');
                    return { success: false, message: "Failed to delete vehicle from Typesense: collection not found." };
                }

                // Delete the vehicle from Typesense using the correct method
                await typesenseClient.collections('rentable_vehicles').documents(id.toString()).delete();        
                return { success: true, message: "Vehicle deleted successfully." };

                
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                return { success: false, message: "Failed to delete vehicle." };
            }
        },
        // __________________________________________________________________________

        // Mutation to update the rentable vehicles
        updateRentableVehicle: async ( _, { id, make, model, year, price, quantity, availability, transmission, fuel_type, seats, description, primaryImage, additionalImages },) => {
          
          // Validate the input using Joi
          

          try {
            // Find the vehicle by ID
            const vehicle = await RentableVehicle.findByPk(id);
            if (!vehicle) {
              return {
                success: false,
                message: 'Vehicle not found.',
                vehicle: null,
              };
            }
    
            // Prepare the input object for updates
            const input = {
              make: make !== undefined ? make : vehicle.make,
              model: model !== undefined ? model : vehicle.model,
              year: year !== undefined ? year : vehicle.year,
              price: price !== undefined ? price : vehicle.price,
              quantity: quantity !== undefined ? quantity : vehicle.quantity,
              availability: availability !== undefined ? availability : vehicle.availability,
              transmission: transmission !== undefined ? transmission : vehicle.transmission,
              fuel_type: fuel_type !== undefined ? fuel_type : vehicle.fuel_type,
              seats: seats !== undefined ? seats : vehicle.seats,
              description: description !== undefined ? description : vehicle.description,
              primaryImageUrl: vehicle.primaryImageUrl,
              additionalImageUrls: vehicle.additionalImageUrls
            };

            const { error } = validateVehicleUpdate(input);
          if (error) {
            throw new Error(error.details[0].message); // Throw error with the first validation message
          }

            const bucketName = "carrental";
            const bucketExists = await minioClient.bucketExists(bucketName);
            if (!bucketExists) {
              await minioClient.makeBucket(bucketName);
            }
    
            // Function to upload files to MinIO
            const uploadFile = async (file) => {
              try {
                  console.log('MinIO Client:', minioClient); // Log the client
                  const { createReadStream, filename } = await file;
                  const objectName = `${Date.now()}-${filename}`;
                  const stream = createReadStream();
                  await minioClient.putObject(bucketName, objectName, stream);
                  return await minioClient.presignedGetObject(bucketName, objectName);
              } catch (error) {
                  throw new Error(`Error uploading file: ${error.message}`);
              }
          };
          
    
            // Upload primary image if provided
            if (primaryImage) {
              input.primaryImageUrl = await uploadFile(primaryImage);
            }
    
            // Upload additional images if provided
            if (additionalImages && additionalImages.length > 0) {
              input.additionalImageUrls = await Promise.all(
                additionalImages.map((image) => uploadFile(image))
              );
            }
    
            // Update vehicle details
            await vehicle.update(input);
    
            // Fetch the updated vehicle data
            const updatedVehicle = await RentableVehicle.findByPk(id);
            if (!updatedVehicle) {
              return {
                success: false,
                message: 'Failed to retrieve updated vehicle.',
                vehicle: null,
              };
            }
    
            // Index the updated vehicle in Typesense
            const typesenseDocument = {
              id: String(id), // Explicitly convert id to a string
              make: make !== undefined ? make : vehicle.make,
              model: model !== undefined ? model : vehicle.model,
              year: year !== undefined ? year : vehicle.year,
              price: price !== undefined ? price : vehicle.price,
              quantity: quantity !== undefined ? quantity : vehicle.quantity,
              availability: availability !== undefined ? availability : vehicle.availability,
              transmission: transmission !== undefined ? transmission : vehicle.transmission,
              fuel_type: fuel_type !== undefined ? fuel_type : vehicle.fuel_type,
              seats: seats !== undefined ? seats : vehicle.seats,
              description: description !== undefined ? description : vehicle.description,
              primaryImageUrl: vehicle.primaryImageUrl,
              additionalImageUrls: vehicle.additionalImageUrls
            };
          
            try {
              await indexVehicle(typesenseDocument);
            } catch (error) {
              console.error("Error during indexing:", error);
            }

          
    
            // Return the updated vehicle with success message
            return {
              success: true,
              message: "Vehicle updated successfully.",
              vehicle: updatedVehicle.get({ plain: true }),
            };
          } catch (error) {
            console.error('Error updating vehicle:', error);
            return {
              success: false,
              message: `Failed to update vehicle: ${error.message}`,
              vehicle: null,
            };
          }
        },
        // __________________________________________________________________________
      
        // Mutation for admin login
        loginAdmin: async (_, { email, password }) => {

            // Step 1: Validate input using Joi
            const { error } = validateAdminLogin({ email, password });
            if (error) {
              throw new Error(error.details[0].message); // Throw validation error if present
            }
            // Step 2: Find admin by email
            const admin = await Admin.findOne({ where: { email } });
            if (!admin) {
              throw new Error('Admin not found');
            }

            // Step 3: Compare passwords
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
              throw new Error('Password does not match');
            }

            // Step 4: Generate JWT token
            const token = createToken(admin.id);
            // Step 5: Return the token and admin data
            return { token, user: admin }; // Return both token and user information
        },

        // Mutation for adding make to the database      
        addManufacturer: async (_, { make }) => {
          try{
            const {error} = validateMake({make});
            if(error){
              const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
              }));
              throw new UserInputError('Validation Error', {errors});

            }
            const existingMake = await Make.findOne({ 
              where: sequelize.where(
              sequelize.fn('LOWER', sequelize.col('make')), 
              sequelize.fn('LOWER', make.trim())
              ) 
            });
            if (existingMake) {
              throw new UserInputError('Make already exists', {
              errors: [{
                field: 'general',
                message: `${make} already exists`
              }]
              });
            }

            const newMake = await Make.create({ make: make.trim() });
            return newMake;
          }catch(error){
            if(error instanceof UserInputError){
              throw error;
            }
            console.error('Error adding make:', error);
            throw new ApolloError('Failed to add make', 'INTERNAL_SERVER_ERROR');

          }
        }

        // __________________________________________________________________________
    },
};

export default adminResolvers;