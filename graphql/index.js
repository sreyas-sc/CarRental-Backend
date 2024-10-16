// Combines and exports all GraphQL type definitions and resolvers into a single object that the Apollo server can use.
import { mergeTypeDefs } from '@graphql-tools/merge'; // Importing mergeTypeDefs

import userTypeDefs from './typeDefs/user-type-defs';
import adminTypeDefs from './typeDefs/admin-type-def';

const typeDefs = mergeTypeDefs([userTypeDefs, adminTypeDefs]);
module.exports = typeDefs;
