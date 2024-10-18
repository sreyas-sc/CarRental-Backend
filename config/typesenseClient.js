import Typesense from 'typesense';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Typesense client
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

// Create a schema for the rentable vehicles
export const createSchema = async () => {
  const schema = {
    name: 'rentable_vehicles',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'make', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'year', type: 'string' },
      { name: 'price', type: 'float' },
      { name: 'quantity', type: 'int32' },
      { name: 'availability', type: 'int32' },
      { name: 'transmission', type: 'string' },
      { name: 'fuel_type', type: 'string' },
      { name: 'seats', type: 'int32' },
      { name: 'description', type: 'string' },
      { name: 'primaryImageUrl', type: 'string' },
      { name: 'additionalImageUrls', type: 'string[]' },
    ],
    default_sorting_field: 'price',
  };

  // Check if the collection exists before attempting to delete
  try {
    const existingCollection = await typesenseClient.collections('rentable_vehicles').retrieve();
    if (existingCollection) {
      console.log('Existing schema found, not deleting.');
      return; // Skip deletion if the collection exists
    }
  } catch (err) {
    // If the collection does not exist, we can safely create it
    console.log('No existing schema found, creating a new one.');
  }

  // Create the new collection
  try {
    await typesenseClient.collections().create(schema);
    console.log('Created schema');
  } catch (err) {
    console.error('Error creating schema:', err);
  }
};

// Function to index a vehicle in Typesense
export const indexVehicle = async (vehicle) => {
  try {
    // Check if the vehicle document already exists and update it if it does
    await typesenseClient.collections('rentable_vehicles').documents().upsert(vehicle);
    console.log('Indexed vehicle in Typesense');
  } catch (err) {
    console.error('Error indexing vehicle in Typesense:', err);
  }
};

// Export the Typesense client and other functions
export { typesenseClient };
