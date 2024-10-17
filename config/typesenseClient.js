// typesenseClient.js

import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: 'zqt97vp5eimsjaxrp-1.a1.typesense.net',
      port: '443',
      protocol: 'https',
    },
  ],
  apiKey: 'VSCBZiQouzeFl3VSafRgPw9ycXYm6tyc',
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

  try {
    await typesenseClient.collections('rentable_vehicles').delete();
    console.log('Deleted existing schema');
  } catch (err) {
    console.log('No existing schema found');
  }

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
    await typesenseClient.collections('rentable_vehicles').documents().create(vehicle);
    console.log('Indexed vehicle in Typesense');
  } catch (err) {
    console.error('Error indexing vehicle in Typesense:', err);
  }
};

export { typesenseClient };