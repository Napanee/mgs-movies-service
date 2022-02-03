import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';

import {movieCreatePayload, movieDeletePayload, movieRefetchInput, movieRefetchPayload, movieUpdateInput, movieUpdatePayload} from '../types';
import MovieResolver, {IArgsCreate, IArgsDelete, IArgsRefetch, IArgsUpdate} from '../resolvers/Movie';


class MovieMutation {
	private resolver = new MovieResolver();

	create() {
		return {
			type: movieCreatePayload,
			args: {
				tmdb: {
					type: new GraphQLNonNull(GraphQLInt)
				},
			},
			resolve: (_: any, args: IArgsCreate) => this.resolver.create(args)
		};
	}

	update() {
		return {
			type: movieUpdatePayload,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLID)
				},
				input: {
					type: movieUpdateInput
				},
			},
			resolve: (_: any, args: IArgsUpdate) => this.resolver.update(args)
		};
	}

	refetch() {
		return {
			type: movieRefetchPayload,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLID)
				},
				input: {
					type: movieRefetchInput
				},
			},
			resolve: (_: any, args: IArgsRefetch) => this.resolver.refetch(args)
		};
	}

	delete() {
		return {
			type: movieDeletePayload,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLID)
				}
			},
			resolve: (_: any, args: IArgsDelete) => this.resolver.delete(args)
		};
	}
}

export default MovieMutation;