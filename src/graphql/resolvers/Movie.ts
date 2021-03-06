import {FindOptions, Includeable, Op, Order, WhereOptions} from 'sequelize';

import Genre from '@models/Genre';
import Movie, {MovieInput, MovieOutput} from '@models/Movie';
import Person from '@models/Person';
import {fetchMovieCredits, fetchMovieData, fetchPerson} from '@utils/index';


interface IOptions {
	include?: Includeable | Includeable[];
	oder?: Order;
	where?: WhereOptions<MovieInput>;
}

export interface IArgsGet {
	id?: number;
	title?: string;
}

export interface IArgsList extends FindOptions<MovieInput> {
	orderBy?: string;
}

export interface IArgsCreate {
	tmdb: number;
}

export interface IArgsUpdate {
	id: number;
	input: {
		backdrop?: string;
		poster?: string;
	};
}

export interface IArgsRefetch {
	id: number;
	input?: {
		withImages: boolean;
	};
}

export interface IArgsDelete {
	id: number;
}

export interface IListResponse {
	edges: {
		node: MovieOutput;
	}[];
	pageInfo: {
		hasNextPage: () => boolean;
		hasPreviousPage: () => boolean;
	};
	totalCount: number;
}

class MovieController {
	private model = Movie;

	async get({id, title}: IArgsGet): Promise<MovieOutput | null> {
		if (id && title) {
			throw new Error('You can only search by one attribute.');
		}

		if (!id && !title) {
			throw new Error('You must enter at least one attribute.');
		}

		const options: IOptions = {
			where: {},
		};

		if (id) {
			options.where = {id};
		}

		if (title) {
			options.where = {title};
		}

		return this.model.findOne(options);
	}

	async list(args: IArgsList): Promise<IListResponse>;
	async list(args: IArgsList, plain: boolean): Promise<MovieOutput[]>;
	async list({orderBy, ...options}: IArgsList, plain = false): Promise<IListResponse | MovieOutput[]> {
		if (orderBy) {
			const orderDirection = orderBy.startsWith('-') ? 'DESC' : 'ASC';
			const order: Order = [[orderBy.replace('-', ''), orderDirection]];

			options.order = order;
		}

		const {rows, count} = await this.model.findAndCountAll(options);

		if (plain) {
			return rows;
		}

		return {
			edges: rows.map((node) => ({node})),
			pageInfo: {
				hasNextPage: () => count > (options.offset || 0) + rows.length,
				hasPreviousPage: () => !!options.offset && options.offset > 0,
			},
			totalCount: count,
		};
	}

	async create({tmdb: id}: IArgsCreate) {
		const {genres, tmdb, ...defaults} = await fetchMovieData(id);
		const [movieModel, isNew] = await Movie.findOrCreate({where: {tmdb}, defaults: {...defaults, tmdb}});

		if (!isNew) {
			return {
				ok: false,
				movie: movieModel,
				errors: [{
					field: 'id',
					message: 'This Movie already exists.',
				}],
			};
		}

		const genreModels = await Genre.findAll({where: {tmdb: {[Op.in]: genres.map((genre) => genre.id)}}});
		const people = await fetchMovieCredits(id);

		await movieModel.addGenres(genreModels);
		await Promise.all(
			people.map(async ({tmdb, ...data}) => {
				const {tmdb: id, ...defaults} = await fetchPerson(tmdb);
				const [personModel] = await Person.findOrCreate({where: {tmdb: id}, defaults: {...defaults, tmdb}});

				await movieModel.addPerson(personModel, {through: {...data}});
			})
		);

		return {
			movie: movieModel,
			ok: !!movieModel,
		};
	}

	async update({id, input: {backdrop, poster}}: IArgsUpdate) {
		const movieModel = await Movie.findByPk(id);

		if (!movieModel) {
			return {
				ok: false,
				errors: [{
					field: 'id',
					message: 'Movie not found.',
				}],
			};
		}

		if (backdrop) {
			movieModel.backdrop = backdrop;
		}

		if (poster) {
			movieModel.poster = poster;
		}

		const newMovieModel = await movieModel.save();

		return {
			movie: newMovieModel,
			ok: !!newMovieModel,
		};
	}

	async refetch({id, input: {withImages} = {withImages: false}}: IArgsRefetch) {
		const movieModel = await Movie.findByPk(id);

		if (!movieModel) {
			return {
				ok: false,
				errors: [{
					field: 'id',
					message: 'Movie not found.',
				}],
			};
		}

		await movieModel.removeGenres();
		await movieModel.removePeople();

		const {genres, ...movieData} = await fetchMovieData(movieModel.tmdb);
		const genreModels = await Genre.findAll({where: {tmdb: {[Op.in]: genres.map((genre) => genre.id)}}});
		const people = await fetchMovieCredits(movieModel.tmdb);

		await movieModel.update(movieData, {hooks: withImages});
		await movieModel.addGenres(genreModels);
		await Promise.all(
			people.map(async ({tmdb, ...data}) => {
				const {tmdb: id, ...defaults} = await fetchPerson(tmdb);
				const [personModel] = await Person.findOrCreate({where: {tmdb: id}, defaults: {...defaults, tmdb}});

				await movieModel.addPerson(personModel, {through: {...data}});
			})
		);

		return {
			movie: movieModel,
			ok: !!movieModel,
		};
	}

	async delete({id}: IArgsDelete) {
		const deleted = await Movie.destroy({where: {id}, cascade: true});

		if (deleted === 1) {
			return {
				ok: true,
			};
		}

		return {
			ok: false,
			errors: [{
				field: 'id',
				message: 'Error during movie delete.',
			}],
		};
	}
}

export default MovieController;
