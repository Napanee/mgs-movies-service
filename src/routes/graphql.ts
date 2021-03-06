import express from 'express';
import {graphqlHTTP} from 'express-graphql';

import GraphQLSchema from '@graphql/index';


const
	router = express.Router()
;

router.use('/', graphqlHTTP(() => ({
	schema: GraphQLSchema,
	graphiql: process.env.NODE_ENV === 'development',
})));

export default router;
